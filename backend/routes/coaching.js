import express from 'express';
import { 
  requestCoaching, 
  respondToRequest, 
  getMyClients, 
  getMyTrainer,
  sendMessage,
  getMessages,
  getPendingRequests
} from '../controllers/coachingController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

router.post('/request', authenticate, authorize('client'), requestCoaching);
router.post('/respond', authenticate, authorize('trainer'), respondToRequest);
router.get('/my-clients', authenticate, authorize('trainer'), getMyClients);
router.get('/my-trainer', authenticate, authorize('client'), getMyTrainer);
router.post('/message', authenticate, sendMessage);
router.get('/messages/:relationship_id', authenticate, getMessages);
router.get('/requests', authenticate, authorize('trainer'), getPendingRequests);

export default router;