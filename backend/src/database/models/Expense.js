import { DataTypes } from "sequelize";
import sequelize from "../../config/db.js";

const Expense = sequelize.define(
  "Expense",
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
    created_by_user_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    category: {
      type: DataTypes.STRING(80),
      allowNull: false,
      defaultValue: "general",
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
    spent_at: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    tableName: "expenses",
  }
);

Expense.prototype.toSafeJSON = function () {
  return {
    id: this.id,
    branch_id: this.branch_id,
    created_by_user_id: this.created_by_user_id,
    category: this.category,
    concept: this.concept,
    amount: this.amount,
    payment_method: this.payment_method,
    spent_at: this.spent_at,
    notes: this.notes,
    branch: this.branch,
    created_by_user: this.created_by_user,
    created_at: this.created_at,
    updated_at: this.updated_at,
  };
};

export default Expense;