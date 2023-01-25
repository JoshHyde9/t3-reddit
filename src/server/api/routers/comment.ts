import { PrismaClientKnownRequestError } from "@prisma/client/runtime";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createCommentSchema } from "../../../utils/schema";
import { createTRPCRouter, protectedProcedure } from "../trpc";

export const commentRouter = createTRPCRouter({
  createComment: protectedProcedure
    .input(createCommentSchema)
    .mutation(async ({ input, ctx }) => {
      return await ctx.prisma.comment.create({
        data: {
          message: input.message,
          postId: input.postId,
          userId: ctx.session.user.userId,
        },
      });
    }),
  createReply: protectedProcedure
    .input(
      z.object({ id: z.string(), message: z.string(), postId: z.string() })
    )
    .mutation(async ({ input, ctx }) => {
      return await ctx.prisma.comment.update({
        where: {
          id: input.id,
        },
        data: {
          replies: {
            create: {
              message: input.message,
              userId: ctx.session.user.userId,
              postId: input.postId,
            },
          },
        },
      });
    }),
  deleteComment: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      try {
        await ctx.prisma.comment.delete({
          where: {
            id: input.id,
          },
        });
      } catch (error) {
        if (error instanceof PrismaClientKnownRequestError) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Not allowed to delete someone else's comment.",
          });
        }
      }

      return true;
    }),
});
