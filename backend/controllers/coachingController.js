import {
  CoachingRelationship, Trainer, Client,
  User, WorkoutProgram, Message
} from '../models/index.js';
import { Op } from 'sequelize';

// POST /api/coaching/request
export const requestCoaching = async (req, res) => {
  try {
    const client_id = req.user.client_id;
    const { trainer_id, package_type, monthly_rate, goals } = req.body;

    // ── 1. Check trainer exists ───────────────────────────────────────────
    const trainer = await Trainer.findByPk(trainer_id);
    if (!trainer) {
      return res.status(404).json({ message: 'Trainer not found' });
    }

    // ── 2. Check trainer is verified by admin ─────────────────────────────
    // FIX 1: was merged with "not found" check — now separate with clear message
    if (!trainer.is_verified) {
      return res.status(400).json({
        message: 'Trainer is not yet verified by admin'
      });
    }

    // ── 3. Check for existing active/pending relationship ─────────────────
    // FIX 2: was status: ['pending','active'] — Sequelize needs Op.in
    const existingRelationship = await CoachingRelationship.findOne({
      where: {
        client_id,
        trainer_id,
        status: { [Op.in]: ['pending', 'active'] } // ← FIXED
      }
    });

    if (existingRelationship) {
      return res.status(400).json({
        message: 'You already have a pending or active request with this trainer'
      });
    }

    // ── 4. Check trainer capacity ─────────────────────────────────────────
    // FIX 3: null-safe defaults so null values don't cause wrong comparison
    const maxClients  = trainer.max_clients || 10;
    const currentLoad = trainer.current_client_load || 0;

    if (currentLoad >= maxClients) {
      return res.status(400).json({
        message: 'Trainer is at full capacity'
      });
    }

    // ── 5. Create relationship ────────────────────────────────────────────
    const relationship = await CoachingRelationship.create({
      client_id,
      trainer_id,
      package_type,
      monthly_rate,
      goals,
      status: 'pending',
      start_date: new Date()
    });

    res.status(201).json({
      message: 'Coaching request sent successfully',
      relationship
    });

  } catch (error) {
    console.error('Request coaching error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// POST /api/coaching/respond
export const respondToRequest = async (req, res) => {
  try {
    const trainer_id = req.user.trainer_id;
    const { relationship_id, action } = req.body; // action: 'accept' or 'reject'

    const relationship = await CoachingRelationship.findOne({
      where: { relationship_id, trainer_id, status: 'pending' }
    });

    if (!relationship) {
      return res.status(404).json({ message: 'Pending request not found' });
    }

    if (action === 'accept') {
      await relationship.update({
        status: 'active',
        start_date: new Date()
      });

      // Safely increment trainer load
      const trainer = await Trainer.findByPk(trainer_id);
      if (trainer) {
        await trainer.update({
          current_client_load: (trainer.current_client_load || 0) + 1
        });
      }
    } else if (action === 'reject') {
      await relationship.update({ status: 'cancelled' });
    } else {
      return res.status(400).json({ message: 'Invalid action. Use accept or reject.' });
    }

    res.json({ message: `Request ${action}ed successfully`, relationship });

  } catch (error) {
    console.error('Respond to request error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// GET /api/coaching/my-clients
export const getMyClients = async (req, res) => {
  try {
    const trainer_id = req.user.trainer_id;
    const { status = 'active', limit = 50 } = req.query;

    const relationships = await CoachingRelationship.findAll({
      where: { trainer_id, status },
      include: [{
        model: Client,
        include: [{
          model: User,
          attributes: ['first_name', 'last_name', 'profile_image_url', 'email']
        }]
      }],
      order: [['last_interaction', 'DESC']],
      limit: parseInt(limit)
    });

    res.json({ clients: relationships });

  } catch (error) {
    console.error('Get my clients error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// GET /api/coaching/my-trainer
export const getMyTrainer = async (req, res) => {
  try {
    const client_id = req.user.client_id;

    const relationship = await CoachingRelationship.findOne({
      where: {
        client_id,
        status: { [Op.in]: ['active', 'pending'] } // ← FIX 4: was plain array
      },
      include: [{
        model: Trainer,
        include: [{
          model: User,
          attributes: ['first_name', 'last_name', 'profile_image_url', 'phone']
        }]
      }]
    });

    res.json({ relationship: relationship || null });

  } catch (error) {
    console.error('Get my trainer error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// POST /api/coaching/message
export const sendMessage = async (req, res) => {
  try {
    const { relationship_id, content, attachment_url } = req.body;
    const user_id = req.user.user_id;

    const relationship = await CoachingRelationship.findByPk(relationship_id);
    if (!relationship) {
      return res.status(404).json({ message: 'Relationship not found' });
    }

    // Verify user belongs to this relationship
    const isAuthorized = await CoachingRelationship.findOne({
      where: { relationship_id },
      include: [
        { model: Client,  required: false },
        { model: Trainer, required: false }
      ]
    });

    const clientUserId  = isAuthorized?.Client?.user_id;
    const trainerUserId = isAuthorized?.Trainer?.user_id;

    if (user_id !== clientUserId && user_id !== trainerUserId) {
      return res.status(403).json({ message: 'Not authorized to message in this relationship' });
    }

    // Determine receiver
    const receiver_id = req.user.role === 'client' ? trainerUserId : clientUserId;

    const message = await Message.create({
      sender_id: user_id,
      receiver_id,
      coaching_relationship_id: relationship_id,
      content,
      attachment_url,
      sent_at: new Date()
    });

    // Update last interaction timestamp
    await relationship.update({ last_interaction: new Date() });

    // Emit via socket
    const io = req.app.get('io');
    if (io) {
      io.to(`room_${relationship_id}`).emit('new_message', message);
    }

    res.status(201).json({ message });

  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getPendingRequests = async (req, res) => {
  try {
    const trainer_id = req.user.trainer_id;

    const requests = await CoachingRelationship.findAll({
      where: {
        trainer_id,
        status: 'pending'
      },
      include: [{
        model: Client,
        include: [{
          model: User,
          attributes: ['first_name', 'last_name', 'email']
        }]
      }],
      order: [['created_at', 'DESC']]
    });

    res.json({ requests });

  } catch (error) {
    console.error('Get pending requests error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// GET /api/coaching/messages/:relationship_id
export const getMessages = async (req, res) => {
  try {
    const { relationship_id } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const messages = await Message.findAll({
      where: { coaching_relationship_id: relationship_id },
      include: [{
        model: User,
        as: 'Sender',
        attributes: ['first_name', 'last_name', 'profile_image_url']
      }],
      order: [['sent_at', 'DESC']],
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit)
    });

    res.json({ messages: messages.reverse() });

  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};