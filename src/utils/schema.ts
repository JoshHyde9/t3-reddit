import { z } from "zod";

export const createPost = z.object({
  title: z.string().trim().min(1, { message: "title must not be empty." }),
});

export type CreatePost = z.infer<typeof createPost>;

export const updatePost = createPost.extend({
  id: z.string(),
});

export const baseUserSchema = z.object({
  username: z
    .string()
    .trim()
    .min(1, { message: "Username must not be empty." }),
  password: z
    .string()
    .trim()
    .min(3, { message: "Password cannot be less than 3 characters" }),
});
