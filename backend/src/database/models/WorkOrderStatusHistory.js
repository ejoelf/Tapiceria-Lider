import { DataTypes } from "sequelize";
import sequelize from "../../config/db.js";

const WorkOrderStatusHistory = sequelize.define(
  "WorkOrderStatusHistory",
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
    previous_status_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    new_status_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    changed_by_user_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    note: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    tableName: "work_order_status_history",
  }
);

export default WorkOrderStatusHistory;