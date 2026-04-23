import asyncHandler from "../../utils/asyncHandler.js";
import {
  createEmployee,
  getEmployeeById,
  listEmployees,
  updateEmployee,
} from "./service.js";

export const getAllEmployees = asyncHandler(async (req, res) => {
  const employees = await listEmployees();

  res.status(200).json({
    ok: true,
    data: employees,
  });
});

export const getOneEmployee = asyncHandler(async (req, res) => {
  const employee = await getEmployeeById(Number(req.params.id));

  res.status(200).json({
    ok: true,
    data: employee,
  });
});

export const createOneEmployee = asyncHandler(async (req, res) => {
  const employee = await createEmployee(req.body);

  res.status(201).json({
    ok: true,
    message: "Empleado creado correctamente",
    data: employee,
  });
});

export const updateOneEmployee = asyncHandler(async (req, res) => {
  const employee = await updateEmployee(Number(req.params.id), req.body);

  res.status(200).json({
    ok: true,
    message: "Empleado actualizado correctamente",
    data: employee,
  });
});