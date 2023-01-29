import { createProxySSGHelpers } from "@trpc/react-query/ssg";
import type {
  GetStaticPaths,
  GetStaticPropsContext,
  InferGetServerSidePropsType,
} from "next";
import superjson from "superjson";
import { format } from "date-fns";

import { appRouter } from "../../../server/api/root";
import { createInnerTRPCContext } from "../../../server/api/trpc";
import { prisma } from "../../../server/db";

import { api } from "../../../utils/api";

import { PostCard } from "../../../components/post/PostCard";

export const getStaticProps = async (
  context: GetStaticPropsContext<{ name: string }>
) => {
  const ssg = createProxySSGHelpers({
    router: appRouter,
    ctx: createInnerTRPCContext({ session: null }),
    transformer: superjson,
  });

  const name = context.params?.name as string;

  await ssg.sub.getAllPostsFromSub.prefetch({ name });

  return {
    props: {
      trpcState: ssg.dehydrate(),
      name,
    },
    revalidate: 1,
  };
};

export const getStaticPaths: GetStaticPaths = async () => {
  const posts = await prisma.post.findMany({
    select: { subName: true },
  });

  return {
    paths: posts.map((post) => ({
      params: {
        name: post.subName,
      },
    })),
    fallback: "blocking",
  };
};

const Post = (props: InferGetServerSidePropsType<typeof getStaticProps>) => {
  const postsAndSubQuery = api.sub.getAllPostsFromSub.useQuery(
    { name: props.name },
    { refetchOnWindowFocus: false }
  );

  if (postsAndSubQuery.status !== "success") {
    return <p>Loading...</p>;
  }

  const { data: postsAndSub } = postsAndSubQuery;

  if (!postsAndSub) {
    return <p>Sub does not exist.</p>;
  }

  if (postsAndSub.posts.length <= 0) {
    return <p>No posts exist on this sub.</p>;
  }

  return (
    <section className="my-4 mx-auto max-w-4xl">
      <section>
        <h1 className="text-3xl font-semibold">{postsAndSub.description}</h1>
        <p>r/{postsAndSub.name}</p>
      </section>
      <section className="flex justify-between gap-x-4">
        <section className="w-9/12">
          {postsAndSub.posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              voteStatus={post.votes?.find(
                (status) => post.id === status.postId
              )}
            />
          ))}
        </section>
        <section className="my-4 min-w-[250px] max-w-xs rounded-md border p-4">
          <h2 className="mb-4 font-semibold">About community</h2>
          <p>{postsAndSub.description}</p>
          <p className="font-light text-neutral-500">
            Created {format(postsAndSub.createdAt, "MMM dd, YYY")}
          </p>
        </section>
      </section>
    </section>
  );
};

export default Post;
