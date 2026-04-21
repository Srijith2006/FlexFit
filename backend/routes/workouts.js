import express from 'express';
import {
  createProgram,
  getClientProgram,
  getTodaysWorkout,
  logWorkout,
  getProgressStats,
  getProgressChart,   // ← new
  logBodyMetrics
} from '../controllers/workoutController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

router.post('/programs',      authenticate, authorize('trainer'), createProgram);
router.get('/my-program',     authenticate, authorize('client'),  getClientProgram);
router.get('/today',          authenticate, authorize('client'),  getTodaysWorkout);
router.post('/log',           authenticate, authorize('client'),  logWorkout);
router.get('/progress',       authenticate, authorize('client'),  getProgressStats);
router.get('/progress-chart', authenticate, authorize('client'),  getProgressChart); // ← was missing
router.post('/body-metrics',  authenticate, authorize('client'),  logBodyMetrics);

export default router;