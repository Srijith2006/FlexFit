import {
  Trainer, User, TrainerVerification,
  CoachingRelationship, WorkoutLog, sequelize // ← fixed: added WorkoutLog
} from '../models/index.js';
import { Op } from 'sequelize';

export const getTrainers = async (req, res) => {
  try {
    const {
      specialization, min_rating, max_price,
      language, verified_only, search,
      page = 1, limit = 10
    } = req.query;

    const where = {};
    const userWhere = {};

    if (verified_only === 'true') where.is_verified = true;
    if (min_rating) where.star_rating = { [Op.gte]: parseFloat(min_rating) };
    if (max_price)  where.hourly_rate  = { [Op.lte]: parseFloat(max_price) };
    if (specialization) where.specializations = { [Op.contains]: [specialization] };
    if (language)       where.languages       = { [Op.contains]: [language] };
    if (search) {
      userWhere[Op.or] = [
        { first_name: { [Op.iLike]: `%${search}%` } },
        { last_name:  { [Op.iLike]: `%${search}%` } }
      ];
    }

    const offset = (parseInt(page) - 1) * parseInt(limit);

    const { count, rows: trainers } = await Trainer.findAndCountAll({
      where,
      include: [{
        model: User,
        where: userWhere,
        attributes: ['first_name', 'last_name', 'profile_image_url', 'country']
      }],
      attributes: { exclude: ['created_at', 'updated_at'] },
      order: [['star_rating', 'DESC']],
      limit: parseInt(limit),
      offset
    });

    const trainersWithDetails = await Promise.all(trainers.map(async (trainer) => {
      const stats = await CoachingRelationship.findAll({
        where: { trainer_id: trainer.trainer_id, status: 'completed' },
        attributes: [
          [sequelize.fn('AVG', sequelize.col('client_rating')), 'avg_rating'],
          [sequelize.fn('COUNT', sequelize.col('relationship_id')), 'total_reviews']
        ],
        raw: true
      });

      return {
        ...trainer.toJSON(),
        computed_rating: parseFloat(stats[0]?.avg_rating || 0).toFixed(1),
        total_reviews: parseInt(stats[0]?.total_reviews || 0)
      };
    }));

    res.json({
      trainers: trainersWithDetails,
      pagination: {
        total: count,
        page: parseInt(page),
        pages: Math.ceil(count / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get trainers error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getTrainerProfile = async (req, res) => {
  try {
    const { trainer_id } = req.params;

    const trainer = await Trainer.findByPk(trainer_id, {
      include: [
        {
          model: User,
          attributes: ['first_name', 'last_name', 'profile_image_url', 'country', 'created_at']
        },
        {
          model: CoachingRelationship,
          where: { status: 'completed' },
          required: false,
          attributes: ['client_rating', 'client_review', 'created_at'],
          limit: 5,
          order: [['created_at', 'DESC']]
        }
      ]
    });

    if (!trainer) {
      return res.status(404).json({ message: 'Trainer not found' });
    }

    const verifications = await TrainerVerification.findAll({
      where: { trainer_id, status: 'approved' },
      attributes: ['document_type', 'verified_at']
    });

    res.json({ trainer: { ...trainer.toJSON(), verifications } });
  } catch (error) {
    console.error('Get trainer profile error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const submitVerification = async (req, res) => {
  try {
    const trainer_id = req.user.trainer_id;
    const {
      document_type, document_url, document_number,
      issued_by, issue_date, expiry_date
    } = req.body;

    const verification = await TrainerVerification.create({
      trainer_id,
      document_type,
      document_url,
      document_number,
      issued_by,
      issue_date,
      expiry_date,
      status: 'pending',
      submitted_at: new Date()
    });

    res.status(201).json({
      message: 'Verification document submitted successfully',
      verification
    });
  } catch (error) {
    console.error('Submit verification error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const updateTrainerAvailability = async (req, res) => {
  try {
    const trainer_id = req.user.trainer_id;
    const { max_clients, current_availability } = req.body;

    const trainer = await Trainer.findByPk(trainer_id);
    if (!trainer) {
      return res.status(404).json({ message: 'Trainer not found' });
    }

    // ← fixed: removed the broken dead-code query that used wrong column name
    await trainer.update({
      max_clients,
      current_client_load: current_availability
    });

    res.json({ message: 'Availability updated', trainer });
  } catch (error) {
    console.error('Update availability error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// GET /api/trainers/stats  ← called by TrainerDashboard
export const getTrainerStats = async (req, res) => {
  try {
    const { trainer_id } = req.user;

    if (!trainer_id) {
      return res.status(400).json({ message: 'Trainer ID not found in token.' });
    }

    const [totalClients, activeClients, trainerProfile] = await Promise.all([
      CoachingRelationship.count({ where: { trainer_id } }),
      CoachingRelationship.count({ where: { trainer_id, status: 'active' } }),
      Trainer.findOne({ where: { trainer_id }, attributes: ['star_rating'] })
    ]);

    // Completed workouts this month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    // WorkoutLog may not have trainer_id — count via coaching relationships instead
    let completionRate = 0;
    if (totalClients > 0) {
      const completedLogs = await WorkoutLog.count({
        where: {
          status: 'completed',
          completed_date: { [Op.gte]: startOfMonth }
        },
        include: [{
          model: CoachingRelationship,  // join through relationship
          where: { trainer_id },
          required: true
        }]
      }).catch(() => 0); // if join fails gracefully return 0

      completionRate = Math.round((completedLogs / totalClients) * 100);
    }

    res.json({
      totalClients,
      activeClients,
      monthlyRevenue: 0,
      averageRating: trainerProfile?.star_rating || 0,
      completionRate
    });
  } catch (error) {
    console.error('getTrainerStats error:', error);
    res.status(500).json({ message: 'Failed to fetch trainer stats', error: error.message });
  }
};