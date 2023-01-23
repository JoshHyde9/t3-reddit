import { createProxySSGHelpers } from "@trpc/react-query/ssg";
import type {
  GetStaticPaths,
  GetStaticPropsContext,
  InferGetServerSidePropsType,
} from "next";
import { prisma } from "../../server/db";
import superjson from "superjson";
import { appRouter } from "../../server/api/root";
import { createInnerTRPCContext } from "../../server/api/trpc";

import { api } from "../../utils/api";

import { Voting } from "../../components/Voting";

export const getStaticProps = async (
  context: GetStaticPropsContext<{ id: string }>
) => {
  const ssg = createProxySSGHelpers({
    router: appRouter,
    ctx: createInnerTRPCContext({ session: null }),
    transformer: superjson,
  });

  const id = context.params?.id as string;

  await ssg.post.getById.prefetch({ id });

  return {
    props: {
      trpcState: ssg.dehydrate(),
      id,
    },
    revalidate: 1,
  };
};

export const getStaticPaths: GetStaticPaths = async () => {
  const posts = await prisma.post.findMany({ select: { id: true } });

  return {
    paths: posts.map((post) => ({
      params: {
        id: post.id,
      },
    })),
    fallback: "blocking",
  };
};

const Post = (props: InferGetServerSidePropsType<typeof getStaticProps>) => {
  const postQuery = api.post.getById.useQuery({ id: props.id });

  if (postQuery.status !== "success") {
    return <p>Loading...</p>;
  }

  const { data: post } = postQuery;

  if (!post) {
    return <p>Post not found.</p>;
  }

  return (
    <section className="mx-auto max-w-prose">
      <article className="my-4 flex flex-row gap-2 rounded-md border">
        <Voting
          points={post.points}
          postId={post.id}
          voteStatus={post.votes?.find((status) => post.id === status.postId)}
        />
        <div className="p-1 pr-2">
          <span className="text-sm">u/{post.creator.username}</span>
          <h1 className="text-lg font-semibold">{post.title}</h1>
          <p className="pt-2">{post.text}</p>
        </div>
      </article>
    </section>
  );
};

export default Post;
