import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createCheckoutSession } from "../services/paymentService";
import { PLANS, ROUTES } from "../utils/constants";
import useAuth from "../hooks/useAuth";

const plans = [
  {
    id: PLANS.BASIC,
    name: "Basic",
    price: "$9",
    period: "/month",
    features: ["Workout tracking", "5 trainer sessions/mo", "Basic analytics", "Community access"],
    cta: "Get Basic",
    highlight: false,
  },
  {
    id: PLANS.PRO,
    name: "Pro",
    price: "$29",
    period: "/month",
    features: ["Everything in Basic", "Unlimited trainer sessions", "Nutrition coaching", "Priority support"],
    cta: "Get Pro",
    highlight: true,
  },
  {
    id: PLANS.ELITE,
    name: "Elite",
    price: "$79",
    period: "/month",
    features: ["Everything in Pro", "Dedicated coach", "Custom meal plans", "Video analysis"],
    cta: "Get Elite",
    highlight: false,
  },
];

const Pricing = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(null);
  const [error, setError] = useState("");

  const handleSelect = async (planId) => {
    if (!isAuthenticated) {
      navigate(ROUTES.LOGIN);
      return;
    }
    try {
      setLoading(planId);
      setError("");
      const { sessionId } = await createCheckoutSession(planId);
      // Redirect to Stripe checkout
      const stripe = window.Stripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);
      await stripe.redirectToCheckout({ sessionId });
    } catch {
      setError("Failed to start checkout. Please try again.");
    } finally {
      setLoading(null);
    }
  };

  return (
    <main style={{ maxWidth: 960, margin: "0 auto", padding: "48px 24px", textAlign: "center" }}>
      <h1 style={{ fontSize: "2rem", fontWeight: 700 }}>Simple, honest pricing</h1>
      <p style={{ color: "#555", marginBottom: 40 }}>
        No hidden fees. Cancel anytime.
      </p>
      {error && <p style={{ color: "#e53e3e", marginBottom: 16 }}>{error}</p>}

      <div style={{ display: "flex", gap: 24, justifyContent: "center", flexWrap: "wrap" }}>
        {plans.map((plan) => (
          <div key={plan.id} style={{
            border: plan.highlight ? "2px solid #4f46e5" : "1px solid #e2e8f0",
            borderRadius: 12, padding: "32px 28px", width: 260,
            background: plan.highlight ? "#f5f3ff" : "#fff",
            position: "relative",
          }}>
            {plan.highlight && (
              <span style={{
                position: "absolute", top: -14, left: "50%", transform: "translateX(-50%)",
                background: "#4f46e5", color: "#fff", fontSize: 12, fontWeight: 600,
                padding: "4px 14px", borderRadius: 20,
              }}>
                Most Popular
              </span>
            )}
            <h2 style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: 8 }}>{plan.name}</h2>
            <p style={{ fontSize: "2.5rem", fontWeight: 800, color: "#4f46e5", margin: 0 }}>
              {plan.price}<span style={{ fontSize: 16, color: "#777" }}>{plan.period}</span>
            </p>
            <ul style={{ listStyle: "none", padding: 0, margin: "20px 0 28px", textAlign: "left" }}>
              {plan.features.map((f) => (
                <li key={f} style={{ padding: "6px 0", fontSize: 14, color: "#444" }}>
                  ✓ {f}
                </li>
              ))}
            </ul>
            <button
              onClick={() => handleSelect(plan.id)}
              disabled={loading === plan.id}
              style={{
                width: "100%", padding: "12px 0", borderRadius: 8, border: "none",
                background: plan.highlight ? "#4f46e5" : "#1a202c", color: "#fff",
                fontWeight: 600, fontSize: 15, cursor: "pointer",
                opacity: loading === plan.id ? 0.7 : 1,
              }}
            >
              {loading === plan.id ? "Redirecting..." : plan.cta}
            </button>
          </div>
        ))}
      </div>
    </main>
  );
};

export default Pricing;