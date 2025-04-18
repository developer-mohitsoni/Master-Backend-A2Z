import prisma from "@/DB/db.config.js";
import type { NextFunction, Request, RequestHandler, Response } from "express";

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

		return res.status(200).json({ message: "Email verified successfully" });
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
