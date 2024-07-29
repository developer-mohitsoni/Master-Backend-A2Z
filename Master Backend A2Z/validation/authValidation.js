import { z } from "zod";

export const registerSchema = z
  .object({
    name: z
      .string({ message: "Name is required" })
      .min(3, { message: "Name must be 3 character long" })
      .max(150, {
        message: "Name character not exceed more than 150 character",
      }),
    email: z
      .string({ message: "Email is required" })
      .email({ message: "Please type correct email" }),
    password: z
      .string({ message: "Password is required" })
      .min(6, { message: "Password must be 6 character long." })
      .max(100, { message: "Password length not exceeds 150 character" }),
    confirm_password: z
      .string({ message: "Confirm Password is required" })
      .min(6, { message: "Confirm Password must be 6 character long." })
      .max(100, {
        message: "Confirm Password length not exceeds 150 character",
      }),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: "Password and Confirm Password must match",
    path: ["confirm_password"],
  });
