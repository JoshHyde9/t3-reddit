import type { FunctionComponent } from "react";
import { useState } from "react";
import { useAutoAnimate } from "@formkit/auto-animate/react";

type ShareBtnProps = {
  url: string;
};

export const ShareBtn: FunctionComponent<ShareBtnProps> = ({ url }) => {
  const [show, setShow] = useState(false);

  const [animationParent] = useAutoAnimate({
    disrespectUserMotionPreference: true,
  });

  return (
    <div ref={animationParent} className="relative inline-block">
      {show && (
        <span className="absolute -left-10 -top-2 w-48 -translate-y-full rounded-lg bg-neutral-200 px-2 py-1 text-center text-sm group-hover:flex">
          Copied to clipboard
        </span>
      )}
      <button
        className="flex items-center gap-x-1"
        onClick={async () => {
          await navigator.clipboard.writeText(url);
          setShow(true);

          setTimeout(() => {
            setShow(false);
          }, 3000);
        }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          className="h-5 w-5 fill-none stroke-black stroke-2"
        >
          <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path>
          <polyline points="16 6 12 2 8 6"></polyline>
          <line x1="12" y1="2" x2="12" y2="15"></line>
        </svg>
        Share
      </button>
    </div>
  );
};
