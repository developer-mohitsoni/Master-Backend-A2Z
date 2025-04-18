import prisma from "@/DB/db.config.js";
import type { MyJwtPayload } from "@/types/index.js";
import type { NextFunction, Request, RequestHandler, Response } from "express";
import jwt from "jsonwebtoken";

class VerificationResetPasswordMailController {
	static async verifyResetMailPassword(req: Request, res: Response) {
		const { token } = req.query;

		console.log("Token: ", token);

		if (!token) return res.status(400).json({ message: "Token missing" });

		try {
			const decoded = jwt.verify(
				token as string,
				process.env.JWT_SECRET as string
			) as MyJwtPayload;

			console.log("Decoded: ", decoded);

			const user = await prisma.users.findUnique({
				where: { id: decoded.userId }
			});

			console.log("User: ", user);

			if (!user) return res.status(400).json({ message: "Invalid user" });

			if (user.resetToken !== token) {
				return res.status(400).json({ message: "Invalid reset token" });
			}

			if (user.resetTokenExpiry) {
				const currentTime = new Date();
				if (currentTime > user.resetTokenExpiry) {
					return res.status(400).json({ message: "Token expired" });
				}
			}
			// Token is valid and not expired, proceed with password reset
			return res.status(200).json({
				message: "Token is valid. You can proceed with password reset.",
				resetToken: user.resetToken
			});
		} catch (err) {
			return res.status(400).json({ message: "Invalid or expired token" });
		}
	}

	static verifyResetPasswordMailHandler: RequestHandler = async (
		req: Request,
		res: Response,
		next: NextFunction
	): Promise<void> => {
		try {
			await VerificationResetPasswordMailController.verifyResetMailPassword(
				req,
				res
			);
		} catch (error) {
			next(error);
		}
	};
}

export default VerificationResetPasswordMailController;
