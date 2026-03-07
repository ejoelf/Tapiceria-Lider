import dotenv from "dotenv";

dotenv.config();

function requiredEnv(name, fallback = null) {
  const value = process.env[name] ?? fallback;

  if (value === undefined || value === null || value === "") {
    throw new Error(`Falta la variable de entorno obligatoria: ${name}`);
  }

  return value;
}

export const env = {
  PORT: Number(process.env.PORT || 4000),
  NODE_ENV: process.env.NODE_ENV || "development",

  DB_HOST: requiredEnv("DB_HOST"),
  DB_PORT: Number(process.env.DB_PORT || 5432),
  DB_NAME: requiredEnv("DB_NAME"),
  DB_USER: requiredEnv("DB_USER"),
  DB_PASSWORD: requiredEnv("DB_PASSWORD"),

  JWT_SECRET: requiredEnv("JWT_SECRET"),
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "7d",

  FRONTEND_WEB_URL: process.env.FRONTEND_WEB_URL || "http://localhost:5173",
  FRONTEND_ADMIN_URL: process.env.FRONTEND_ADMIN_URL || "http://localhost:5174",
};

export default env;