import { z } from "zod";

export const createPost = z.object({
  title: z.string().trim().min(1, { message: "title must not be empty." }),
});

export type CreatePost = z.infer<typeof createPost>;

export const updatePost = createPost.extend({
  id: z.string(),
});
