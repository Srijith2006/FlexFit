import express from 'express';
import {
  getPendingTrainers,
  approveTrainer,
  rejectTrainer,
  getAllTrainers
} from '../controllers/adminController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/pending',       authenticate, authorize('admin'), getPendingTrainers);
router.get('/all',           authenticate, authorize('admin'), getAllTrainers);
router.post('/approve/:id',  authenticate, authorize('admin'), approveTrainer);
router.post('/reject/:id',   authenticate, authorize('admin'), rejectTrainer);

export default router;