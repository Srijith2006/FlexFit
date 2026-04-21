import express from 'express';
import { 
  getClientProfile, 
  updateClientGoals, 
  getClientStats,
  getBodyMetrics,
  getDietLogs,
  createDietLog
} from '../controllers/clientController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/profile', authenticate, authorize('client'), getClientProfile);
router.put('/goals', authenticate, authorize('client'), updateClientGoals);
router.get('/stats', authenticate, authorize('client'), getClientStats);
router.get('/body-metrics', authenticate, authorize('client'), getBodyMetrics);
router.get('/diet-logs', authenticate, authorize('client'), getDietLogs);
router.post('/diet-logs', authenticate, authorize('client'), createDietLog);

export default router;