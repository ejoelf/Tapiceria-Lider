import { DataTypes } from "sequelize";
import sequelize from "../../config/db.js";

const WorkOrderMedia = sequelize.define(
  "WorkOrderMedia",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    work_order_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    uploaded_by_user_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    media_type: {
      type: DataTypes.STRING(30),
      allowNull: false,
    },
    stage: {
      type: DataTypes.STRING(30),
      allowNull: false,
      defaultValue: "other",
    },
    title: {
      type: DataTypes.STRING(180),
      allowNull: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    storage_type: {
      type: DataTypes.STRING(30),
      allowNull: false,
      defaultValue: "local",
    },
    file_name: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    original_name: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    mime_type: {
      type: DataTypes.STRING(120),
      allowNull: true,
    },
    file_size: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    file_path: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    file_url: {
      type: DataTypes.STRING(1000),
      allowNull: true,
    },
    external_url: {
      type: DataTypes.STRING(1000),
      allowNull: true,
    },
    thumbnail_url: {
      type: DataTypes.STRING(1000),
      allowNull: true,
    },
    sort_order: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    is_cover: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    is_public_portfolio_asset: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    metadata: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
  },
  {
    tableName: "work_order_media",
  }
);

WorkOrderMedia.prototype.toSafeJSON = function () {
  return {
    id: this.id,
    work_order_id: this.work_order_id,
    uploaded_by_user_id: this.uploaded_by_user_id,
    media_type: this.media_type,
    stage: this.stage,
    title: this.title,
    description: this.description,
    storage_type: this.storage_type,
    file_name: this.file_name,
    original_name: this.original_name,
    mime_type: this.mime_type,
    file_size: this.file_size,
    file_path: this.file_path,
    file_url: this.file_url,
    external_url: this.external_url,
    thumbnail_url: this.thumbnail_url,
    sort_order: this.sort_order,
    is_cover: this.is_cover,
    is_public_portfolio_asset: this.is_public_portfolio_asset,
    is_active: this.is_active,
    metadata: this.metadata,
    uploaded_by_user: this.uploaded_by_user,
    created_at: this.created_at,
    updated_at: this.updated_at,
  };
};

export default WorkOrderMedia;