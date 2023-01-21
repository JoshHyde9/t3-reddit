import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createPostSchema, updatePost } from "../../../utils/schema";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";

export const postRouter = createTRPCRouter({
  getAll: publicProcedure.query(async ({ ctx }) => {
    return await ctx.prisma.post.findMany();
  }),
  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input, ctx }) => {
      return await ctx.prisma.post.findUnique({ where: { id: input.id } });
    }),
  createPost: protectedProcedure
    .input(createPostSchema)
    .mutation(async ({ input, ctx }) => {
      return await ctx.prisma.post.create({
        data: {
          title: input.title,
          text: input.text,
          creatorId: ctx.session.user.userId,
        },
      });
    }),
  updatePost: protectedProcedure
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
  deletePost: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      try {
        await ctx.prisma.post.delete({ where: { id: input.id } });
      } catch (error) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Post not found." });
      }
      return true;
    }),
});
