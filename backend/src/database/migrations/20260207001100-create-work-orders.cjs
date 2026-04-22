"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("work_orders", {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      code: {
        type: Sequelize.STRING(40),
        allowNull: false,
        unique: true,
      },
      branch_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: "branches",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },
      client_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "clients",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT",
      },
      vehicle_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: "vehicles",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
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
      current_status_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "work_order_statuses",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT",
      },
      service_type: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      title: {
        type: Sequelize.STRING(180),
        allowNull: false,
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      internal_notes: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      vehicle_snapshot: {
        type: Sequelize.JSONB,
        allowNull: true,
      },
      client_snapshot: {
        type: Sequelize.JSONB,
        allowNull: true,
      },
      priority: {
        type: Sequelize.STRING(30),
        allowNull: false,
        defaultValue: "medium",
      },
      estimated_start_date: {
        type: Sequelize.DATEONLY,
        allowNull: true,
      },
      estimated_end_date: {
        type: Sequelize.DATEONLY,
        allowNull: true,
      },
      actual_start_date: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      completed_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      delivered_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      estimated_price: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: true,
        defaultValue: 0,
      },
      final_price: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: true,
        defaultValue: 0,
      },
      advance_paid: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: false,
        defaultValue: 0,
      },
      is_public_portfolio_candidate: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      customer_reference: {
        type: Sequelize.STRING(120),
        allowNull: true,
      },
      source_channel: {
        type: Sequelize.STRING(40),
        allowNull: false,
        defaultValue: "manual",
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
    await queryInterface.dropTable("work_orders");
  },
};