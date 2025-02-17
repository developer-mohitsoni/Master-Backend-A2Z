import redis from "../DB/redis.config.js";

const cacheMiddleware = async (req, res, next) => {
  const key = `master_backend:${req.originalUrl}`;

  try {
    const cachedData = await redis.get(key);

    if (cachedData) {
      console.log("Cache hit");
      return res.json(JSON.parse(cachedData)); // Return cached data
    }

    console.log("Cache miss");
    res.sendResponse = res.json; // Backup original response method

    res.json = async (body) => {
      await redis.setex(key, 3600, JSON.stringify(body)); // Cache response for 1 hour
      res.sendResponse(body);
    };

    next();
  } catch (err) {
    console.error("Redis Cache Error:", err);
    next(); // Continue even if Redis fails
  }
};

export default cacheMiddleware;
