import { DataTypes } from "sequelize";
import sequelize from "../../config/db.js";

const Employee = sequelize.define(
  "Employee",
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
    linked_user_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    first_name: {
      type: DataTypes.STRING(120),
      allowNull: false,
    },
    last_name: {
      type: DataTypes.STRING(120),
      allowNull: false,
    },
    document_number: {
      type: DataTypes.STRING(40),
      allowNull: true,
    },
    email: {
      type: DataTypes.STRING(150),
      allowNull: true,
    },
    phone: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    address: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    position: {
      type: DataTypes.STRING(120),
      allowNull: true,
    },
    hire_date: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    salary_reference: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0,
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
    tableName: "employees",
  }
);

Employee.prototype.toSafeJSON = function () {
  return {
    id: this.id,
    branch_id: this.branch_id,
    linked_user_id: this.linked_user_id,
    first_name: this.first_name,
    last_name: this.last_name,
    document_number: this.document_number,
    email: this.email,
    phone: this.phone,
    address: this.address,
    position: this.position,
    hire_date: this.hire_date,
    salary_reference: this.salary_reference,
    notes: this.notes,
    is_active: this.is_active,
    branch: this.branch,
    linked_user: this.linked_user,
    created_at: this.created_at,
    updated_at: this.updated_at,
  };
};

export default Employee;