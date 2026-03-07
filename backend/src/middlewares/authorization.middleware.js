import AppError from "../utils/appError.js";

export function requireRole(...allowedRoles) {
  return (req, res, next) => {
    const userRole = req.user?.role?.name;

    if (!userRole) {
      return next(new AppError("El usuario autenticado no tiene rol asignado.", 403));
    }

    if (!allowedRoles.includes(userRole)) {
      return next(new AppError("No tenés permisos para realizar esta acción.", 403));
    }

    next();
  };
}

export function requirePermission(...requiredPermissions) {
  return (req, res, next) => {
    const permissions = req.user?.role?.permissions || [];
    const userPermissionCodes = permissions.map((permission) => permission.code);

    const hasPermission = requiredPermissions.every((permissionCode) =>
      userPermissionCodes.includes(permissionCode)
    );

    if (!hasPermission) {
      return next(new AppError("No tenés permisos suficientes para esta acción.", 403));
    }

    next();
  };
}