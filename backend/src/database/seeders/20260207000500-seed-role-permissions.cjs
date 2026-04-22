"use strict";

module.exports = {
  async up(queryInterface) {
    const [roles] = await queryInterface.sequelize.query(
      `SELECT id, name FROM roles;`
    );

    const [permissions] = await queryInterface.sequelize.query(
      `SELECT id, code FROM permissions;`
    );

    const [existingRolePermissions] = await queryInterface.sequelize.query(
      `SELECT role_id, permission_id FROM role_permissions;`
    );

    const existingPairs = new Set(
      existingRolePermissions.map(
        (item) => `${item.role_id}-${item.permission_id}`
      )
    );

    const roleMap = Object.fromEntries(roles.map((role) => [role.name, role.id]));
    const permissionMap = Object.fromEntries(
      permissions.map((permission) => [permission.code, permission.id])
    );

    const allPermissionIds = permissions.map((permission) => permission.id);

    const superAdminRows = allPermissionIds.map((permissionId) => ({
      role_id: roleMap.super_admin,
      permission_id: permissionId,
    }));

    const adminPermissionCodes = [
      "dashboard.view",
      "users.view",
      "users.create",
      "users.update",
      "users.toggle-status",
      "roles.view",
      "branches.view",
      "profile.view",
      "profile.update",
      "profile.change-password",
      "clients.view",
      "clients.create",
      "clients.update",
      "vehicles.view",
      "vehicles.create",
      "vehicles.update",
      "work-orders.view",
      "work-orders.create",
      "work-orders.update",
      "work-orders.change-status",
      "work-order-media.view",
      "work-order-media.create",
      "work-order-media.update",
      "work-order-media.delete",
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
      "profile.view",
      "profile.update",
      "profile.change-password",
      "clients.view",
      "clients.create",
      "clients.update",
      "vehicles.view",
      "vehicles.create",
      "vehicles.update",
      "work-orders.view",
      "work-orders.create",
      "work-orders.update",
      "work-orders.change-status",
      "work-order-media.view",
      "work-order-media.create",
      "work-order-media.update",
      "works.view",
      "works.create",
      "works.update",
      "portfolio.manage",
      "products.manage",
      "materials.manage",
      "molds.manage",
      "employees.manage",
    ];

    const staffPermissionCodes = [
      "dashboard.view",
      "profile.view",
      "profile.update",
      "profile.change-password",
      "clients.view",
      "vehicles.view",
      "work-orders.view",
      "work-order-media.view",
      "works.view",
    ];

    const mapCodesToRows = (roleName, codes) =>
      codes
        .filter((code) => permissionMap[code])
        .map((code) => ({
          role_id: roleMap[roleName],
          permission_id: permissionMap[code],
        }));

    const rows = [
      ...superAdminRows,
      ...mapCodesToRows("admin", adminPermissionCodes),
      ...mapCodesToRows("manager", managerPermissionCodes),
      ...mapCodesToRows("staff", staffPermissionCodes),
    ];

    const rowsToInsert = rows
      .filter(
        (row) =>
          row.role_id &&
          row.permission_id &&
          !existingPairs.has(`${row.role_id}-${row.permission_id}`)
      )
      .map((row) => ({
        ...row,
        created_at: new Date(),
        updated_at: new Date(),
      }));

    if (rowsToInsert.length) {
      await queryInterface.bulkInsert("role_permissions", rowsToInsert);
    }
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete("role_permissions", null, {});
  },
};