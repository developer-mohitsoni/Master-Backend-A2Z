import rateLimit from "express-rate-limit";

// Ye rate limiter middleware create kar rahe hain jo request ko limit karega
export const limitter = rateLimit({
  // windowMs: Yeh define karta hai ki ek window ka time kitna hoga, yahan par 60 minutes (1 hour) set kiya gaya hai
  windowMs: 60 * 60 * 1000, // 3600000 milliseconds ko 60000 se divide karne par 60 minutes milte hain, jo 1 ghante ke barabar hai

  // limit: Yeh define karta hai ki ek IP kitni requests kar sakti hai iss window ke dauran, yahan par 100 requests per hour ki limit set ki gayi hai
  limit: 100, // Har IP ko 1 ghante mein maximum 100 requests karne di jaayegi

  // standardHeaders: Yeh define karta hai ki headers kaunse version ke standard follow karenge, yahan 'draft-7' use kiya gaya hai
  standardHeaders: "draft-7", // draft-6: `RateLimit-*` headers; draft-7: combined `RateLimit` header ko use karega

  // legacyHeaders: Yeh disable karta hai purane `X-RateLimit-*` headers ko
  legacyHeaders: false, // Purane headers (X-RateLimit-*) ko disable kar diya gaya hai

  // store: Yeh setting optional hai, yahan aap Redis, Memcached jaise storage ka use kar sakte hain to store rate limit information
  // store: ... , // Redis, Memcached, etc. yahan use ho sakte hain
});
