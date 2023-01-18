import { z } from "zod";
import { createPost } from "../../../utils/schema";
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
});
