import nodemailer from "nodemailer";
import "dotenv/config";
// Nodemailer module ko import kar rahe hain, jo hume emails bhejne mai help karta hai

// Nodemailer ke `createTransport` method ka use karke ek transporter object bana rahe hain
export const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// `sendEmail` function define kar rahe hain jo email bhejega
export const sendEmail = async (toMail, subject, body) => {
  // Nodemailer ka `sendMail` method use karte hain email bhejne ke liye
  const info = await transporter.sendMail({
    from: process.env.EMAIL_USER, // Email bhejne wale ka address environment variable se
    to: toMail, // Email jis recipient ko bhejna hai uska address
    subject: subject, // Email ka subject line
    html: body, // Email ka HTML content
  });
};
