import Stripe from 'stripe';
import dotenv from 'dotenv';

dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16'
});

export const createPaymentIntent = async (amount, currency = 'usd', metadata = {}) => {
  return await stripe.paymentIntents.create({
    amount: Math.round(amount * 100), // Convert to cents
    currency,
    metadata,
    automatic_payment_methods: { enabled: true }
  });
};

export const createSubscription = async (customerId, priceId) => {
  return await stripe.subscriptions.create({
    customer: customerId,
    items: [{ price: priceId }],
    payment_behavior: 'default_incomplete',
    expand: ['latest_invoice.payment_intent']
  });
};

export const createConnectedAccount = async (trainerEmail) => {
  return await stripe.accounts.create({
    type: 'express',
    email: trainerEmail,
    capabilities: {
      card_payments: { requested: true },
      transfers: { requested: true }
    }
  });
};

export const createAccountLink = async (accountId) => {
  return await stripe.accountLinks.create({
    account: accountId,
    refresh_url: `${process.env.FRONTEND_URL}/trainer/verification`,
    return_url: `${process.env.FRONTEND_URL}/trainer/dashboard`,
    type: 'account_onboarding'
  });
};

export const createTransfer = async (amount, destinationAccountId, transferGroup) => {
  return await stripe.transfers.create({
    amount: Math.round(amount * 100),
    currency: 'usd',
    destination: destinationAccountId,
    transfer_group: transferGroup
  });
};

export default stripe;