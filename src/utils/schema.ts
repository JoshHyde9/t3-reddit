import { z } from "zod";

export const createPost = z.object({
  title: z.string().trim().min(1, { message: "title must not be empty." }),
});

export type CreatePost = z.infer<typeof createPost>;

export const updatePost = createPost.extend({
  id: z.string(),
});

const usernameSchema = z
  .string()
  .trim()
  .min(1, { message: "Username must not be empty." })
  .describe("Username: // Username...");

const passwordSchema = z
  .string()
  .trim()
  .min(3, { message: "Password cannot be less than 3 characters." })
  .describe("Password: // Password...");

export const loginUser = z.object({
  username: usernameSchema,
  password: passwordSchema,
});

export const registerUser = z
  .object({
    username: usernameSchema,
    email: z.string().email().describe("Email: // Email..."),
    password: passwordSchema,
    confirmPassword: z
      .string()
      .trim()
      .min(3, { message: "Password cannot be less than 3 characters." })
      .describe("Confirm Password: // Confirm password..."),
  })
  .required()
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match.",
    path: ["confirmPassword"],
  });
