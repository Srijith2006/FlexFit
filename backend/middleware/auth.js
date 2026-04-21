import jwt from 'jsonwebtoken';
import { User, Trainer, Client } from '../models/index.js';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// ================= AUTHENTICATE =================
export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, JWT_SECRET);

    // Fetch user with related profiles
    const user = await User.findByPk(decoded.user_id, {
      include: [
        { model: Trainer, required: false },
        { model: Client, required: false }
      ]
    });

    if (!user || !user.is_active) {
      return res.status(401).json({ message: 'User not found or inactive' });
    }

    // Attach user info to request
    req.user = {
      user_id: user.user_id,
      role: user.role,
      email: user.email,
      trainer_id: user.Trainer?.trainer_id || null,
      client_id: user.Client?.client_id || null
    };

    next();

  } catch (error) {
    console.error("Auth error:", error);

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired' });
    }

    return res.status(401).json({ message: 'Invalid token' });
  }
};

// ================= AUTHORIZE (ROLE-BASED) =================
export const authorize = (...roles) => {
  return (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      if (!roles.includes(req.user.role)) {
        return res.status(403).json({ message: 'Access denied' });
      }

      next();

    } catch (error) {
      console.error("Authorization error:", error);
      return res.status(500).json({ message: 'Authorization error' });
    }
  };
};

// ================= ADMIN ONLY (OPTIONAL SHORTCUT) =================
export const isAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access only' });
  }
  next();
};