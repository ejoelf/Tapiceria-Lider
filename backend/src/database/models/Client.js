import { DataTypes } from "sequelize";
import sequelize from "../../config/db.js";

const Client = sequelize.define(
  "Client",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    branch_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    client_type: {
      type: DataTypes.STRING(30),
      allowNull: false,
      defaultValue: "individual",
    },
    first_name: {
      type: DataTypes.STRING(120),
      allowNull: true,
    },
    last_name: {
      type: DataTypes.STRING(120),
      allowNull: true,
    },
    company_name: {
      type: DataTypes.STRING(180),
      allowNull: true,
    },
    tax_id: {
      type: DataTypes.STRING(30),
      allowNull: true,
    },
    email: {
      type: DataTypes.STRING(150),
      allowNull: true,
      set(value) {
        this.setDataValue("email", value ? value.toLowerCase().trim() : null);
      },
    },
    phone: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    secondary_phone: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    address: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    city: {
      type: DataTypes.STRING(120),
      allowNull: true,
    },
    province: {
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
    tableName: "clients",
  }
);

Client.prototype.getDisplayName = function () {
  if (this.client_type === "company") {
    return this.company_name || "Empresa sin nombre";
  }

  return `${this.first_name || ""} ${this.last_name || ""}`.trim() || "Cliente sin nombre";
};

Client.prototype.toSafeJSON = function () {
  return {
    id: this.id,
    branch_id: this.branch_id,
    client_type: this.client_type,
    first_name: this.first_name,
    last_name: this.last_name,
    company_name: this.company_name,
    display_name: this.getDisplayName(),
    tax_id: this.tax_id,
    email: this.email,
    phone: this.phone,
    secondary_phone: this.secondary_phone,
    address: this.address,
    city: this.city,
    province: this.province,
    notes: this.notes,
    is_active: this.is_active,
    branch: this.branch,
    vehicles: this.vehicles,
    created_at: this.created_at,
    updated_at: this.updated_at,
  };
};

export default Client;