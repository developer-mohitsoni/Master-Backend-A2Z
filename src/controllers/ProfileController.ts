import fs from "node:fs";
import path from "node:path";
import type { NextFunction, Request, Response } from "express";
import type { UploadedFile } from "express-fileupload";
import type { RequestHandler } from "express-serve-static-core";
import prisma from "../DB/db.config.js";
import { generateRandomNum, imageValidator } from "../utils/helper.js";

class ProfileController {
	static async index(req: Request, res: Response): Promise<void> {
		try {
			const user = req.user;
			res.json({
				status: 200,
				message: "Profile fetched successfully",
				user
			});
		} catch (err) {
			res.status(500).json({
				message: "Something Went Wrong..."
			});
		}
	}

	static async store() {}

	static async show() {}

	static async update(req: Request, res: Response): Promise<void> {
		try {
			if (!req.user) {
				res.status(401).json({ message: "Unauthorized" });
			}

			const userIdFromToken = req.user?.id;

			const { id } = req.params;

			if (String(userIdFromToken) !== String(id)) {
				res
					.status(403)
					.json({ message: "You can only update your own profile" });
			}

			if (!req.files || Object.keys(req.files).length === 0) {
				res.status(400).json({
					status: 400,
					message: "Profile image is required"
				});
			}

			const profileImage: UploadedFile | undefined = !Array.isArray(
				req.files?.profile
			)
				? req.files?.profile
				: undefined;

			if (Array.isArray(profileImage)) {
				res.status(400).json({
					errors: {
						profileImage: "Multiple files are not supported"
					}
				});
			}

			const message = imageValidator(
				profileImage?.size ?? 0,
				profileImage?.mimetype as string
			);

			if (message !== null) {
				res.status(400).json({
					errors: {
						profileImage: message
					}
				});
			}

			const imgExt = profileImage?.name?.split(".");
			console.log(imgExt);

			if (!imgExt || imgExt.length < 2) {
				res.status(400).json({
					status: 400,
					message: "Invalid profile image name"
				});
				return;
			}

			const imageName = `${generateRandomNum()}.${imgExt[1]}`;

			const currentDirectory = process.cwd();

			const uploadFolder = path.join(currentDirectory, "public/images");

			if (!fs.existsSync(uploadFolder)) {
				fs.mkdirSync(uploadFolder, { recursive: true });
			}

			const uploadPath = path.join(uploadFolder, imageName);

			profileImage?.mv(uploadPath, (err) => {
				if (err) {
					console.error("Error uploading the image:", err);
					throw err;
				}
				console.log("Image uploaded successfully to:", uploadPath);
			});

			await prisma.users.update({
				data: {
					profile: imageName
				},
				where: {
					id: id
				},
				select: {
					created_at: true,
					profile: true,
					email: true
				}
			});

			res.json({
				status: 200,
				message: "Profile Updated Successfully!"
			});
		} catch (err) {}
	}

	// Wrapper function that returns void for use with Express router
	static indexHandler: RequestHandler = async (
		req: Request,
		res: Response,
		next: NextFunction
	): Promise<void> => {
		try {
			await ProfileController.index(req, res);
		} catch (error) {
			next(error);
		}
	};

	static updateHandler: RequestHandler = async (
		req: Request,
		res: Response,
		next: NextFunction
	): Promise<void> => {
		try {
			await ProfileController.update(req, res);
		} catch (error) {
			next(error);
		}
	};
}

export default ProfileController;
