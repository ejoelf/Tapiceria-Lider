import bcrypt from "bcryptjs";
import { Op } from "sequelize";
import { User, Role, Branch, Permission } from "../../database/models/index.js";
import AppError from "../../utils/appError.js";

const userInclude = [
  {
    model: Role,
    as: "role",
    include: [
      {
        model: Permission,
        as: "permissions",
        through: { attributes: [] },
      },
    ],
  },
  { model: Branch, as: "branch" },
];

export async function listUsers() {
  const users = await User.findAll({
    include: userInclude,
    order: [["id", "ASC"]],
  });

  return users.map((user) => user.toSafeJSON());
}

export async function getUserById(userId) {
  const user = await User.findByPk(userId, {
    include: userInclude,
  });

  if (!user) {
    throw new AppError("Usuario no encontrado.", 404);
  }

  return user.toSafeJSON();
}

export async function createUser(payload) {
  const {
    role_id,
    branch_id = null,
    first_name,
    last_name,
    email,
    password,
    phone = null,
    is_active = true,
  } = payload;

  if (!role_id || !first_name || !last_name || !email || !password) {
    throw new AppError(
      "role_id, first_name, last_name, email y password son obligatorios.",
      400
    );
  }

  const normalizedEmail = email.toLowerCase().trim();

  const existingUser = await User.findOne({
    where: { email: normalizedEmail },
  });

  if (existingUser) {
    throw new AppError("Ya existe un usuario con ese email.", 409);
  }

  const role = await Role.findByPk(role_id);

  if (!role) {
    throw new AppError("El rol indicado no existe.", 400);
  }

  if (branch_id) {
    const branch = await Branch.findByPk(branch_id);

    if (!branch) {
      throw new AppError("La sucursal indicada no existe.", 400);
    }
  }

  const password_hash = await bcrypt.hash(password, 10);

  const user = await User.create({
    role_id,
    branch_id,
    first_name: first_name.trim(),
    last_name: last_name.trim(),
    email: normalizedEmail,
    password_hash,
    phone: phone?.trim() || null,
    is_active,
  });

  const createdUser = await User.findByPk(user.id, {
    include: userInclude,
  });

  return createdUser.toSafeJSON();
}

export async function updateUser(userId, payload) {
  const user = await User.findByPk(userId);

  if (!user) {
    throw new AppError("Usuario no encontrado.", 404);
  }

  const {
    role_id,
    branch_id,
    first_name,
    last_name,
    email,
    phone,
    is_active,
  } = payload;

  if (email) {
    const normalizedEmail = email.toLowerCase().trim();

    const existingUser = await User.findOne({
      where: {
        email: normalizedEmail,
        id: {
          [Op.ne]: userId,
        },
      },
    });

    if (existingUser) {
      throw new AppError("Ya existe otro usuario con ese email.", 409);
    }

    user.email = normalizedEmail;
  }

  if (role_id !== undefined) {
    const role = await Role.findByPk(role_id);

    if (!role) {
      throw new AppError("El rol indicado no existe.", 400);
    }

    user.role_id = role_id;
  }

  if (branch_id !== undefined) {
    if (branch_id === null) {
      user.branch_id = null;
    } else {
      const branch = await Branch.findByPk(branch_id);

      if (!branch) {
        throw new AppError("La sucursal indicada no existe.", 400);
      }

      user.branch_id = branch_id;
    }
  }

  if (first_name !== undefined) user.first_name = first_name.trim();
  if (last_name !== undefined) user.last_name = last_name.trim();
  if (phone !== undefined) user.phone = phone?.trim() || null;
  if (is_active !== undefined) user.is_active = Boolean(is_active);

  await user.save();

  const updatedUser = await User.findByPk(user.id, {
    include: userInclude,
  });

  return updatedUser.toSafeJSON();
}

export async function toggleUserStatus(userId) {
  const user = await User.findByPk(userId, {
    include: userInclude,
  });

  if (!user) {
    throw new AppError("Usuario no encontrado.", 404);
  }

  user.is_active = !user.is_active;
  await user.save();

  const updatedUser = await User.findByPk(user.id, {
    include: userInclude,
  });

  return updatedUser.toSafeJSON();
} 