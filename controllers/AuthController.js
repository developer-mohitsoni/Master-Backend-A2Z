import { errors } from "@vinejs/vine";
import prisma from "../DB/db.config.js";
import { loginSchema, registerSchema } from "../validations/authValidation.js";

import vine from "@vinejs/vine";

import bcrypt from "bcrypt";

import jwt from "jsonwebtoken";
import { sendEmail } from "../config/mailer.js";
import logger from "../config/logger.js";

class AuthController {
  // Static async function "register" banaya gaya hai jo "req" aur "res" ko handle karega
  static async register(req, res) {
    try {
      // Body se data extract kar rahe hain
      const body = req.body;

      // "registerSchema" ke hisaab se data validate karne ke liye validator banaya gaya
      const validator = vine.compile(registerSchema);

      // Validator ka use karke body ka data validate kar rahe hain
      const payload = await validator.validate(body);

      // User ke email ko check kar rahe hain agar woh pehle se database mein hai ya nahi
      const findUser = await prisma.users.findUnique({
        where: {
          email: payload.email, // Payload se email ko yahan check kar rahe hain
        },
      });

      // Agar user pehle se hai toh error return karte hain
      if (findUser) {
        return res.status(400).json({
          errors: {
            email:
              "User Email Already Exist. Please Use Another Email to Register",
            // Agar email pehle se hai toh yeh message dikhate hain
          },
        });
      }

      // Agar email nayi hai, tab yeh code chalega
      if (!findUser) {
        // Password ko encrypt karne ke liye salt generate kar rahe hain
        const salt = bcrypt.genSaltSync(10);
        payload.password = bcrypt.hashSync(payload.password, salt);

        // Naye user ko database mein store kar rahe hain
        const user = await prisma.users.create({
          data: payload, // Payload mein jo bhi data hai, usko store kar rahe hain
        });

        // Successful response return karte hain agar user create ho gaya
        return res.json({
          status: 200,
          message: "User Created Successfully", // Success message
          user, // User ka data bhi return karte hain
        });
      }
    } catch (error) {
      // Agar koi error aata hai toh usko console mein log karte hain
      console.log("The error is: ", error);

      // Agar validation error hota hai toh yeh code chalega
      if (error instanceof errors.E_VALIDATION_ERROR) {
        return res.status(400).json({
          errors: error.messages, // Validation errors ko return karte hain
        });
      } else {
        // Agar koi aur error hota hai toh generic error response dete hain
        return res.status(500).json({
          status: 500,
          message: "Something went wrong... Please try again",
          // Generic error message
        });
      }
    }
  }

  // Static async function "login" banaya gaya hai jo "req" aur "res" ko handle karega
  static async login(req, res) {
    try {
      // Body se data extract kar rahe hain
      const body = req.body;

      // "loginSchema" ke hisaab se data validate karne ke liye validator banaya gaya
      const validator = vine.compile(loginSchema);

      // Validator ka use karke body ka data validate kar rahe hain
      const payload = await validator.validate(body);

      // User ko uske email ke basis par database se dhund rahe hain
      const findUser = await prisma.users.findUnique({
        where: {
          email: payload.email, // Payload se email ko yahan check kar rahe hain
        },
      });

      // Agar email database mein mil jata hai
      if (findUser) {
        // Password ko compare karte hain user ke diye gaye password se jo database mein hai

        // Agar password match nahi karta, toh error return karte hain
        if (!bcrypt.compareSync(payload.password, findUser.password)) {
          return res.status(400).json({
            errors: {
              email: "Invalid Credentials.", // Invalid credentials ka message agar password galat hai
            },
          });
        }

        // Agar email aur password match kar jate hain, tab yeh code chalega

        // User ko token assign karte hain agar login successful ho jata hai
        const payloadData = {
          id: findUser.id,
          name: findUser.name,
          email: findUser.email,
          profile: findUser.profile, // User ka profile info
        };

        // JWT token generate karte hain, jo 365 din tak valid rahega
        const token = jwt.sign(payloadData, process.env.JWT_SECRET, {
          expiresIn: "365d", // Token ki validity
        });

        return res.json({
          message: "Logged In", // Success message for login

          // Access token ke sath return karte hain, "Bearer" optional hai
          access_token: `Bearer ${token}`,
        });
      }

      // Agar user database mein nahi milta toh error return karte hain
      return res.status(400).json({
        errors: {
          email: "No User Found", // User nahi mila message
        },
      });
    } catch (error) {
      // Agar koi error aata hai toh usko console mein log karte hain
      console.log("The error is: ", error);

      // Agar validation error hota hai toh yeh code chalega
      if (error instanceof errors.E_VALIDATION_ERROR) {
        return res.status(400).json({
          errors: error.messages, // Validation errors ko return karte hain
        });
      } else {
        // Agar koi aur error hota hai toh generic error response dete hain
        return res.status(500).json({
          status: 500,
          message: "Something went wrong... Please try again",
          // Generic error message
        });
      }
    }
  }

  // Send Test Email function define kar rahe hain
  static async sendTestEmail(req, res) {
    try {
      // Request se email parameter ko extract kar rahe hain
      const { email } = req.query;

      // Payload object bana rahe hain jo email ke details ko store karega
      const payload = {
        toEmail: email, // Recipient ka email address
        subject: "Hey I am just testing...", // Email ka subject
        body: "<h1>Hello, I am from Mathura</h1>", // Email ka pehla HTML body content
        body1: "<h1>Hello Mohit Soni</h1>", // Email ka doosra HTML body content
      };

      // sendEmail function ko call karke pehla email send kar rahe hain
      await sendEmail(payload.toEmail, payload.subject, payload.body);

      // sendEmail function ko call karke doosra email send kar rahe hain
      await sendEmail(payload.toEmail, "Second Email", payload.body1);

      // Agar emails successfully send ho jate hain, toh response mai success message bhej rahe hain
      return res.status(200).json({
        status: 200,
        message: "Email Sent",
      });
    } catch (error) {
      // Agar koi error aati hai, toh usko logger ke through error log kar rahe hain
      logger.error({
        type: "Email Error", // Error type define kar rahe hain
        body: error, // Error ka actual content log kar rahe hain
      });

      // Response mai error message bhej rahe hain agar email bhejne mai koi problem hui
      return res.status(500).json({
        message: "Something went wrong. Please try again later",
      });
    }
  }
}

export default AuthController;
