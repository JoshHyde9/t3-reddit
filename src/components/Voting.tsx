import type { FunctionComponent } from "react";
import { api } from "../utils/api";

type VotingProps = {
  points: number;
  postId: string;
};

export const Voting: FunctionComponent<VotingProps> = ({ points, postId }) => {
  const utils = api.useContext();
  const { mutate: vote } = api.post.vote.useMutation({
    onSettled: async () => {
      await utils.post.invalidate();
    },
  });
  return (
    <section className="flex flex-col items-center gap-y-px bg-neutral-50 p-1">
      <button onClick={() => vote({ postId, value: 1 })}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          className="h-6 cursor-pointer fill-none stroke-neutral-400 stroke-2 duration-300  hover:stroke-[#cc3700]"
        >
          <path d="M9 21V10H5l7-7 7 7h-4v11z"></path>
        </svg>
      </button>
      <p className="text-sm font-semibold">{points}</p>
      <button onClick={() => vote({ postId, value: -1 })}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          className="h-6 rotate-180 cursor-pointer fill-none stroke-neutral-400 stroke-2  duration-300 hover:stroke-[#5a75cc]"
        >
          <path d="M9 21V10H5l7-7 7 7h-4v11z"></path>
        </svg>
      </button>
    </section>
  );
};
