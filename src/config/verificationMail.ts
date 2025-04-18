import nodemailer from "nodemailer";
import "dotenv/config";

export const sendVerificationEmail = async (toMail: string, token: string) => {
	const transporter = nodemailer.createTransport({
		service: "gmail", // or your provider
		auth: {
			user: process.env.EMAIL_USER,
			pass: process.env.EMAIL_PASS
		}
	});

	const verificationLink = `${process.env.BACKEND_URL}/verify-email?token=${token}`;

	const mailOptions = {
		from: process.env.EMAIL_USER,
		to: toMail,
		subject: "Verify your email",
		html: `<p>Click below to verify your email:</p><a href="${verificationLink}">${verificationLink}</a>`
	};

	await transporter.sendMail(mailOptions);
};
