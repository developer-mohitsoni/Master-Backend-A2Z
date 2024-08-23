export const redisConnection = {
  // Redis ka host define kar rahe hai jo environment variable se liya jaa raha hai
  host: process.env.REDIS_HOST,
  // Redis ka port number define kar rahe hai jo environment variable se liya jaa raha hai
  port: process.env.REDIS_PORT,
};

export const defaultQueueConfig = {
  // Queue ke liye delay define kar sakte hain, yahan delay (ms) set kar sakte hain (is line ko abhi comment out kiya hai)
  // delay: 5000,

  // Jab task complete ho jaye toh kitne purane tasks remove karne hain wo yahan define kar rahe hain
  removeOnComplete: {
    // Kitne tasks remove karne hain, yahan 100 set kiya hai
    count: 100,
    // Kitni der purani tasks remove karni hain, yahan 1 din (24 ghante) set kiya hai
    age: 60 * 60 * 24, // 1day
  },

  // Kitni baar retry karna hai agar task fail ho jaaye, yahan 3 baar set kiya hai
  attempts: 3,

  // Agar task fail ho toh exponential backoff strategy apply karte hain, delay har retry ke baad badh jaata hai
  backoff: {
    // Backoff type exponential hai, jo har retry ke saath delay ko badha dega
    type: "exponential",
    // Pehla retry delay 1 second ke baad hoga
    delay: 1000, // 1sec
  },
};
