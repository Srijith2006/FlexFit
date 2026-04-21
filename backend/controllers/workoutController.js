import {
  WorkoutProgram, WorkoutSession, Exercise, SessionExercise,
  WorkoutLog, BodyMetric, sequelize
} from '../models/index.js';
import { Op } from 'sequelize';
import { format } from 'date-fns';

export const createProgram = async (req, res) => {
  try {
    const trainer_id = req.user.trainer_id;
    const {
      client_id, program_name, description,
      duration_weeks, difficulty_level, goal_type, sessions
    } = req.body;

    const program = await WorkoutProgram.create({
      trainer_id, client_id, program_name, description,
      duration_weeks, difficulty_level, goal_type,
      is_template: !client_id
    });

    if (sessions?.length > 0) {
      for (const sessionData of sessions) {
        const session = await WorkoutSession.create({
          program_id: program.program_id,
          session_name: sessionData.name,
          day_of_week: sessionData.day_of_week,
          week_number: sessionData.week_number || 1,
          duration_minutes: sessionData.duration_minutes,
          focus_area: sessionData.focus_area,
          intensity_level: sessionData.intensity_level,
          instructions: sessionData.instructions
        });

        if (sessionData.exercises) {
          for (let i = 0; i < sessionData.exercises.length; i++) {
            const ex = sessionData.exercises[i];
            await SessionExercise.create({
              session_id: session.session_id,
              exercise_id: ex.exercise_id,
              order_index: i + 1,
              custom_sets: ex.sets,
              custom_reps: ex.reps,
              custom_weight_kg: ex.weight,
              rest_seconds: ex.rest_seconds,
              trainer_notes: ex.notes
            });
          }
        }
      }
    }

    res.status(201).json({ message: 'Program created', program });
  } catch (error) {
    console.error('Create program error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getClientProgram = async (req, res) => {
  try {
    const client_id = req.user.client_id;

    const program = await WorkoutProgram.findOne({
      where: { client_id, is_active: true },
      include: [{
        model: WorkoutSession,
        include: [{
          model: SessionExercise,
          include: [{
            model: Exercise,
            attributes: ['exercise_name', 'muscle_group', 'video_demo_url', 'instructions']
          }]
        }]
      }],
      order: [
        ['created_at', 'DESC'],
        [WorkoutSession, 'week_number', 'ASC'],
        [WorkoutSession, 'day_of_week', 'ASC'],
        [WorkoutSession, SessionExercise, 'order_index', 'ASC']
      ]
    });

    res.json({ program: program || null });
  } catch (error) {
    console.error('Get client program error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getTodaysWorkout = async (req, res) => {
  try {
    const client_id = req.user.client_id;
    const today = new Date();
    const dayOfWeek = today.getDay() || 7;

    const program = await WorkoutProgram.findOne({
      where: { client_id, is_active: true }
    });

    if (!program) {
      return res.json({ workout: null, message: 'No active program' });
    }

    const session = await WorkoutSession.findOne({
      where: {
        program_id: program.program_id,
        day_of_week: dayOfWeek,
        is_rest_day: false
      },
      include: [{
        model: SessionExercise,
        include: [{
          model: Exercise,
          attributes: ['exercise_id', 'exercise_name', 'muscle_group', 'video_demo_url', 'instructions']
        }]
      }],
      order: [[SessionExercise, 'order_index', 'ASC']]
    });

    if (!session) {
      return res.json({ workout: null, message: 'Rest day or no workout scheduled' });
    }

    res.json({ workout: session, already_logged: false });
  } catch (error) {
    console.error('Get today workout error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const logWorkout = async (req, res) => {
  try {
    const client_id = req.user.client_id;
    const {
      session_exercise_id, scheduled_date, actual_sets,
      actual_reps, actual_weight_kg, duration_minutes,
      perceived_difficulty, notes, coaching_relationship_id
    } = req.body;

    const log = await WorkoutLog.create({
      client_id,
      session_exercise_id,
      coaching_relationship_id,
      scheduled_date,
      completed_date: new Date(),
      status: 'completed',
      actual_sets,
      actual_reps,
      actual_weight_kg,
      duration_minutes,
      perceived_difficulty,
      client_notes: notes
    });

    res.status(201).json({ message: 'Workout logged', log });
  } catch (error) {
    console.error('Log workout error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// GET /api/workouts/progress  ← ClientDashboard expects specific shape
export const getProgressStats = async (req, res) => {
  try {
    const client_id = req.user.client_id;
    const { period = '30' } = req.query;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(period));

    // All completed logs in period
    const logs = await WorkoutLog.findAll({
      where: {
        client_id,
        status: 'completed',
        completed_date: { [Op.gte]: startDate }
      },
      order: [['completed_date', 'DESC']],
      attributes: ['completed_date']
    });

    // Streak calculation
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

    // Weight change — compare first and last body metric in period
    const metrics = await BodyMetric.findAll({
      where: { client_id, recorded_date: { [Op.gte]: startDate } },
      order: [['recorded_date', 'ASC']],
      attributes: ['weight_kg', 'recorded_date']
    });

    const firstWeight = metrics.length > 0 ? parseFloat(metrics[0].weight_kg) : 0;
    const lastWeight  = metrics.length > 0 ? parseFloat(metrics[metrics.length - 1].weight_kg) : 0;
    const weightChange = metrics.length > 1
      ? parseFloat((lastWeight - firstWeight).toFixed(1))
      : 0;

    // Adherence — workouts completed vs days in period
    const adherenceRate = Math.min(
      Math.round((logs.length / parseInt(period)) * 100),
      100
    );

    // ← fixed: response shape matches exactly what ClientDashboard reads
    res.json({
      workoutsCompleted: logs.length,
      currentStreak,
      weightChange,
      adherenceRate
    });
  } catch (error) {
    console.error('Get progress stats error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// GET /api/workouts/progress-chart  ← ClientDashboard chart
export const getProgressChart = async (req, res) => {
  try {
    const { client_id } = req.user;

    const metrics = await BodyMetric.findAll({
      where: { client_id },
      order: [['recorded_date', 'ASC']], // ← fixed: was recorded_at, correct col is recorded_date
      limit: 30,
      attributes: ['weight_kg', 'recorded_date']
    });

    const chartData = metrics.map(m => ({
      date: new Date(m.recorded_date).toLocaleDateString('en-US', {
        month: 'short', day: 'numeric'
      }),
      weight: parseFloat(m.weight_kg)
    }));

    res.json(chartData);
  } catch (error) {
    console.error('getProgressChart error:', error);
    res.status(500).json({ message: 'Failed to fetch chart data', error: error.message });
  }
};

export const logBodyMetrics = async (req, res) => {
  try {
    const client_id = req.user.client_id;
    const { weight_kg, body_fat_percentage, measurements, photos } = req.body;

    const metric = await BodyMetric.create({
      client_id,
      recorded_date: new Date(),
      weight_kg,
      body_fat_percentage,
      chest_cm:  measurements?.chest,
      waist_cm:  measurements?.waist,
      hips_cm:   measurements?.hips,
      arms_cm:   measurements?.arms,
      thighs_cm: measurements?.thighs,
      progress_photos_front: photos?.front,
      progress_photos_side:  photos?.side,
      progress_photos_back:  photos?.back
    });

    const { Client } = await import('../models/index.js');
    await Client.update(
      { current_weight_kg: weight_kg },
      { where: { client_id } }
    );

    res.status(201).json({ message: 'Metrics logged', metric });
  } catch (error) {
    console.error('Log body metrics error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};