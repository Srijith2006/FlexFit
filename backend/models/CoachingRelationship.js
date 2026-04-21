export default (sequelize, DataTypes) => {
  const CoachingRelationship = sequelize.define('CoachingRelationship', {
    relationship_id: {
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
    trainer_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'trainers',
        key: 'trainer_id'
      }
    },
    status: {
      type: DataTypes.ENUM('pending', 'active', 'paused', 'completed', 'cancelled'),
      defaultValue: 'pending'
    },
    start_date: DataTypes.DATEONLY,
    end_date: DataTypes.DATEONLY,
    package_type: {
      type: DataTypes.ENUM('single_session', 'weekly', 'monthly', '3_month', '6_month', '12_month'),
      defaultValue: 'monthly'
    },
    sessions_per_week: {
      type: DataTypes.INTEGER,
      defaultValue: 3
    },
    monthly_rate: DataTypes.DECIMAL(10, 2),
    last_interaction: DataTypes.DATE,
    client_rating: {
      type: DataTypes.DECIMAL(2, 1),
      validate: { min: 0, max: 5 }
    },
    client_review: DataTypes.TEXT,
    trainer_notes: DataTypes.TEXT,
    goals: DataTypes.JSONB // Store client's specific goals for this relationship
  }, {
    tableName: 'coaching_relationships',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

  return CoachingRelationship;
};