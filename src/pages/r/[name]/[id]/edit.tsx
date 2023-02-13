import { createProxySSGHelpers } from "@trpc/react-query/ssg";
import type {
  GetStaticPaths,
  GetStaticPropsContext,
  InferGetStaticPropsType,
} from "next";
import superjson from "superjson";
import type { z } from "zod";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";

import { appRouter } from "../../../../server/api/root";
import { prisma } from "../../../../server/db";
import { createInnerTRPCContext } from "../../../../server/api/trpc";

import { api } from "../../../../utils/api";
import { editImagePostSchema, editPostSchema } from "../../../../utils/schema";

import { Form } from "../../../../components/Form";
import Link from "next/link";
import { NotFound } from "../../../../components/layout/NotFound";
import Image from "next/image";

export async function getStaticProps(
  context: GetStaticPropsContext<{ id: string }>
) {
  const ssg = createProxySSGHelpers({
    router: appRouter,
    ctx: createInnerTRPCContext({ session: null }),
    transformer: superjson,
  });

  const id = context.params?.id as string;
  const subName = context.params?.id as string;

  await ssg.post.getById.prefetch({ id });
  return {
    props: {
      trpcState: ssg.dehydrate(),
      id,
      subName,
    },
    revalidate: 1,
  };
}
export const getStaticPaths: GetStaticPaths = async () => {
  const posts = await prisma.post.findMany({
    select: {
      id: true,
      subName: true,
    },
  });
  return {
    paths: posts.map((post) => ({
      params: {
        id: post.id,
        name: post.subName,
      },
    })),
    fallback: "blocking",
  };
};

const Edit = (props: InferGetStaticPropsType<typeof getStaticProps>) => {
  const { data: session } = useSession();

  const router = useRouter();

  const {
    mutate: updatePost,
    isLoading,
    error,
  } = api.post.updatePost.useMutation({
    onSuccess: async () => {
      await router.push(`/r/${props.subName}/${props.id}`);
    },
  });

  const postQuery = api.post.getById.useQuery(
    { id: props.id },
    { refetchOnWindowFocus: false }
  );

  if (postQuery.status !== "success") {
    return <p>loading...</p>;
  }

  const { data: post } = postQuery;

  if (!post) {
    return (
      <NotFound message="Sorry, there doesn't seem to be anything here." />
    );
  }

  if (session?.user.userId !== post.creatorId) {
    return (
      <section className="flex h-[calc(100vh-80px)] flex-col items-center justify-center pb-80 text-center">
        <h1 className="mb-2 text-xl font-semibold">
          You are not allowed to edit someone else&apos;s post
        </h1>
        <Link
          href={`/post/${post.id}`}
          className="rounded-md bg-teal-600 py-2 px-4 text-white duration-300 hover:bg-teal-500"
        >
          Go back
        </Link>
      </section>
    );
  }

  const handleEdit = (data: z.infer<typeof editPostSchema>) => {
    updatePost({
      id: post.id,
      title: data.title,
      text: data.text,
      nsfw: !!data.nsfw,
    });
  };

  return (
    <div className="mx-auto max-w-prose">
      {post.text ? (
        <Form
          onSubmit={handleEdit}
          schema={editPostSchema}
          className="flex flex-col"
          buttonMessage="Update Post"
          globalError={error?.message}
          isLoading={isLoading}
          initialData={{ title: post.title, text: post.text, nsfw: post.nsfw }}
        />
      ) : (
        <Form
          onSubmit={handleEdit}
          schema={editImagePostSchema}
          className="flex flex-col"
          buttonMessage="Update Post"
          globalError={error?.message}
          isLoading={isLoading}
          image={
            <Image
              src={`https://t3redditclone.s3.ap-southeast-2.amazonaws.com/${
                post.image as string
              }`}
              alt="post image"
              width={500}
              height={500}
            />
          }
          initialData={{ title: post.title, nsfw: post.nsfw }}
        />
      )}
    </div>
  );
};

export default Edit;
