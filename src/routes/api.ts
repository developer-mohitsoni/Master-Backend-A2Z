import { Router } from "express"; // Import Router
// import cacheMiddleware from "../config/redisCache.js";
import AuthController from "../controllers/AuthController.js";
import MailController from "../controllers/MailController.js";
// import NewsController from "../controllers/NewsController.js";
// import ProfileController from "../controllers/ProfileController.js";
// import authMiddleware from "../middleware/Authenticate.js";

import VerificationEmailController from "../controllers/VerificationEmailController.js"; // Import VerificationEmailController

const router = Router();

router.get("/auth/verify-email", VerificationEmailController.verifyMailHandler); // Email verification route

router.post("/auth/register", AuthController.registerHandler);

router.post("/auth/login", AuthController.loginHandler);

router.get("/send-email", MailController.mailHandler);

//*  Profile routes

// router.get("/profile", authMiddleware, ProfileController.indexHandler); //! Private Route
// router.put("/profile/:id", authMiddleware, ProfileController.update); //! Private Route

//* News routes

// router.get("/news", cacheMiddleware, NewsController.indexHandler);
// router.post("/news", authMiddleware, NewsController.storeHandler);
// router.get("/news/:id", cacheMiddleware, NewsController.showHandler);
// router.put("/news/:id", authMiddleware, NewsController.updateHandler);
// router.delete("/news/:id", authMiddleware, NewsController.destroyHandler);

export default router;
