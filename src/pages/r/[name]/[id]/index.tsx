import { createProxySSGHelpers } from "@trpc/react-query/ssg";
import { useState } from "react";
import type {
  GetStaticPaths,
  GetStaticPropsContext,
  InferGetServerSidePropsType,
} from "next";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/router";
import superjson from "superjson";
import type { z } from "zod";
import Image from "next/image";

import { appRouter } from "../../../../server/api/root";
import { createInnerTRPCContext } from "../../../../server/api/trpc";
import { prisma } from "../../../../server/db";

import { api } from "../../../../utils/api";
import {
  createComment,
  type editCommentSchema,
  type createCommentSchema,
} from "../../../../utils/schema";

import { Form } from "../../../../components/Form";
import { Voting } from "../../../../components/post/Voting";
import { Comment } from "../../../../components/comment/Comment";
import { ShareBtn } from "../../../../components/post/ShareBtn";
import { env } from "../../../../env/client.mjs";
import formatDistanceToNow from "date-fns/formatDistanceToNow";
import { LoadingSpinner } from "../../../../components/layout/LoadingSpinner";

export const getStaticProps = async (
  context: GetStaticPropsContext<{ id: string; name: string }>
) => {
  const ssg = createProxySSGHelpers({
    router: appRouter,
    ctx: createInnerTRPCContext({ session: null }),
    transformer: superjson,
  });

  const id = context.params?.id as string;
  const subName = context.params?.name as string;

  await ssg.post.getById.prefetch({ id });

  return {
    props: {
      trpcState: ssg.dehydrate(),
      id,
      subName,
    },
    revalidate: 1,
  };
};

export const getStaticPaths: GetStaticPaths = async () => {
  const posts = await prisma.post.findMany({
    select: { id: true, subName: true },
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

const Post = (props: InferGetServerSidePropsType<typeof getStaticProps>) => {
  const { data: session, status: sessionStatus } = useSession();
  const router = useRouter();
  const utils = api.useContext();
  const [open, setOpen] = useState<null | string>(null);
  const [edit, setEdit] = useState<null | string>(null);
  const [imageBlur, setImageBlur] = useState(true);

  const { mutate: deletePost } = api.post.deletePost.useMutation({
    onSuccess: async () => {
      await router.replace("/");
    },
  });

  const { mutate: mutateCreateComment, isLoading: isCreateCommentLoading } =
    api.comment.createComment.useMutation({
      onSuccess: async () => {
        await utils.post.invalidate();
      },
    });

  const { mutate: mutateCreateReply, isLoading: isCreateReplyLoading } =
    api.comment.createReply.useMutation({
      onSuccess: async () => {
        await utils.post.invalidate();
        setOpen(null);
      },
    });

  const { mutate: mutateEditComment, isLoading: isEditCommentLoading } =
    api.comment.updateComment.useMutation({
      onSuccess: async () => {
        await utils.post.invalidate();
        setEdit(null);
      },
    });

  const { mutate: deleteComment } = api.comment.deleteComment.useMutation({
    onSuccess: async () => {
      await utils.post.invalidate();
    },
  });

  const postQuery = api.post.getById.useQuery(
    { id: props.id },
    { refetchOnWindowFocus: false }
  );

  if (postQuery.status !== "success") {
    return <LoadingSpinner />;
  }

  const { data: post } = postQuery;

  if (!post) {
    return <p>Post not found.</p>;
  }

  const handleCreateComment = (data: z.infer<typeof createCommentSchema>) => {
    mutateCreateComment({ postId: post.id, message: data.message });
  };

  const handleCreateReply = (
    data: z.infer<typeof createCommentSchema>,
    commentId: string
  ) => {
    mutateCreateReply({
      message: data.message,
      postId: post.id,
      id: commentId,
    });
  };

  const handleEditComment = (
    data: z.infer<typeof editCommentSchema>,
    commentId: string
  ) => {
    mutateEditComment({
      message: data.message,
      commentId,
    });
  };

  return (
    <section className="mx-auto max-w-prose px-2 md:px-0">
      <article className="my-4 flex flex-row gap-2 rounded-md border">
        <Voting
          points={post.points}
          postId={post.id}
          voteStatus={post.votes?.find((status) => post.id === status.postId)}
        />
        <div className="flex-auto p-1 pr-2">
          <div className="mb-2 flex items-center gap-x-1 text-xs">
            <Link href={`/r/${post.subName}`} className="hover:underline">
              <p className="text-sm font-semibold">r/{post.subName}</p>
            </Link>
            <span className="mx-1 font-thin">&#x2022;</span>
            <p>
              Posted By{" "}
              <Link
                className="hover:underline"
                href={`/user/${post.creator.username}`}
              >
                u/{post.creator.username}
              </Link>
            </p>
            <p>{formatDistanceToNow(post.createdAt)} ago</p>
            {post.nsfw && (
              <>
                <span className="mx-1 font-thin">&#x2022;</span>
                <p className="rounded-md border-2 border-nsfw px-1 text-nsfw">
                  nsfw
                </p>
              </>
            )}
          </div>
          <h1 className="text-lg font-semibold">{post.title}</h1>
          {post.text ? (
            <p className="pt-2">{post.text}</p>
          ) : post.nsfw ? (
            <div
              onClick={() => setImageBlur(false)}
              className="relative cursor-pointer pt-2"
            >
              {imageBlur ? (
                <div className="absolute h-full w-full backdrop-blur-2xl"></div>
              ) : null}
              <Image
                className="h-auto w-auto"
                src={`https://t3redditclone.s3.ap-southeast-2.amazonaws.com/${
                  post.image as string
                }`}
                alt="post image"
                width={500}
                height={500}
              />
            </div>
          ) : (
            <Image
              className="h-auto w-auto pt-2"
              src={`https://t3redditclone.s3.ap-southeast-2.amazonaws.com/${
                post.image as string
              }`}
              alt="post image"
              width={500}
              height={500}
            />
          )}
          <div className="mt-4 flex gap-x-2">
            <>
              {session?.user.userId === post.creatorId ||
              post.sub.moderators.some(
                (moderator) => moderator.id === session?.user.userId
              ) ? (
                <button onClick={() => deletePost({ id: post.id })}>
                  Delete
                </button>
              ) : null}
              {session?.user.userId === post.creatorId && (
                <Link href={`/r/${post.subName}/${post.id}/edit`}>Edit</Link>
              )}
            </>
          </div>
        </div>
      </article>
      <section className="flex gap-x-2">
        <p>
          {post.comments.length}{" "}
          {post.comments.length === 1 ? "Comment" : "Comments"}
        </p>
        <ShareBtn url={`${env.NEXT_PUBLIC_URL}/r/${post.subName}/${post.id}`} />
      </section>
      <section>
        {sessionStatus === "authenticated" && (
          <Form
            onSubmit={handleCreateComment}
            className="mb-10 flex flex-col"
            schema={createComment}
            isLoading={isCreateCommentLoading}
            buttonMessage="Create comment"
          />
        )}
        {post.comments
          .filter((comment) => !comment.commentId)
          .map((comment, i) => (
            <Comment
              key={i}
              edit={edit}
              open={open}
              session={session}
              setEdit={setEdit}
              setOpen={setOpen}
              comment={comment}
              deleteComment={deleteComment}
              handleCreateReply={handleCreateReply}
              handleEditComment={handleEditComment}
              isCreateReplyLoading={isCreateReplyLoading}
              isEditCommentLoading={isEditCommentLoading}
            />
          ))}
      </section>
    </section>
  );
};

export default Post;
