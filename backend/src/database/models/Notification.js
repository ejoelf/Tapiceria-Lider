import { DataTypes } from "sequelize";
import sequelize from "../../config/db.js";

const Notification = sequelize.define(
  "Notification",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    event_code: {
      type: DataTypes.STRING(80),
      allowNull: false,
    },
    title: {
      type: DataTypes.STRING(180),
      allowNull: false,
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    level: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: "info",
    },
    channels: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: ["in_app"],
    },
    delivery_status: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
    entity_type: {
      type: DataTypes.STRING(80),
      allowNull: true,
    },
    entity_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    payload: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
    is_read: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    read_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    tableName: "notifications",
  }
);

Notification.prototype.toSafeJSON = function () {
  return {
    id: this.id,
    user_id: this.user_id,
    event_code: this.event_code,
    title: this.title,
    message: this.message,
    level: this.level,
    channels: this.channels,
    delivery_status: this.delivery_status,
    entity_type: this.entity_type,
    entity_id: this.entity_id,
    payload: this.payload,
    is_read: this.is_read,
    read_at: this.read_at,
    user: this.user,
    created_at: this.created_at,
    updated_at: this.updated_at,
  };
};

export default Notification;