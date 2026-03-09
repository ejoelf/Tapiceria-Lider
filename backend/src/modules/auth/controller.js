import asyncHandler from "../../utils/asyncHandler.js";
import {
  changeAuthenticatedUserPassword,
  getAuthenticatedUser,
  loginUser,
  updateAuthenticatedUser,
} from "./service.js";

export const login = asyncHandler(async (req, res) => {
  const result = await loginUser(req.body);

  res.status(200).json({
    ok: true,
    message: "Login exitoso",
    data: result,
  });
});

export const me = asyncHandler(async (req, res) => {
  const user = await getAuthenticatedUser(req.user.id);

  res.status(200).json({
    ok: true,
    data: user,
  });
});

export const updateMe = asyncHandler(async (req, res) => {
  const user = await updateAuthenticatedUser(req.user.id, req.body);

  res.status(200).json({
    ok: true,
    message: "Perfil actualizado correctamente",
    data: user,
  });
});

export const changeMyPassword = asyncHandler(async (req, res) => {
  await changeAuthenticatedUserPassword(req.user.id, req.body);

  res.status(200).json({
    ok: true,
    message: "Contraseña actualizada correctamente",
  });
});