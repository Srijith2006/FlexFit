export default (sequelize, DataTypes) => {
  const DietPlan = sequelize.define('DietPlan', {
    diet_plan_id: {
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
    plan_name: {
      type: DataTypes.STRING(200),
      allowNull: false
    },
    daily_calories: {
      type: DataTypes.INTEGER,
      validate: { min: 0 }
    },
    protein_grams: DataTypes.INTEGER,
    carbs_grams: DataTypes.INTEGER,
    fats_grams: DataTypes.INTEGER,
    meal_count_per_day: {
      type: DataTypes.INTEGER,
      defaultValue: 3
    },
    diet_type: {
      type: DataTypes.ENUM(
        'balanced', 'keto', 'paleo', 'vegan', 'vegetarian',
        'mediterranean', 'low_carb', 'high_protein',
        'intermittent_fasting', 'gluten_free'
      ),
      defaultValue: 'balanced'
    },
    is_template: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  }, {
    tableName: 'diet_plans',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

  return DietPlan;
};