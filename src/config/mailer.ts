import nodemailer from "nodemailer";
import "dotenv/config";
import type { SendMail } from "../types/index.d.ts";

export const transporter = nodemailer.createTransport({
	service: "gmail",
	auth: {
		user: process.env.EMAIL_USER,
		pass: process.env.EMAIL_PASS
	}
});

export const sendEmail = async ({ toMail, subject, body }: SendMail) => {
	await transporter.sendMail({
		from: process.env.EMAIL_USER,
		to: toMail,
		subject: subject,
		html: body
	});
};
