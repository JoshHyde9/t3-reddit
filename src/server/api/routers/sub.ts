import { PrismaClientKnownRequestError } from "@prisma/client/runtime";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createSubSchema } from "../../../utils/schema";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";

export const subRouter = createTRPCRouter({
  getAllPostsFromSub: publicProcedure
    .input(z.object({ name: z.string() }))
    .query(async ({ input, ctx }) => {
      return await ctx.prisma.post.findMany({
        where: {
          subName: input.name,
        },
        include: {
          // Get the votes of the posts if the user is logged in
          ...(ctx.session?.user
            ? {
                votes: {
                  select: { value: true, postId: true },
                  where: { userId: ctx.session.user.userId },
                },
              }
            : {}),
          _count: {
            select: {
              comments: true,
            },
          },
          creator: {
            select: {
              username: true,
            },
          },
        },
      });
    }),
  createSub: protectedProcedure
    .input(createSubSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        return await ctx.prisma.sub.create({
          data: { name: input.name, description: input.description },
        });
      } catch (error) {
        if (error instanceof PrismaClientKnownRequestError) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "Sub name already exists.",
          });
        }
      }
    }),
});
