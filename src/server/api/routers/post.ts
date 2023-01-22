import { TRPCError } from "@trpc/server";
import { undefined, z } from "zod";
import { createPostSchema, updatePost } from "../../../utils/schema";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";

export const postRouter = createTRPCRouter({
  // FIXME: Cursor is cooked.
  getAll: publicProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).nullish(),
        cursor: z.string().nullish(),
      })
    )
    .query(async ({ input, ctx }) => {
      const limit = input.limit ?? 50;
      const { cursor } = input;

      const items = await ctx.prisma.post.findMany({
        take: limit + 1,
        // cursor: cursor ? { id: cursor } : undefined,
        orderBy: {
          createdAt: "desc",
        },
      });
      let nextCursor: typeof cursor | undefined = undefined;
      if (items.length > limit) {
        const nextItem = items.pop();
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        nextCursor = nextItem!.id;
      }
      return {
        items,
        nextCursor,
      };
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
