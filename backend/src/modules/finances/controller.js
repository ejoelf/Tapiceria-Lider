import asyncHandler from "../../utils/asyncHandler.js";
import {
  createExpense,
  createIncome,
  listExpenses,
  listIncomes,
} from "./service.js";

export const getAllIncomes = asyncHandler(async (req, res) => {
  const data = await listIncomes();
  res.status(200).json({ ok: true, data });
});

export const createOneIncome = asyncHandler(async (req, res) => {
  const data = await createIncome(req.body, req.user?.id || null);
  res.status(201).json({
    ok: true,
    message: "Ingreso creado correctamente",
    data,
  });
});

export const getAllExpenses = asyncHandler(async (req, res) => {
  const data = await listExpenses();
  res.status(200).json({ ok: true, data });
});

export const createOneExpense = asyncHandler(async (req, res) => {
  const data = await createExpense(req.body, req.user?.id || null);
  res.status(201).json({
    ok: true,
    message: "Egreso creado correctamente",
    data,
  });
});