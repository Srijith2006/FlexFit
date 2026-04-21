import express from 'express';
import {
  getTrainers,
  getTrainerProfile,
  getTrainerStats,        // ← new
  submitVerification,
  updateTrainerAvailability
} from '../controllers/trainerController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/',              getTrainers);
router.get('/stats',         authenticate, authorize('trainer'), getTrainerStats); // ← was missing — MUST be before /:trainer_id
router.get('/:trainer_id',   getTrainerProfile);
router.post('/verification', authenticate, authorize('trainer'), submitVerification);
router.put('/availability',  authenticate, authorize('trainer'), updateTrainerAvailability);

export default router;