"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("molds", {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      brand_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: "vehicle_brands",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },
      model_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: "vehicle_models",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },
      technical_part_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "technical_parts",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT",
      },
      created_by_user_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: "users",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },
      code: {
        type: Sequelize.STRING(80),
        allowNull: false,
        unique: true,
      },
      title: {
        type: Sequelize.STRING(180),
        allowNull: false,
      },
      vehicle_type: {
        type: Sequelize.STRING(40),
        allowNull: false,
        defaultValue: "car",
      },
      year_from: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      year_to: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      version_label: {
        type: Sequelize.STRING(120),
        allowNull: true,
      },
      material_reference: {
        type: Sequelize.STRING(120),
        allowNull: true,
      },
      dimensions_notes: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      technical_notes: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      print_notes: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      is_reference_verified: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
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
    await queryInterface.dropTable("molds");
  },
};