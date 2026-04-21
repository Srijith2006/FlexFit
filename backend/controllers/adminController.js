import { Trainer, User, TrainerVerification } from '../models/index.js';
import { Op } from 'sequelize';

// GET /api/admin/pending
export const getPendingTrainers = async (req, res) => {
  try {
    const trainers = await Trainer.findAll({
      where: {
        is_verified: false
      },
      include: [{
        model: User,
        attributes: ['user_id', 'first_name', 'last_name', 'email', 'created_at', 'profile_image_url']
      }],
      order: [['created_at', 'DESC']]
    });

    res.json({ trainers });
  } catch (error) {
    console.error('getPendingTrainers error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// GET /api/admin/all
export const getAllTrainers = async (req, res) => {
  try {
    const trainers = await Trainer.findAll({
      include: [{
        model: User,
        attributes: ['user_id', 'first_name', 'last_name', 'email', 'created_at']
      }],
      order: [['created_at', 'DESC']]
    });

    res.json({ trainers });
  } catch (error) {
    console.error('getAllTrainers error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// POST /api/admin/approve/:id
export const approveTrainer = async (req, res) => {
  try {
    const { id } = req.params;

    const trainer = await Trainer.findByPk(id, {
      include: [{ model: User, attributes: ['email', 'first_name'] }]
    });

    if (!trainer) {
      return res.status(404).json({ message: 'Trainer not found' });
    }

    await trainer.update({
      verification_status: 'approved',
      is_verified: true,
      verification_date: new Date(),
      rejection_reason: null
    });

    res.json({ message: 'Trainer approved successfully', trainer });
  } catch (error) {
    console.error('approveTrainer error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// POST /api/admin/reject/:id
export const rejectTrainer = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const trainer = await Trainer.findByPk(id);
    if (!trainer) {
      return res.status(404).json({ message: 'Trainer not found' });
    }

    await trainer.update({
      verification_status: 'rejected',
      is_verified: false,
      rejection_reason: reason || 'Rejected by admin'
    });

    res.json({ message: 'Trainer rejected', trainer });
  } catch (error) {
    console.error('rejectTrainer error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};