import { Router } from "express";
import { login, me } from "./controller.js";
import { protect } from "../../middlewares/auth.middleware.js";

const router = Router();

router.post("/login", login);
router.get("/me", protect, me);

export default router;