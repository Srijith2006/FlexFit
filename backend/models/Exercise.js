export default (sequelize, DataTypes) => {
  const Exercise = sequelize.define('Exercise', {
    exercise_id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    exercise_name: {
      type: DataTypes.STRING(200),
      allowNull: false
    },
    muscle_group: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      defaultValue: []
    },
    equipment_needed: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      defaultValue: []
    },
    difficulty_level: {
      type: DataTypes.ENUM('beginner', 'intermediate', 'advanced', 'expert'),
      defaultValue: 'intermediate'
    },
    exercise_type: {
      type: DataTypes.ENUM('strength', 'cardio', 'flexibility', 'balance', 'plyometric', 'calisthenics'),
      defaultValue: 'strength'
    },
    default_sets: {
      type: DataTypes.INTEGER,
      defaultValue: 3
    },
    default_reps: {
      type: DataTypes.INTEGER,
      defaultValue: 12
    },
    default_duration: DataTypes.INTEGER,
    instructions: DataTypes.TEXT,
    video_demo_url: DataTypes.TEXT,
    image_demo_url: DataTypes.TEXT,
    created_by_trainer_id: {
      type: DataTypes.UUID,
      references: {
        model: 'trainers',
        key: 'trainer_id'
      }
    },
    is_system_exercise: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    }
  }, {
    tableName: 'exercises',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false
  });

  return Exercise;
};