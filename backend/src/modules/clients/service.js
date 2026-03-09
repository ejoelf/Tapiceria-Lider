import { Branch, Client, Vehicle } from "../../database/models/index.js";
import AppError from "../../utils/appError.js";

const clientInclude = [
  { model: Branch, as: "branch" },
  { model: Vehicle, as: "vehicles" },
];

export async function listClients() {
  const clients = await Client.findAll({
    include: clientInclude,
    order: [["id", "ASC"]],
  });

  return clients.map((client) => client.toSafeJSON());
}

export async function getClientById(clientId) {
  const client = await Client.findByPk(clientId, {
    include: clientInclude,
  });

  if (!client) {
    throw new AppError("Cliente no encontrado.", 404);
  }

  return client.toSafeJSON();
}

export async function createClient(payload) {
  const {
    branch_id = null,
    client_type = "individual",
    first_name = null,
    last_name = null,
    company_name = null,
    tax_id = null,
    email = null,
    phone = null,
    secondary_phone = null,
    address = null,
    city = null,
    province = null,
    notes = null,
    is_active = true,
  } = payload;

  if (!["individual", "company"].includes(client_type)) {
    throw new AppError("client_type debe ser individual o company.", 400);
  }

  if (client_type === "individual" && !String(first_name || "").trim() && !String(last_name || "").trim()) {
    throw new AppError("Para cliente individual debés indicar nombre o apellido.", 400);
  }

  if (client_type === "company" && !String(company_name || "").trim()) {
    throw new AppError("Para cliente empresa debés indicar company_name.", 400);
  }

  if (branch_id) {
    const branch = await Branch.findByPk(branch_id);
    if (!branch) {
      throw new AppError("La sucursal indicada no existe.", 400);
    }
  }

  const client = await Client.create({
    branch_id,
    client_type,
    first_name: first_name ? String(first_name).trim() : null,
    last_name: last_name ? String(last_name).trim() : null,
    company_name: company_name ? String(company_name).trim() : null,
    tax_id: tax_id ? String(tax_id).trim() : null,
    email: email ? String(email).trim().toLowerCase() : null,
    phone: phone ? String(phone).trim() : null,
    secondary_phone: secondary_phone ? String(secondary_phone).trim() : null,
    address: address ? String(address).trim() : null,
    city: city ? String(city).trim() : null,
    province: province ? String(province).trim() : null,
    notes: notes ? String(notes).trim() : null,
    is_active: Boolean(is_active),
  });

  const createdClient = await Client.findByPk(client.id, {
    include: clientInclude,
  });

  return createdClient.toSafeJSON();
}

export async function updateClient(clientId, payload) {
  const client = await Client.findByPk(clientId);

  if (!client) {
    throw new AppError("Cliente no encontrado.", 404);
  }

  const {
    branch_id,
    client_type,
    first_name,
    last_name,
    company_name,
    tax_id,
    email,
    phone,
    secondary_phone,
    address,
    city,
    province,
    notes,
    is_active,
  } = payload;

  if (branch_id !== undefined) {
    if (branch_id === null) {
      client.branch_id = null;
    } else {
      const branch = await Branch.findByPk(branch_id);
      if (!branch) {
        throw new AppError("La sucursal indicada no existe.", 400);
      }
      client.branch_id = branch_id;
    }
  }

  if (client_type !== undefined) {
    if (!["individual", "company"].includes(client_type)) {
      throw new AppError("client_type debe ser individual o company.", 400);
    }
    client.client_type = client_type;
  }

  if (first_name !== undefined) client.first_name = first_name ? String(first_name).trim() : null;
  if (last_name !== undefined) client.last_name = last_name ? String(last_name).trim() : null;
  if (company_name !== undefined) client.company_name = company_name ? String(company_name).trim() : null;
  if (tax_id !== undefined) client.tax_id = tax_id ? String(tax_id).trim() : null;
  if (email !== undefined) client.email = email ? String(email).trim().toLowerCase() : null;
  if (phone !== undefined) client.phone = phone ? String(phone).trim() : null;
  if (secondary_phone !== undefined) client.secondary_phone = secondary_phone ? String(secondary_phone).trim() : null;
  if (address !== undefined) client.address = address ? String(address).trim() : null;
  if (city !== undefined) client.city = city ? String(city).trim() : null;
  if (province !== undefined) client.province = province ? String(province).trim() : null;
  if (notes !== undefined) client.notes = notes ? String(notes).trim() : null;
  if (is_active !== undefined) client.is_active = Boolean(is_active);

  if (
    client.client_type === "individual" &&
    !String(client.first_name || "").trim() &&
    !String(client.last_name || "").trim()
  ) {
    throw new AppError("Para cliente individual debés indicar nombre o apellido.", 400);
  }

  if (client.client_type === "company" && !String(client.company_name || "").trim()) {
    throw new AppError("Para cliente empresa debés indicar company_name.", 400);
  }

  await client.save();

  const updatedClient = await Client.findByPk(client.id, {
    include: clientInclude,
  });

  return updatedClient.toSafeJSON();
}