import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "../trpc";

export const searchRouter = createTRPCRouter({
  searchAll: publicProcedure
    .input(z.object({ searchTerm: z.string().trim().min(1) }))
    .mutation(async ({ input, ctx }) => {
      const query = `%${input.searchTerm}%`;
      const [subs, users] = await ctx.prisma.$transaction([
        ctx.prisma.$queryRaw<
          { name: string }[]
        >`SELECT name FROM "Sub" WHERE "name" ILIKE ${query} LIMIT 10;`,
        ctx.prisma.$queryRaw<
          { username: string }[]
        >`SELECT username FROM "User" WHERE "username" ILIKE ${query} LIMIT 10;`,
      ]);
      return { subs, users };
    }),
  searchSubs: publicProcedure
    .input(z.object({ searchTerm: z.string().trim().min(1) }))
    .mutation(async ({ input, ctx }) => {
      const query = `%${input.searchTerm}%`;
      const [subs] = await ctx.prisma.$transaction([
        ctx.prisma.$queryRaw<
          { name: string }[]
        >`SELECT name FROM "Sub" WHERE "name" ILIKE ${query} LIMIT 10;`,
      ]);
      return { subs };
    }),
});
