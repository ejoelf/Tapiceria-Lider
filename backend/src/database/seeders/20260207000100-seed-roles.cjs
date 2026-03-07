"use strict";

module.exports = {
  async up(queryInterface) {
    await queryInterface.bulkInsert("roles", [
      {
        name: "super_admin",
        description: "Acceso total al sistema",
        is_system: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        name: "admin",
        description: "Administrador general",
        is_system: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        name: "manager",
        description: "Encargado de sucursal o sector",
        is_system: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        name: "staff",
        description: "Personal operativo",
        is_system: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete("roles", null, {});
  },
};