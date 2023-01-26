import type { FunctionComponent } from "react";
import { formatDistanceToNow } from "date-fns";

type CommentProps = {
  reply: {
    user: {
      id: string;
      username: string;
    };
    createdAt: Date;
    message: string;
    edited: boolean;
  };
  children?: React.ReactNode;
};

export const Comment: FunctionComponent<CommentProps> = ({ reply }) => {
  return (
    <section className="m-2 border-l-2 border-gray-300">
      <div className="ml-4">
        <div className="flex gap-2">
          <h1 className="font-semibold">{reply.user.username}</h1>
          <span>&#x2022;</span>
          <p>{formatDistanceToNow(reply.createdAt)} ago</p>
        </div>
        <p className="py-1">{reply.message}</p>
      </div>
    </section>
  );
};
