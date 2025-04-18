import prisma from "@/DB/db.config.js";
import type { NextFunction, Request, RequestHandler, Response } from "express";
import jwt from "jsonwebtoken";

class RefreshTokenController {
	static async refreshToken(req: Request, res: Response) {
		try {
			const { refreshToken: clientRefreshToken } = req.body;

			if (!clientRefreshToken) {
				return res.status(400).json({ message: "Refresh Token is required" });
			}

			// Verify the refresh token
			jwt.verify(
				clientRefreshToken,
				process.env.REFRESH_TOKEN_SECRET as string,
				async (err: jwt.VerifyErrors | null, decoded: any) => {
					if (err) {
						return res
							.status(403)
							.json({ message: "Invalid or expired refresh token" });
					}

					// Find the user based on email from the refresh token
					const user = await prisma.users.findUnique({
						where: { email: decoded?.email }
					});

					if (!user || user.refreshToken !== clientRefreshToken) {
						return res
							.status(403)
							.json({ message: "Refresh token does not match our records" });
					}

					// Generate a new access token (short-lived token)
					const newAccessToken = jwt.sign(
						{ email: user.email, userId: user.id },
						process.env.ACCESS_TOKEN_SECRET as string,
						{ expiresIn: "15m" }
					);

					const newRefreshToken = jwt.sign(
						{ email: user.email },
						process.env.REFRESH_TOKEN_SECRET as string,
						{ expiresIn: "7d" }
					);

					await prisma.users.update({
						where: { email: user.email },
						data: { refreshToken: newRefreshToken }
					});

					// Return the new access token
					return res.json({
						accessToken: `Bearer ${newAccessToken}`,
						refreshToken: newRefreshToken
					});
				}
			);
		} catch (error) {
			console.error(error);
			res.status(500).json({
				message: "Server error during refresh token verification"
			});
		}
	}

	static refreshTokenHandler: RequestHandler = async (
		req: Request,
		res: Response,
		next: NextFunction
	): Promise<void> => {
		try {
			await RefreshTokenController.refreshToken(req, res);
		} catch (error) {
			next(error);
		}
	};
}
export default RefreshTokenController;
