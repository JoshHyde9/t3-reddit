import type { Post } from "@prisma/client";
import Link from "next/link";
import { Voting } from "./Voting";

export const PostCard = ({
  post,
  voteStatus,
}: {
  post: Post & {
    votes?:
      | {
          value: number;
          postId: string;
        }[]
      | undefined;
    _count: {
      comments: number;
    };
    creator: {
      username: string;
    };
  };
  voteStatus: { value: number; postId: string } | undefined;
}) => (
  <article className="my-4 flex flex-row gap-2 rounded-md border">
    <Voting points={post.points} postId={post.id} voteStatus={voteStatus} />
    <Link href={`/post/${post.id}`} className="flex-auto">
      <div className="p-1 pr-2">
        <span className="text-sm">u/{post.creator.username}</span>
        <h1 className="text-lg font-semibold">{post.title}</h1>
        <p className="pt-2">{post.text}</p>
        <div className="mt-2 ml-2 flex gap-x-2">
          {post._count && <p>{post._count.comments} Comments</p>}
        </div>
      </div>
    </Link>
  </article>
);
