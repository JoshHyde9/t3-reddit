import { createProxySSGHelpers } from "@trpc/react-query/ssg";
import type {
  GetStaticPaths,
  GetStaticPropsContext,
  InferGetServerSidePropsType,
} from "next";
import superjson from "superjson";
import { format } from "date-fns";
import { useSession } from "next-auth/react";

import { appRouter } from "../../../server/api/root";
import { createInnerTRPCContext } from "../../../server/api/trpc";
import { prisma } from "../../../server/db";

import { api } from "../../../utils/api";

import { PostCard } from "../../../components/post/PostCard";
import { useRouter } from "next/router";

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
  const utils = api.useContext();
  const router = useRouter();
  const { data: session } = useSession();

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

  const { mutate: joinSub } = api.sub.subscribeUserToSub.useMutation({
    onSettled: async () => {
      await utils.sub.getAllPostsFromSub.invalidate();
    },
  });

  return (
    <section className="my-4 mx-auto max-w-5xl">
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
        <section className="my-4 h-fit min-w-[250px] max-w-xs rounded-md border p-4">
          <h2 className="mb-4 font-semibold">About community</h2>
          <p>{postsAndSub.description}</p>
          <p className="font-light text-neutral-700">
            Created {format(postsAndSub.createdAt, "MMM dd, YYY")}
          </p>
          <hr className="my-4" />
          <div className="flex flex-col leading-4">
            <h3>{Intl.NumberFormat().format(postsAndSub._count.users)}</h3>
            <p>{postsAndSub._count.users === 1 ? "user" : "users"}</p>
          </div>
          <hr className="my-4" />
          <div className="flex flex-col text-center">
            <button
              onClick={async () => {
                if (session) {
                  joinSub({ subName: props.name });
                } else {
                  await router.replace(`/login?next=/r/${props.name}`);
                }
              }}
              className="rounded-full bg-teal-600 py-2 text-white duration-300 hover:bg-teal-500"
            >
              {postsAndSub.users && postsAndSub.users.length >= 1
                ? "Leave"
                : "Join"}{" "}
              Community
            </button>
          </div>
        </section>
      </section>
    </section>
  );
};

export default Post;
