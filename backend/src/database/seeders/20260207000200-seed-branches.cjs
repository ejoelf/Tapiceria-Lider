"use strict";

module.exports = {
  async up(queryInterface) {
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
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete("branches", { code: "RC-CENTRAL" }, {});
  },
};