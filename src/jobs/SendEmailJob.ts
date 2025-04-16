import { Queue, Worker } from "bullmq";
import logger from "../config/logger.js";
import { sendEmail } from "../config/mailer.js";
import { defaultQueueConfig, redisConnection } from "../config/queue.js";
export const emailQueueName = "email-queue";
import type { SendMail } from "../types/index.d.ts";

export const emailQueue = new Queue(emailQueueName, {
	connection: redisConnection,
	defaultJobOptions: defaultQueueConfig
});
//* Workers
export const handler = new Worker(
	emailQueueName,
	async (job) => {
		console.log("The email worker data is: ", job.data);
		const data = job.data;
		data?.map(async ({ toMail, subject, body }: SendMail) => {
			await sendEmail({ toMail, subject, body });
		});
	},
	{
		connection: redisConnection
	}
);
//* Worker listeners
handler.on("completed", (job) => {
	logger.info({
		job: job,
		message: "Job Completed"
	});
	console.log(`The job ${job.id} is completed.`); //
});
handler.on("failed", (job) => {
	console.log(`The job ${job?.id} is failed.`);
});
