import { DataTypes } from "sequelize";
import sequelize from "../../config/db.js";

const MoldFile = sequelize.define(
  "MoldFile",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    mold_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    uploaded_by_user_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    file_type: {
      type: DataTypes.STRING(30),
      allowNull: false,
    },
    version_number: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
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
    is_printable: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    is_current: {
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
    tableName: "mold_files",
  }
);

MoldFile.prototype.toSafeJSON = function () {
  return {
    id: this.id,
    mold_id: this.mold_id,
    uploaded_by_user_id: this.uploaded_by_user_id,
    file_type: this.file_type,
    version_number: this.version_number,
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
    is_printable: this.is_printable,
    is_current: this.is_current,
    metadata: this.metadata,
    uploaded_by_user: this.uploaded_by_user,
    created_at: this.created_at,
    updated_at: this.updated_at,
  };
};

export default MoldFile;