export default (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    user_id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      }
    },
    password_hash: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    role: {
      type: DataTypes.ENUM('admin', 'trainer', 'client'),
      defaultValue: 'client'
    },
    first_name: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    last_name: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    phone: DataTypes.STRING(20),
    profile_image_url: DataTypes.TEXT,
    date_of_birth: DataTypes.DATEONLY,
    gender: {
      type: DataTypes.ENUM('male', 'female', 'other', 'prefer_not_to_say')
    },
    country: DataTypes.STRING(100),
    timezone: {
      type: DataTypes.STRING(50),
      defaultValue: 'UTC'
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    role: {
      type: DataTypes.STRING,
      defaultValue: 'client' // client | trainer | admin
    },
    email_verified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    last_login: DataTypes.DATE
  }, {
    tableName: 'users',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

  return User;
};