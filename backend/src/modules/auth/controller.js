import asyncHandler from "../../utils/asyncHandler.js";
import { getAuthenticatedUser, loginUser } from "./service.js";

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