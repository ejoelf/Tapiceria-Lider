import { Branch } from "../../database/models/index.js";

export async function listBranches() {
  const branches = await Branch.findAll({
    order: [["id", "ASC"]],
  });

  return branches;
}