import { Router } from "express";
import authRoutes from "../modules/auth/routes.js";
import usersRoutes from "../modules/users/routes.js";
import rolesRoutes from "../modules/roles/routes.js";
import branchesRoutes from "../modules/branches/routes.js";
import clientsRoutes from "../modules/clients/routes.js";
import vehiclesRoutes from "../modules/vehicles/routes.js";
import vehicleCatalogsRoutes from "../modules/vehicle-catalogs/routes.js";
import workOrdersRoutes from "../modules/work-orders/routes.js";
import workOrderMediaRoutes from "../modules/work-order-media/routes.js";
import materialsRoutes from "../modules/materials/routes.js";
import moldsRoutes from "../modules/molds/routes.js";
import employeesRoutes from "../modules/employees/routes.js";
import productsRoutes from "../modules/products/routes.js";
import financesRoutes from "../modules/finances/routes.js";
import dashboardRoutes from "../modules/dashboard/routes.js";
import notificationsRoutes from "../modules/notifications/routes.js";
import settingsRoutes from "../modules/settings/routes.js";
import publicSettingsRoutes from "../modules/settings/public-routes.js";
import monthlySummaryRoutes from "../modules/monthly-summary/routes.js";
import exportsRoutes from "../modules/exports/routes.js";

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

router.use("/public/settings", publicSettingsRoutes);

router.use("/auth", authRoutes);
router.use("/users", usersRoutes);
router.use("/roles", rolesRoutes);
router.use("/branches", branchesRoutes);
router.use("/clients", clientsRoutes);
router.use("/vehicles", vehiclesRoutes);
router.use("/vehicle-catalogs", vehicleCatalogsRoutes);
router.use("/work-orders", workOrdersRoutes);
router.use("/work-order-media", workOrderMediaRoutes);
router.use("/materials", materialsRoutes);
router.use("/molds", moldsRoutes);
router.use("/employees", employeesRoutes);
router.use("/products", productsRoutes);
router.use("/finances", financesRoutes);
router.use("/dashboard", dashboardRoutes);
router.use("/notifications", notificationsRoutes);
router.use("/settings", settingsRoutes);
router.use("/monthly-summary", monthlySummaryRoutes);
router.use("/exports", exportsRoutes);

export default router;