import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import path from "path";
import { fileURLToPath } from "url";

import env from "./config/env.js";
import mainRouter from "./routes/index.js";

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const allowedOrigins = [env.FRONTEND_WEB_URL, env.FRONTEND_ADMIN_URL];

app.use(
  cors({
    origin(origin, callback) {
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error(`Origen no permitido por CORS: ${origin}`));
    },
    credentials: true,
  })
);

app.use(helmet());
app.use(morgan("dev"));

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

app.use("/uploads", express.static(path.join(__dirname, "../uploads")));
app.use("/api", mainRouter);

app.use((req, res) => {
  res.status(404).json({
    ok: false,
    message: "Ruta no encontrada",
  });
});

app.use((error, req, res, next) => {
  console.error("🔥 Error global:", error);

  const statusCode = error.statusCode || 500;
  const message = error.message || "Error interno del servidor";

  res.status(statusCode).json({
    ok: false,
    message,
  });
});

export default app;