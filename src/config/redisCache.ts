import type { NextFunction, Request, Response } from "express";

// Extend the Response interface to include jsonAsync
declare module "express-serve-static-core" {
	interface Response {
		jsonAsync?: (body: any) => void;
	}
}

import redis from "../DB/redis.config.js";

const cacheMiddleware = async (
	req: Request,
	res: Response,
	next: NextFunction
): Promise<void> => {
	const key = `master_backend:${req.originalUrl}`;

	try {
		const cachedData = await redis.get(key);

		if (cachedData) {
			console.log("Cache hit");
			res.json(JSON.parse(cachedData));
			return; // ✅ Prevent further execution
		}

		console.log("Cache miss");

		const originalJson = res.json.bind(res);
		res.jsonAsync = (body: any) => {
			redis.setex(key, 3600, JSON.stringify(body)).catch((err: any) => {
				console.error("Error setting cache in Redis", err);
			});
			originalJson(body); // ✅ Return response
		};

		next();
	} catch (err) {
		console.error("Redis Cache Error:", err);
		next(); // Continue if Redis fails
	}
};

export default cacheMiddleware;
