import redis from "@/DB/redis.config.js";

export const invalidateCache = async (keyPrefix: string) => {
	const keys = await redis.keys(`${keyPrefix}:*`);
	if (keys.length > 0) {
		await redis.del(...keys);
	}
};
