import { Branch, Employee, User } from "../../database/models/index.js";
import AppError from "../../utils/appError.js";

const employeeInclude = [
  { model: Branch, as: "branch" },
  { model: User, as: "linked_user" },
];

export async function listEmployees() {
  const employees = await Employee.findAll({
    include: employeeInclude,
    order: [["id", "ASC"]],
  });

  return employees.map((item) => item.toSafeJSON());
}

export async function getEmployeeById(employeeId) {
  const employee = await Employee.findByPk(employeeId, {
    include: employeeInclude,
  });

  if (!employee) {
    throw new AppError("Empleado no encontrado.", 404);
  }

  return employee.toSafeJSON();
}

export async function createEmployee(payload) {
  const {
    branch_id = null,
    linked_user_id = null,
    first_name,
    last_name,
    document_number = null,
    email = null,
    phone = null,
    address = null,
    position = null,
    hire_date = null,
    salary_reference = 0,
    notes = null,
    is_active = true,
  } = payload;

  if (!first_name || !last_name) {
    throw new AppError("first_name y last_name son obligatorios.", 400);
  }

  if (branch_id) {
    const branch = await Branch.findByPk(branch_id);
    if (!branch) {
      throw new AppError("La sucursal indicada no existe.", 400);
    }
  }

  if (linked_user_id) {
    const user = await User.findByPk(linked_user_id);
    if (!user) {
      throw new AppError("El usuario vinculado no existe.", 400);
    }
  }

  const employee = await Employee.create({
    branch_id,
    linked_user_id,
    first_name: String(first_name).trim(),
    last_name: String(last_name).trim(),
    document_number: document_number ? String(document_number).trim() : null,
    email: email ? String(email).trim().toLowerCase() : null,
    phone: phone ? String(phone).trim() : null,
    address: address ? String(address).trim() : null,
    position: position ? String(position).trim() : null,
    hire_date,
    salary_reference,
    notes: notes ? String(notes).trim() : null,
    is_active: Boolean(is_active),
  });

  const created = await Employee.findByPk(employee.id, {
    include: employeeInclude,
  });

  return created.toSafeJSON();
}

export async function updateEmployee(employeeId, payload) {
  const employee = await Employee.findByPk(employeeId);

  if (!employee) {
    throw new AppError("Empleado no encontrado.", 404);
  }

  const {
    branch_id,
    linked_user_id,
    first_name,
    last_name,
    document_number,
    email,
    phone,
    address,
    position,
    hire_date,
    salary_reference,
    notes,
    is_active,
  } = payload;

  if (branch_id !== undefined) {
    if (branch_id === null) {
      employee.branch_id = null;
    } else {
      const branch = await Branch.findByPk(branch_id);
      if (!branch) {
        throw new AppError("La sucursal indicada no existe.", 400);
      }
      employee.branch_id = branch_id;
    }
  }

  if (linked_user_id !== undefined) {
    if (linked_user_id === null) {
      employee.linked_user_id = null;
    } else {
      const user = await User.findByPk(linked_user_id);
      if (!user) {
        throw new AppError("El usuario vinculado no existe.", 400);
      }
      employee.linked_user_id = linked_user_id;
    }
  }

  if (first_name !== undefined) employee.first_name = String(first_name).trim();
  if (last_name !== undefined) employee.last_name = String(last_name).trim();
  if (document_number !== undefined) employee.document_number = document_number ? String(document_number).trim() : null;
  if (email !== undefined) employee.email = email ? String(email).trim().toLowerCase() : null;
  if (phone !== undefined) employee.phone = phone ? String(phone).trim() : null;
  if (address !== undefined) employee.address = address ? String(address).trim() : null;
  if (position !== undefined) employee.position = position ? String(position).trim() : null;
  if (hire_date !== undefined) employee.hire_date = hire_date;
  if (salary_reference !== undefined) employee.salary_reference = salary_reference;
  if (notes !== undefined) employee.notes = notes ? String(notes).trim() : null;
  if (is_active !== undefined) employee.is_active = Boolean(is_active);

  await employee.save();

  const updated = await Employee.findByPk(employee.id, {
    include: employeeInclude,
  });

  return updated.toSafeJSON();
}