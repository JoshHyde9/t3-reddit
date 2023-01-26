import { createProxySSGHelpers } from "@trpc/react-query/ssg";
import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
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
import { Voting } from "../../../components/Voting";
import { ReplyEdit } from "../../../components/comment/ReplyEdit";
import { Comment } from "../../../components/comment/Comment";

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
  const [open, setOpen] = useState<null | number>(null);
  const [edit, setEdit] = useState<null | number>(null);

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
      <section>
        <p>{post.comments.length} comments</p>
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
            <div key={i} className="my-5 border-l-2 border-gray-300">
              <div className="ml-4">
                <div className="flex gap-2">
                  <h1 className="font-semibold">{comment.user.username}</h1>
                  <span>&#x2022;</span>
                  <p>{formatDistanceToNow(comment.createdAt)} ago</p>
                  {comment.edited && (
                    <>
                      <span>&#x2022;</span>
                      <p>(edited)</p>
                    </>
                  )}
                </div>
                <p className="py-1">{comment.message}</p>
                <div className="flex gap-x-2">
                  {session?.user && (
                    <>
                      <button
                        onClick={() => {
                          setEdit(null);
                          setOpen((prevOpen) => (prevOpen === i ? null : i));
                        }}
                      >
                        Reply
                      </button>
                      {session?.user.userId === comment.userId && (
                        <>
                          <button
                            onClick={() => {
                              setOpen(null);
                              setEdit((prevEdit) =>
                                prevEdit === i ? null : i
                              );
                            }}
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => deleteComment({ id: comment.id })}
                          >
                            Delete
                          </button>
                        </>
                      )}
                    </>
                  )}
                </div>
                <>
                  {open === i && (
                    <ReplyEdit
                      commentUsername={comment.user.username}
                      isLoading={isCreateReplyLoading}
                      schema={createComment}
                      onSubmit={(data: z.infer<typeof createCommentSchema>) =>
                        handleCreateReply(data, comment.id)
                      }
                    />
                  )}
                  {edit === i && (
                    <ReplyEdit
                      editing={true}
                      isLoading={isEditCommentLoading}
                      schema={createComment}
                      onSubmit={(data: z.infer<typeof editCommentSchema>) =>
                        handleEditComment(data, comment.id)
                      }
                    />
                  )}
                  {comment.replies.map((reply, j) => (
                    <Comment
                      key={j}
                      reply={reply}
                      creatorUsername={comment.user.username}
                    />
                  ))}
                </>
              </div>
            </div>
          ))}
      </section>
    </section>
  );
};

export default Post;
