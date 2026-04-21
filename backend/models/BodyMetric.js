export default (sequelize, DataTypes) => {
  const BodyMetric = sequelize.define('BodyMetric', {
    metric_id: {
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
    recorded_date: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    weight_kg: DataTypes.DECIMAL(5, 2),
    body_fat_percentage: DataTypes.DECIMAL(4, 1),
    chest_cm: DataTypes.DECIMAL(5, 1),
    waist_cm: DataTypes.DECIMAL(5, 1),
    hips_cm: DataTypes.DECIMAL(5, 1),
    arms_cm: DataTypes.DECIMAL(5, 1),
    thighs_cm: DataTypes.DECIMAL(5, 1),
    progress_photos_front: {
      type: DataTypes.ARRAY(DataTypes.TEXT),
      defaultValue: []
    },
    progress_photos_side: {
      type: DataTypes.ARRAY(DataTypes.TEXT),
      defaultValue: []
    },
    progress_photos_back: {
      type: DataTypes.ARRAY(DataTypes.TEXT),
      defaultValue: []
    },
    notes: DataTypes.TEXT
  }, {
    tableName: 'body_metrics',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false
  });

  return BodyMetric;
};