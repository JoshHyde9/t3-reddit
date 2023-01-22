import type { Post } from "@prisma/client";

export const PostCard = ({ post }: { post: Post }) => (
  <div className="my-4 flex flex-col rounded-md border p-4">
    <h1 className="text-lg font-semibold">{post.title}</h1>
    <p className="pt-4">{post.text}</p>
  </div>
);
