import asyncHandler from "../../utils/asyncHandler.js";
import {
  createClient,
  getClientById,
  listClients,
  updateClient,
} from "./service.js";

export const getAllClients = asyncHandler(async (req, res) => {
  const clients = await listClients();

  res.status(200).json({
    ok: true,
    data: clients,
  });
});

export const getOneClient = asyncHandler(async (req, res) => {
  const client = await getClientById(Number(req.params.id));

  res.status(200).json({
    ok: true,
    data: client,
  });
});

export const createOneClient = asyncHandler(async (req, res) => {
  const client = await createClient(req.body);

  res.status(201).json({
    ok: true,
    message: "Cliente creado correctamente",
    data: client,
  });
});

export const updateOneClient = asyncHandler(async (req, res) => {
  const client = await updateClient(Number(req.params.id), req.body);

  res.status(200).json({
    ok: true,
    message: "Cliente actualizado correctamente",
    data: client,
  });
});