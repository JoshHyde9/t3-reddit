import { commentRouter } from "./routers/comment";
import { postRouter } from "./routers/post";
import { subRouter } from "./routers/sub";
import { userRouter } from "./routers/user";
import { createTRPCRouter } from "./trpc";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here
 */
export const appRouter = createTRPCRouter({
  post: postRouter,
  user: userRouter,
  comment: commentRouter,
  sub: subRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
