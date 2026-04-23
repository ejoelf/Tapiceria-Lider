import asyncHandler from "../../utils/asyncHandler.js";
import {
  createProduct,
  createProductCategory,
  getProductById,
  listProductCategories,
  listProducts,
  updateProduct,
} from "./service.js";

export const getAllProductCategories = asyncHandler(async (req, res) => {
  const categories = await listProductCategories();

  res.status(200).json({
    ok: true,
    data: categories,
  });
});

export const createOneProductCategory = asyncHandler(async (req, res) => {
  const category = await createProductCategory(req.body);

  res.status(201).json({
    ok: true,
    message: "Categoría creada correctamente",
    data: category,
  });
});

export const getAllProducts = asyncHandler(async (req, res) => {
  const products = await listProducts();

  res.status(200).json({
    ok: true,
    data: products,
  });
});

export const getOneProduct = asyncHandler(async (req, res) => {
  const product = await getProductById(Number(req.params.id));

  res.status(200).json({
    ok: true,
    data: product,
  });
});

export const createOneProduct = asyncHandler(async (req, res) => {
  const product = await createProduct(req.body);

  res.status(201).json({
    ok: true,
    message: "Producto creado correctamente",
    data: product,
  });
});

export const updateOneProduct = asyncHandler(async (req, res) => {
  const product = await updateProduct(Number(req.params.id), req.body);

  res.status(200).json({
    ok: true,
    message: "Producto actualizado correctamente",
    data: product,
  });
});