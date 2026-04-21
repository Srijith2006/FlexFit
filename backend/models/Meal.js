export default (sequelize, DataTypes) => {
  const Meal = sequelize.define('Meal', {
    meal_id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    diet_plan_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'diet_plans',
        key: 'diet_plan_id'
      }
    },
    meal_type: {
      type: DataTypes.ENUM(
        'breakfast', 'morning_snack', 'lunch',
        'afternoon_snack', 'dinner', 'evening_snack'
      ),
      allowNull: false
    },
    meal_name: {
      type: DataTypes.STRING(200),
      allowNull: false
    },
    calories: {
      type: DataTypes.INTEGER,
      validate: { min: 0 }
    },
    protein_g: DataTypes.INTEGER,
    carbs_g: DataTypes.INTEGER,
    fats_g: DataTypes.INTEGER,
    preparation_time: DataTypes.INTEGER,
    ingredients: {
      type: DataTypes.ARRAY(DataTypes.TEXT),
      defaultValue: []
    },
    instructions: DataTypes.TEXT,
    dietary_tags: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      defaultValue: []
    },
    image_url: DataTypes.TEXT,
    order_index: {
      type: DataTypes.INTEGER,
      defaultValue: 1
    }
  }, {
    tableName: 'meals',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false
  });

  return Meal;
};