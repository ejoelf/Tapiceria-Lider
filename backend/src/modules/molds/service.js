import {
  Mold,
  MoldFile,
  TechnicalPart,
  User,
  VehicleBrand,
  VehicleModel,
} from "../../database/models/index.js";
import AppError from "../../utils/appError.js";

const moldInclude = [
  { model: VehicleBrand, as: "brand" },
  { model: VehicleModel, as: "model" },
  { model: TechnicalPart, as: "technical_part" },
  { model: User, as: "created_by_user" },
  {
    model: MoldFile,
    as: "files",
    include: [{ model: User, as: "uploaded_by_user" }],
  },
];

export async function listTechnicalParts() {
  return TechnicalPart.findAll({
    order: [["name", "ASC"]],
  });
}

export async function createTechnicalPart(payload) {
  const { code, name, description = null, is_active = true } = payload;

  if (!code || !name) {
    throw new AppError("code y name son obligatorios.", 400);
  }

  const existing = await TechnicalPart.findOne({
    where: { code: String(code).trim().toUpperCase() },
  });

  if (existing) {
    throw new AppError("Ya existe una pieza técnica con ese código.", 409);
  }

  return TechnicalPart.create({
    code: String(code).trim().toUpperCase(),
    name: String(name).trim(),
    description: description ? String(description).trim() : null,
    is_active: Boolean(is_active),
  });
}

export async function listMolds() {
  const molds = await Mold.findAll({
    include: moldInclude,
    order: [["id", "DESC"]],
  });

  return molds.map((item) => item.toSafeJSON());
}

export async function getMoldById(moldId) {
  const mold = await Mold.findByPk(moldId, {
    include: moldInclude,
  });

  if (!mold) {
    throw new AppError("Molde no encontrado.", 404);
  }

  if (Array.isArray(mold.files)) {
    mold.files.sort((a, b) => {
      if (a.version_number !== b.version_number) {
        return b.version_number - a.version_number;
      }
      return b.id - a.id;
    });
  }

  return mold.toSafeJSON();
}

export async function createMold(payload, authUserId = null) {
  const {
    brand_id = null,
    model_id = null,
    technical_part_id,
    code,
    title,
    vehicle_type = "car",
    year_from = null,
    year_to = null,
    version_label = null,
    material_reference = null,
    dimensions_notes = null,
    technical_notes = null,
    print_notes = null,
    is_reference_verified = false,
    is_active = true,
  } = payload;

  if (!technical_part_id || !code || !title) {
    throw new AppError("technical_part_id, code y title son obligatorios.", 400);
  }

  const existing = await Mold.findOne({
    where: { code: String(code).trim().toUpperCase() },
  });

  if (existing) {
    throw new AppError("Ya existe un molde con ese código.", 409);
  }

  const technicalPart = await TechnicalPart.findByPk(technical_part_id);
  if (!technicalPart) {
    throw new AppError("La pieza técnica indicada no existe.", 400);
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

  const mold = await Mold.create({
    brand_id,
    model_id,
    technical_part_id,
    created_by_user_id: authUserId,
    code: String(code).trim().toUpperCase(),
    title: String(title).trim(),
    vehicle_type: String(vehicle_type).trim(),
    year_from,
    year_to,
    version_label: version_label ? String(version_label).trim() : null,
    material_reference: material_reference ? String(material_reference).trim() : null,
    dimensions_notes: dimensions_notes ? String(dimensions_notes).trim() : null,
    technical_notes: technical_notes ? String(technical_notes).trim() : null,
    print_notes: print_notes ? String(print_notes).trim() : null,
    is_reference_verified: Boolean(is_reference_verified),
    is_active: Boolean(is_active),
  });

  return getMoldById(mold.id);
}

export async function updateMold(moldId, payload) {
  const mold = await Mold.findByPk(moldId);

  if (!mold) {
    throw new AppError("Molde no encontrado.", 404);
  }

  const {
    brand_id,
    model_id,
    technical_part_id,
    code,
    title,
    vehicle_type,
    year_from,
    year_to,
    version_label,
    material_reference,
    dimensions_notes,
    technical_notes,
    print_notes,
    is_reference_verified,
    is_active,
  } = payload;

  if (brand_id !== undefined) {
    if (brand_id === null) {
      mold.brand_id = null;
    } else {
      const brand = await VehicleBrand.findByPk(brand_id);
      if (!brand) {
        throw new AppError("La marca indicada no existe.", 400);
      }
      mold.brand_id = brand_id;
    }
  }

  if (model_id !== undefined) {
    if (model_id === null) {
      mold.model_id = null;
    } else {
      const model = await VehicleModel.findByPk(model_id);
      if (!model) {
        throw new AppError("El modelo indicado no existe.", 400);
      }

      const effectiveBrandId = mold.brand_id;
      if (effectiveBrandId && model.brand_id !== effectiveBrandId) {
        throw new AppError("El modelo no pertenece a la marca indicada.", 400);
      }

      mold.model_id = model_id;
    }
  }

  if (technical_part_id !== undefined) {
    const part = await TechnicalPart.findByPk(technical_part_id);
    if (!part) {
      throw new AppError("La pieza técnica indicada no existe.", 400);
    }
    mold.technical_part_id = technical_part_id;
  }

  if (code !== undefined) mold.code = String(code).trim().toUpperCase();
  if (title !== undefined) mold.title = String(title).trim();
  if (vehicle_type !== undefined) mold.vehicle_type = String(vehicle_type).trim();
  if (year_from !== undefined) mold.year_from = year_from;
  if (year_to !== undefined) mold.year_to = year_to;
  if (version_label !== undefined) mold.version_label = version_label ? String(version_label).trim() : null;
  if (material_reference !== undefined) mold.material_reference = material_reference ? String(material_reference).trim() : null;
  if (dimensions_notes !== undefined) mold.dimensions_notes = dimensions_notes ? String(dimensions_notes).trim() : null;
  if (technical_notes !== undefined) mold.technical_notes = technical_notes ? String(technical_notes).trim() : null;
  if (print_notes !== undefined) mold.print_notes = print_notes ? String(print_notes).trim() : null;
  if (is_reference_verified !== undefined) mold.is_reference_verified = Boolean(is_reference_verified);
  if (is_active !== undefined) mold.is_active = Boolean(is_active);

  await mold.save();

  return getMoldById(mold.id);
}

export async function createMoldFile(moldId, payload, authUserId = null) {
  const mold = await Mold.findByPk(moldId);

  if (!mold) {
    throw new AppError("Molde no encontrado.", 404);
  }

  const {
    file_type,
    version_number = 1,
    title = null,
    description = null,
    storage_type = "local",
    file_name = null,
    original_name = null,
    mime_type = null,
    file_size = null,
    file_path = null,
    file_url = null,
    external_url = null,
    is_printable = false,
    is_current = true,
    metadata = null,
  } = payload;

  if (!file_type) {
    throw new AppError("file_type es obligatorio.", 400);
  }

  if (is_current) {
    await MoldFile.update(
      { is_current: false },
      { where: { mold_id: moldId } }
    );
  }

  const file = await MoldFile.create({
    mold_id: moldId,
    uploaded_by_user_id: authUserId,
    file_type: String(file_type).trim(),
    version_number,
    title: title ? String(title).trim() : null,
    description: description ? String(description).trim() : null,
    storage_type: storage_type ? String(storage_type).trim() : "local",
    file_name: file_name ? String(file_name).trim() : null,
    original_name: original_name ? String(original_name).trim() : null,
    mime_type: mime_type ? String(mime_type).trim() : null,
    file_size,
    file_path: file_path ? String(file_path).trim() : null,
    file_url: file_url ? String(file_url).trim() : null,
    external_url: external_url ? String(external_url).trim() : null,
    is_printable: Boolean(is_printable),
    is_current: Boolean(is_current),
    metadata,
  });

  const created = await MoldFile.findByPk(file.id, {
    include: [{ model: User, as: "uploaded_by_user" }],
  });

  return created.toSafeJSON();
}