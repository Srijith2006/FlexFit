export default (sequelize, DataTypes) => {
  const Trainer = sequelize.define('Trainer', {
    trainer_id: {
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

    specializations: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      defaultValue: []
    },

    years_experience: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },

    bio: DataTypes.TEXT,

    hourly_rate: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0
    },

    currency: {
      type: DataTypes.STRING(3),
      defaultValue: 'USD'
    },

    languages: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      defaultValue: ['English']
    },

    certification_status: DataTypes.STRING(50),

    star_rating: {
      type: DataTypes.DECIMAL(2, 1),
      defaultValue: 0,
      validate: {
        min: 0,
        max: 5
      }
    },

    total_clients_served: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },

    current_client_load: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },

    response_time_hours: DataTypes.DECIMAL(4, 1),

    // ✅ OLD FIELD (keep it for quick filtering)
    is_verified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },

    verification_date: DataTypes.DATE,

    // ✅ NEW FIELD (MAIN CONTROL)
    verification_status: {
      type: DataTypes.ENUM('pending', 'approved', 'rejected'),
      defaultValue: 'pending'
    },

    // ✅ STORE DOCUMENT
    document_url: {
      type: DataTypes.TEXT
    },

    // OPTIONAL: rejection reason
    rejection_reason: {
      type: DataTypes.TEXT
    },

    max_clients: {
      type: DataTypes.INTEGER,
      defaultValue: 50
    },

    instagram_url: DataTypes.STRING(255),

    website_url: DataTypes.STRING(255)

  }, {
    tableName: 'trainers',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

  return Trainer;
};