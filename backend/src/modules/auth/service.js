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

  return {
    token,
    user: user.toSafeJSON(),
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