export default (sequelize, DataTypes) => {
  const TrainerVideo = sequelize.define('TrainerVideo', {
    video_id: {
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
    video_url: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    thumbnail_url: DataTypes.TEXT,
    title: {
      type: DataTypes.STRING(200),
      allowNull: false
    },
    description: DataTypes.TEXT,
    duration_seconds: {
      type: DataTypes.INTEGER,
      validate: { min: 0 }
    },
    video_type: {
      type: DataTypes.ENUM(
        'exercise_demo', 'workout_routine',
        'form_tips', 'motivation', 'nutrition_advice'
      ),
      defaultValue: 'exercise_demo'
    },
    exercise_tags: {
      type: DataTypes.ARRAY(DataTypes.UUID),
      defaultValue: []
    },
    is_public: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    view_count: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    like_count: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    }
  }, {
    tableName: 'trainer_videos',
    timestamps: true,
    createdAt: 'uploaded_at',
    updatedAt: 'updated_at'
  });

  return TrainerVideo;
};