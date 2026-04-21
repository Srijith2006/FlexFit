export default (sequelize, DataTypes) => {
  const Subscription = sequelize.define('Subscription', {
    subscription_id: {
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
    plan_type: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    currency: {
      type: DataTypes.STRING(3),
      defaultValue: 'USD'
    },
    billing_cycle: {
      type: DataTypes.ENUM('weekly', 'monthly', 'quarterly', 'yearly'),
      defaultValue: 'monthly'
    },
    stripe_subscription_id: {
      type: DataTypes.STRING(100),
      unique: true
    },
    status: {
      type: DataTypes.ENUM('active', 'inactive', 'trial', 'cancelled', 'expired'),
      defaultValue: 'active'
    },
    start_date: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    end_date: DataTypes.DATE,
    cancel_at_period_end: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    payment_method_id: DataTypes.STRING(100)
  }, {
    tableName: 'subscriptions',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

  return Subscription;
};