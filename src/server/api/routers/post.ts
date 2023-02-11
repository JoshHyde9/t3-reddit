import { PrismaClientKnownRequestError } from "@prisma/client/runtime";
import { TRPCError } from "@trpc/server";
import { undefined, z } from "zod";
import { createPostSchema, editPost } from "../../../utils/schema";
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
    .query(async ({ ctx, input }) => {
      const limit = input.limit ?? 50;
      const { cursor } = input;
      const items = await ctx.prisma.post.findMany({
        take: limit + 1,
        // cursor: cursor ? { createdAt: cursor } : undefined,
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
        orderBy: {
          createdAt: "desc",
        },
      });
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      let nextCursor: typeof cursor | undefined = undefined;
      if (items.length > limit) {
        const nextItem = items.pop();
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        nextCursor = nextItem!.createdAt.toString();
      }
      return {
        items,
        nextCursor,
      };
    }),
  // FIXME: Cursor is cooked.
  getAllUserSubbedTo: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).nullish(),
        cursor: z.string().nullish(),
      })
    )
    .query(async ({ ctx, input }) => {
      const limit = input.limit ?? 50;
      const { cursor } = input;
      const items = await ctx.prisma.post.findMany({
        take: limit + 1,
        // cursor: cursor ? { createdAt: cursor } : undefined,
        where: { sub: { users: { some: { id: ctx.session.user.userId } } } },
        include: {
          votes: {
            select: { value: true, postId: true },
            where: { userId: ctx.session.user.userId },
          },
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
        orderBy: {
          createdAt: "desc",
        },
      });
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      let nextCursor: typeof cursor | undefined = undefined;
      if (items.length > limit) {
        const nextItem = items.pop();
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        nextCursor = nextItem!.createdAt.toString();
      }
      return {
        items,
        nextCursor,
      };
    }),
  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input, ctx }) => {
      return await ctx.prisma.post.findUnique({
        where: { id: input.id },
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

          creator: {
            select: {
              username: true,
            },
          },
          comments: {
            select: {
              id: true,
              message: true,
              edited: true,
              createdAt: true,
              commentId: true,
              replies: {
                where: {
                  postId: input.id,
                },
                select: {
                  id: true,
                  message: true,
                  edited: true,
                  createdAt: true,
                  commentId: true,
                  replies: {
                    select: {
                      id: true,
                      createdAt: true,
                      message: true,
                      edited: true,
                      commentId: true,
                      user: {
                        select: {
                          id: true,
                          username: true,
                        },
                      },
                      replies: {
                        select: {
                          id: true,
                          createdAt: true,
                          message: true,
                          edited: true,
                          commentId: true,
                          user: {
                            select: {
                              id: true,
                              username: true,
                            },
                          },
                        },
                      },
                    },
                  },
                  user: {
                    select: {
                      id: true,
                      username: true,
                    },
                  },
                },
              },
              user: {
                select: {
                  username: true,
                  id: true,
                },
              },
            },
            orderBy: {
              createdAt: "desc",
            },
          },
        },
      });
    }),
  createPost: protectedProcedure
    .input(createPostSchema)
    .mutation(async ({ input, ctx }) => {
      const post = await ctx.prisma.$transaction(async (tx) => {
        if (input.image) {
          const createdPost = await tx.post.create({
            data: {
              title: input.title,
              image: input.image,
              creatorId: ctx.session.user.userId,
              points: 1,
              subName: input.subName,
            },
          });
          await tx.vote.create({
            data: {
              value: 1,
              postId: createdPost.id,
              userId: ctx.session.user.userId,
            },
          });
          return createdPost;
        } else {
          const createdPost = await tx.post.create({
            data: {
              title: input.title,
              text: input.text,
              creatorId: ctx.session.user.userId,
              points: 1,
              subName: input.subName,
            },
          });

          await tx.vote.create({
            data: {
              value: 1,
              postId: createdPost.id,
              userId: ctx.session.user.userId,
            },
          });

          return createdPost;
        }
      });

      return post;
    }),
  updatePost: protectedProcedure
    .input(editPost)
    .mutation(async ({ input, ctx }) => {
      try {
        await ctx.prisma.post.update({
          where: {
            id_creatorId: { creatorId: ctx.session.user.userId, id: input.id },
          },
          data: { title: input.title, text: input.text },
        });
      } catch (error) {
        if (error instanceof PrismaClientKnownRequestError) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Not allowed to edit someone elses post.",
          });
        }
      }
    }),
  deletePost: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      try {
        await ctx.prisma.post.delete({
          where: {
            id_creatorId: { creatorId: ctx.session.user.userId, id: input.id },
          },
        });
      } catch (error) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Post not found." });
      }
      return true;
    }),
  vote: protectedProcedure
    .input(z.object({ postId: z.string(), value: z.number().int() }))
    .mutation(async ({ input, ctx }) => {
      const isVotePos = input.value !== -1;
      const realValue = isVotePos ? 1 : -1;

      const vote = await ctx.prisma.vote.findUnique({
        where: {
          userId_postId: {
            postId: input.postId,
            userId: ctx.session.user.userId,
          },
        },
      });

      // User has voted on the post before
      // and they are changing their vote
      if (vote && vote.value !== realValue) {
        await ctx.prisma.$transaction([
          ctx.prisma.vote.update({
            data: { value: realValue },
            where: {
              userId_postId: {
                postId: input.postId,
                userId: ctx.session.user.userId,
              },
            },
          }),

          ctx.prisma.post.update({
            where: { id: input.postId },
            data: {
              points: {
                ...(realValue === 1 ? { increment: 2 } : { decrement: 2 }),
              },
            },
          }),
        ]);
      } else if (!vote) {
        // Has never voted before
        // Create the vote and update the post's points count
        await ctx.prisma.$transaction([
          ctx.prisma.vote.create({
            data: {
              value: realValue,
              userId: ctx.session.user.userId,
              postId: input.postId,
            },
          }),

          ctx.prisma.post.update({
            where: { id: input.postId },
            data: {
              points: {
                ...(realValue === 1 ? { increment: 1 } : { decrement: 1 }),
              },
            },
          }),
        ]);
      } else {
        if (realValue === 1) {
          // User upvoted a post they have already upvoted
          // Delete the vote and decrement the post's points count
          await ctx.prisma.$transaction([
            ctx.prisma.vote.delete({
              where: {
                userId_postId: {
                  postId: input.postId,
                  userId: ctx.session.user.userId,
                },
              },
            }),

            ctx.prisma.post.update({
              where: { id: input.postId },
              data: {
                points: {
                  decrement: 1,
                },
              },
            }),
          ]);
        } else {
          // User downvoted a post they have already downvoted
          // Delete the vote and increment the post's points count
          await ctx.prisma.$transaction([
            ctx.prisma.vote.delete({
              where: {
                userId_postId: {
                  postId: input.postId,
                  userId: ctx.session.user.userId,
                },
              },
            }),

            ctx.prisma.post.update({
              where: { id: input.postId },
              data: {
                points: {
                  increment: 1,
                },
              },
            }),
          ]);
        }
      }

      return true;
    }),
});
