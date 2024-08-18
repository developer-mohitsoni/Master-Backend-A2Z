import redis from "express-redis-cache";

// Redis cache ko configure kar rahe hain yahan par
const redisCache = redis({
  // port: Redis server ka port number define kar rahe hain, jo default 6379 hota hai
  port: 6379, // Redis ka default port 6379 hai

  // host: Redis server ka host address set kar rahe hain, yahan "localhost" set kiya hai kyunki server local machine par run kar raha hai
  host: "localhost", // "localhost" ka matlab hai ki Redis server local machine par run ho raha hai

  // prefix: Cache key ke aage ek prefix add kar rahe hain taaki cache keys ka naam unique bane rahe
  prefix: "master_backend", // "master_backend" prefix use ho raha hai taaki Redis cache keys mein alag prefix add ho jaye

  // expire: Cache data ko kitni der tak store karna hai, yahan par 1 ghanta set kiya gaya hai (60 * 60 seconds)
  expire: 60 * 60, // Cache expire time set kar rahe hain, jo yahan 1 ghante ke liye set kiya gaya hai
});

// Redis cache ko default export kar rahe hain taaki doosri files mein ise import kar sakein
export default redisCache;
