"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("notifications", {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: "users",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },
      event_code: {
        type: Sequelize.STRING(80),
        allowNull: false,
      },
      title: {
        type: Sequelize.STRING(180),
        allowNull: false,
      },
      message: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      level: {
        type: Sequelize.STRING(20),
        allowNull: false,
        defaultValue: "info",
      },
      channels: {
        type: Sequelize.JSONB,
        allowNull: false,
        defaultValue: ["in_app"],
      },
      delivery_status: {
        type: Sequelize.JSONB,
        allowNull: true,
      },
      entity_type: {
        type: Sequelize.STRING(80),
        allowNull: true,
      },
      entity_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      payload: {
        type: Sequelize.JSONB,
        allowNull: true,
      },
      is_read: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      read_at: {
        type: Sequelize.DATE,
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
    await queryInterface.dropTable("notifications");
  },
};