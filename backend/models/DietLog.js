export default (sequelize, DataTypes) => {
  const DietLog = sequelize.define('DietLog', {
    log_id: {
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
    log_date: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    total_calories: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    total_protein: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    total_carbs: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    total_fats: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    water_intake_ml: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    adherence_score: {
      type: DataTypes.INTEGER,
      validate: { min: 0, max: 100 }
    },
    meals_logged: {
      type: DataTypes.JSONB,
      defaultValue: []
    },
    notes: DataTypes.TEXT
  }, {
    tableName: 'diet_logs',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

  return DietLog;
};