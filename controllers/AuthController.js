import { errors } from "@vinejs/vine";
import prisma from "../DB/db.config.js";
import { registerSchema } from "../validations/authValidation.js";

import vine from "@vinejs/vine";

class AuthController {
  static async register(req, res) {
    try {
      const body = req.body;

      const validator = vine.compile(registerSchema);

      const payload = await validator.validate(body);

      return res.json({
        payload,
      });
    } catch (error) {
      if (error instanceof errors.E_VALIDATION_ERROR) {
        // console.log(error.messages);

        return res.status(400).json({
          errors: error.messages,
        });
      }
    }
  }
}

export default AuthController;
