"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("work_order_media", {
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
      uploaded_by_user_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: "users",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },
      media_type: {
        type: Sequelize.STRING(30),
        allowNull: false,
      },
      stage: {
        type: Sequelize.STRING(30),
        allowNull: false,
        defaultValue: "other",
      },
      title: {
        type: Sequelize.STRING(180),
        allowNull: true,
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      storage_type: {
        type: Sequelize.STRING(30),
        allowNull: false,
        defaultValue: "local",
      },
      file_name: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      original_name: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      mime_type: {
        type: Sequelize.STRING(120),
        allowNull: true,
      },
      file_size: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      file_path: {
        type: Sequelize.STRING(500),
        allowNull: true,
      },
      file_url: {
        type: Sequelize.STRING(1000),
        allowNull: true,
      },
      external_url: {
        type: Sequelize.STRING(1000),
        allowNull: true,
      },
      thumbnail_url: {
        type: Sequelize.STRING(1000),
        allowNull: true,
      },
      sort_order: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      is_cover: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      is_public_portfolio_asset: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      metadata: {
        type: Sequelize.JSONB,
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
    await queryInterface.dropTable("work_order_media");
  },
};