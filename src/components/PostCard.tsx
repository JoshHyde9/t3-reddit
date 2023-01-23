import type { Post } from "@prisma/client";

export const PostCard = ({
  post,
}: {
  post: Post & {
    creator: {
      id: string;
      username: string;
      createdAt: Date;
    };
  };
}) => (
  <div className="my-4 flex flex-col rounded-md border p-4">
    <span className="text-sm">u/{post.creator.username}</span>
    <h1 className="text-lg font-semibold">{post.title}</h1>
    <p className="pt-4">{post.text}</p>
    <p>{post.points}</p>
  </div>
);
