"use strict";

module.exports = {
  async up(queryInterface) {
    const [roles] = await queryInterface.sequelize.query(
      `SELECT id, name FROM roles;`
    );

    const [permissions] = await queryInterface.sequelize.query(
      `SELECT id, code FROM permissions;`
    );

    const roleMap = Object.fromEntries(roles.map((role) => [role.name, role.id]));
    const permissionMap = Object.fromEntries(
      permissions.map((permission) => [permission.code, permission.id])
    );

    const allPermissionIds = permissions.map((permission) => permission.id);

    const superAdminRows = allPermissionIds.map((permissionId) => ({
      role_id: roleMap.super_admin,
      permission_id: permissionId,
      created_at: new Date(),
      updated_at: new Date(),
    }));

    const adminPermissionCodes = [
      "dashboard.view",
      "users.view",
      "users.create",
      "users.update",
      "users.toggle-status",
      "roles.view",
      "branches.view",
      "works.view",
      "works.create",
      "works.update",
      "portfolio.manage",
      "products.manage",
      "materials.manage",
      "molds.manage",
      "employees.manage",
      "finances.manage",
    ];

    const managerPermissionCodes = [
      "dashboard.view",
      "users.view",
      "branches.view",
      "works.view",
      "works.create",
      "works.update",
      "portfolio.manage",
      "products.manage",
      "materials.manage",
      "molds.manage",
      "employees.manage",
    ];

    const staffPermissionCodes = ["dashboard.view", "works.view"];

    const mapCodesToRows = (roleName, codes) =>
      codes.map((code) => ({
        role_id: roleMap[roleName],
        permission_id: permissionMap[code],
        created_at: new Date(),
        updated_at: new Date(),
      }));

    const rows = [
      ...superAdminRows,
      ...mapCodesToRows("admin", adminPermissionCodes),
      ...mapCodesToRows("manager", managerPermissionCodes),
      ...mapCodesToRows("staff", staffPermissionCodes),
    ];

    await queryInterface.bulkInsert("role_permissions", rows);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete("role_permissions", null, {});
  },
};