import { createUniqueFieldSchema } from "@ts-react/form";
import { z } from "zod";

export const textAreaSchema = createUniqueFieldSchema(
  z
    .string({ required_error: "Required." })
    .trim()
    .min(1, { message: "Text must not be empty." })
    .describe("Text: // Text..."),
  "textAreaId"
);

export const createPostSchema = z.object({
  title: z
    .string({ required_error: "Required." })
    .trim()
    .min(1, { message: "title must not be empty." })
    .describe("Title: // Title..."),
  text: textAreaSchema,
});

export type CreatePost = z.infer<typeof createPostSchema>;

const usernameSchema = z
  .string({ required_error: "Required." })
  .trim()
  .min(1, { message: "Username must not be empty." })
  .describe("Username: // Username...");

export const passwordSchema = z
  .string({ required_error: "Required." })
  .trim()
  .min(3, { message: "Password cannot be less than 3 characters." })
  .describe("Password: // Password...");

const emailSchema = z
  .string({ required_error: "Required." })
  .email()
  .describe("Email: // Email...");

export const loginUser = z.object({
  username: usernameSchema,
  password: passwordSchema,
});

export const registerUser = z
  .object({
    username: usernameSchema,
    email: z
      .string({ required_error: "Required." })
      .email()
      .describe("Email: // Email..."),
    password: passwordSchema,
    confirmPassword: z
      .string({ required_error: "Required." })
      .trim()
      .min(3, { message: "Password cannot be less than 3 characters." })
      .describe("Confirm Password: // Confirm password..."),
  })
  .required()
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match.",
    path: ["confirmPassword"],
  });

export const editPost = z.object({
  id: z.string(),
  title: z
    .string()
    .trim()
    .min(1, { message: "title must not be empty." })
    .describe("Title: // Title..."),
  text: textAreaSchema,
});

export const editPostSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, { message: "title must not be empty." })
    .describe("Title: // Title..."),
  text: textAreaSchema,
});

export const forgotPassword = z.object({ newPassword: passwordSchema });

export const sendEmailSchema = z.object({ email: emailSchema });

export const createComment = z.object({
  message: textAreaSchema,
});

export const createCommentSchema = createComment.extend({
  postId: z.string(),
});

export const editCommentSchema = createComment.extend({
  commentId: z.string(),
});
