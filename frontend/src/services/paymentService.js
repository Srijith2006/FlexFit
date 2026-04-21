import axios from "axios";
import { API_BASE_URL, STORAGE_KEYS } from "../utils/constants";

const api = axios.create({ baseURL: API_BASE_URL });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ─── Stripe / payment endpoints ───────────────────────────────────────────────

/**
 * Create a Stripe checkout session for the chosen plan.
 * Returns { sessionId } — use with Stripe.js redirectToCheckout.
 */
export const createCheckoutSession = async (planId) => {
  const { data } = await api.post("/payments/create-checkout-session", { planId });
  return data;
};

/**
 * Fetch the current user's active subscription.
 */
export const getSubscription = async () => {
  const { data } = await api.get("/payments/subscription");
  return data;
};

/**
 * Cancel the current subscription (end of billing period).
 */
export const cancelSubscription = async () => {
  const { data } = await api.post("/payments/cancel");
  return data;
};

/**
 * Retrieve billing history / invoices for the logged-in user.
 */
export const getBillingHistory = async () => {
  const { data } = await api.get("/payments/invoices");
  return data;
};

/**
 * Update default payment method via a Stripe SetupIntent client secret.
 */
export const getSetupIntent = async () => {
  const { data } = await api.post("/payments/setup-intent");
  return data;
};