import { Sequelize } from "sequelize";
import env from "./env.js";

export const sequelize = new Sequelize(
  env.DB_NAME,
  env.DB_USER,
  env.DB_PASSWORD,
  {
    host: env.DB_HOST,
    port: env.DB_PORT,
    dialect: "postgres",
    logging: false,
    define: {
      underscored: true,
      timestamps: true,
    },
  }
);

export async function connectDB() {
  try {
    await sequelize.authenticate();
    console.log("✅ Base de datos conectada correctamente");
  } catch (error) {
    console.error("❌ Error al conectar la base de datos:");
    console.error(error.message);
    throw error;
  }
}

export default sequelize;