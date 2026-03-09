"use strict";

module.exports = {
  async up(queryInterface) {
    const rows = [
      { name: "Ford", slug: "ford" },
      { name: "Chevrolet", slug: "chevrolet" },
      { name: "Volkswagen", slug: "volkswagen" },
      { name: "Renault", slug: "renault" },
      { name: "Fiat", slug: "fiat" },
      { name: "Peugeot", slug: "peugeot" },
      { name: "Toyota", slug: "toyota" },
      { name: "Honda", slug: "honda" },
      { name: "Nissan", slug: "nissan" },
      { name: "Citroën", slug: "citroen" },
      { name: "Mercedes-Benz", slug: "mercedes-benz" },
      { name: "BMW", slug: "bmw" },
      { name: "Audi", slug: "audi" },
      { name: "Jeep", slug: "jeep" },
      { name: "Kia", slug: "kia" },
      { name: "Hyundai", slug: "hyundai" },
      { name: "Yamaha", slug: "yamaha" },
      { name: "Suzuki", slug: "suzuki" },
      { name: "Kawasaki", slug: "kawasaki" },
      { name: "Ducati", slug: "ducati" },
    ];

    const [existing] = await queryInterface.sequelize.query(
      `SELECT slug FROM vehicle_brands;`
    );

    const existingSlugs = new Set(existing.map((item) => item.slug));

    const rowsToInsert = rows
      .filter((row) => !existingSlugs.has(row.slug))
      .map((row) => ({
        ...row,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      }));

    if (rowsToInsert.length) {
      await queryInterface.bulkInsert("vehicle_brands", rowsToInsert);
    }
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete("vehicle_brands", null, {});
  },
};