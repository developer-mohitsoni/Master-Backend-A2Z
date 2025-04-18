import prisma from "@/DB/db.config.js";
import type { MyJwtPayload } from "@/types/index.js";
import type { NextFunction, Request, RequestHandler, Response } from "express";
import jwt from "jsonwebtoken";

class VerificationEmailController {
	static async verifyEmail(req: Request, res: Response) {
		const { token } = req.query;

		if (!token) return res.status(400).json({ message: "Token missing" });

		try {
			jwt.verify(
				token as string,
				process.env.JWT_SECRET as string,
				(err: jwt.VerifyErrors | null, user: any) => {
					if (err)
						return res
							.status(401)
							.json({ status: 401, message: "Unauthorized" });
					req.user = user as MyJwtPayload;
				}
			);

			const decoded = req.user;
			const user = await prisma.users.findUnique({
				where: { id: decoded?.userId }
			});

			if (!user) return res.status(400).json({ message: "Invalid user" });

			if (user.emailVerified) {
				// Email already verified, return fresh login token
				const accessToken = jwt.sign(
					{ userId: user.id },
					process.env.JWT_SECRET as string,
					{
						expiresIn: "2m"
					}
				);

				return res
					.status(200)
					.json({ message: "Already verified", token: accessToken });
			}

			await prisma.users.update({
				where: { id: user.id },
				data: {
					emailVerified: true,
					verificationToken: token as string
				}
			});

			// ✅ Auto login token return
			const accessToken = jwt.sign(
				{ userId: user.id },
				process.env.JWT_SECRET as string,
				{
					expiresIn: "15m"
				}
			);

			return res
				.status(200)
				.json({ message: "Email verified", token: accessToken });
		} catch (err) {
			return res.status(400).json({ message: "Invalid or expired token" });
		}
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
