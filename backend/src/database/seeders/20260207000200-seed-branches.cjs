"use strict";

module.exports = {
  async up(queryInterface) {
    const [existingBranches] = await queryInterface.sequelize.query(
      `SELECT code FROM branches WHERE code = 'RC-CENTRAL';`
    );

    if (!existingBranches.length) {
      await queryInterface.bulkInsert("branches", [
        {
          name: "Casa Central Río Cuarto",
          code: "RC-CENTRAL",
          address: "A definir",
          city: "Río Cuarto",
          province: "Córdoba",
          phone: null,
          email: null,
          is_main: true,
          is_active: true,
          created_at: new Date(),
          updated_at: new Date(),
        },
      ]);
    }
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete("branches", { code: "RC-CENTRAL" }, {});
  },
};