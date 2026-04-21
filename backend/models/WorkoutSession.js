export default (sequelize, DataTypes) => {
  const WorkoutSession = sequelize.define('WorkoutSession', {
    session_id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    program_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'workout_programs',
        key: 'program_id'
      }
    },
    session_name: {
      type: DataTypes.STRING(200),
      allowNull: false
    },
    day_of_week: {
      type: DataTypes.INTEGER,
      validate: { min: 1, max: 7 }
    },
    week_number: {
      type: DataTypes.INTEGER,
      defaultValue: 1
    },
    duration_minutes: DataTypes.INTEGER,
    focus_area: DataTypes.STRING(100),
    intensity_level: {
      type: DataTypes.INTEGER,
      validate: { min: 1, max: 10 }
    },
    instructions: DataTypes.TEXT,
    warmup_description: DataTypes.TEXT,
    cooldown_description: DataTypes.TEXT,
    is_rest_day: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    }
  }, {
    tableName: 'workout_sessions',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false
  });

  return WorkoutSession;
};