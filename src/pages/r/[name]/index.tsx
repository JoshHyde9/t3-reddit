import { createProxySSGHelpers } from "@trpc/react-query/ssg";
import type {
  GetStaticPaths,
  GetStaticPropsContext,
  InferGetServerSidePropsType,
} from "next";
import superjson from "superjson";

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
  const posts = await prisma.post.findMany({ select: { subName: true } });

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
  const postQuery = api.sub.getAllPostsFromSub.useQuery(
    { name: props.name },
    { refetchOnWindowFocus: false }
  );

  if (postQuery.status !== "success") {
    return <p>Loading...</p>;
  }

  const { data: posts } = postQuery;

  if (posts.length <= 0) {
    return <p>No posts exist on this sub.</p>;
  }

  return (
    <section className="mx-auto max-w-prose">
      {posts.map((post) => (
        <PostCard
          key={post.id}
          post={post}
          voteStatus={post.votes?.find((status) => post.id === status.postId)}
        />
      ))}
    </section>
  );
};

export default Post;
