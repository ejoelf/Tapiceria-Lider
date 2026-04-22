"use strict";

module.exports = {
  async up(queryInterface) {
    const rows = [
      {
        code: "received",
        name: "Recibido",
        description: "Trabajo ingresado al sistema",
        sort_order: 1,
        is_final: false,
      },
      {
        code: "quoted",
        name: "Presupuestado",
        description: "Trabajo presupuestado",
        sort_order: 2,
        is_final: false,
      },
      {
        code: "approved",
        name: "Aprobado",
        description: "Presupuesto aprobado por el cliente",
        sort_order: 3,
        is_final: false,
      },
      {
        code: "in_progress",
        name: "En proceso",
        description: "Trabajo en ejecución",
        sort_order: 4,
        is_final: false,
      },
      {
        code: "paused",
        name: "Pausado",
        description: "Trabajo pausado temporalmente",
        sort_order: 5,
        is_final: false,
      },
      {
        code: "completed",
        name: "Terminado",
        description: "Trabajo finalizado",
        sort_order: 6,
        is_final: false,
      },
      {
        code: "delivered",
        name: "Entregado",
        description: "Trabajo entregado al cliente",
        sort_order: 7,
        is_final: true,
      },
      {
        code: "cancelled",
        name: "Cancelado",
        description: "Trabajo cancelado",
        sort_order: 8,
        is_final: true,
      },
    ];

    const [existing] = await queryInterface.sequelize.query(
      `SELECT code FROM work_order_statuses;`
    );

    const existingCodes = new Set(existing.map((item) => item.code));

    const rowsToInsert = rows
      .filter((row) => !existingCodes.has(row.code))
      .map((row) => ({
        ...row,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      }));

    if (rowsToInsert.length) {
      await queryInterface.bulkInsert("work_order_statuses", rowsToInsert);
    }
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete("work_order_statuses", null, {});
  },
};