export default (sequelize, DataTypes) => {
  const Payment = sequelize.define('Payment', {
    payment_id: {
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
      references: {
        model: 'trainers',
        key: 'trainer_id'
      }
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    currency: {
      type: DataTypes.STRING(3),
      defaultValue: 'USD'
    },
    payment_type: {
      type: DataTypes.ENUM(
        'platform_subscription', 'trainer_session',
        'trainer_package', 'refund'
      ),
      allowNull: false
    },
    stripe_payment_intent_id: {
      type: DataTypes.STRING(100),
      unique: true
    },
    platform_fee: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0
    },
    trainer_payout: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0
    },
    status: {
      type: DataTypes.ENUM('pending', 'completed', 'failed', 'refunded', 'disputed'),
      defaultValue: 'pending'
    },
    description: DataTypes.TEXT,
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'payments',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

  return Payment;
};