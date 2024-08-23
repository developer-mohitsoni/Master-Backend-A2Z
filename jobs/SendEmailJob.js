import { Queue, Worker } from "bullmq"; // "bullmq" library se Queue aur Worker ko import kar rahe hain.
import { defaultQueueConfig, redisConnection } from "../config/queue.js"; // Default queue configuration aur Redis connection settings ko import kar rahe hain.
import logger from "../config/logger.js"; // Logging ke liye custom logger ko import kar rahe hain.
import { sendEmail } from "../config/mailer.js"; // Email bhejne ke liye sendEmail function ko import kar rahe hain.

export const emailQueueName = "email-queue"; // Queue ka naam define kar rahe hain "email-queue".

export const emailQueue = new Queue(emailQueueName, {
  connection: redisConnection, // Queue ko Redis se connect kar rahe hain.
  defaultJobOptions: defaultQueueConfig, // Queue ke liye default configuration set kar rahe hain.
});

//* Workers
export const handler = new Worker(
  emailQueueName, // Worker ko specific queue se associate kar rahe hain.
  async (job) => {
    // Job process karne ke liye async function define kar rahe hain.
    console.log("The email worker data is: ", job.data); // Console mai job data ko print kar rahe hain.
    const data = job.data;
    data?.map(async (item) => {
      // Data array ke har item par async function apply kar rahe hain.
      await sendEmail(item.toEmail, item.subject, item.body); // Email bhejne ke liye sendEmail function ko call kar rahe hain.
    });
  },
  {
    connection: redisConnection, // Worker ko Redis se connect kar rahe hain.
  }
);

//* Worker listeners

handler.on("completed", (job) => {
  // Jab job complete ho jata hai toh ye listener trigger hota hai.
  logger.info({
    job: job, // Job ki info logger mai store kar rahe hain.
    message: "Job Completed", // Completion message log kar rahe hain.
  });
  console.log(`The job ${job.id} is completed.`); // Console mai job completion ka message print kar rahe hain.
});

handler.on("failed", (job) => {
  // Jab job fail ho jata hai toh ye listener trigger hota hai.
  console.log(`The job ${job.id} is failed.`); // Console mai job failure ka message print kar rahe hain.
});
