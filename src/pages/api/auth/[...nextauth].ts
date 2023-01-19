import NextAuth, { type AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { verify } from "argon2";

import { prisma } from "../../../server/db";
import { baseUserSchema } from "../../../utils/schema";

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: {
          label: "Username",
          type: "text",
          placeholder: "Username...",
        },
        password: {
          label: "Password",
          type: "password",
          placeholder: "Password...",
        },
      },
      authorize: async (credentials) => {
        try {
          const creds = await baseUserSchema.parseAsync(credentials);

          const user = await prisma.user.findFirst({
            where: { username: creds.username },
          });

          if (!user) {
            throw new Error("Invalid credentials");
          }

          const isValidPassword = await verify(user.password, creds.password);

          if (!isValidPassword) {
            throw new Error("Invalid credentials");
          }

          return { id: user.id, username: user.username };
        } catch {
          return null;
        }
      },
    }),
  ],
  callbacks: {
    jwt: ({ token, user }) => {
      if (user) {
        token.userId = user.id;
        token.username = user.username;
      }

      return token;
    },
    session: ({ session, token }) => {
      if (token) {
        session.user.userId = token.userId;
        session.user.username = token.username;
      }

      return session;
    },
  },
  jwt: {
    maxAge: 15 * 24 * 30 * 60, // 15 days
  },
  pages: {
    signIn: "/login",
  },
};

export default NextAuth(authOptions);
