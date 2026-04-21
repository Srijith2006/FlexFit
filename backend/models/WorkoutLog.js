export default (sequelize, DataTypes) => {
  const WorkoutLog = sequelize.define('WorkoutLog', {
    log_id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    client_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'clients',
        key: 'client_id'
      }
    },
    session_exercise_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'session_exercises',
        key: 'session_exercise_id'
      }
    },
    coaching_relationship_id: {
      type: DataTypes.UUID,
      references: {
        model: 'coaching_relationships',
        key: 'relationship_id'
      }
    },
    scheduled_date: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    completed_date: DataTypes.DATE,
    status: {
      type: DataTypes.ENUM('scheduled', 'completed', 'skipped', 'partial', 'rescheduled'),
      defaultValue: 'scheduled'
    },
    actual_sets: DataTypes.INTEGER,
    actual_reps: DataTypes.INTEGER,
    actual_weight_kg: DataTypes.DECIMAL(6, 2),
    actual_duration: DataTypes.INTEGER,
    perceived_difficulty: {
      type: DataTypes.INTEGER,
      validate: { min: 1, max: 10 }
    },
    client_notes: DataTypes.TEXT,
    trainer_feedback: DataTypes.TEXT
  }, {
    tableName: 'workout_logs',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

  return WorkoutLog;
};