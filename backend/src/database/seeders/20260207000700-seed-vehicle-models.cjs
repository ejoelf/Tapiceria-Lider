"use strict";

module.exports = {
  async up(queryInterface) {
    const [brands] = await queryInterface.sequelize.query(
      `SELECT id, slug FROM vehicle_brands;`
    );

    const brandMap = Object.fromEntries(brands.map((brand) => [brand.slug, brand.id]));

    const rows = [
      { brandSlug: "ford", name: "Fiesta", slug: "fiesta" },
      { brandSlug: "ford", name: "Focus", slug: "focus" },
      { brandSlug: "ford", name: "Ranger", slug: "ranger" },
      { brandSlug: "chevrolet", name: "Corsa", slug: "corsa" },
      { brandSlug: "chevrolet", name: "Cruze", slug: "cruze" },
      { brandSlug: "chevrolet", name: "S10", slug: "s10" },
      { brandSlug: "volkswagen", name: "Gol", slug: "gol" },
      { brandSlug: "volkswagen", name: "Amarok", slug: "amarok" },
      { brandSlug: "volkswagen", name: "Vento", slug: "vento" },
      { brandSlug: "renault", name: "Clio", slug: "clio" },
      { brandSlug: "renault", name: "Kangoo", slug: "kangoo" },
      { brandSlug: "renault", name: "Duster", slug: "duster" },
      { brandSlug: "fiat", name: "Palio", slug: "palio" },
      { brandSlug: "fiat", name: "Cronos", slug: "cronos" },
      { brandSlug: "fiat", name: "Toro", slug: "toro" },
      { brandSlug: "toyota", name: "Hilux", slug: "hilux" },
      { brandSlug: "toyota", name: "Corolla", slug: "corolla" },
      { brandSlug: "honda", name: "Civic", slug: "civic" },
      { brandSlug: "yamaha", name: "FZ", slug: "fz" },
      { brandSlug: "suzuki", name: "GN 125", slug: "gn-125" },
    ];

    const [existing] = await queryInterface.sequelize.query(
      `SELECT brand_id, slug FROM vehicle_models;`
    );

    const existingPairs = new Set(existing.map((item) => `${item.brand_id}-${item.slug}`));

    const rowsToInsert = rows
      .filter((row) => brandMap[row.brandSlug])
      .filter((row) => !existingPairs.has(`${brandMap[row.brandSlug]}-${row.slug}`))
      .map((row) => ({
        brand_id: brandMap[row.brandSlug],
        name: row.name,
        slug: row.slug,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      }));

    if (rowsToInsert.length) {
      await queryInterface.bulkInsert("vehicle_models", rowsToInsert);
    }
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete("vehicle_models", null, {});
  },
};