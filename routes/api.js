import { Router } from "express";
import AuthController from "../controllers/AuthController.js";
import ProfileController from "../controllers/ProfileController.js";

import authMiddleware from "../middleware/Authenticate.js";
import NewsController from "../controllers/NewsController.js";
// Redis cache ko import kar rahe hain configuration file se
import cacheMiddleware from "../config/redisCache.js";

const router = Router();

router.post("/auth/register", AuthController.register);
router.post("/auth/login", AuthController.login);

router.get("/send-email", AuthController.sendTestEmail);

//*  Profile routes

// Verify karte time mujhe ye bta raha hai ki kis user ne mujhe request bheji hai taaki mai ussi user ke perspective se sirf ussi user ka data process karu.
router.get("/profile", authMiddleware, ProfileController.index); //! Private Route
router.put("/profile/:id", authMiddleware, ProfileController.update); //! Private Route

//* News routes

// Yahan par '/news' route ko Redis cache ke saath connect kar rahe hain aur 'NewsController.index' ko handle karne ke liye use kar rahe hain
router.get("/news", cacheMiddleware, NewsController.index); // data cache karna
router.post("/news", authMiddleware, NewsController.store); // data invalidate karna
router.get("/news/:id", cacheMiddleware, NewsController.show); // data cache karna
router.put("/news/:id", authMiddleware, NewsController.update); // data invalidate karna
router.delete("/news/:id", authMiddleware, NewsController.destroy); // data invalidate karna

export default router;
