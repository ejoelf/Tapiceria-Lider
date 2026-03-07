import { User, Role, Branch, Permission } from "../database/models/index.js";
import { verifyToken } from "../utils/jwt.js";
import AppError from "../utils/appError.js";

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

export async function protect(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new AppError("No autorizado. Token no proporcionado.", 401);
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      throw new AppError("No autorizado. Token inválido.", 401);
    }

    const decoded = verifyToken(token);

    const user = await User.findByPk(decoded.userId, {
      include: authUserInclude,
    });

    if (!user) {
      throw new AppError("Usuario no encontrado.", 401);
    }

    if (!user.is_active) {
      throw new AppError("Usuario inactivo.", 403);
    }

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
}