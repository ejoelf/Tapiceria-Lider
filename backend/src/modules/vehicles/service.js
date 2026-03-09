import {
  Branch,
  Client,
  Vehicle,
  VehicleBrand,
  VehicleModel,
} from "../../database/models/index.js";
import AppError from "../../utils/appError.js";

const vehicleInclude = [
  { model: Client, as: "client" },
  { model: Branch, as: "branch" },
  { model: VehicleBrand, as: "brand" },
  { model: VehicleModel, as: "model" },
];

export async function listVehicles() {
  const vehicles = await Vehicle.findAll({
    include: vehicleInclude,
    order: [["id", "ASC"]],
  });

  return vehicles.map((vehicle) => vehicle.toSafeJSON());
}

export async function getVehicleById(vehicleId) {
  const vehicle = await Vehicle.findByPk(vehicleId, {
    include: vehicleInclude,
  });

  if (!vehicle) {
    throw new AppError("Vehículo no encontrado.", 404);
  }

  return vehicle.toSafeJSON();
}

export async function createVehicle(payload) {
  const {
    client_id,
    branch_id = null,
    brand_id = null,
    model_id = null,
    vehicle_type = "car",
    year = null,
    version = null,
    plate = null,
    vin = null,
    color = null,
    nickname = null,
    notes = null,
    is_active = true,
  } = payload;

  if (!client_id) {
    throw new AppError("client_id es obligatorio.", 400);
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

  if (brand_id) {
    const brand = await VehicleBrand.findByPk(brand_id);
    if (!brand) {
      throw new AppError("La marca indicada no existe.", 400);
    }
  }

  if (model_id) {
    const model = await VehicleModel.findByPk(model_id);
    if (!model) {
      throw new AppError("El modelo indicado no existe.", 400);
    }

    if (brand_id && model.brand_id !== brand_id) {
      throw new AppError("El modelo no pertenece a la marca indicada.", 400);
    }
  }

  const vehicle = await Vehicle.create({
    client_id,
    branch_id,
    brand_id,
    model_id,
    vehicle_type,
    year,
    version: version ? String(version).trim() : null,
    plate: plate ? String(plate).trim().toUpperCase() : null,
    vin: vin ? String(vin).trim() : null,
    color: color ? String(color).trim() : null,
    nickname: nickname ? String(nickname).trim() : null,
    notes: notes ? String(notes).trim() : null,
    is_active: Boolean(is_active),
  });

  const createdVehicle = await Vehicle.findByPk(vehicle.id, {
    include: vehicleInclude,
  });

  return createdVehicle.toSafeJSON();
}

export async function updateVehicle(vehicleId, payload) {
  const vehicle = await Vehicle.findByPk(vehicleId);

  if (!vehicle) {
    throw new AppError("Vehículo no encontrado.", 404);
  }

  const {
    client_id,
    branch_id,
    brand_id,
    model_id,
    vehicle_type,
    year,
    version,
    plate,
    vin,
    color,
    nickname,
    notes,
    is_active,
  } = payload;

  if (client_id !== undefined) {
    const client = await Client.findByPk(client_id);
    if (!client) {
      throw new AppError("El cliente indicado no existe.", 400);
    }
    vehicle.client_id = client_id;
  }

  if (branch_id !== undefined) {
    if (branch_id === null) {
      vehicle.branch_id = null;
    } else {
      const branch = await Branch.findByPk(branch_id);
      if (!branch) {
        throw new AppError("La sucursal indicada no existe.", 400);
      }
      vehicle.branch_id = branch_id;
    }
  }

  if (brand_id !== undefined) {
    if (brand_id === null) {
      vehicle.brand_id = null;
    } else {
      const brand = await VehicleBrand.findByPk(brand_id);
      if (!brand) {
        throw new AppError("La marca indicada no existe.", 400);
      }
      vehicle.brand_id = brand_id;
    }
  }

  if (model_id !== undefined) {
    if (model_id === null) {
      vehicle.model_id = null;
    } else {
      const model = await VehicleModel.findByPk(model_id);
      if (!model) {
        throw new AppError("El modelo indicado no existe.", 400);
      }

      const effectiveBrandId =
        brand_id !== undefined ? vehicle.brand_id : vehicle.brand_id;

      if (effectiveBrandId && model.brand_id !== effectiveBrandId) {
        throw new AppError("El modelo no pertenece a la marca indicada.", 400);
      }

      vehicle.model_id = model_id;
    }
  }

  if (vehicle_type !== undefined) vehicle.vehicle_type = String(vehicle_type).trim();
  if (year !== undefined) vehicle.year = year;
  if (version !== undefined) vehicle.version = version ? String(version).trim() : null;
  if (plate !== undefined) vehicle.plate = plate ? String(plate).trim().toUpperCase() : null;
  if (vin !== undefined) vehicle.vin = vin ? String(vin).trim() : null;
  if (color !== undefined) vehicle.color = color ? String(color).trim() : null;
  if (nickname !== undefined) vehicle.nickname = nickname ? String(nickname).trim() : null;
  if (notes !== undefined) vehicle.notes = notes ? String(notes).trim() : null;
  if (is_active !== undefined) vehicle.is_active = Boolean(is_active);

  await vehicle.save();

  const updatedVehicle = await Vehicle.findByPk(vehicle.id, {
    include: vehicleInclude,
  });

  return updatedVehicle.toSafeJSON();
}

export async function listVehicleBrands() {
  return VehicleBrand.findAll({
    order: [["name", "ASC"]],
  });
}

export async function listVehicleModels() {
  return VehicleModel.findAll({
    include: [{ model: VehicleBrand, as: "brand" }],
    order: [["name", "ASC"]],
  });
}