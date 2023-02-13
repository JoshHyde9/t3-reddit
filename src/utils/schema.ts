import { createUniqueFieldSchema } from "@ts-react/form";
import { z } from "zod";

export const optionalTextAreaSchema = createUniqueFieldSchema(
  z.string().trim().optional().describe("Text: // Text..."),
  "optionalTextAreaId"
);

export const textAreaSchema = createUniqueFieldSchema(
  z
    .string()
    .trim()
    .min(1, { message: "Text must not be empty." })
    .describe("Text: // Text..."),
  "textAreaId"
);

export const fileInputSchema = createUniqueFieldSchema(
  z.string(),
  "fileInputId"
);

export const createPostSchema = z.object({
  title: z
    .string({ required_error: "Required." })
    .trim()
    .min(1, { message: "title must not be empty." })
    .describe("Title: // Title..."),
  text: textAreaSchema.optional(),
  image: fileInputSchema.optional(),
  nsfw: z.boolean({ required_error: "Required." }).describe("NSFW: "),
  subName: z
    .string({ required_error: "Required." })
    .trim()
    .min(1, { message: "sub name must not be empty." })
    .describe("Community: // Community..."),
});

export const createTextPostSchema = z.object({
  title: z
    .string({ required_error: "Required." })
    .trim()
    .min(1, { message: "title must not be empty." })
    .describe("Title: // Title..."),
  text: textAreaSchema,
  subName: z
    .string({ required_error: "Required." })
    .trim()
    .min(1, { message: "sub name must not be empty." })
    .describe("Community: // Community..."),
  nsfw: z.boolean().optional().describe("NSFW: "),
});

export const createImagePostSchema = z.object({
  title: z
    .string({ required_error: "Required." })
    .trim()
    .min(1, { message: "title must not be empty." })
    .describe("Title: // Title..."),
  image: fileInputSchema,
  subName: z
    .string({ required_error: "Required." })
    .trim()
    .min(1, { message: "sub name must not be empty." })
    .describe("Community: // Community..."),
  nsfw: z.boolean({ required_error: "Required." }).describe("NSFW: "),
});

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
  text: textAreaSchema.optional(),
});

export const editPostSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, { message: "title must not be empty." })
    .describe("Title: // Title..."),
  text: optionalTextAreaSchema,
});

export const editImagePostSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, { message: "title must not be empty." })
    .describe("Title: // Title..."),
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

export const createSubSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, { message: "name must not be empty." })
    .describe("Name: // Name..."),
  description: z
    .string()
    .trim()
    .min(1, { message: "description must not be null" })
    .describe("Description: // Description..."),
});
