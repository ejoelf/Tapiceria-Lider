import { Router } from "express";
import authRoutes from "../modules/auth/routes.js";
import usersRoutes from "../modules/users/routes.js";

const router = Router();

router.get("/", (req, res) => {
  res.json({
    ok: true,
    message: "API de Tapicería Líder funcionando correctamente",
    timestamp: new Date().toISOString(),
  });
});

router.get("/health", (req, res) => {
  res.status(200).json({
    ok: true,
    status: "UP",
    service: "tapiceria-lider-backend",
    environment: process.env.NODE_ENV || "development",
    timestamp: new Date().toISOString(),
  });
});

router.use("/auth", authRoutes);
router.use("/users", usersRoutes);

export default router;