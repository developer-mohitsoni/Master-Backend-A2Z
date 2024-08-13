import { errors } from "@vinejs/vine";
import prisma from "../DB/db.config.js";
import { registerSchema } from "../validations/authValidation.js";

import vine from "@vinejs/vine";

import bcrypt from "bcrypt";

class AuthController {
  static async register(req, res) {
    try {
      const body = req.body;

      const validator = vine.compile(registerSchema);

      const payload = await validator.validate(body);

      //* Check if user email already exist

      const findUser = await prisma.users.findUnique({
        where: {
          email: payload.email,
        },
      });

      if (findUser) {
        return res.status(400).json({
          errors: {
            email:
              "User Email Already Exist. Please Use Another Email to Register",
          },
        });
      }

      //* If user email is new email then :-
      
      if (!findUser) {
        //* Encrypt the password

        const salt = bcrypt.genSaltSync(10);
        payload.password = bcrypt.hashSync(payload.password, salt);

        //*  Now, Store into our DB

        const user = await prisma.users.create({
          data: payload,
        });

        return res.json({
          status: 200,
          message: "User Created Successfully",
          user,
        });
      }
    } catch (error) {
      console.log("The error is: ", error);

      if (error instanceof errors.E_VALIDATION_ERROR) {
        // console.log(error.messages);

        return res.status(400).json({
          errors: error.messages,
        });
      } else {
        return res.status(500).json({
          status: 500,
          message: "Something went wrong... Please try again",
        });
      }
    }
  }
}

export default AuthController;
