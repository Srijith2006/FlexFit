export default (sequelize, DataTypes) => {
  const SessionExercise = sequelize.define('SessionExercise', {
    session_exercise_id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    session_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'workout_sessions',
        key: 'session_id'
      }
    },
    exercise_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'exercises',
        key: 'exercise_id'
      }
    },
    order_index: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    custom_sets: DataTypes.INTEGER,
    custom_reps: DataTypes.INTEGER,
    custom_weight_kg: DataTypes.DECIMAL(6, 2),
    custom_duration: DataTypes.INTEGER,
    rest_seconds: {
      type: DataTypes.INTEGER,
      defaultValue: 60
    },
    trainer_notes: DataTypes.TEXT,
    alternative_exercise_id: {
      type: DataTypes.UUID,
      references: {
        model: 'exercises',
        key: 'exercise_id'
      }
    },
    is_superset: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    superset_group: DataTypes.INTEGER
  }, {
    tableName: 'session_exercises',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false
  });

  return SessionExercise;
};