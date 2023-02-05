import type { Post } from "@prisma/client";
import formatDistanceToNow from "date-fns/formatDistanceToNow";
import Image from "next/image.js";
import Link from "next/link";
import { env } from "../../env/client.mjs";
import { ShareBtn } from "./ShareBtn";
import { Voting } from "./Voting";

export const PostCard = ({
  post,
  voteStatus,
}: {
  post: Post & {
    _count: {
      comments: number;
    };
    votes?:
      | {
          value: number;
          postId: string;
        }[]
      | undefined;
    creator: {
      username: string;
    };
  };
  voteStatus: { value: number; postId: string } | undefined;
}) => (
  <article className="my-4 flex flex-row gap-2 rounded-md border">
    <Voting points={post.points} postId={post.id} voteStatus={voteStatus} />
    <div className="w-full">
      <div className="p-1 pr-2">
        <div className="mb-2 flex items-center gap-x-1 text-xs">
          <Link href={`/r/${post.subName}`} className="hover:underline">
            <p className="text-sm font-semibold">r/{post.subName}</p>
          </Link>
          <span className="mx-1 font-thin">&#x2022;</span>
          <p>
            Posted by{" "}
            <Link
              className="hover:underline"
              href={`/user/${post.creator.username}`}
            >
              u/{post.creator.username}
            </Link>
          </p>
          <p>{formatDistanceToNow(post.createdAt)} ago</p>
        </div>
        <Link href={`/r/${post.subName}/${post.id}`}>
          <h1 className="text-lg font-semibold">{post.title}</h1>
          {post.text ? (
            <p className="pt-2">{post.text}</p>
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
        </Link>
      </div>
      <div className="my-2 ml-2 flex items-center gap-x-2">
        <p>
          {post._count.comments}{" "}
          {post._count.comments === 1 ? "Comment" : "Comments"}
        </p>
        <ShareBtn url={`${env.NEXT_PUBLIC_URL}/r/${post.subName}/${post.id}`} />
      </div>
    </div>
  </article>
);
