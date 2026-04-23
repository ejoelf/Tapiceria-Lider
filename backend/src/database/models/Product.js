import { DataTypes } from "sequelize";
import sequelize from "../../config/db.js";

const Product = sequelize.define(
  "Product",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    category_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    branch_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    code: {
      type: DataTypes.STRING(60),
      allowNull: false,
      unique: true,
    },
    name: {
      type: DataTypes.STRING(160),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    price: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0,
    },
    stock: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    status: {
      type: DataTypes.STRING(30),
      allowNull: false,
      defaultValue: "available",
    },
    image_url: {
      type: DataTypes.STRING(1000),
      allowNull: true,
    },
    is_featured: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    is_visible_public: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  },
  {
    tableName: "products",
  }
);

Product.prototype.toSafeJSON = function () {
  return {
    id: this.id,
    category_id: this.category_id,
    branch_id: this.branch_id,
    code: this.code,
    name: this.name,
    description: this.description,
    price: this.price,
    stock: this.stock,
    status: this.status,
    image_url: this.image_url,
    is_featured: this.is_featured,
    is_visible_public: this.is_visible_public,
    is_active: this.is_active,
    category: this.category,
    branch: this.branch,
    created_at: this.created_at,
    updated_at: this.updated_at,
  };
};

export default Product;