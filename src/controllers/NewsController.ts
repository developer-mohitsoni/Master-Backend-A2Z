import { invalidateCache } from "@/config/redisCacheInvalidate.js";
import { ZodCustomErrorReporter } from "@/validations/CustomErrorReporter.js";
import type { NextFunction, Request, Response } from "express";
import type { UploadedFile } from "express-fileupload";
import type { RequestHandler } from "express-serve-static-core";
import { ZodError } from "zod";
import prisma from "../DB/db.config.js";
import redis from "../DB/redis.config.js";
import logger from "../config/logger.js";
import newsApiTransform from "../transform/newsApiTransform.js";
import type { ValidateNews } from "../types/index.d.ts";
import { imageValidator, removeImage, uploadImage } from "../utils/helper.js";
import { validatePagination } from "../utils/helper.js";
import { newsSchema } from "../validations/newsValidation.js";
class NewsController {
	static async index(req: Request, res: Response) {
		try {
			const { page, limit } = validatePagination(
				req.query.page as string,
				req.query.limit as string
			);
			const skip = (page - 1) * limit;

			const news = await prisma.news.findMany({
				take: limit,
				skip: skip,
				include: {
					user: {
						select: {
							id: true,
							name: true,
							profile: true
						}
					}
				}
				// cacheStrategy: {
				// 	ttl: 60 // 1 seconds
				// }
			});

			const newsTransform = news?.map((item) =>
				newsApiTransform.transform(item)
			);
			const totalNews = await prisma.news.count();

			const totalPages = Math.ceil(totalNews / limit);

			if (res.jsonAsync) {
				return res.jsonAsync({
					status: 200,
					news: newsTransform,
					metadata: {
						totalPages,
						currentPage: page,
						currentLimit: limit
					}
				});
			}

			return res.json({
				status: 200,
				news: newsTransform,
				metadata: {
					totalPages,
					currentPage: page,
					currentLimit: limit
				}
			});
		} catch (err) {
			logger.error((err as any)?.message);
			return res.status(500).json({
				message: "Something went wrong. Please try again!"
			});
		}
	}

	static async store(req: Request, res: Response) {
		try {
			const user = req.user;

			const body = req.body;

			const payload: ValidateNews = await newsSchema.parseAsync(body);

			if (!req.files || Object.keys(req.files).length === 0) {
				return res.status(400).json({
					errors: {
						image: "Image field is required"
					}
				});
			}

			const image = req.files?.image as UploadedFile;

			const message = imageValidator(image?.size, image?.mimetype);

			if (message !== null) {
				return res.status(400).json({
					errors: {
						image: message
					}
				});
			}

			const imageName = uploadImage(image);

			payload.image = imageName;

			payload.userId = user?.id;

			const news = await prisma.news.create({
				data: {
					title: payload.title,
					content: payload.content,
					image: payload.image,
					user: {
						connect: {
							id: payload.userId
						}
					}
				},
				select: {
					image: true,
					content: true,
					created_at: true
				}
			});

			//* remove cache

			await invalidateCache("master_backend");

			return res.json({
				status: 200,
				message: "News Created Successfully!",
				news
			});
		} catch (err) {
			logger.error((err as any)?.message);

			if (err instanceof ZodError) {
				const reporter = new ZodCustomErrorReporter(err);

				return res.status(422).json({
					status: 422,
					errors: reporter.createError()
				});
			}
			return res.status(500).json({
				status: 500, // Internal server error code
				message: "Something went wrong... Please try again" // Error message
			});
		}
	}

	static async show(req: Request, res: Response) {
		try {
			const { id } = req.params;
			const news = await prisma.news.findUnique({
				where: {
					id: id
				},
				include: {
					user: {
						select: {
							id: true,
							name: true,
							profile: true
						}
					}
				}
			});

			const transformNews = news ? newsApiTransform.transform(news) : null;

			return res.json({
				status: 200,
				news: transformNews
			});
		} catch (err) {
			logger.error((err as any)?.message);

			return res.status(500).json({
				message: "Something Went Wrong... Please try again"
			});
		}
	}

	static async update(req: Request, res: Response) {
		try {
			const { id } = req.params;

			const user = req.user;

			const body = req.body;

			const news = await prisma.news.findUnique({
				where: {
					id: id
				},
				select: {
					user_id: true,
					image: true
				}
			});

			if (user?.id !== news?.user_id) {
				return res.status(400).json({
					message: "Unauthorized"
				});
			}

			const payload: ValidateNews = await newsSchema.parseAsync(body);
			const image = req.files?.image as UploadedFile;

			if (image) {
				const message = imageValidator(image?.size, image?.mimetype);

				if (message !== null) {
					return res.status(400).json({
						errors: {
							image: message
						}
					});
				}

				const imageName = uploadImage(image);
				payload.image = imageName;

				if (news?.image) {
					removeImage(news.image);
				}
			}

			await prisma.news.update({
				data: {
					title: payload.title,
					content: payload.content,
					image: payload.image
				},
				where: {
					id: id
				}
			});

			// console.log(req.originalUrl);

			await invalidateCache("master_backend");

			return res.status(200).json({
				message: "News Updated Successfully"
			});
		} catch (err) {
			logger.error((err as any)?.message);

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

	static async destroy(req: Request, res: Response) {
		try {
			const { id } = req.params;

			const user = req.user;

			const news = await prisma.news.findUnique({
				where: {
					id: id
				},
				select: {
					user_id: true,
					image: true
				}
			});

			if (user?.id !== news?.user_id) {
				return res.status(401).json({
					message: "Unauthorized"
				});
			}

			if (news?.image) {
				removeImage(news.image);
			}

			await prisma.news.delete({
				where: {
					id: id
				}
			});

			const cacheKeyPattern = "master_backend:/api/news*";

			const keys = await redis.keys(cacheKeyPattern);
			if (keys.length > 0) {
				await redis.del(keys);
			}

			return res.status(200).json({
				message: "News Deleted Successfully"
			});
		} catch (err) {
			logger.error((err as any)?.message);
			return res.status(500).json({
				status: 500,
				message: "Something went wrong. Please try again" //
			});
		}
	}

	static indexHandler: RequestHandler = async (
		req: Request,
		res: Response,
		next: NextFunction
	): Promise<void> => {
		try {
			await NewsController.index(req, res);
		} catch (error) {
			next(error);
		}
	};
	static storeHandler: RequestHandler = async (
		req: Request,
		res: Response,
		next: NextFunction
	): Promise<void> => {
		try {
			await NewsController.store(req, res);
		} catch (error) {
			next(error);
		}
	};
	static showHandler: RequestHandler = async (
		req: Request,
		res: Response,
		next: NextFunction
	): Promise<void> => {
		try {
			await NewsController.show(req, res);
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
			await NewsController.update(req, res);
		} catch (error) {
			next(error);
		}
	};
	static destroyHandler: RequestHandler = async (
		req: Request,
		res: Response,
		next: NextFunction
	): Promise<void> => {
		try {
			await NewsController.destroy(req, res);
		} catch (error) {
			next(error);
		}
	};
}

export default NewsController;
