import { DataTypes } from "sequelize";
import sequelize from "../../config/db.js";

const Material = sequelize.define(
  "Material",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    category_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    branch_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    code: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
    },
    name: {
      type: DataTypes.STRING(150),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    unit: {
      type: DataTypes.STRING(30),
      allowNull: false,
      defaultValue: "unit",
    },
    color: {
      type: DataTypes.STRING(80),
      allowNull: true,
    },
    stock_current: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0,
    },
    stock_minimum: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0,
    },
    cost_reference: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0,
    },
    storage_location: {
      type: DataTypes.STRING(150),
      allowNull: true,
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  },
  {
    tableName: "materials",
  }
);

Material.prototype.toSafeJSON = function () {
  return {
    id: this.id,
    category_id: this.category_id,
    branch_id: this.branch_id,
    code: this.code,
    name: this.name,
    description: this.description,
    unit: this.unit,
    color: this.color,
    stock_current: this.stock_current,
    stock_minimum: this.stock_minimum,
    cost_reference: this.cost_reference,
    storage_location: this.storage_location,
    notes: this.notes,
    is_active: this.is_active,
    category: this.category,
    branch: this.branch,
    created_at: this.created_at,
    updated_at: this.updated_at,
  };
};

export default Material;