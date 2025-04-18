import rateLimit from "express-rate-limit";

export const limitter = rateLimit({
	windowMs: 5 * 60 * 1000, // 5 minutes
	limit: 5, // Max 5 requests per IP in 5 mins
	standardHeaders: "draft-7",
	legacyHeaders: false,
	message: {
		status: 429,
		message: "Too many login attempts, please try again later."
	}
	// store: new RedisStore({ sendCommand: redisClient.sendCommand.bind(redisClient) }), // If using Redis
});
