import { Router } from "express";
import { registerController, loginController, meController } from "../controllers/authController";
import { authMiddleware } from "../middlewares/authMiddleware";

const router = Router();

router.post("/register", registerController);
router.post("/login", loginController);
router.get("/me", authMiddleware, meController);

export default router;