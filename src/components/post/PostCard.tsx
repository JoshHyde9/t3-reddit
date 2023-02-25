import type { Post } from "@prisma/client";
import { useState } from "react";
import formatDistanceToNow from "date-fns/formatDistanceToNow";
import Image from "next/image.js";
import Link from "next/link";
import { useSession } from "next-auth/react";

import { api } from "../../utils/api";

import { env } from "../../env/client.mjs";

import { ShareBtn } from "./ShareBtn";
import { Voting } from "./Voting";
import { Modal } from "../layout/Modal";

export const PostCard = ({
  post,
  subModerators,
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
  subModerators?: {
    username: string;
  }[];
  voteStatus: { value: number; postId: string } | undefined;
}) => {
  const { data: session } = useSession();
  const utils = api.useContext();
  const [showModal, setShowModal] = useState(false);

  const { mutate: promoteUserToMod } = api.sub.promoteToMod.useMutation({
    onSettled: async () => {
      setShowModal(false);
      await utils.sub.invalidate();
    },
  });

  const isLoggedInUserMod = subModerators?.some(
    (moderator) => moderator.username === session?.user.username
  );

  return (
    <>
      {showModal && (
        <Modal
          title="Promote User to Mod?"
          message={`Are you sure you want to promote ${post.creator.username} to a ${post.subName} moderator? This cannot be undone (for now.)`}
          showModal={showModal}
          setShowModal={setShowModal}
          functionParams={{
            username: post.creator.username,
            subName: post.subName,
          }}
          handleFunction={promoteUserToMod}
        />
      )}

      <article className="my-4 flex flex-row gap-2 rounded-md border">
        <Voting points={post.points} postId={post.id} voteStatus={voteStatus} />
        <div className="w-full">
          <div className="p-1 pr-2">
            <div className="mb-2 flex items-center gap-x-1 text-xs">
              <Link href={`/r/${post.subName}`} className="hover:underline">
                <p className="text-sm font-semibold">r/{post.subName}</p>
              </Link>
              <span className="font-thin md:mx-1">&#x2022;</span>
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
              {post.nsfw && (
                <>
                  <span className="font-thin md:mx-1">&#x2022;</span>
                  <p className="rounded-md border-2 border-nsfw px-1 text-nsfw">
                    nsfw
                  </p>
                </>
              )}
            </div>
            <Link href={`/r/${post.subName}/${post.id}`}>
              <h1 className="text-lg font-semibold">{post.title}</h1>
              {post.text ? (
                <p className="pt-2">{post.text}</p>
              ) : (
                <div className="relative flex justify-center">
                  {post.nsfw && (
                    <div className="absolute h-full w-full backdrop-blur-2xl"></div>
                  )}
                  <Image
                    className="h-auto w-auto pt-2"
                    src={`https://t3redditclone.s3.ap-southeast-2.amazonaws.com/${
                      post.image as string
                    }`}
                    alt="post image"
                    width={500}
                    height={500}
                  />
                </div>
              )}
            </Link>
          </div>
          <div className="m-2 flex items-center gap-x-2">
            <p>
              {post._count.comments}{" "}
              {post._count.comments === 1 ? "Comment" : "Comments"}
            </p>
            <ShareBtn
              url={`${env.NEXT_PUBLIC_URL}/r/${post.subName}/${post.id}`}
            />
            {isLoggedInUserMod && (
              <div className="ml-auto">
                <button onClick={() => setShowModal(true)}>
                  Promote to moderator
                </button>
              </div>
            )}
          </div>
        </div>
      </article>
    </>
  );
};
