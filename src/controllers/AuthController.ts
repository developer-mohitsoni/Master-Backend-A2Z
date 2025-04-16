import vine, { errors } from "@vinejs/vine";
import bcrypt from "bcrypt";
import type { NextFunction, Request, Response } from "express";
import type { RequestHandler } from "express-serve-static-core";
import jwt from "jsonwebtoken";
import prisma from "../DB/db.config.js";
import { loginSchema, registerSchema } from "../validations/authValidation.js";

class AuthController {
	static async register(req: Request, res: Response) {
		try {
			const body = req.body;

			const validator = vine.compile(registerSchema);

			const payload = await validator.validate(body);

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

				const user = await prisma.users.create({
					data: {
						name: payload.name,
						email: payload.email,
						password: payload.password
					},
					select: {
						password: true,
						name: true,
						profile: true
					}
				});

				return res.json({
					status: 200,
					message: "User Created Successfully", // Success message
					user // User ka data bhi return karte hain
				});
			}
		} catch (err) {
			console.log("The error is: ", err);

			if (err instanceof errors.E_VALIDATION_ERROR) {
				return res.status(400).json({
					errors: err.messages // Validation errors ko return karte hain
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

			const validator = vine.compile(loginSchema);

			const payload = await validator.validate(body);

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
					id: findUser.id,
					name: findUser.name,
					email: findUser.email,
					profile: findUser.profile
				};

				const token = (payloadData: object): string => {
					return jwt.sign(payloadData, process.env.JWT_SECRET as string, {
						expiresIn: "365d"
					});
				};

				const accessToken = token(payloadData);

				return res.json({
					message: "Logged In",
					access_token: `Bearer ${accessToken}`
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

			if (err instanceof errors.E_VALIDATION_ERROR) {
				// Agar validation error hota hai toh yeh code chalega
				return res.status(400).json({
					errors: err.messages // Validation errors ko return karte hain
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
