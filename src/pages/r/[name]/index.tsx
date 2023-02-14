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
import { NotFound } from "../../../components/layout/NotFound";

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
  const session = useSession();

  const subQuery = api.sub.getAllPostsFromSub.useQuery(
    { name: props.name },
    { refetchOnWindowFocus: false }
  );

  if (subQuery.status !== "success") {
    return <p>Loading...</p>;
  }

  const { data: sub } = subQuery;

  if (!sub) {
    return (
      <NotFound
        message={`Hm... we couldn't find any results for "${props.name}"`}
      />
    );
  }

  if (sub.posts.length <= 0) {
    return <NotFound message="No posts exist on this sub" />;
  }

  const { mutate: joinSub } = api.sub.subscribeUserToSub.useMutation({
    onSettled: async () => {
      await utils.sub.getAllPostsFromSub.invalidate();
    },
  });

  return (
    <section className="my-4 mx-auto max-w-5xl px-2">
      <section>
        <h1 className="text-3xl font-semibold">{sub.description}</h1>
        <p>r/{sub.name}</p>
        <div className="mt-2 flex text-center md:hidden">
          <button
            onClick={async () => {
              if (session.status === "authenticated") {
                joinSub({ subName: props.name });
              } else {
                await router.replace(`/login?next=/r/${props.name}`);
              }
            }}
            className="w-1/2 rounded-full bg-teal-600 py-2 text-white duration-300 hover:bg-teal-500"
          >
            {sub.users && sub.users.length >= 1 ? "Leave" : "Join"} Community
          </button>
        </div>
      </section>
      <section className="flex justify-between gap-x-4">
        <section className="w-full md:w-9/12">
          {sub.posts.map((post) => (
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
          <h2 className="mb-4 font-semibold">About community</h2>
          <p>{sub.description}</p>
          <p className="font-light text-neutral-700">
            Created {format(sub.createdAt, "MMM dd, YYY")}
          </p>
          <hr className="my-4" />
          <div className="flex flex-col leading-4">
            <h3>{Intl.NumberFormat().format(sub._count.users)}</h3>
            <p>{sub._count.users === 1 ? "member" : "members"}</p>
          </div>
          <hr className="my-4" />
          <div className="flex flex-col text-center">
            <button
              onClick={async () => {
                if (session.status === "authenticated") {
                  joinSub({ subName: props.name });
                } else {
                  await router.replace(`/login?next=/r/${props.name}`);
                }
              }}
              className="rounded-full bg-teal-600 py-2 text-white duration-300 hover:bg-teal-500"
            >
              {sub.users && sub.users.length >= 1 ? "Leave" : "Join"} Community
            </button>
          </div>
        </section>
      </section>
    </section>
  );
};

export default Post;
