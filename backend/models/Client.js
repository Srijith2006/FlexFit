export default (sequelize, DataTypes) => {
  const Client = sequelize.define('Client', {
    client_id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      unique: true,
      references: {
        model: 'users',
        key: 'user_id'
      }
    },
    fitness_goal: {
      type: DataTypes.ENUM(
        'lose_weight', 'gain_muscle', 'maintain', 
        'improve_endurance', 'increase_flexibility', 
        'sports_performance', 'general_health'
      )
    },
    current_weight_kg: DataTypes.DECIMAL(5, 2),
    target_weight_kg: DataTypes.DECIMAL(5, 2),
    height_cm: DataTypes.INTEGER,
    body_fat_percentage: DataTypes.DECIMAL(4, 1),
    activity_level: {
      type: DataTypes.ENUM(
        'sedentary', 'lightly_active', 'moderately_active', 
        'very_active', 'extremely_active'
      ),
      defaultValue: 'moderately_active'
    },
    medical_conditions: {
      type: DataTypes.ARRAY(DataTypes.TEXT),
      defaultValue: []
    },
    dietary_restrictions: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      defaultValue: []
    },
    available_equipment: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      defaultValue: []
    },
    workout_days_per_week: {
      type: DataTypes.INTEGER,
      validate: { min: 1, max: 7 }
    },
    subscription_status: {
      type: DataTypes.ENUM('active', 'inactive', 'trial', 'cancelled', 'expired'),
      defaultValue: 'inactive'
    },
    subscription_expiry: DataTypes.DATE,
    onboarding_completed: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    preferred_workout_time: DataTypes.TIME
  }, {
    tableName: 'clients',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

  return Client;
};