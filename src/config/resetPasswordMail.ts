import nodemailer from "nodemailer";
import "dotenv/config";

export const sendResetPasswordEmail = async (
	toMail: string,
	resetToken: string
) => {
	const transporter = nodemailer.createTransport({
		service: "gmail", // or your provider
		auth: {
			user: process.env.EMAIL_USER,
			pass: process.env.EMAIL_PASS
		}
	});

	// Send the reset token to the user's email address
	const resetLink = `${process.env.BACKEND_URL}/reset-password-email?token=${resetToken}`; // Replace with your actual frontend URL later

	const mailOptions = {
		from: process.env.EMAIL_USER,
		to: toMail,
		subject: "Password Reset Request",
		html: `<p>We received a request to reset your password. Click the link below to reset your password:</p>
    <a href="${resetLink}">${resetLink}</a>`
	};

	try {
		await transporter.sendMail(mailOptions);
	} catch (error) {
		console.error("Error sending email:", error);
	}
};
