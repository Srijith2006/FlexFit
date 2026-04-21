import { Notification } from '../models/index.js';
import { io } from '../server.js';

export const createNotification = async (user_id, type, title, message, action_url = null) => {
  try {
    const notification = await Notification.create({
      user_id,
      type,
      title,
      message,
      action_url,
      sent_at: new Date()
    });

    // Emit real-time notification
    const socketIo = global.io || io;
    if (socketIo) {
      socketIo.to(`user_${user_id}`).emit('notification', notification);
    }

    return notification;
  } catch (error) {
    console.error('Create notification error:', error);
    throw error;
  }
};

export const markAsRead = async (notification_id, user_id) => {
  try {
    const notification = await Notification.findOne({
      where: { notification_id, user_id }
    });

    if (!notification) {
      throw new Error('Notification not found');
    }

    await notification.update({
      is_read: true,
      read_at: new Date()
    });

    return notification;
  } catch (error) {
    console.error('Mark as read error:', error);
    throw error;
  }
};

export const getUnreadCount = async (user_id) => {
  try {
    return await Notification.count({
      where: { user_id, is_read: false }
    });
  } catch (error) {
    console.error('Get unread count error:', error);
    throw error;
  }
};

export const sendWorkoutReminder = async (client_id, user_id) => {
  await createNotification(
    user_id,
    'workout_reminder',
    'Workout Reminder',
    'You have a workout scheduled for today. Don\'t forget to log your progress!',
    '/client/workout'
  );
};

export const sendMealReminder = async (client_id, user_id) => {
  await createNotification(
    user_id,
    'meal_reminder',
    'Meal Log Reminder',
    'Remember to log your meals for today to track your nutrition.',
    '/client/diet'
  );
};

export const sendMessageNotification = async (receiver_id, sender_name) => {
  await createNotification(
    receiver_id,
    'message',
    'New Message',
    `You have a new message from ${sender_name}`,
    '/messages'
  );
};

export const sendProgramUpdate = async (client_id, user_id, trainer_name) => {
  await createNotification(
    user_id,
    'program_update',
    'Program Updated',
    `${trainer_name} has updated your workout program.`,
    '/client/dashboard'
  );
};

export const sendGoalAchieved = async (client_id, user_id, goal_type) => {
  await createNotification(
    user_id,
    'goal_achieved',
    'Goal Achieved! 🎉',
    `Congratulations! You've reached your ${goal_type} goal!`,
    '/client/progress'
  );
};