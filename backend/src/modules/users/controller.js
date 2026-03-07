import asyncHandler from "../../utils/asyncHandler.js";
import {
  createUser,
  getUserById,
  listUsers,
  toggleUserStatus,
  updateUser,
} from "./service.js";

export const getAllUsers = asyncHandler(async (req, res) => {
  const users = await listUsers();

  res.status(200).json({
    ok: true,
    data: users,
  });
});

export const getOneUser = asyncHandler(async (req, res) => {
  const user = await getUserById(Number(req.params.id));

  res.status(200).json({
    ok: true,
    data: user,
  });
});

export const createOneUser = asyncHandler(async (req, res) => {
  const user = await createUser(req.body);

  res.status(201).json({
    ok: true,
    message: "Usuario creado correctamente",
    data: user,
  });
});

export const updateOneUser = asyncHandler(async (req, res) => {
  const user = await updateUser(Number(req.params.id), req.body);

  res.status(200).json({
    ok: true,
    message: "Usuario actualizado correctamente",
    data: user,
  });
});

export const toggleOneUserStatus = asyncHandler(async (req, res) => {
  const user = await toggleUserStatus(Number(req.params.id));

  res.status(200).json({
    ok: true,
    message: "Estado del usuario actualizado correctamente",
    data: user,
  });
});