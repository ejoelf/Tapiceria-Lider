import { Role, Permission } from "../../database/models/index.js";

export async function listRoles() {
  const roles = await Role.findAll({
    include: [
      {
        model: Permission,
        as: "permissions",
        through: { attributes: [] },
      },
    ],
    order: [["id", "ASC"]],
  });

  return roles;
}