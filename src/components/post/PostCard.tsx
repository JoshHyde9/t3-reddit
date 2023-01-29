import type { Post } from "@prisma/client";
import Link from "next/link";
import { env } from "../../env/client.mjs";
import { ShareBtn } from "./ShareBtn";
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
    <div className="w-full">
      <Link href={`/r/${post.subName}/${post.id}`} className="flex-auto">
        <div className="p-1 pr-2">
          <span className="text-sm">u/{post.creator.username}</span>
          <h1 className="text-lg font-semibold">{post.title}</h1>
          <p className="pt-2">{post.text}</p>
        </div>
      </Link>
      <div className="my-2 ml-2 flex items-center gap-x-2">
        {post._count && <p>{post._count.comments} Comments</p>}
        <ShareBtn url={`${env.NEXT_PUBLIC_URL}/post/${post.id}`} />
      </div>
    </div>
  </article>
);
