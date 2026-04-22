import {
  Branch,
  Client,
  User,
  Vehicle,
  WorkOrder,
  WorkOrderStatus,
  WorkOrderStatusHistory,
  WorkOrderMedia,
} from "../../database/models/index.js";
import sequelize from "../../config/db.js";
import AppError from "../../utils/appError.js";
import { buildWorkOrderCode } from "../../utils/workOrderCode.js";

const workOrderInclude = [
  { model: Branch, as: "branch" },
  { model: Client, as: "client" },
  { model: Vehicle, as: "vehicle" },
  { model: User, as: "created_by_user" },
  { model: WorkOrderStatus, as: "current_status" },
];

const workOrderDetailInclude = [
  ...workOrderInclude,
  {
    model: WorkOrderStatusHistory,
    as: "status_history",
    include: [
      { model: WorkOrderStatus, as: "previous_status" },
      { model: WorkOrderStatus, as: "new_status" },
      { model: User, as: "changed_by_user" },
    ],
  },
  {
    model: WorkOrderMedia,
    as: "media_items",
    include: [{ model: User, as: "uploaded_by_user" }],
  },
];

function buildClientSnapshot(client) {
  return {
    id: client.id,
    client_type: client.client_type,
    display_name: client.getDisplayName ? client.getDisplayName() : null,
    first_name: client.first_name,
    last_name: client.last_name,
    company_name: client.company_name,
    email: client.email,
    phone: client.phone,
  };
}

function buildVehicleSnapshot(vehicle) {
  if (!vehicle) return null;

  return {
    id: vehicle.id,
    vehicle_type: vehicle.vehicle_type,
    year: vehicle.year,
    version: vehicle.version,
    plate: vehicle.plate,
    vin: vehicle.vin,
    color: vehicle.color,
    nickname: vehicle.nickname,
    brand_id: vehicle.brand_id,
    model_id: vehicle.model_id,
  };
}

async function getStatusByCode(code, transaction = null) {
  return WorkOrderStatus.findOne({
    where: { code },
    transaction,
  });
}

export async function listWorkOrders() {
  const workOrders = await WorkOrder.findAll({
    include: workOrderInclude,
    order: [["id", "DESC"]],
  });

  return workOrders.map((item) => item.toSafeJSON());
}

export async function getWorkOrderById(workOrderId) {
  const workOrder = await WorkOrder.findByPk(workOrderId, {
    include: workOrderDetailInclude,
  });

  if (!workOrder) {
    throw new AppError("Orden de trabajo no encontrada.", 404);
  }

  if (Array.isArray(workOrder.status_history)) {
    workOrder.status_history.sort((a, b) => a.id - b.id);
  }

  if (Array.isArray(workOrder.media_items)) {
    workOrder.media_items.sort((a, b) => {
      if (a.sort_order !== b.sort_order) return a.sort_order - b.sort_order;
      return a.id - b.id;
    });
  }

  return workOrder.toSafeJSON();
}

export async function listWorkOrderStatuses() {
  return WorkOrderStatus.findAll({
    where: { is_active: true },
    order: [["sort_order", "ASC"], ["id", "ASC"]],
  });
}

export async function createWorkOrder(payload, authUserId = null) {
  const {
    branch_id = null,
    client_id,
    vehicle_id = null,
    service_type,
    title,
    description = null,
    internal_notes = null,
    priority = "medium",
    estimated_start_date = null,
    estimated_end_date = null,
    estimated_price = 0,
    final_price = 0,
    advance_paid = 0,
    is_public_portfolio_candidate = false,
    customer_reference = null,
    source_channel = "manual",
    is_active = true,
  } = payload;

  if (!client_id || !service_type || !title) {
    throw new AppError("client_id, service_type y title son obligatorios.", 400);
  }

  if (!["low", "medium", "high", "urgent"].includes(priority)) {
    throw new AppError("priority debe ser low, medium, high o urgent.", 400);
  }

  const client = await Client.findByPk(client_id);
  if (!client) {
    throw new AppError("El cliente indicado no existe.", 400);
  }

  if (branch_id) {
    const branch = await Branch.findByPk(branch_id);
    if (!branch) {
      throw new AppError("La sucursal indicada no existe.", 400);
    }
  }

  let vehicle = null;
  if (vehicle_id) {
    vehicle = await Vehicle.findByPk(vehicle_id);
    if (!vehicle) {
      throw new AppError("El vehículo indicado no existe.", 400);
    }
    if (vehicle.client_id !== client.id) {
      throw new AppError("El vehículo no pertenece al cliente indicado.", 400);
    }
  }

  const initialStatus = await getStatusByCode("received");
  if (!initialStatus) {
    throw new AppError("No existe el estado inicial 'received'.", 500);
  }

  const result = await sequelize.transaction(async (transaction) => {
    const created = await WorkOrder.create(
      {
        code: "TEMP",
        branch_id,
        client_id,
        vehicle_id,
        created_by_user_id: authUserId,
        current_status_id: initialStatus.id,
        service_type: String(service_type).trim(),
        title: String(title).trim(),
        description: description ? String(description).trim() : null,
        internal_notes: internal_notes ? String(internal_notes).trim() : null,
        vehicle_snapshot: buildVehicleSnapshot(vehicle),
        client_snapshot: buildClientSnapshot(client),
        priority,
        estimated_start_date,
        estimated_end_date,
        estimated_price,
        final_price,
        advance_paid,
        is_public_portfolio_candidate: Boolean(is_public_portfolio_candidate),
        customer_reference: customer_reference ? String(customer_reference).trim() : null,
        source_channel: source_channel ? String(source_channel).trim() : "manual",
        is_active: Boolean(is_active),
      },
      { transaction }
    );

    created.code = buildWorkOrderCode(created.id);
    await created.save({ transaction });

    await WorkOrderStatusHistory.create(
      {
        work_order_id: created.id,
        previous_status_id: null,
        new_status_id: initialStatus.id,
        changed_by_user_id: authUserId,
        note: "Orden de trabajo creada",
      },
      { transaction }
    );

    return created.id;
  });

  return getWorkOrderById(result);
}

export async function updateWorkOrder(workOrderId, payload) {
  const workOrder = await WorkOrder.findByPk(workOrderId);

  if (!workOrder) {
    throw new AppError("Orden de trabajo no encontrada.", 404);
  }

  const {
    branch_id,
    client_id,
    vehicle_id,
    service_type,
    title,
    description,
    internal_notes,
    priority,
    estimated_start_date,
    estimated_end_date,
    estimated_price,
    final_price,
    advance_paid,
    is_public_portfolio_candidate,
    customer_reference,
    source_channel,
    is_active,
  } = payload;

  let client = null;
  if (client_id !== undefined) {
    client = await Client.findByPk(client_id);
    if (!client) {
      throw new AppError("El cliente indicado no existe.", 400);
    }
    workOrder.client_id = client_id;
    workOrder.client_snapshot = buildClientSnapshot(client);
  } else if (workOrder.client_id) {
    client = await Client.findByPk(workOrder.client_id);
  }

  if (branch_id !== undefined) {
    if (branch_id === null) {
      workOrder.branch_id = null;
    } else {
      const branch = await Branch.findByPk(branch_id);
      if (!branch) {
        throw new AppError("La sucursal indicada no existe.", 400);
      }
      workOrder.branch_id = branch_id;
    }
  }

  if (vehicle_id !== undefined) {
    if (vehicle_id === null) {
      workOrder.vehicle_id = null;
      workOrder.vehicle_snapshot = null;
    } else {
      const vehicle = await Vehicle.findByPk(vehicle_id);
      if (!vehicle) {
        throw new AppError("El vehículo indicado no existe.", 400);
      }

      const effectiveClientId = client ? client.id : workOrder.client_id;

      if (vehicle.client_id !== effectiveClientId) {
        throw new AppError("El vehículo no pertenece al cliente indicado.", 400);
      }

      workOrder.vehicle_id = vehicle_id;
      workOrder.vehicle_snapshot = buildVehicleSnapshot(vehicle);
    }
  }

  if (service_type !== undefined) workOrder.service_type = String(service_type).trim();
  if (title !== undefined) workOrder.title = String(title).trim();
  if (description !== undefined) workOrder.description = description ? String(description).trim() : null;
  if (internal_notes !== undefined) workOrder.internal_notes = internal_notes ? String(internal_notes).trim() : null;

  if (priority !== undefined) {
    if (!["low", "medium", "high", "urgent"].includes(priority)) {
      throw new AppError("priority debe ser low, medium, high o urgent.", 400);
    }
    workOrder.priority = priority;
  }

  if (estimated_start_date !== undefined) workOrder.estimated_start_date = estimated_start_date;
  if (estimated_end_date !== undefined) workOrder.estimated_end_date = estimated_end_date;
  if (estimated_price !== undefined) workOrder.estimated_price = estimated_price;
  if (final_price !== undefined) workOrder.final_price = final_price;
  if (advance_paid !== undefined) workOrder.advance_paid = advance_paid;
  if (is_public_portfolio_candidate !== undefined) {
    workOrder.is_public_portfolio_candidate = Boolean(is_public_portfolio_candidate);
  }
  if (customer_reference !== undefined) {
    workOrder.customer_reference = customer_reference ? String(customer_reference).trim() : null;
  }
  if (source_channel !== undefined) {
    workOrder.source_channel = source_channel ? String(source_channel).trim() : "manual";
  }
  if (is_active !== undefined) workOrder.is_active = Boolean(is_active);

  await workOrder.save();

  return getWorkOrderById(workOrder.id);
}

export async function changeWorkOrderStatus(workOrderId, payload, authUserId = null) {
  const { status_code, note = null } = payload;

  if (!status_code) {
    throw new AppError("status_code es obligatorio.", 400);
  }

  const workOrder = await WorkOrder.findByPk(workOrderId, {
    include: [{ model: WorkOrderStatus, as: "current_status" }],
  });

  if (!workOrder) {
    throw new AppError("Orden de trabajo no encontrada.", 404);
  }

  const newStatus = await getStatusByCode(status_code);
  if (!newStatus) {
    throw new AppError("El estado indicado no existe.", 400);
  }

  if (workOrder.current_status_id === newStatus.id) {
    throw new AppError("La orden ya se encuentra en ese estado.", 400);
  }

  const previousStatusId = workOrder.current_status_id;

  await sequelize.transaction(async (transaction) => {
    workOrder.current_status_id = newStatus.id;

    if (newStatus.code === "in_progress" && !workOrder.actual_start_date) {
      workOrder.actual_start_date = new Date();
    }

    if (newStatus.code === "completed") {
      workOrder.completed_at = new Date();
    }

    if (newStatus.code === "delivered") {
      if (!workOrder.completed_at) {
        workOrder.completed_at = new Date();
      }
      workOrder.delivered_at = new Date();
    }

    if (newStatus.code === "cancelled" && !note) {
      throw new AppError("Para cancelar una orden debés indicar una nota.", 400);
    }

    await workOrder.save({ transaction });

    await WorkOrderStatusHistory.create(
      {
        work_order_id: workOrder.id,
        previous_status_id: previousStatusId,
        new_status_id: newStatus.id,
        changed_by_user_id: authUserId,
        note: note ? String(note).trim() : null,
      },
      { transaction }
    );
  });

  return getWorkOrderById(workOrder.id);
}