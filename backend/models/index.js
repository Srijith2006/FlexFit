import { Sequelize, DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

// Import all models
import UserModel from './User.js';
import TrainerModel from './Trainer.js';
import ClientModel from './Client.js';
import CoachingRelationshipModel from './CoachingRelationship.js';
import WorkoutProgramModel from './WorkoutProgram.js';
import WorkoutSessionModel from './WorkoutSession.js';
import ExerciseModel from './Exercise.js';
import SessionExerciseModel from './SessionExercise.js';
import WorkoutLogModel from './WorkoutLog.js';
import BodyMetricModel from './BodyMetric.js';
import DietPlanModel from './DietPlan.js';
import MealModel from './Meal.js';
import DietLogModel from './DietLog.js';
import MessageModel from './Message.js';
import PaymentModel from './Payment.js';
import SubscriptionModel from './Subscription.js';
import TrainerVerificationModel from './TrainerVerification.js';
import TrainerVideoModel from './TrainerVideo.js';
import NotificationModel from './Notification.js';

// Initialize models
const User = UserModel(sequelize, DataTypes);
const Trainer = TrainerModel(sequelize, DataTypes);
const Client = ClientModel(sequelize, DataTypes);
const CoachingRelationship = CoachingRelationshipModel(sequelize, DataTypes);
const WorkoutProgram = WorkoutProgramModel(sequelize, DataTypes);
const WorkoutSession = WorkoutSessionModel(sequelize, DataTypes);
const Exercise = ExerciseModel(sequelize, DataTypes);
const SessionExercise = SessionExerciseModel(sequelize, DataTypes);
const WorkoutLog = WorkoutLogModel(sequelize, DataTypes);
const BodyMetric = BodyMetricModel(sequelize, DataTypes);
const DietPlan = DietPlanModel(sequelize, DataTypes);
const Meal = MealModel(sequelize, DataTypes);
const DietLog = DietLogModel(sequelize, DataTypes);
const Message = MessageModel(sequelize, DataTypes);
const Payment = PaymentModel(sequelize, DataTypes);
const Subscription = SubscriptionModel(sequelize, DataTypes);
const TrainerVerification = TrainerVerificationModel(sequelize, DataTypes);
const TrainerVideo = TrainerVideoModel(sequelize, DataTypes);
const Notification = NotificationModel(sequelize, DataTypes);

// Define relationships
User.hasOne(Trainer, { foreignKey: 'user_id', onDelete: 'CASCADE' });
Trainer.belongsTo(User, { foreignKey: 'user_id' });

User.hasOne(Client, { foreignKey: 'user_id', onDelete: 'CASCADE' });
Client.belongsTo(User, { foreignKey: 'user_id' });

Trainer.hasMany(CoachingRelationship, { foreignKey: 'trainer_id' });
Client.hasMany(CoachingRelationship, { foreignKey: 'client_id' });
CoachingRelationship.belongsTo(Trainer, { foreignKey: 'trainer_id' });
CoachingRelationship.belongsTo(Client, { foreignKey: 'client_id' });

Trainer.hasMany(WorkoutProgram, { foreignKey: 'trainer_id' });
Client.hasMany(WorkoutProgram, { foreignKey: 'client_id' });
WorkoutProgram.belongsTo(Trainer, { foreignKey: 'trainer_id' });
WorkoutProgram.belongsTo(Client, { foreignKey: 'client_id' });

WorkoutProgram.hasMany(WorkoutSession, { foreignKey: 'program_id', onDelete: 'CASCADE' });
WorkoutSession.belongsTo(WorkoutProgram, { foreignKey: 'program_id' });

WorkoutSession.hasMany(SessionExercise, { foreignKey: 'session_id', onDelete: 'CASCADE' });
SessionExercise.belongsTo(WorkoutSession, { foreignKey: 'session_id' });

Exercise.hasMany(SessionExercise, { foreignKey: 'exercise_id' });
SessionExercise.belongsTo(Exercise, { foreignKey: 'exercise_id' });

Client.hasMany(WorkoutLog, { foreignKey: 'client_id' });
WorkoutLog.belongsTo(Client, { foreignKey: 'client_id' });
WorkoutLog.belongsTo(SessionExercise, { foreignKey: 'session_exercise_id' });
WorkoutLog.belongsTo(CoachingRelationship, { foreignKey: 'coaching_relationship_id' });

Client.hasMany(BodyMetric, { foreignKey: 'client_id' });
BodyMetric.belongsTo(Client, { foreignKey: 'client_id' });

Trainer.hasMany(DietPlan, { foreignKey: 'trainer_id' });
Client.hasMany(DietPlan, { foreignKey: 'client_id' });
DietPlan.belongsTo(Trainer, { foreignKey: 'trainer_id' });
DietPlan.belongsTo(Client, { foreignKey: 'client_id' });

DietPlan.hasMany(Meal, { foreignKey: 'diet_plan_id', onDelete: 'CASCADE' });
Meal.belongsTo(DietPlan, { foreignKey: 'diet_plan_id' });

Client.hasMany(DietLog, { foreignKey: 'client_id' });
DietLog.belongsTo(Client, { foreignKey: 'client_id' });

User.hasMany(Message, { foreignKey: 'sender_id', as: 'SentMessages' });
User.hasMany(Message, { foreignKey: 'receiver_id', as: 'ReceivedMessages' });
Message.belongsTo(User, { foreignKey: 'sender_id', as: 'Sender' });
Message.belongsTo(User, { foreignKey: 'receiver_id', as: 'Receiver' });
Message.belongsTo(CoachingRelationship, { foreignKey: 'coaching_relationship_id' });

Client.hasMany(Payment, { foreignKey: 'client_id' });
Payment.belongsTo(Client, { foreignKey: 'client_id' });
Payment.belongsTo(Trainer, { foreignKey: 'trainer_id' });

Client.hasMany(Subscription, { foreignKey: 'client_id' });
Subscription.belongsTo(Client, { foreignKey: 'client_id' });

Trainer.hasMany(TrainerVerification, { foreignKey: 'trainer_id' });
TrainerVerification.belongsTo(Trainer, { foreignKey: 'trainer_id' });

Trainer.hasMany(TrainerVideo, { foreignKey: 'trainer_id' });
TrainerVideo.belongsTo(Trainer, { foreignKey: 'trainer_id' });

User.hasMany(Notification, { foreignKey: 'user_id' });
Notification.belongsTo(User, { foreignKey: 'user_id' });

export {
  sequelize,
  User,
  Trainer,
  Client,
  CoachingRelationship,
  WorkoutProgram,
  WorkoutSession,
  Exercise,
  SessionExercise,
  WorkoutLog,
  BodyMetric,
  DietPlan,
  Meal,
  DietLog,
  Message,
  Payment,
  Subscription,
  TrainerVerification,
  TrainerVideo,
  Notification
};