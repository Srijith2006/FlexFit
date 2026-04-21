import express from 'express';
import {
  createPlatformSubscription,
  processTrainerPayment,
  confirmPayment,
  getPaymentHistory,
  getTrainerEarnings,
  setupStripeConnect,
  handleWebhook
} from '../controllers/paymentController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

router.post('/subscription',     authenticate, authorize('client'),  createPlatformSubscription);
router.post('/trainer-payment',  authenticate, authorize('client'),  processTrainerPayment);
router.post('/confirm',          authenticate,                       confirmPayment);
router.get('/history',           authenticate, authorize('client'),  getPaymentHistory);
router.get('/earnings',          authenticate, authorize('trainer'), getTrainerEarnings);
router.get('/earnings-summary',  authenticate, authorize('trainer'), getTrainerEarnings); // ← alias — was missing
router.post('/connect',          authenticate, authorize('trainer'), setupStripeConnect);
router.post('/webhook', express.raw({ type: 'application/json' }), handleWebhook);

export default router;