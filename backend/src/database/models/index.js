import Role from "./Role.js";
import Branch from "./Branch.js";
import User from "./User.js";
import Permission from "./Permission.js";
import RolePermission from "./RolePermission.js";

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

export { Role, Branch, User, Permission, RolePermission };