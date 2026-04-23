import { DataTypes } from "sequelize";
import sequelize from "../../config/db.js";

const Mold = sequelize.define(
  "Mold",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    brand_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    model_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    technical_part_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    created_by_user_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    code: {
      type: DataTypes.STRING(80),
      allowNull: false,
      unique: true,
    },
    title: {
      type: DataTypes.STRING(180),
      allowNull: false,
    },
    vehicle_type: {
      type: DataTypes.STRING(40),
      allowNull: false,
      defaultValue: "car",
    },
    year_from: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    year_to: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    version_label: {
      type: DataTypes.STRING(120),
      allowNull: true,
    },
    material_reference: {
      type: DataTypes.STRING(120),
      allowNull: true,
    },
    dimensions_notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    technical_notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    print_notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    is_reference_verified: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  },
  {
    tableName: "molds",
  }
);

Mold.prototype.toSafeJSON = function () {
  return {
    id: this.id,
    brand_id: this.brand_id,
    model_id: this.model_id,
    technical_part_id: this.technical_part_id,
    created_by_user_id: this.created_by_user_id,
    code: this.code,
    title: this.title,
    vehicle_type: this.vehicle_type,
    year_from: this.year_from,
    year_to: this.year_to,
    version_label: this.version_label,
    material_reference: this.material_reference,
    dimensions_notes: this.dimensions_notes,
    technical_notes: this.technical_notes,
    print_notes: this.print_notes,
    is_reference_verified: this.is_reference_verified,
    is_active: this.is_active,
    brand: this.brand,
    model: this.model,
    technical_part: this.technical_part,
    created_by_user: this.created_by_user,
    files: this.files,
    created_at: this.created_at,
    updated_at: this.updated_at,
  };
};

export default Mold;