import bcrypt from "bcryptjs";
import { User, Role, Branch, Permission } from "../../database/models/index.js";
import { signToken } from "../../utils/jwt.js";
import AppError from "../../utils/appError.js";

const authUserInclude = [
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

export async function loginUser({ email, password }) {
  if (!email || !password) {
    throw new AppError("Email y contraseña son obligatorios.", 400);
  }

  const normalizedEmail = email.toLowerCase().trim();

  const user = await User.findOne({
    where: { email: normalizedEmail },
    include: authUserInclude,
  });

  if (!user) {
    throw new AppError("Credenciales inválidas.", 401);
  }

  if (!user.is_active) {
    throw new AppError("Tu usuario está inactivo.", 403);
  }

  const isPasswordValid = await user.comparePassword(password);

  if (!isPasswordValid) {
    throw new AppError("Credenciales inválidas.", 401);
  }

  await user.update({
    last_login_at: new Date(),
  });

  const token = signToken({
    userId: user.id,
    email: user.email,
    role: user.role?.name || null,
  });

  const refreshedUser = await User.findByPk(user.id, {
    include: authUserInclude,
  });

  return {
    token,
    user: refreshedUser.toSafeJSON(),
  };
}

export async function getAuthenticatedUser(userId) {
  const user = await User.findByPk(userId, {
    include: authUserInclude,
  });

  if (!user) {
    throw new AppError("Usuario no encontrado.", 404);
  }

  return user.toSafeJSON();
}

export async function updateAuthenticatedUser(userId, payload) {
  const user = await User.findByPk(userId);

  if (!user) {
    throw new AppError("Usuario no encontrado.", 404);
  }

  const { first_name, last_name, phone } = payload;

  if (first_name !== undefined) {
    if (!String(first_name).trim()) {
      throw new AppError("El nombre no puede estar vacío.", 400);
    }
    user.first_name = String(first_name).trim();
  }

  if (last_name !== undefined) {
    if (!String(last_name).trim()) {
      throw new AppError("El apellido no puede estar vacío.", 400);
    }
    user.last_name = String(last_name).trim();
  }

  if (phone !== undefined) {
    user.phone = phone ? String(phone).trim() : null;
  }

  await user.save();

  const updatedUser = await User.findByPk(user.id, {
    include: authUserInclude,
  });

  return updatedUser.toSafeJSON();
}

export async function changeAuthenticatedUserPassword(userId, payload) {
  const { current_password, new_password, confirm_password } = payload;

  if (!current_password || !new_password || !confirm_password) {
    throw new AppError(
      "current_password, new_password y confirm_password son obligatorios.",
      400
    );
  }

  if (new_password.length < 8) {
    throw new AppError("La nueva contraseña debe tener al menos 8 caracteres.", 400);
  }

  if (new_password !== confirm_password) {
    throw new AppError("La confirmación de contraseña no coincide.", 400);
  }

  const user = await User.findByPk(userId);

  if (!user) {
    throw new AppError("Usuario no encontrado.", 404);
  }

  const isCurrentPasswordValid = await user.comparePassword(current_password);

  if (!isCurrentPasswordValid) {
    throw new AppError("La contraseña actual es incorrecta.", 401);
  }

  const isSamePassword = await bcrypt.compare(new_password, user.password_hash);

  if (isSamePassword) {
    throw new AppError("La nueva contraseña no puede ser igual a la actual.", 400);
  }

  user.password_hash = await bcrypt.hash(new_password, 10);
  await user.save();

  return {
    success: true,
  };
}