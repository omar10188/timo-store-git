const { z } = require("zod");

const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/;

const registerSchema = z.object({
  body: z.object({
    name: z.string().min(2, "Name must be at least 2 characters long"),
    email: z.string().email("Please provide a valid email address"),
    password: z
      .string()
      .min(6, "Password must be at least 6 characters long")
      .regex(passwordRegex, "Password must contain at least 1 uppercase letter, 1 lowercase letter, and 1 number"),
  }),
});

const loginSchema = z.object({
  body: z.object({
    email: z.string().email("Please provide a valid email address"),
    password: z.string().min(1, "Password is required"),
  }),
});

const forgotPasswordSchema = z.object({
  body: z.object({
    email: z.string().email("Please provide a valid email address"),
  }),
});

const resetPasswordSchema = z.object({
  body: z.object({
    password: z
      .string()
      .min(6, "Password must be at least 6 characters long")
      .regex(passwordRegex, "Password must contain at least 1 uppercase letter, 1 lowercase letter, and 1 number"),
  }),
});

module.exports = {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
};
