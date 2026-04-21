import { Client, User, BodyMetric, DietLog, WorkoutLog } from '../models/index.js';
import { Op } from 'sequelize';

export const getClientProfile = async (req, res) => {
  try {
    const client = await Client.findByPk(req.user.client_id, {
      include: [{
        model: User,
        attributes: ['first_name', 'last_name', 'email', 'profile_image_url', 'phone']
      }]
    });

    if (!client) {
      return res.status(404).json({ message: 'Client not found' });
    }

    res.json({ client });
  } catch (error) {
    console.error('Get client profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateClientGoals = async (req, res) => {
  try {
    const { fitness_goal, target_weight_kg, workout_days_per_week, dietary_restrictions } = req.body;
    
    const client = await Client.findByPk(req.user.client_id);
    if (!client) {
      return res.status(404).json({ message: 'Client not found' });
    }

    await client.update({
      fitness_goal,
      target_weight_kg,
      workout_days_per_week,
      dietary_restrictions: dietary_restrictions || []
    });

    res.json({ message: 'Goals updated successfully', client });
  } catch (error) {
    console.error('Update goals error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getClientStats = async (req, res) => {
  try {
    const client_id = req.user.client_id;

    // Get total workouts
    const totalWorkouts = await WorkoutLog.count({
      where: { client_id, status: 'completed' }
    });

    // Get current streak
    const logs = await WorkoutLog.findAll({
      where: { client_id, status: 'completed' },
      order: [['completed_date', 'DESC']],
      attributes: ['completed_date']
    });

    let currentStreak = 0;
    let lastDate = null;

    for (const log of logs) {
      const logDate = new Date(log.completed_date).toDateString();
      if (!lastDate) {
        currentStreak = 1;
        lastDate = logDate;
      } else {
        const prevDate = new Date(lastDate);
        prevDate.setDate(prevDate.getDate() - 1);
        if (logDate === prevDate.toDateString()) {
          currentStreak++;
          lastDate = logDate;
        } else {
          break;
        }
      }
    }

    // Get weight change
    const latestMetric = await BodyMetric.findOne({
      where: { client_id },
      order: [['recorded_date', 'DESC']]
    });

    const firstMetric = await BodyMetric.findOne({
      where: { client_id },
      order: [['recorded_date', 'ASC']]
    });

    const weightChange = latestMetric && firstMetric 
      ? latestMetric.weight_kg - firstMetric.weight_kg 
      : 0;

    // Calculate adherence rate
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const scheduledWorkouts = await WorkoutLog.count({
      where: {
        client_id,
        scheduled_date: { [Op.gte]: thirtyDaysAgo }
      }
    });

    const completedWorkouts = await WorkoutLog.count({
      where: {
        client_id,
        scheduled_date: { [Op.gte]: thirtyDaysAgo },
        status: 'completed'
      }
    });

    const adherenceRate = scheduledWorkouts > 0 
      ? Math.round((completedWorkouts / scheduledWorkouts) * 100) 
      : 0;

    res.json({
      workoutsCompleted: totalWorkouts,
      currentStreak,
      weightChange: parseFloat(weightChange.toFixed(1)),
      adherenceRate
    });
  } catch (error) {
    console.error('Get client stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getBodyMetrics = async (req, res) => {
  try {
    const client_id = req.user.client_id;
    const { limit = 30 } = req.query;

    const metrics = await BodyMetric.findAll({
      where: { client_id },
      order: [['recorded_date', 'DESC']],
      limit: parseInt(limit)
    });

    res.json({ metrics: metrics.reverse() });
  } catch (error) {
    console.error('Get body metrics error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getDietLogs = async (req, res) => {
  try {
    const client_id = req.user.client_id;
    const { startDate, endDate } = req.query;

    const where = { client_id };
    if (startDate && endDate) {
      where.log_date = { [Op.between]: [startDate, endDate] };
    }

    const logs = await DietLog.findAll({
      where,
      order: [['log_date', 'DESC']],
      limit: 30
    });

    res.json({ logs });
  } catch (error) {
    console.error('Get diet logs error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const createDietLog = async (req, res) => {
  try {
    const client_id = req.user.client_id;
    const { log_date, total_calories, total_protein, total_carbs, total_fats, water_intake_ml, meals_logged, adherence_score } = req.body;

    const [log, created] = await DietLog.findOrCreate({
      where: { client_id, log_date },
      defaults: {
        total_calories,
        total_protein,
        total_carbs,
        total_fats,
        water_intake_ml,
        meals_logged: meals_logged || [],
        adherence_score
      }
    });

    if (!created) {
      await log.update({
        total_calories,
        total_protein,
        total_carbs,
        total_fats,
        water_intake_ml,
        meals_logged: meals_logged || [],
        adherence_score
      });
    }

    res.status(201).json({ message: 'Diet log saved', log });
  } catch (error) {
    console.error('Create diet log error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};