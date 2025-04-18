import prisma from "@/DB/db.config.js";
import bcrypt from "bcrypt";
import type { NextFunction, Request, RequestHandler, Response } from "express";

class ResetPasswordController {
	static async resetPassword(req: Request, res: Response) {
		try {
			const { resetToken, newPassword } = req.body;

			// Find the user by reset token
			const user = await prisma.users.findUnique({
				where: {
					resetToken
				}
			});

			if (!user) {
				return res
					.status(400)
					.json({ message: "Invalid or expired reset token" });
			}

			// Check if the token is expired
			const currentTime = new Date();
			if (user.resetTokenExpiry && currentTime > user.resetTokenExpiry) {
				return res.status(401).json({ message: "Reset token has expired" });
			}

			const isSamePassword = await bcrypt.compare(newPassword, user.password);
			if (isSamePassword) {
				return res.status(401).json({
					errors: {
						email: "New password cannot be the same as the old password."
					}
				});
			}

			// Hash the new password
			const salt = await bcrypt.genSalt(10);
			const hashedPassword = await bcrypt.hash(newPassword, salt);

			// Update the user's password
			await prisma.users.update({
				where: { resetToken },
				data: {
					password: hashedPassword,
					resetToken: null, // Clear reset token after use
					resetTokenExpiry: null // Clear reset token expiration
				}
			});

			res.status(200).json({
				success: true,
				message: "Your password has been reset successfully."
			});
		} catch (err) {
			console.error(err);
			res.status(500).json({ message: "Server error during password reset" });
		}
	}

	static resetPasswordHandler: RequestHandler = async (
		req: Request,
		res: Response,
		next: NextFunction
	): Promise<void> => {
		try {
			await ResetPasswordController.resetPassword(req, res);
		} catch (error) {
			next(error);
		}
	};
}

export default ResetPasswordController;
