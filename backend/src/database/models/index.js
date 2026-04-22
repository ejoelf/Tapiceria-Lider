import Role from "./Role.js";
import Branch from "./Branch.js";
import User from "./User.js";
import Permission from "./Permission.js";
import RolePermission from "./RolePermission.js";
import Client from "./Client.js";
import VehicleBrand from "./VehicleBrand.js";
import VehicleModel from "./VehicleModel.js";
import Vehicle from "./Vehicle.js";
import WorkOrderStatus from "./WorkOrderStatus.js";
import WorkOrder from "./WorkOrder.js";
import WorkOrderStatusHistory from "./WorkOrderStatusHistory.js";
import WorkOrderMedia from "./WorkOrderMedia.js";

Role.hasMany(User, {
  foreignKey: "role_id",
  as: "users",
});

User.belongsTo(Role, {
  foreignKey: "role_id",
  as: "role",
});

Branch.hasMany(User, {
  foreignKey: "branch_id",
  as: "users",
});

User.belongsTo(Branch, {
  foreignKey: "branch_id",
  as: "branch",
});

Role.belongsToMany(Permission, {
  through: RolePermission,
  foreignKey: "role_id",
  otherKey: "permission_id",
  as: "permissions",
});

Permission.belongsToMany(Role, {
  through: RolePermission,
  foreignKey: "permission_id",
  otherKey: "role_id",
  as: "roles",
});

Role.hasMany(RolePermission, {
  foreignKey: "role_id",
  as: "role_permissions",
});

RolePermission.belongsTo(Role, {
  foreignKey: "role_id",
  as: "role",
});

Permission.hasMany(RolePermission, {
  foreignKey: "permission_id",
  as: "role_permissions",
});

RolePermission.belongsTo(Permission, {
  foreignKey: "permission_id",
  as: "permission",
});

Branch.hasMany(Client, {
  foreignKey: "branch_id",
  as: "clients",
});

Client.belongsTo(Branch, {
  foreignKey: "branch_id",
  as: "branch",
});

Client.hasMany(Vehicle, {
  foreignKey: "client_id",
  as: "vehicles",
});

Vehicle.belongsTo(Client, {
  foreignKey: "client_id",
  as: "client",
});

Branch.hasMany(Vehicle, {
  foreignKey: "branch_id",
  as: "vehicles",
});

Vehicle.belongsTo(Branch, {
  foreignKey: "branch_id",
  as: "branch",
});

VehicleBrand.hasMany(VehicleModel, {
  foreignKey: "brand_id",
  as: "models",
});

VehicleModel.belongsTo(VehicleBrand, {
  foreignKey: "brand_id",
  as: "brand",
});

VehicleBrand.hasMany(Vehicle, {
  foreignKey: "brand_id",
  as: "vehicles",
});

Vehicle.belongsTo(VehicleBrand, {
  foreignKey: "brand_id",
  as: "brand",
});

VehicleModel.hasMany(Vehicle, {
  foreignKey: "model_id",
  as: "vehicles",
});

Vehicle.belongsTo(VehicleModel, {
  foreignKey: "model_id",
  as: "model",
});

Branch.hasMany(WorkOrder, {
  foreignKey: "branch_id",
  as: "work_orders",
});

WorkOrder.belongsTo(Branch, {
  foreignKey: "branch_id",
  as: "branch",
});

Client.hasMany(WorkOrder, {
  foreignKey: "client_id",
  as: "work_orders",
});

WorkOrder.belongsTo(Client, {
  foreignKey: "client_id",
  as: "client",
});

Vehicle.hasMany(WorkOrder, {
  foreignKey: "vehicle_id",
  as: "work_orders",
});

WorkOrder.belongsTo(Vehicle, {
  foreignKey: "vehicle_id",
  as: "vehicle",
});

User.hasMany(WorkOrder, {
  foreignKey: "created_by_user_id",
  as: "created_work_orders",
});

WorkOrder.belongsTo(User, {
  foreignKey: "created_by_user_id",
  as: "created_by_user",
});

WorkOrderStatus.hasMany(WorkOrder, {
  foreignKey: "current_status_id",
  as: "work_orders",
});

WorkOrder.belongsTo(WorkOrderStatus, {
  foreignKey: "current_status_id",
  as: "current_status",
});

WorkOrder.hasMany(WorkOrderStatusHistory, {
  foreignKey: "work_order_id",
  as: "status_history",
});

WorkOrderStatusHistory.belongsTo(WorkOrder, {
  foreignKey: "work_order_id",
  as: "work_order",
});

WorkOrderStatus.hasMany(WorkOrderStatusHistory, {
  foreignKey: "previous_status_id",
  as: "previous_status_changes",
});

WorkOrderStatusHistory.belongsTo(WorkOrderStatus, {
  foreignKey: "previous_status_id",
  as: "previous_status",
});

WorkOrderStatus.hasMany(WorkOrderStatusHistory, {
  foreignKey: "new_status_id",
  as: "new_status_changes",
});

WorkOrderStatusHistory.belongsTo(WorkOrderStatus, {
  foreignKey: "new_status_id",
  as: "new_status",
});

User.hasMany(WorkOrderStatusHistory, {
  foreignKey: "changed_by_user_id",
  as: "status_changes",
});

WorkOrderStatusHistory.belongsTo(User, {
  foreignKey: "changed_by_user_id",
  as: "changed_by_user",
});

WorkOrder.hasMany(WorkOrderMedia, {
  foreignKey: "work_order_id",
  as: "media_items",
});

WorkOrderMedia.belongsTo(WorkOrder, {
  foreignKey: "work_order_id",
  as: "work_order",
});

User.hasMany(WorkOrderMedia, {
  foreignKey: "uploaded_by_user_id",
  as: "uploaded_work_order_media",
});

WorkOrderMedia.belongsTo(User, {
  foreignKey: "uploaded_by_user_id",
  as: "uploaded_by_user",
});

export {
  Role,
  Branch,
  User,
  Permission,
  RolePermission,
  Client,
  VehicleBrand,
  VehicleModel,
  Vehicle,
  WorkOrderStatus,
  WorkOrder,
  WorkOrderStatusHistory,
  WorkOrderMedia,
};