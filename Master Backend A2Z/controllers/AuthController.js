import prisma from "../DB/db.config.js";
import { z } from "zod";
import { registerSchema } from "../validation/authValidation.js";
import { ZodError } from "zod";
import { formateError } from "../validation/CustomErrorReporter.js";

class AuthController {
  static async register(req, res) {
    try {
      const body = req.body;
      const payload = await registerSchema.parse(body);
      return res.json({payload})
    } catch (error) {
      if (error instanceof ZodError) {
        const errors = formateError(error);

        return res.status(500).json({
          message: "Invalid Data",
          errors,
        });
      }
    }
  }
}

export default AuthController