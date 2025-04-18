import { sendVerificationEmail } from "@/config/verificationMail.js";
import { ZodCustomErrorReporter } from "@/validations/CustomErrorReporter.js";
import bcrypt from "bcrypt";
import type { NextFunction, Request, Response } from "express";
import type { RequestHandler } from "express-serve-static-core";
import jwt from "jsonwebtoken";
import { ZodError } from "zod";
import prisma from "../DB/db.config.js";
import { loginSchema, registerSchema } from "../validations/authValidation.js";

class AuthController {
	static async register(req: Request, res: Response) {
		try {
			const body = req.body;

			const payload = await registerSchema.parseAsync(body);

			const findUser = await prisma.users.findUnique({
				where: {
					email: payload.email
				}
			});

			if (findUser) {
				return res.status(400).json({
					errors: {
						email:
							"User Email Already Exist. Please Use Another Email to Register"
						// Agar email pehle se hai toh yeh message dikhate hain
					}
				});
			}

			if (!findUser) {
				// Password ko encrypt karne ke liye salt generate kar rahe hain
				const salt = await bcrypt.genSalt(10);
				payload.password = await bcrypt.hash(payload.password, salt);

				// Generate email verification token
				// const verificationToken = uuidv4();

				const user = await prisma.users.create({
					data: {
						name: payload.name,
						email: payload.email,
						password: payload.password
					},
					select: {
						id: true,
						name: true,
						email: true,
						created_at: true
					}
				});

				const verificationToken = jwt.sign(
					{ userId: user.id, email: user.email },
					process.env.JWT_SECRET as string,
					{ expiresIn: "15m" }
				);

				// Send verification email
				await sendVerificationEmail(payload.email, verificationToken);

				return res.json({
					status: 200,
					message: "User registered successfully. Please verify your email."
				});
			}
		} catch (err) {
			console.log("The error is: ", err);

			if (err instanceof ZodError) {
				const reporter = new ZodCustomErrorReporter(err);

				return res.status(422).json({
					status: 422,
					errors: reporter.createError()
				});
			}
			return res.status(500).json({
				status: 500,
				message: "Something went wrong... Please try again"
				// Generic error message
			});
		}
	}

	static async login(req: Request, res: Response) {
		try {
			const body = req.body;

			const payload = await loginSchema.parseAsync(body);

			const findUser = await prisma.users.findUnique({
				where: {
					email: payload.email
				}
			});
			if (findUser) {
				if (!bcrypt.compareSync(payload.password, findUser.password)) {
					return res.status(400).json({
						errors: {
							email: "Invalid Credentials."
						}
					});
				}

				const payloadData = {
					id: findUser.id
				};

				const accessToken = jwt.sign(
					payloadData,
					process.env.ACCESS_TOKEN_SECRET as string,
					{
						expiresIn: "1h"
					}
				);

				const refreshToken = jwt.sign(
					payloadData,
					process.env.REFRESH_TOKEN_SECRET as string,
					{
						expiresIn: "7d"
					}
				);

				await prisma.users.update({
					where: {
						id: findUser.id
					},
					data: {
						refreshToken
					}
				});

				// const accessToken = token(payloadData);

				return res.json({
					message: "Logged In",
					access_token: `Bearer ${accessToken}`,
					refresh_token: `Bearer ${refreshToken}`
				});
			}
			if (!findUser) {
				return res.status(400).json({
					errors: {
						email: "No User Found"
					}
				});
			}
		} catch (err) {
			console.log("The error is: ", err);

			if (err instanceof ZodError) {
				const reporter = new ZodCustomErrorReporter(err);

				return res.status(422).json({
					status: 422,
					errors: reporter.createError()
				});
			}
			return res.status(500).json({
				status: 500,
				message: "Something went wrong... Please try again"
			});
		}
	}

	// Wrapper functions that return void for use with Express router
	static registerHandler: RequestHandler = async (
		req: Request,
		res: Response,
		next: NextFunction
	): Promise<void> => {
		try {
			await AuthController.register(req, res);
		} catch (error) {
			next(error);
		}
	};

	static loginHandler: RequestHandler = async (
		req: Request,
		res: Response,
		next: NextFunction
	): Promise<void> => {
		try {
			await AuthController.login(req, res);
		} catch (error) {
			next(error);
		}
	};
}
export default AuthController;
