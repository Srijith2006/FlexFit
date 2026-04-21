export default (sequelize, DataTypes) => {
  const WorkoutProgram = sequelize.define('WorkoutProgram', {
    program_id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    trainer_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'trainers',
        key: 'trainer_id'
      }
    },
    client_id: {
      type: DataTypes.UUID,
      references: {
        model: 'clients',
        key: 'client_id'
      }
    },
    program_name: {
      type: DataTypes.STRING(200),
      allowNull: false
    },
    description: DataTypes.TEXT,
    duration_weeks: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    difficulty_level: {
      type: DataTypes.ENUM('beginner', 'intermediate', 'advanced', 'expert'),
      defaultValue: 'intermediate'
    },
    goal_type: {
      type: DataTypes.ENUM(
        'lose_weight', 'gain_muscle', 'maintain', 
        'improve_endurance', 'increase_flexibility', 
        'sports_performance', 'general_health'
      )
    },
    is_template: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    template_category: DataTypes.STRING(100),
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  }, {
    tableName: 'workout_programs',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

  return WorkoutProgram;
};