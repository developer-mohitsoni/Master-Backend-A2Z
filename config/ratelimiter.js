import rateLimit from "express-rate-limit";

export const limitter = rateLimit({
	windowMs: 60 * 60 * 1000, // 3600000/60000 => 60 min => 1hr
	limit: 100, // Limit each IP to 1 requests per `window` (here, per 1 h).
	standardHeaders: 'draft-7', // draft-6: `RateLimit-*` headers; draft-7: combined `RateLimit` header
	legacyHeaders: false, // Disable the `X-RateLimit-*` headers.
	// store: ... , // Redis, Memcached, etc. See below.
})