import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "../trpc";

export const searchRouter = createTRPCRouter({
  searchAll: publicProcedure
    .input(z.object({ searchTerm: z.string().trim().min(1) }))
    .mutation(async ({ input, ctx }) => {
      const [subs, users] = await ctx.prisma.$transaction([
        ctx.prisma.sub.findMany({
          take: 10,
          where: { name: { contains: input.searchTerm } },
          select: { name: true },
        }),
        ctx.prisma.user.findMany({
          take: 10,
          where: { username: { contains: input.searchTerm } },
          select: { username: true },
        }),
      ]);
      return { subs, users };
    }),
});
