import { Router } from "express"; // Import Router
import cacheMiddleware from "../config/redisCache.js";
import AuthController from "../controllers/AuthController.js";
import MailController from "../controllers/MailController.js";
import NewsController from "../controllers/NewsController.js";
import ProfileController from "../controllers/ProfileController.js";
import authMiddleware from "../middleware/Authenticate.js";

import ForgotPasswordMailController from "@/controllers/ForgotPasswordMailController.js";
import RefreshTokenController from "@/controllers/RefreshTokenController.js";
import ResetPasswordController from "@/controllers/ResetPasswordController.js";
import VerificationResetPasswordMailController from "@/controllers/VerificationResetPasswordMailController.js";
import VerificationEmailController from "../controllers/VerificationEmailController.js"; // Import VerificationEmailController

const router = Router();

//* Auth routes

router.post("/auth/register", AuthController.registerHandler);

router.post("/auth/login", AuthController.loginHandler);

//*  Profile routes

router.get("/profile", authMiddleware, ProfileController.indexHandler); //! Private Route
router.put("/profile/:id", authMiddleware, ProfileController.update); //! Private Route

//* News routes

router.get("/news", cacheMiddleware, NewsController.indexHandler);
router.post("/news", authMiddleware, NewsController.storeHandler);
router.get("/news/:id", cacheMiddleware, NewsController.showHandler);
router.put("/news/:id", authMiddleware, NewsController.updateHandler);
router.delete("/news/:id", authMiddleware, NewsController.destroyHandler);

//* Token Routes

router.post("/auth/refresh-token", RefreshTokenController.refreshTokenHandler);

//* Mail Routes

router.get("/send-email", MailController.mailHandler);

router.get("/auth/verify-email", VerificationEmailController.verifyMailHandler); // Email verification route

router.post(
	"/auth/forgot-password",
	ForgotPasswordMailController.forgotPasswordMailHandler
); // Forgot password route

router.get(
	"/auth/reset-password-email",
	VerificationResetPasswordMailController.verifyResetPasswordMailHandler
); // Email verification route

router.post(
	"/auth/reset-password",
	ResetPasswordController.resetPasswordHandler
); // Reset password route

export default router;
