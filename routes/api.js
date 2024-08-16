import { Router } from "express";
import AuthController from "../controllers/AuthController.js";
import ProfileController from "../controllers/ProfileController.js";

import authMiddleware from "../middleware/Authenticate.js";
import NewsController from "../controllers/NewsController.js";

const router = Router();

router.post("/auth/register", AuthController.register);
router.post("/auth/login", AuthController.login);

//*  Profile routes

router.get("/profile", authMiddleware, ProfileController.index); //! Private Route
router.put("/profile/:id", authMiddleware, ProfileController.update); //! Private Route

//* News routes

router.get("/news", NewsController.index);
router.post("/news", authMiddleware, NewsController.store);
router.get("/news/:id", NewsController.show);
router.put("/news/:id", authMiddleware, NewsController.update);
router.delete("/news/:id", authMiddleware, NewsController.destroy);

export default router;
