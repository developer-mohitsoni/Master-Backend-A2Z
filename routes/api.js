import { Router } from "express";
import AuthController from "../controllers/AuthController.js";
import ProfileController from "../controllers/ProfileController.js";

import authMiddleware from "../middleware/Authenticate.js";

const router = Router();

router.post("/auth/register", AuthController.register);
router.post("/auth/login", AuthController.login)


//*  Profile routes

router.get("/profile", authMiddleware, ProfileController.index) //! Private Route

export default router;
