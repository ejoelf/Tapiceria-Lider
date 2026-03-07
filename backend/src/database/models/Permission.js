import { DataTypes } from "sequelize";
import sequelize from "../../config/db.js";

const Permission = sequelize.define(
  "Permission",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    code: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
    },
    name: {
      type: DataTypes.STRING(150),
      allowNull: false,
    },
    description: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    module: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
  },
  {
    tableName: "permissions",
  }
);

export default Permission;