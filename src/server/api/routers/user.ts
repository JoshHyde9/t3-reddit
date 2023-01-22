import { PrismaClientKnownRequestError } from "@prisma/client/runtime";
import { TRPCError } from "@trpc/server";
import { hash } from "argon2";
import { z } from "zod";
import jwt from "jsonwebtoken";

import { passwordSchema, registerUser } from "../../../utils/schema";
import { sendEmail } from "../../../utils/sendEmail";
import { createTRPCRouter, publicProcedure } from "../trpc";
import { env } from "../../../env/server.mjs";

type JWTPayload = {
  userId: string | null;
} & jwt.JwtPayload;

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
  forgotPassword: publicProcedure
    .input(z.object({ email: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const user = await ctx.prisma.user.findUnique({
        where: { email: input.email },
      });

      if (!user) return true;

      const token = jwt.sign({ userId: user.id }, env.NEXTAUTH_SECRET, {
        expiresIn: "15m",
      });

      await sendEmail({
        to: input.email,
        html: `<a href="${env.NEXTAUTH_URL}/forgot-password/${token}">reset password</a>`,
      });

      return true;
    }),
  changePassword: publicProcedure
    .input(z.object({ token: z.string(), newPassword: passwordSchema }))
    .mutation(async ({ input, ctx }) => {
      const token = jwt.verify(input.token, env.NEXTAUTH_SECRET) as JWTPayload;

      if (!token.userId) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Token expired.",
        });
      }

      const user = await ctx.prisma.user.findUnique({
        where: { id: token.userId },
      });

      if (!user) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "User no longer exists.",
        });
      }

      await ctx.prisma.user.update({
        where: { id: token.userId },
        data: { password: await hash(input.newPassword) },
      });

      return { username: user.username };
    }),
});
