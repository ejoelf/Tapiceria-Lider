import { Branch, Product, ProductCategory } from "../../database/models/index.js";
import AppError from "../../utils/appError.js";

const productInclude = [
  { model: ProductCategory, as: "category" },
  { model: Branch, as: "branch" },
];

export async function listProductCategories() {
  return ProductCategory.findAll({
    order: [["name", "ASC"]],
  });
}

export async function createProductCategory(payload) {
  const { name, description = null, is_active = true } = payload;

  if (!name || !String(name).trim()) {
    throw new AppError("name es obligatorio.", 400);
  }

  const existing = await ProductCategory.findOne({
    where: { name: String(name).trim() },
  });

  if (existing) {
    throw new AppError("Ya existe una categoría con ese nombre.", 409);
  }

  return ProductCategory.create({
    name: String(name).trim(),
    description: description ? String(description).trim() : null,
    is_active: Boolean(is_active),
  });
}

export async function listProducts() {
  const products = await Product.findAll({
    include: productInclude,
    order: [["id", "DESC"]],
  });

  return products.map((item) => item.toSafeJSON());
}

export async function getProductById(productId) {
  const product = await Product.findByPk(productId, {
    include: productInclude,
  });

  if (!product) {
    throw new AppError("Producto no encontrado.", 404);
  }

  return product.toSafeJSON();
}

export async function createProduct(payload) {
  const {
    category_id = null,
    branch_id = null,
    code,
    name,
    description = null,
    price = 0,
    stock = 0,
    status = "available",
    image_url = null,
    is_featured = false,
    is_visible_public = true,
    is_active = true,
  } = payload;

  if (!code || !name) {
    throw new AppError("code y name son obligatorios.", 400);
  }

  const existing = await Product.findOne({
    where: { code: String(code).trim().toUpperCase() },
  });

  if (existing) {
    throw new AppError("Ya existe un producto con ese código.", 409);
  }

  if (category_id) {
    const category = await ProductCategory.findByPk(category_id);
    if (!category) {
      throw new AppError("La categoría indicada no existe.", 400);
    }
  }

  if (branch_id) {
    const branch = await Branch.findByPk(branch_id);
    if (!branch) {
      throw new AppError("La sucursal indicada no existe.", 400);
    }
  }

  const product = await Product.create({
    category_id,
    branch_id,
    code: String(code).trim().toUpperCase(),
    name: String(name).trim(),
    description: description ? String(description).trim() : null,
    price,
    stock,
    status: String(status).trim(),
    image_url: image_url ? String(image_url).trim() : null,
    is_featured: Boolean(is_featured),
    is_visible_public: Boolean(is_visible_public),
    is_active: Boolean(is_active),
  });

  const created = await Product.findByPk(product.id, {
    include: productInclude,
  });

  return created.toSafeJSON();
}

export async function updateProduct(productId, payload) {
  const product = await Product.findByPk(productId);

  if (!product) {
    throw new AppError("Producto no encontrado.", 404);
  }

  const {
    category_id,
    branch_id,
    code,
    name,
    description,
    price,
    stock,
    status,
    image_url,
    is_featured,
    is_visible_public,
    is_active,
  } = payload;

  if (category_id !== undefined) {
    if (category_id === null) {
      product.category_id = null;
    } else {
      const category = await ProductCategory.findByPk(category_id);
      if (!category) {
        throw new AppError("La categoría indicada no existe.", 400);
      }
      product.category_id = category_id;
    }
  }

  if (branch_id !== undefined) {
    if (branch_id === null) {
      product.branch_id = null;
    } else {
      const branch = await Branch.findByPk(branch_id);
      if (!branch) {
        throw new AppError("La sucursal indicada no existe.", 400);
      }
      product.branch_id = branch_id;
    }
  }

  if (code !== undefined) product.code = String(code).trim().toUpperCase();
  if (name !== undefined) product.name = String(name).trim();
  if (description !== undefined) product.description = description ? String(description).trim() : null;
  if (price !== undefined) product.price = price;
  if (stock !== undefined) product.stock = stock;
  if (status !== undefined) product.status = String(status).trim();
  if (image_url !== undefined) product.image_url = image_url ? String(image_url).trim() : null;
  if (is_featured !== undefined) product.is_featured = Boolean(is_featured);
  if (is_visible_public !== undefined) product.is_visible_public = Boolean(is_visible_public);
  if (is_active !== undefined) product.is_active = Boolean(is_active);

  await product.save();

  const updated = await Product.findByPk(product.id, {
    include: productInclude,
  });

  return updated.toSafeJSON();
}