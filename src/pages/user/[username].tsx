import { createProxySSGHelpers } from "@trpc/react-query/ssg";
import type {
  GetStaticPaths,
  GetStaticPropsContext,
  InferGetServerSidePropsType,
} from "next";
import superjson from "superjson";
import { format } from "date-fns";

import { appRouter } from "../../server/api/root";
import { createInnerTRPCContext } from "../../server/api/trpc";
import { prisma } from "../../server/db";

import { api } from "../../utils/api";

import { PostCard } from "../../components/post/PostCard";

export const getStaticProps = async (
  context: GetStaticPropsContext<{ username: string }>
) => {
  const ssg = createProxySSGHelpers({
    router: appRouter,
    ctx: createInnerTRPCContext({ session: null }),
    transformer: superjson,
  });

  const username = context.params?.username as string;

  await ssg.user.getAllUserPosts.prefetch({ username });

  return {
    props: {
      trpcState: ssg.dehydrate(),
      username,
    },
    revalidate: 1,
  };
};

export const getStaticPaths: GetStaticPaths = async () => {
  const posts = await prisma.post.findMany({
    select: { creator: { select: { username: true } } },
  });

  return {
    paths: posts.map((post) => ({
      params: {
        username: post.creator.username,
      },
    })),
    fallback: "blocking",
  };
};

const UserAccount = (
  props: InferGetServerSidePropsType<typeof getStaticProps>
) => {
  const userPostsQuery = api.user.getAllUserPosts.useQuery(
    { username: props.username },
    { refetchOnWindowFocus: false }
  );

  if (userPostsQuery.status !== "success") {
    return <p>Loading...</p>;
  }

  const { data: userPosts } = userPostsQuery;

  if (!userPosts) {
    return (
      <section className="my-4 mx-auto max-w-4xl">
        <p>User does not exist.</p>
      </section>
    );
  }

  if (userPosts.posts.length <= 0) {
    return (
      <section className="my-4 mx-auto max-w-4xl">
        <p>User hasn&apos;t created any posts.</p>
      </section>
    );
  }

  return (
    <section className="my-4 mx-auto max-w-4xl">
      <section className="px-2 md:hidden md:px-0">
        <h1 className="text-2xl font-semibold">{userPosts.username}</h1>
        <div className="flex gap-x-2 text-neutral-700">
          <p>u/{userPosts.username}</p>
          <span>&#x2022;</span>
          <p>2,602 karma</p>
          <span>&#x2022;</span>
          <p>{format(userPosts.createdAt, "MMM dd, YYY")}</p>
        </div>
      </section>
      <section className="flex justify-between gap-x-4 px-2 md:px-0">
        <section className="w-full md:w-9/12">
          {userPosts.posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              voteStatus={post.votes?.find(
                (status) => post.id === status.postId
              )}
            />
          ))}
        </section>
        <section className="my-4 hidden h-fit min-w-[250px] max-w-xs rounded-md border p-4 md:block">
          <h1 className="mb-4 text-lg font-semibold">{userPosts.username}</h1>
          <div className="flex justify-between">
            {/* TODO: Implement Reddit karma */}
            <div>
              <h2>Karma</h2>
              <p className="font-light text-neutral-700">2,602</p>
            </div>
            <div>
              <h2>Cake day</h2>
              <p className="font-light text-neutral-700">
                {format(userPosts.createdAt, "MMM dd, YYY")}
              </p>
            </div>
          </div>
          <hr className="my-4" />
        </section>
      </section>
    </section>
  );
};

export default UserAccount;
