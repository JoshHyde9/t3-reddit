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

import { appRouter } from "../../../server/api/root";
import { createInnerTRPCContext } from "../../../server/api/trpc";
import { prisma } from "../../../server/db";

import { api } from "../../../utils/api";
import {
  createComment,
  type editCommentSchema,
  type createCommentSchema,
} from "../../../utils/schema";

import { Form } from "../../../components/Form";
import { Voting } from "../../../components/post/Voting";
import { Comment } from "../../../components/comment/Comment";
import { ShareBtn } from "../../../components/post/ShareBtn";
import { env } from "../../../env/client.mjs";

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
  const { data: session } = useSession();
  const router = useRouter();
  const utils = api.useContext();
  const [open, setOpen] = useState<null | string>(null);
  const [edit, setEdit] = useState<null | string>(null);

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
    return <p>Loading...</p>;
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
    <section className="mx-auto max-w-prose">
      <article className="my-4 flex flex-row gap-2 rounded-md border">
        <Voting
          points={post.points}
          postId={post.id}
          voteStatus={post.votes?.find((status) => post.id === status.postId)}
        />
        <div className="flex-auto p-1 pr-2">
          <span className="text-sm">u/{post.creator.username}</span>
          <h1 className="text-lg font-semibold">{post.title}</h1>
          <p className="pt-2">{post.text}</p>
          <div className="mt-4 flex gap-x-2">
            {session?.user.userId === post.creatorId && (
              <>
                <button onClick={() => deletePost({ id: post.id })}>
                  Delete
                </button>
                <Link href={`/post/${post.id}/edit`}>Edit</Link>
              </>
            )}
          </div>
        </div>
      </article>
      <section className="flex gap-x-2">
        <p>{post.comments.length} comments</p>
        <ShareBtn url={`${env.NEXT_PUBLIC_URL}/post/${post.id}`} />
      </section>
      <section>
        {session?.user && (
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
