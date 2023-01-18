import { z } from "zod";
import { createPost, updatePost } from "../../../utils/schema";
import { createTRPCRouter, publicProcedure } from "../trpc";

export const postRouter = createTRPCRouter({
  getAll: publicProcedure.query(async ({ ctx }) => {
    return await ctx.prisma.post.findMany();
  }),
  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input, ctx }) => {
      return await ctx.prisma.post.findUnique({ where: { id: input.id } });
    }),
  createPost: publicProcedure
    .input(createPost)
    .mutation(async ({ input, ctx }) => {
      return await ctx.prisma.post.create({ data: { title: input.title } });
    }),
  updatePost: publicProcedure
    .input(updatePost)
    .mutation(async ({ input, ctx }) => {
      const post = await ctx.prisma.post.findFirst({
        where: { id: input.id },
      });

      if (!post) return null;

      return await ctx.prisma.post.update({
        where: { id: input.id },
        data: { title: input.title },
      });
    }),
});
