import stripe, { createPaymentIntent, createTransfer } from '../config/stripe.js';
import {
  Payment, Subscription, Trainer,
  Client, User // ← fixed: added User and TrainerPayout
} from '../models/index.js';
import { Op } from 'sequelize';

export const createPlatformSubscription = async (req, res) => {
  try {
    const client_id = req.user.client_id;
    const { payment_method_id, plan_type = 'monthly' } = req.body;

    const prices = {
      monthly:   { amount: 19.99, name: 'Monthly Plan' },
      quarterly: { amount: 49.99, name: 'Quarterly Plan' },
      yearly:    { amount: 179.99, name: 'Yearly Plan' }
    };

    const plan = prices[plan_type];
    if (!plan) return res.status(400).json({ message: 'Invalid plan type' });

    const paymentIntent = await createPaymentIntent(plan.amount, 'usd', {
      client_id, type: 'platform_subscription'
    });

    const subscription = await Subscription.create({
      client_id,
      plan_type,
      amount: plan.amount,
      stripe_subscription_id: paymentIntent.id,
      status: 'active',
      start_date: new Date(),
      end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    });

    await Payment.create({
      client_id,
      amount: plan.amount,
      currency: 'USD',
      payment_type: 'platform_subscription',
      stripe_payment_intent_id: paymentIntent.id,
      platform_fee: plan.amount,
      status: 'completed',
      description: `Platform subscription - ${plan.name}`
    });

    await Client.update(
      { subscription_status: 'active', subscription_expiry: subscription.end_date },
      { where: { client_id } }
    );

    res.json({ client_secret: paymentIntent.client_secret, subscription });
  } catch (error) {
    console.error('Create subscription error:', error);
    res.status(500).json({ message: 'Payment processing failed', error: error.message });
  }
};

export const processTrainerPayment = async (req, res) => {
  try {
    const client_id = req.user.client_id;
    const { trainer_id, amount, coaching_relationship_id } = req.body;

    const trainer = await Trainer.findByPk(trainer_id);
    if (!trainer) return res.status(404).json({ message: 'Trainer not found' });

    const platformFeePercent = parseInt(process.env.STRIPE_PLATFORM_FEE_PERCENT) || 15;
    const platformFee   = amount * (platformFeePercent / 100);
    const trainerPayout = amount - platformFee;

    const paymentIntent = await createPaymentIntent(amount, 'usd', {
      client_id, trainer_id, coaching_relationship_id
    });

    const payment = await Payment.create({
      client_id, trainer_id, amount,
      currency: 'USD',
      payment_type: 'trainer_package',
      stripe_payment_intent_id: paymentIntent.id,
      platform_fee: platformFee,
      trainer_payout: trainerPayout,
      status: 'pending',
      description: `Coaching package with trainer ${trainer_id}`
    });

    res.json({
      client_secret: paymentIntent.client_secret,
      payment: {
        id: payment.payment_id,
        amount, platform_fee: platformFee, trainer_payout: trainerPayout
      }
    });
  } catch (error) {
    console.error('Process trainer payment error:', error);
    res.status(500).json({ message: 'Payment processing failed', error: error.message });
  }
};

export const confirmPayment = async (req, res) => {
  try {
    const { payment_intent_id } = req.body;
    const paymentIntent = await stripe.paymentIntents.retrieve(payment_intent_id);

    if (paymentIntent.status === 'succeeded') {
      const payment = await Payment.findOne({
        where: { stripe_payment_intent_id: payment_intent_id }
      });

      if (payment) {
        await payment.update({ status: 'completed' });
        if (payment.payment_type === 'trainer_package' && payment.trainer_id) {
          await handleTrainerPayout(payment);
        }
      }

      res.json({ status: 'success', payment });
    } else {
      res.status(400).json({ status: paymentIntent.status });
    }
  } catch (error) {
    console.error('Confirm payment error:', error);
    res.status(500).json({ message: 'Payment confirmation failed', error: error.message });
  }
};

// Renamed to avoid conflict with the route export name
const handleTrainerPayout = async (payment) => {
  try {
    const trainer = await Trainer.findByPk(payment.trainer_id);
    if (!trainer?.stripe_account_id) return;

    await createTransfer(
      payment.trainer_payout,
      trainer.stripe_account_id,
      `payment_${payment.payment_id}`
    );

    // ← fixed: TrainerPayout now imported at top
    await TrainerPayout.create({
      trainer_id: payment.trainer_id,
      amount: payment.trainer_payout,
      currency: 'USD',
      stripe_transfer_id: payment.stripe_payment_intent_id,
      period_start: new Date(),
      period_end: new Date(),
      status: 'completed'
    });
  } catch (error) {
    console.error('Trainer payout error:', error);
  }
};

export const getPaymentHistory = async (req, res) => {
  try {
    const client_id = req.user.client_id;

    const payments = await Payment.findAll({
      where: { client_id },
      order: [['created_at', 'DESC']],
      include: [{
        model: Trainer,
        required: false,
        include: [{
          model: User, // ← fixed: User now imported
          attributes: ['first_name', 'last_name']
        }]
      }]
    });

    res.json({ payments });
  } catch (error) {
    console.error('Get payment history error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// GET /api/payments/earnings  AND  /api/payments/earnings-summary (alias in routes)
export const getTrainerEarnings = async (req, res) => {
  try {
    const trainer_id = req.user.trainer_id;

    const earnings = await Payment.findAll({
      where: { trainer_id, status: 'completed' },
      attributes: [
        [Payment.sequelize.fn('SUM', Payment.sequelize.col('trainer_payout')), 'total_earnings'],
        [Payment.sequelize.fn('COUNT', Payment.sequelize.col('payment_id')), 'total_sessions']
      ],
      raw: true
    });

    const monthlyEarnings = await Payment.findAll({
      where: {
        trainer_id,
        status: 'completed',
        created_at: { [Op.gte]: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) }
      },
      attributes: [
        [Payment.sequelize.fn('DATE_TRUNC', 'month', Payment.sequelize.col('created_at')), 'month'],
        [Payment.sequelize.fn('SUM', Payment.sequelize.col('trainer_payout')), 'earnings']
      ],
      group: [Payment.sequelize.fn('DATE_TRUNC', 'month', Payment.sequelize.col('created_at'))],
      order: [[Payment.sequelize.fn('DATE_TRUNC', 'month', Payment.sequelize.col('created_at')), 'ASC']],
      raw: true
    });

    res.json({
      summary: earnings[0] || { total_earnings: 0, total_sessions: 0 },
      monthly: monthlyEarnings // TrainerDashboard reads .data.monthly
    });
  } catch (error) {
    console.error('Get trainer earnings error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const setupStripeConnect = async (req, res) => {
  try {
    const trainer = await Trainer.findByPk(req.user.trainer_id, {
      include: [{ model: User, attributes: ['email'] }]
    });

    if (!trainer) return res.status(404).json({ message: 'Trainer not found' });

    let accountId = trainer.stripe_account_id;
    if (!accountId) {
      const { createConnectedAccount, createAccountLink } = await import('../config/stripe.js');
      const account = await createConnectedAccount(trainer.User.email);
      accountId = account.id;
      await trainer.update({ stripe_account_id: accountId });
    }

    const { createAccountLink } = await import('../config/stripe.js');
    const accountLink = await createAccountLink(accountId);

    res.json({ url: accountLink.url });
  } catch (error) {
    console.error('Setup Stripe Connect error:', error);
    res.status(500).json({ message: 'Stripe setup failed', error: error.message });
  }
};

export const handleWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body, sig, process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('Webhook signature failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  switch (event.type) {
    case 'payment_intent.succeeded':
      await handlePaymentSuccess(event.data.object);
      break;
    case 'payment_intent.payment_failed':
      await handlePaymentFailure(event.data.object);
      break;
    case 'transfer.paid':
      await handleTransferPaid(event.data.object);
      break;
    default:
      console.log(`Unhandled event: ${event.type}`);
  }

  res.json({ received: true });
};

const handlePaymentSuccess = async (paymentIntent) => {
  const payment = await Payment.findOne({
    where: { stripe_payment_intent_id: paymentIntent.id }
  });
  if (payment) await payment.update({ status: 'completed' });
};

const handlePaymentFailure = async (paymentIntent) => {
  const payment = await Payment.findOne({
    where: { stripe_payment_intent_id: paymentIntent.id }
  });
  if (payment) await payment.update({ status: 'failed' });
};

const handleTransferPaid = async (transfer) => {
  // ← fixed: TrainerPayout now imported
  await TrainerPayout.update(
    { status: 'paid' },
    { where: { stripe_transfer_id: transfer.id } }
  );
};