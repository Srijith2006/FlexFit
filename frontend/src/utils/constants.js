// API base URL from environment
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";
export const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:5000";
export const APP_NAME = import.meta.env.VITE_APP_NAME || "FlexFit";

// User roles
export const ROLES = {
  ADMIN: "admin",
  TRAINER: "trainer",
  CLIENT: "client",
};

// Local storage keys
export const STORAGE_KEYS = {
  TOKEN: "flexfit_token",
  USER: "flexfit_user",
};

// Route paths
export const ROUTES = {
  HOME: "/",
  ABOUT: "/about",
  PRICING: "/pricing",
  LOGIN: "/login",
  SIGNUP: "/signup",
  DASHBOARD: "/dashboard",
  PROFILE: "/profile",
  ADMIN: {
    ROOT: "/admin",
    VERIFICATION: "/admin/verification",
    USERS: "/admin/users",
  },
  TRAINER: {
    ROOT: "/trainer",
    PROGRAMS: "/trainer/programs",
    VIDEOS: "/trainer/videos",
    CLIENTS: "/trainer/clients",
  },
  CLIENT: {
    ROOT: "/client",
    DIET: "/client/diet",
    WORKOUTS: "/client/workouts",
    PROGRESS: "/client/progress",
  },
};

// Meal types for diet logging
export const MEAL_TYPES = ["Breakfast", "Lunch", "Dinner", "Snack"];

// Exercise categories
export const EXERCISE_CATEGORIES = [
  "Strength",
  "Cardio",
  "Flexibility",
  "HIIT",
  "Yoga",
  "Sports",
];

// Workout difficulty levels
export const DIFFICULTY_LEVELS = ["Beginner", "Intermediate", "Advanced"];

// Verification status values
export const VERIFICATION_STATUS = {
  PENDING: "pending",
  APPROVED: "approved",
  REJECTED: "rejected",
};

// Subscription plan IDs (match Stripe product IDs)
export const PLANS = {
  BASIC: "plan_basic",
  PRO: "plan_pro",
  ELITE: "plan_elite",
};