import type { NextFunction, Request, Response } from "express";
import type { RequestHandler } from "express-serve-static-core";
import logger from "../config/logger.js";
import { emailQueue, emailQueueName } from "../jobs/SendEmailJob.js";

class MailController {
	static async sendTestEmail(req: Request, res: Response) {
		try {
			const { email } = req.query;

			if (!email || typeof email !== "string") {
				return res
					.status(400)
					.json({ message: "Invalid email query parameter" });
			}

			const payload = [
				{
					toMail: email,
					subject: "Hey I am just testing...",
					body: "<h1>Hello, I am from Mathura</h1>"
				},
				{
					toMail: email,
					subject: "Congrulation you got job offer",
					body: "<h1>Hello Mohit you join our company as Software Developer</h1>"
				},
				{
					toMail: email,
					subject: "Finally I started as a Freelancer",
					body: "<h1>I am happy to see you, I love you</h1>"
				}
			];

			await emailQueue.add(emailQueueName, payload);

			return res.status(200).json({
				status: 200,
				message: "Job added successfully"
			});
		} catch (error) {
			logger.error({
				type: "Email Error",
				body: error
			});

			return res.status(500).json({
				message: "Something went wrong. Please try again later"
			});
		}
	}
	static mailHandler: RequestHandler = async (
		req: Request,
		res: Response,
		next: NextFunction
	): Promise<void> => {
		try {
			await MailController.sendTestEmail(req, res);
		} catch (error) {
			next(error);
		}
	};
}

export default MailController;
