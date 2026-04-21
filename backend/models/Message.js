export default (sequelize, DataTypes) => {
  const Message = sequelize.define('Message', {
    message_id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    sender_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'user_id'
      }
    },
    receiver_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'user_id'
      }
    },
    coaching_relationship_id: {
      type: DataTypes.UUID,
      references: {
        model: 'coaching_relationships',
        key: 'relationship_id'
      }
    },
    message_type: {
      type: DataTypes.ENUM('text', 'image', 'video', 'file', 'system'),
      defaultValue: 'text'
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    attachment_url: DataTypes.TEXT,
    is_read: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    sent_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    read_at: DataTypes.DATE,
    is_deleted_by_sender: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    is_deleted_by_receiver: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    }
  }, {
    tableName: 'messages',
    timestamps: false
  });

  return Message;
};