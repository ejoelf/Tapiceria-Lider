"use strict";

module.exports = {
  async up(queryInterface) {
    const rows = [
      {
        code: "dashboard.view",
        name: "Ver dashboard",
        description: "Permite ver el dashboard principal",
        module: "dashboard",
      },
      {
        code: "users.view",
        name: "Ver usuarios",
        description: "Permite listar y ver usuarios",
        module: "users",
      },
      {
        code: "users.create",
        name: "Crear usuarios",
        description: "Permite crear usuarios",
        module: "users",
      },
      {
        code: "users.update",
        name: "Editar usuarios",
        description: "Permite editar usuarios",
        module: "users",
      },
      {
        code: "users.toggle-status",
        name: "Activar o desactivar usuarios",
        description: "Permite activar o desactivar usuarios",
        module: "users",
      },
      {
        code: "roles.view",
        name: "Ver roles",
        description: "Permite ver roles",
        module: "roles",
      },
      {
        code: "branches.view",
        name: "Ver sucursales",
        description: "Permite ver sucursales",
        module: "branches",
      },
      {
        code: "profile.view",
        name: "Ver perfil propio",
        description: "Permite ver el perfil del usuario autenticado",
        module: "profile",
      },
      {
        code: "profile.update",
        name: "Actualizar perfil propio",
        description: "Permite actualizar el perfil del usuario autenticado",
        module: "profile",
      },
      {
        code: "profile.change-password",
        name: "Cambiar contraseña propia",
        description: "Permite cambiar la contraseña del usuario autenticado",
        module: "profile",
      },
      {
        code: "clients.view",
        name: "Ver clientes",
        description: "Permite listar y ver clientes",
        module: "clients",
      },
      {
        code: "clients.create",
        name: "Crear clientes",
        description: "Permite crear clientes",
        module: "clients",
      },
      {
        code: "clients.update",
        name: "Editar clientes",
        description: "Permite editar clientes",
        module: "clients",
      },
      {
        code: "vehicles.view",
        name: "Ver vehículos",
        description: "Permite listar y ver vehículos",
        module: "vehicles",
      },
      {
        code: "vehicles.create",
        name: "Crear vehículos",
        description: "Permite crear vehículos",
        module: "vehicles",
      },
      {
        code: "vehicles.update",
        name: "Editar vehículos",
        description: "Permite editar vehículos",
        module: "vehicles",
      },
      {
        code: "work-orders.view",
        name: "Ver órdenes de trabajo",
        description: "Permite listar y ver órdenes de trabajo",
        module: "work-orders",
      },
      {
        code: "work-orders.create",
        name: "Crear órdenes de trabajo",
        description: "Permite crear órdenes de trabajo",
        module: "work-orders",
      },
      {
        code: "work-orders.update",
        name: "Editar órdenes de trabajo",
        description: "Permite editar órdenes de trabajo",
        module: "work-orders",
      },
      {
        code: "work-orders.change-status",
        name: "Cambiar estado de órdenes de trabajo",
        description: "Permite cambiar el estado de las órdenes de trabajo",
        module: "work-orders",
      },
      {
        code: "work-order-media.view",
        name: "Ver media de órdenes",
        description: "Permite listar y ver archivos multimedia de órdenes",
        module: "work-order-media",
      },
      {
        code: "work-order-media.create",
        name: "Crear media de órdenes",
        description: "Permite agregar archivos multimedia a órdenes",
        module: "work-order-media",
      },
      {
        code: "work-order-media.update",
        name: "Editar media de órdenes",
        description: "Permite editar archivos multimedia de órdenes",
        module: "work-order-media",
      },
      {
        code: "work-order-media.delete",
        name: "Eliminar media de órdenes",
        description: "Permite desactivar o eliminar media de órdenes",
        module: "work-order-media",
      },
      {
        code: "materials.view",
        name: "Ver materiales",
        description: "Permite listar y ver materiales",
        module: "materials",
      },
      {
        code: "materials.create",
        name: "Crear materiales",
        description: "Permite crear materiales",
        module: "materials",
      },
      {
        code: "materials.update",
        name: "Editar materiales",
        description: "Permite editar materiales",
        module: "materials",
      },
      {
        code: "materials.movements.view",
        name: "Ver movimientos de inventario",
        description: "Permite ver movimientos de inventario",
        module: "materials",
      },
      {
        code: "materials.movements.create",
        name: "Crear movimientos de inventario",
        description: "Permite registrar ingresos y egresos",
        module: "materials",
      },
      {
        code: "molds.view",
        name: "Ver moldes",
        description: "Permite listar y ver moldes",
        module: "molds",
      },
      {
        code: "molds.create",
        name: "Crear moldes",
        description: "Permite crear moldes",
        module: "molds",
      },
      {
        code: "molds.update",
        name: "Editar moldes",
        description: "Permite editar moldes",
        module: "molds",
      },
      {
        code: "molds.files.create",
        name: "Crear archivos de moldes",
        description: "Permite agregar archivos a moldes",
        module: "molds",
      },
      {
        code: "employees.view",
        name: "Ver empleados",
        description: "Permite listar y ver empleados",
        module: "employees",
      },
      {
        code: "employees.create",
        name: "Crear empleados",
        description: "Permite crear empleados",
        module: "employees",
      },
      {
        code: "employees.update",
        name: "Editar empleados",
        description: "Permite editar empleados",
        module: "employees",
      },
      {
        code: "products.view",
        name: "Ver productos",
        description: "Permite listar y ver productos",
        module: "products",
      },
      {
        code: "products.create",
        name: "Crear productos",
        description: "Permite crear productos",
        module: "products",
      },
      {
        code: "products.update",
        name: "Editar productos",
        description: "Permite editar productos",
        module: "products",
      },
      {
        code: "works.view",
        name: "Ver trabajos",
        description: "Permite ver órdenes de trabajo",
        module: "works",
      },
      {
        code: "works.create",
        name: "Crear trabajos",
        description: "Permite crear órdenes de trabajo",
        module: "works",
      },
      {
        code: "works.update",
        name: "Editar trabajos",
        description: "Permite editar órdenes de trabajo",
        module: "works",
      },
      {
        code: "portfolio.manage",
        name: "Gestionar portfolio",
        description: "Permite gestionar trabajos publicados en la web",
        module: "portfolio",
      },
      {
        code: "finances.manage",
        name: "Gestionar finanzas",
        description: "Permite gestionar caja, ingresos y egresos",
        module: "finances",
      },
      {
        code: "notifications.view",
        name: "Ver notificaciones",
        description: "Permite ver notificaciones del sistema",
        module: "notifications",
      },
      {
        code: "notifications.manage",
        name: "Gestionar notificaciones",
        description: "Permite gestionar notificaciones del sistema",
        module: "notifications",
      }
    ];

    const [existingPermissions] = await queryInterface.sequelize.query(
      `SELECT code FROM permissions;`
    );

    const existingCodes = new Set(
      existingPermissions.map((permission) => permission.code)
    );

    const rowsToInsert = rows
      .filter((row) => !existingCodes.has(row.code))
      .map((row) => ({
        ...row,
        created_at: new Date(),
        updated_at: new Date(),
      }));

    if (rowsToInsert.length) {
      await queryInterface.bulkInsert("permissions", rowsToInsert);
    }
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete("permissions", null, {});
  },
};