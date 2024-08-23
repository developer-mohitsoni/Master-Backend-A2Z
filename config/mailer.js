import nodemailer from "nodemailer";
// Nodemailer module ko import kar rahe hain, jo hume emails bhejne mai help karta hai

// Nodemailer ke `createTransport` method ka use karke ek transporter object bana rahe hain
export const transporter = nodemailer.createTransport({
  // SMTP server ka host name le rahe hain environment variable se
  host: process.env.SMTP_HOST,

  // SMTP server ka port number le rahe hain environment variable se
  port: process.env.SMTP_PORT,

  // Agar aapka port 465 hai to secure connection true rakhna, baaki sab ke liye false
  secure: false,

  // SMTP server ke authentication details provide kar rahe hain
  auth: {
    user: process.env.SMTP_USER, // SMTP username environment variable se
    pass: process.env.SMTP_PASS, // SMTP password environment variable se
  },
});

// `sendEmail` function define kar rahe hain jo email bhejega
export const sendEmail = async (toMail, subject, body) => {
  // Nodemailer ka `sendMail` method use karte hain email bhejne ke liye
  const info = await transporter.sendMail({
    from: process.env.FROM_EMAIL, // Email bhejne wale ka address environment variable se
    to: toMail, // Email jis recipient ko bhejna hai uska address
    subject: subject, // Email ka subject line
    html: body, // Email ka HTML content
  });
};
