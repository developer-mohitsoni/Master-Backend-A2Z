import prisma from "@/DB/db.config.js";
import type { NextFunction, Request, RequestHandler, Response } from "express";
import jwt from "jsonwebtoken";

class VerificationEmailController {
	static async verifyEmail(req: Request, res: Response) {
		const { token } = req.query;

		if (!token) return res.status(400).json({ message: "Token missing" });

		const user = await prisma.users.findFirst({
			where: { verificationToken: String(token) }
		});

		if (!user) {
			return res.status(400).json({ message: "Invalid or Expired token" });
		}

		await prisma.users.update({
			where: { id: user.id },
			data: {
				emailVerified: true,
				verificationToken: null
			}
		});

		// Generate JWT for auto-login UX
		const jwtToken = jwt.sign(
			{
				userId: user.id
			},
			process.env.JWT_SECRET as string,
			{
				expiresIn: "7d"
			}
		);

		// Send response with JWT token
		return res.status(200).json({
			success: true,
			message: "Email verified successfully.",
			token: jwtToken
		});
	}

	static verifyMailHandler: RequestHandler = async (
		req: Request,
		res: Response,
		next: NextFunction
	): Promise<void> => {
		try {
			await VerificationEmailController.verifyEmail(req, res);
		} catch (error) {
			next(error);
		}
	};
}

export default VerificationEmailController;
