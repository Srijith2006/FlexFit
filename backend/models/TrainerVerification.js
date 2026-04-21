export default (sequelize, DataTypes) => {
  const TrainerVerification = sequelize.define('TrainerVerification', {
    verification_id: {
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
    document_type: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    document_url: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    document_number: DataTypes.STRING(100),
    issued_by: DataTypes.STRING(200),
    issue_date: DataTypes.DATEONLY,
    expiry_date: DataTypes.DATEONLY,
    verification_method: {
      type: DataTypes.STRING(50),
      defaultValue: 'manual'
    },
    ai_confidence_score: {
      type: DataTypes.DECIMAL(3, 2),
      validate: { min: 0, max: 1 }
    },
    extracted_data: DataTypes.JSONB,
    /*admin_reviewer_id: {
      type: DataTypes.UUID,
      references: {
        model: 'admins',
        key: 'admin_id'
      }
    },*/
    status: {
      type: DataTypes.ENUM('pending', 'ai_reviewed', 'approved', 'rejected', 'additional_docs_required'),
      defaultValue: 'pending'
    },
    submitted_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    reviewed_at: DataTypes.DATE,
    rejection_reason: DataTypes.TEXT
  }, {
    tableName: 'trainer_verifications',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false
  });

  return TrainerVerification;
};