import type { Dispatch, FunctionComponent, SetStateAction } from "react";
import type { Session } from "next-auth";
import type { z } from "zod";

import { formatDistanceToNow } from "date-fns";

import {
  createComment,
  type createCommentSchema,
  type editCommentSchema,
} from "../../utils/schema";

import { ReplyEdit } from "./ReplyEdit";

type CommentProps = {
  comment: {
    id: string;
    message: string;
    commentId?: string | null;
    edited: boolean;
    user: {
      id: string;
      username: string;
    };
    createdAt: Date;
    replies?: {
      id: string;
      user: {
        id: string;
        username: string;
      };
      createdAt: Date;
      message: string;
      edited: boolean;
    }[];
  };
  session: Session | null;
  setOpen: Dispatch<SetStateAction<string | null>>;
  setEdit: Dispatch<SetStateAction<string | null>>;
  open: null | string;
  edit: null | string;
  deleteComment: ({ id }: { id: string }) => void;
  handleEditComment: (
    data: z.infer<typeof editCommentSchema>,
    commentId: string
  ) => void;
  handleCreateReply: (
    data: z.infer<typeof createCommentSchema>,
    commentId: string
  ) => void;
  isEditCommentLoading: boolean;
  isCreateReplyLoading: boolean;
  children?: React.ReactNode;
};

export const Comment: FunctionComponent<CommentProps> = ({
  comment,
  session,
  deleteComment,
  setEdit,
  setOpen,
  open,
  edit,
  handleCreateReply,
  handleEditComment,
  isEditCommentLoading,
  isCreateReplyLoading,
}) => {
  return (
    <section className="m-2 border-l-2 border-gray-300">
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
                  setOpen((prevOpen) =>
                    prevOpen === comment.id ? null : comment.id
                  );
                }}
              >
                Reply
              </button>
              {session?.user.userId === comment.user.id && (
                <>
                  <button
                    onClick={() => {
                      setOpen(null);
                      setEdit((prevEdit) =>
                        prevEdit === comment.id ? null : comment.id
                      );
                    }}
                  >
                    Edit
                  </button>
                  <button onClick={() => deleteComment({ id: comment.id })}>
                    Delete
                  </button>
                </>
              )}
            </>
          )}
        </div>
        <>
          {open === comment.id && (
            <ReplyEdit
              commentUsername={comment.user.username}
              isLoading={isCreateReplyLoading}
              schema={createComment}
              onSubmit={(data: z.infer<typeof createCommentSchema>) =>
                handleCreateReply(data, comment.id)
              }
            />
          )}
          {edit === comment.id && (
            <ReplyEdit
              editing={true}
              isLoading={isEditCommentLoading}
              schema={createComment}
              onSubmit={(data: z.infer<typeof editCommentSchema>) =>
                handleEditComment(data, comment.id)
              }
            />
          )}
          {comment.replies &&
            comment.replies.map((reply, j) => (
              <Comment
                key={j}
                edit={edit}
                open={open}
                comment={reply}
                session={session}
                setEdit={setEdit}
                setOpen={setOpen}
                deleteComment={deleteComment}
                handleCreateReply={handleCreateReply}
                handleEditComment={handleEditComment}
                isCreateReplyLoading={isCreateReplyLoading}
                isEditCommentLoading={isEditCommentLoading}
              />
            ))}
        </>
      </div>
    </section>
  );
};
