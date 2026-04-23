import { DataTypes } from "sequelize";
import sequelize from "../../config/db.js";

const InventoryMovement = sequelize.define(
  "InventoryMovement",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    material_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    work_order_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    created_by_user_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    movement_type: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    quantity: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
    },
    unit_cost: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0,
    },
    note: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    tableName: "inventory_movements",
  }
);

InventoryMovement.prototype.toSafeJSON = function () {
  return {
    id: this.id,
    material_id: this.material_id,
    work_order_id: this.work_order_id,
    created_by_user_id: this.created_by_user_id,
    movement_type: this.movement_type,
    quantity: this.quantity,
    unit_cost: this.unit_cost,
    note: this.note,
    material: this.material,
    work_order: this.work_order,
    created_by_user: this.created_by_user,
    created_at: this.created_at,
    updated_at: this.updated_at,
  };
};

export default InventoryMovement;