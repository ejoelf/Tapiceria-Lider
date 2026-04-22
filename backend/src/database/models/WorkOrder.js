import { DataTypes } from "sequelize";
import sequelize from "../../config/db.js";

const WorkOrder = sequelize.define(
  "WorkOrder",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    code: {
      type: DataTypes.STRING(40),
      allowNull: false,
      unique: true,
    },
    branch_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    client_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    vehicle_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    created_by_user_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    current_status_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    service_type: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    title: {
      type: DataTypes.STRING(180),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    internal_notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    vehicle_snapshot: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
    client_snapshot: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
    priority: {
      type: DataTypes.STRING(30),
      allowNull: false,
      defaultValue: "medium",
    },
    estimated_start_date: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    estimated_end_date: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    actual_start_date: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    completed_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    delivered_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    estimated_price: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: true,
      defaultValue: 0,
    },
    final_price: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: true,
      defaultValue: 0,
    },
    advance_paid: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0,
    },
    is_public_portfolio_candidate: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    customer_reference: {
      type: DataTypes.STRING(120),
      allowNull: true,
    },
    source_channel: {
      type: DataTypes.STRING(40),
      allowNull: false,
      defaultValue: "manual",
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  },
  {
    tableName: "work_orders",
  }
);

WorkOrder.prototype.toSafeJSON = function () {
  return {
    id: this.id,
    code: this.code,
    branch_id: this.branch_id,
    client_id: this.client_id,
    vehicle_id: this.vehicle_id,
    created_by_user_id: this.created_by_user_id,
    current_status_id: this.current_status_id,
    service_type: this.service_type,
    title: this.title,
    description: this.description,
    internal_notes: this.internal_notes,
    vehicle_snapshot: this.vehicle_snapshot,
    client_snapshot: this.client_snapshot,
    priority: this.priority,
    estimated_start_date: this.estimated_start_date,
    estimated_end_date: this.estimated_end_date,
    actual_start_date: this.actual_start_date,
    completed_at: this.completed_at,
    delivered_at: this.delivered_at,
    estimated_price: this.estimated_price,
    final_price: this.final_price,
    advance_paid: this.advance_paid,
    is_public_portfolio_candidate: this.is_public_portfolio_candidate,
    customer_reference: this.customer_reference,
    source_channel: this.source_channel,
    is_active: this.is_active,
    branch: this.branch,
    client: this.client,
    vehicle: this.vehicle,
    created_by_user: this.created_by_user,
    current_status: this.current_status,
    status_history: this.status_history,
    media_items: this.media_items,
    created_at: this.created_at,
    updated_at: this.updated_at,
  };
};

export default WorkOrder;