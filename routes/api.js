import { Router } from "express";
import AuthController from "../controllers/AuthController.js";
import ProfileController from "../controllers/ProfileController.js";

import authMiddleware from "../middleware/Authenticate.js";
import NewsController from "../controllers/NewsController.js";
// Redis cache ko import kar rahe hain configuration file se
import redisCache from "../DB/redis.config.js";

const router = Router();

router.post("/auth/register", AuthController.register);
router.post("/auth/login", AuthController.login);

router.get("/send-email", AuthController.sendTestEmail);

//*  Profile routes

router.get("/profile", authMiddleware, ProfileController.index); //! Private Route
router.put("/profile/:id", authMiddleware, ProfileController.update); //! Private Route

//* News routes

// Yahan par '/news' route ko Redis cache ke saath connect kar rahe hain aur 'NewsController.index' ko handle karne ke liye use kar rahe hain
router.get("/news", redisCache.route(), NewsController.index);
router.post("/news", authMiddleware, NewsController.store);
router.get("/news/:id", NewsController.show);
router.put("/news/:id", authMiddleware, NewsController.update);
router.delete("/news/:id", authMiddleware, NewsController.destroy);

export default router;
