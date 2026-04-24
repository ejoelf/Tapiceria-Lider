import { Router } from "express";
import { getPublicWebsiteSettings } from "./public-controller.js";

const router = Router();

router.get("/website", getPublicWebsiteSettings);

export default router;