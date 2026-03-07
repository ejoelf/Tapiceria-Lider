import { DataTypes } from "sequelize";
import bcrypt from "bcryptjs";
import sequelize from "../../config/db.js";

const User = sequelize.define(
  "User",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    role_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    branch_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    first_name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    last_name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING(150),
      allowNull: false,
      unique: true,
      set(value) {
        this.setDataValue("email", value?.toLowerCase().trim());
      },
    },
    password_hash: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    phone: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    last_login_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    tableName: "users",
  }
);

User.prototype.comparePassword = async function (plainPassword) {
  return bcrypt.compare(plainPassword, this.password_hash);
};

User.prototype.toSafeJSON = function () {
  return {
    id: this.id,
    role_id: this.role_id,
    branch_id: this.branch_id,
    first_name: this.first_name,
    last_name: this.last_name,
    email: this.email,
    phone: this.phone,
    is_active: this.is_active,
    last_login_at: this.last_login_at,
    role: this.role,
    branch: this.branch,
    permissions: this.role?.permissions || [],
    created_at: this.created_at,
    updated_at: this.updated_at,
  };
};

export default User;