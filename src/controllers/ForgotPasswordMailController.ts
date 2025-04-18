import prisma from "@/DB/db.config.js";
import { sendResetPasswordEmail } from "@/config/resetPasswordMail.js";
import type { NextFunction, Request, RequestHandler, Response } from "express";
import jwt from "jsonwebtoken";

class ForgotPasswordMailController {
	static async forgotPassword(req: Request, res: Response) {
		try {
			const { email } = req.body;

			// check if the user exists

			const user = await prisma.users.findUnique({
				where: {
					email
				}
			});

			if (!user) {
				return res.status(404).json({ message: "User not found" });
			}

			const payloadData = {
				userId: user.id,
				email: user.email
			};

			// Generate a password reset token
			const resetToken = jwt.sign(
				payloadData,
				process.env.JWT_SECRET as string
			);
			const resetTokenExpiry = new Date();

			resetTokenExpiry.setHours(resetTokenExpiry.getHours() + 1); // Token expires in 1 hour

			// store the reset token and its expiration in the database

			await prisma.users.update({
				where: {
					email: user.email
				},
				data: {
					resetToken,
					resetTokenExpiry
				}
			});

			await sendResetPasswordEmail(email, resetToken);

			return res.status(200).json({
				success: true,
				message: "Password reset link has been sent to your email."
			});
		} catch (err) {
			console.error(err);
			res.status(500).json({ message: "Server error during forgot password" });
		}
	}

	static forgotPasswordMailHandler: RequestHandler = async (
		req: Request,
		res: Response,
		next: NextFunction
	): Promise<void> => {
		try {
			await ForgotPasswordMailController.forgotPassword(req, res);
		} catch (error) {
			next(error);
		}
	};
}

export default ForgotPasswordMailController;
