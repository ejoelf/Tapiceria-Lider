"use strict";

const bcrypt = require("bcryptjs");

module.exports = {
  async up(queryInterface) {
    const passwordHash = await bcrypt.hash("Admin1234!", 10);

    const [roles] = await queryInterface.sequelize.query(
      `SELECT id, name FROM roles WHERE name = 'super_admin' LIMIT 1;`
    );

    const [branches] = await queryInterface.sequelize.query(
      `SELECT id, code FROM branches WHERE code = 'RC-CENTRAL' LIMIT 1;`
    );

    if (!roles.length) {
      throw new Error("No se encontró el rol super_admin");
    }

    if (!branches.length) {
      throw new Error("No se encontró la sucursal RC-CENTRAL");
    }

    await queryInterface.bulkInsert("users", [
      {
        role_id: roles[0].id,
        branch_id: branches[0].id,
        first_name: "Joel",
        last_name: "Admin",
        email: "admin@tapicerialider.com",
        password_hash: passwordHash,
        phone: null,
        is_active: true,
        last_login_at: null,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete(
      "users",
      { email: "admin@tapicerialider.com" },
      {}
    );
  },
};