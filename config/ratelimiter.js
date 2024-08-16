import rateLimit from "express-rate-limit";

export const limitter = rateLimit({
	windowMs: 1 * 60 * 1000, // 1 minutes
	limit: 1, // Limit each IP to 1 requests per `window` (here, per 1 minutes).
	standardHeaders: 'draft-7', // draft-6: `RateLimit-*` headers; draft-7: combined `RateLimit` header
	legacyHeaders: false, // Disable the `X-RateLimit-*` headers.
	// store: ... , // Redis, Memcached, etc. See below.
})