import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User, Trainer, Client } from '../models/index.js';
import { validationResult } from 'express-validator';

const JWT_SECRET     = process.env.JWT_SECRET || 'your-secret-key';
const JWT_EXPIRES_IN = '7d';

export const register = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password, role, first_name, last_name, phone, ...profileData } = req.body;

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    const password_hash = await bcrypt.hash(password, 12);

    const user = await User.create({
      email, password_hash, role, first_name, last_name, phone
    });

    if (role === 'trainer') {
      await Trainer.create({ user_id: user.user_id, ...profileData });
    } else if (role === 'client') {
      await Client.create({ user_id: user.user_id, ...profileData });
    }

    const token = jwt.sign(
      {
        user_id:    user.user_id,
        role:       user.role,
        trainer_id: null,
        client_id:  null
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        user_id:    user.user_id,
        email:      user.email,
        role:       user.role,
        first_name: user.first_name,
        last_name:  user.last_name
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({
      where: { email },
      include: [
        { model: Trainer, required: false },
        { model: Client, required: false }
      ]
    });

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // ✅ FIXED CONDITION
    if (user.is_active === false) {
      return res.status(401).json({ message: 'Account is deactivated' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    await user.update({ last_login: new Date() });

    const token = jwt.sign(
      {
        user_id: user.user_id,
        role: user.role,
        trainer_id: user.Trainer?.trainer_id || null,
        client_id: user.Client?.client_id || null
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    let profile = null;
    if (user.role === 'trainer') profile = user.Trainer || null;
    if (user.role === 'client')  profile = user.Client  || null;

    res.json({
      token,
      user: {
        user_id: user.user_id,
        email: user.email,
        role: user.role,
        first_name: user.first_name,
        last_name: user.last_name,
        profile_image_url: user.profile_image_url,
        profile
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
};

export const getMe = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.user_id, {
      include: [
        { model: Trainer, required: false },
        { model: Client,  required: false }
      ],
      attributes: { exclude: ['password_hash'] }
    });

    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json({ user });
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.user_id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const allowedUpdates = [
      'first_name', 'last_name', 'phone',
      'profile_image_url', 'date_of_birth',
      'gender', 'country', 'timezone'
    ];

    const updates = {};
    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });

    await user.update(updates);

    if (user.role === 'trainer' && req.body.trainer_data) {
      const trainer = await Trainer.findOne({ where: { user_id: user.user_id } });
      if (trainer) await trainer.update(req.body.trainer_data);
    } else if (user.role === 'client' && req.body.client_data) {
      const client = await Client.findOne({ where: { user_id: user.user_id } });
      if (client) await client.update(req.body.client_data);
    }

    res.json({ message: 'Profile updated successfully', user });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};