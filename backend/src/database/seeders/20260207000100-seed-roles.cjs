"use strict";

module.exports = {
  async up(queryInterface) {
    const rows = [
      {
        name: "super_admin",
        description: "Acceso total al sistema",
        is_system: true,
      },
      {
        name: "admin",
        description: "Administrador general",
        is_system: true,
      },
      {
        name: "manager",
        description: "Encargado de sucursal o sector",
        is_system: true,
      },
      {
        name: "staff",
        description: "Personal operativo",
        is_system: true,
      },
    ];

    const [existingRoles] = await queryInterface.sequelize.query(
      `SELECT name FROM roles;`
    );

    const existingNames = new Set(existingRoles.map((role) => role.name));

    const rowsToInsert = rows
      .filter((row) => !existingNames.has(row.name))
      .map((row) => ({
        ...row,
        created_at: new Date(),
        updated_at: new Date(),
      }));

    if (rowsToInsert.length) {
      await queryInterface.bulkInsert("roles", rowsToInsert);
    }
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete(
      "roles",
      {
        name: ["super_admin", "admin", "manager", "staff"],
      },
      {}
    );
  },
};