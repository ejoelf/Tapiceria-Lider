import { DataTypes } from "sequelize";
import sequelize from "../../config/db.js";

const Vehicle = sequelize.define(
  "Vehicle",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    client_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    branch_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    brand_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    model_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    vehicle_type: {
      type: DataTypes.STRING(40),
      allowNull: false,
      defaultValue: "car",
    },
    year: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    version: {
      type: DataTypes.STRING(120),
      allowNull: true,
    },
    plate: {
      type: DataTypes.STRING(20),
      allowNull: true,
      set(value) {
        this.setDataValue("plate", value ? value.toUpperCase().trim() : null);
      },
    },
    vin: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    color: {
      type: DataTypes.STRING(60),
      allowNull: true,
    },
    nickname: {
      type: DataTypes.STRING(120),
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
    tableName: "vehicles",
  }
);

Vehicle.prototype.toSafeJSON = function () {
  return {
    id: this.id,
    client_id: this.client_id,
    branch_id: this.branch_id,
    brand_id: this.brand_id,
    model_id: this.model_id,
    vehicle_type: this.vehicle_type,
    year: this.year,
    version: this.version,
    plate: this.plate,
    vin: this.vin,
    color: this.color,
    nickname: this.nickname,
    notes: this.notes,
    is_active: this.is_active,
    client: this.client,
    branch: this.branch,
    brand: this.brand,
    model: this.model,
    created_at: this.created_at,
    updated_at: this.updated_at,
  };
};

export default Vehicle;