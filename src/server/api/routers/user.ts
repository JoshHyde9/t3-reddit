import { PrismaClientKnownRequestError } from "@prisma/client/runtime";
import { TRPCError } from "@trpc/server";
import { hash } from "argon2";

import { registerUser } from "../../../utils/schema";
import { createTRPCRouter, publicProcedure } from "../trpc";

export const userRouter = createTRPCRouter({
  register: publicProcedure
    .input(registerUser)
    .mutation(async ({ input, ctx }) => {
      const hashedPassword = await hash(input.password);
      try {
        await ctx.prisma.user.create({
          data: {
            username: input.username,
            email: input.email,
            password: hashedPassword,
          },
        });
      } catch (error) {
        if (error instanceof PrismaClientKnownRequestError) {
          if (error.message.includes("email"))
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: "Email already in use.",
            });

          if (error.message.includes("username"))
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: "Username already is use.",
            });
        }
      }
    }),
});
