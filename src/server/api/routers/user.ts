import { hash } from "argon2";

import { registerUser } from "../../../utils/schema";
import { createTRPCRouter, publicProcedure } from "../trpc";

export const userRouter = createTRPCRouter({
  register: publicProcedure
    .input(registerUser)
    .mutation(async ({ input, ctx }) => {
      const hashedPassword = await hash(input.password);
      return await ctx.prisma.user.create({
        data: {
          username: input.username,
          email: input.email,
          password: hashedPassword,
        },
      });
    }),
});
