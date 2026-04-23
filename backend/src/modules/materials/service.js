import sequelize from "../../config/db.js";
import {
  Branch,
  InventoryMovement,
  Material,
  MaterialCategory,
  User,
  WorkOrder,
} from "../../database/models/index.js";
import AppError from "../../utils/appError.js";

const materialInclude = [
  { model: MaterialCategory, as: "category" },
  { model: Branch, as: "branch" },
];

const movementInclude = [
  { model: Material, as: "material" },
  { model: WorkOrder, as: "work_order" },
  { model: User, as: "created_by_user" },
];

export async function listMaterialCategories() {
  return MaterialCategory.findAll({
    order: [["name", "ASC"]],
  });
}

export async function createMaterialCategory(payload) {
  const { name, description = null, is_active = true } = payload;

  if (!name || !String(name).trim()) {
    throw new AppError("name es obligatorio.", 400);
  }

  const existing = await MaterialCategory.findOne({
    where: { name: String(name).trim() },
  });

  if (existing) {
    throw new AppError("Ya existe una categoría con ese nombre.", 409);
  }

  return MaterialCategory.create({
    name: String(name).trim(),
    description: description ? String(description).trim() : null,
    is_active: Boolean(is_active),
  });
}

export async function listMaterials() {
  const materials = await Material.findAll({
    include: materialInclude,
    order: [["id", "ASC"]],
  });

  return materials.map((item) => item.toSafeJSON());
}

export async function getMaterialById(materialId) {
  const material = await Material.findByPk(materialId, {
    include: materialInclude,
  });

  if (!material) {
    throw new AppError("Material no encontrado.", 404);
  }

  return material.toSafeJSON();
}

export async function createMaterial(payload) {
  const {
    category_id = null,
    branch_id = null,
    code,
    name,
    description = null,
    unit = "unit",
    color = null,
    stock_current = 0,
    stock_minimum = 0,
    cost_reference = 0,
    storage_location = null,
    notes = null,
    is_active = true,
  } = payload;

  if (!code || !name) {
    throw new AppError("code y name son obligatorios.", 400);
  }

  const existing = await Material.findOne({
    where: { code: String(code).trim().toUpperCase() },
  });

  if (existing) {
    throw new AppError("Ya existe un material con ese código.", 409);
  }

  if (category_id) {
    const category = await MaterialCategory.findByPk(category_id);
    if (!category) {
      throw new AppError("La categoría indicada no existe.", 400);
    }
  }

  if (branch_id) {
    const branch = await Branch.findByPk(branch_id);
    if (!branch) {
      throw new AppError("La sucursal indicada no existe.", 400);
    }
  }

  const material = await Material.create({
    category_id,
    branch_id,
    code: String(code).trim().toUpperCase(),
    name: String(name).trim(),
    description: description ? String(description).trim() : null,
    unit: unit ? String(unit).trim() : "unit",
    color: color ? String(color).trim() : null,
    stock_current,
    stock_minimum,
    cost_reference,
    storage_location: storage_location ? String(storage_location).trim() : null,
    notes: notes ? String(notes).trim() : null,
    is_active: Boolean(is_active),
  });

  const created = await Material.findByPk(material.id, {
    include: materialInclude,
  });

  return created.toSafeJSON();
}

export async function updateMaterial(materialId, payload) {
  const material = await Material.findByPk(materialId);

  if (!material) {
    throw new AppError("Material no encontrado.", 404);
  }

  const {
    category_id,
    branch_id,
    code,
    name,
    description,
    unit,
    color,
    stock_minimum,
    cost_reference,
    storage_location,
    notes,
    is_active,
  } = payload;

  if (category_id !== undefined) {
    if (category_id === null) {
      material.category_id = null;
    } else {
      const category = await MaterialCategory.findByPk(category_id);
      if (!category) {
        throw new AppError("La categoría indicada no existe.", 400);
      }
      material.category_id = category_id;
    }
  }

  if (branch_id !== undefined) {
    if (branch_id === null) {
      material.branch_id = null;
    } else {
      const branch = await Branch.findByPk(branch_id);
      if (!branch) {
        throw new AppError("La sucursal indicada no existe.", 400);
      }
      material.branch_id = branch_id;
    }
  }

  if (code !== undefined) material.code = String(code).trim().toUpperCase();
  if (name !== undefined) material.name = String(name).trim();
  if (description !== undefined) material.description = description ? String(description).trim() : null;
  if (unit !== undefined) material.unit = unit ? String(unit).trim() : "unit";
  if (color !== undefined) material.color = color ? String(color).trim() : null;
  if (stock_minimum !== undefined) material.stock_minimum = stock_minimum;
  if (cost_reference !== undefined) material.cost_reference = cost_reference;
  if (storage_location !== undefined) material.storage_location = storage_location ? String(storage_location).trim() : null;
  if (notes !== undefined) material.notes = notes ? String(notes).trim() : null;
  if (is_active !== undefined) material.is_active = Boolean(is_active);

  await material.save();

  const updated = await Material.findByPk(material.id, {
    include: materialInclude,
  });

  return updated.toSafeJSON();
}

export async function listInventoryMovements() {
  const movements = await InventoryMovement.findAll({
    include: movementInclude,
    order: [["id", "DESC"]],
  });

  return movements.map((item) => item.toSafeJSON());
}

export async function createInventoryMovement(payload, authUserId = null) {
  const {
    material_id,
    work_order_id = null,
    movement_type,
    quantity,
    unit_cost = 0,
    note = null,
  } = payload;

  if (!material_id || !movement_type || quantity === undefined) {
    throw new AppError("material_id, movement_type y quantity son obligatorios.", 400);
  }

  if (!["in", "out", "adjustment"].includes(movement_type)) {
    throw new AppError("movement_type debe ser in, out o adjustment.", 400);
  }

  const parsedQuantity = Number(quantity);
  if (Number.isNaN(parsedQuantity) || parsedQuantity <= 0) {
    throw new AppError("quantity debe ser un número mayor a 0.", 400);
  }

  const material = await Material.findByPk(material_id);
  if (!material) {
    throw new AppError("El material indicado no existe.", 400);
  }

  if (work_order_id) {
    const workOrder = await WorkOrder.findByPk(work_order_id);
    if (!workOrder) {
      throw new AppError("La orden de trabajo indicada no existe.", 400);
    }
  }

  const result = await sequelize.transaction(async (transaction) => {
    const currentStock = Number(material.stock_current);
    let nextStock = currentStock;

    if (movement_type === "in") {
      nextStock = currentStock + parsedQuantity;
    } else if (movement_type === "out") {
      nextStock = currentStock - parsedQuantity;
    } else if (movement_type === "adjustment") {
      nextStock = parsedQuantity;
    }

    if (nextStock < 0) {
      throw new AppError("El movimiento dejaría stock negativo.", 400);
    }

    const movement = await InventoryMovement.create(
      {
        material_id,
        work_order_id,
        created_by_user_id: authUserId,
        movement_type,
        quantity: parsedQuantity,
        unit_cost,
        note: note ? String(note).trim() : null,
      },
      { transaction }
    );

    material.stock_current = nextStock;
    await material.save({ transaction });

    return movement.id;
  });

  const created = await InventoryMovement.findByPk(result, {
    include: movementInclude,
  });

  return created.toSafeJSON();
}