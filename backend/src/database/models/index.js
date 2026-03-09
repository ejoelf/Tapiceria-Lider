import Role from "./Role.js";
import Branch from "./Branch.js";
import User from "./User.js";
import Permission from "./Permission.js";
import RolePermission from "./RolePermission.js";
import Client from "./Client.js";
import VehicleBrand from "./VehicleBrand.js";
import VehicleModel from "./VehicleModel.js";
import Vehicle from "./Vehicle.js";

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
};