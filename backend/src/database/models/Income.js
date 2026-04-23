import { DataTypes } from "sequelize";
import sequelize from "../../config/db.js";

const Income = sequelize.define(
  "Income",
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
    work_order_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    created_by_user_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    type: {
      type: DataTypes.STRING(40),
      allowNull: false,
      defaultValue: "payment",
    },
    concept: {
      type: DataTypes.STRING(180),
      allowNull: false,
    },
    amount: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
    },
    payment_method: {
      type: DataTypes.STRING(40),
      allowNull: false,
      defaultValue: "cash",
    },
    paid_at: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    tableName: "incomes",
  }
);

Income.prototype.toSafeJSON = function () {
  return {
    id: this.id,
    branch_id: this.branch_id,
    work_order_id: this.work_order_id,
    created_by_user_id: this.created_by_user_id,
    type: this.type,
    concept: this.concept,
    amount: this.amount,
    payment_method: this.payment_method,
    paid_at: this.paid_at,
    notes: this.notes,
    branch: this.branch,
    work_order: this.work_order,
    created_by_user: this.created_by_user,
    created_at: this.created_at,
    updated_at: this.updated_at,
  };
};

export default Income;