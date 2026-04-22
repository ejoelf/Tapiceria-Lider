"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("work_order_status_history", {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      work_order_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "work_orders",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      previous_status_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: "work_order_statuses",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },
      new_status_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "work_order_statuses",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT",
      },
      changed_by_user_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: "users",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },
      note: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn("NOW"),
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn("NOW"),
      },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("work_order_status_history");
  },
};