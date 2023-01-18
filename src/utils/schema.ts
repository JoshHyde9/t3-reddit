import { z } from "zod";

export const createPost = z.object({
  title: z.string(),
});

export type CreatePost = z.infer<typeof createPost>;
