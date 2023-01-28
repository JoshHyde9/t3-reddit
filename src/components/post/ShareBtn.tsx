import type { FunctionComponent } from "react";

type ShareBtnProps = {
  url: string;
};

export const ShareBtn: FunctionComponent<ShareBtnProps> = ({ url }) => (
  <button
    className="flex items-center gap-x-1"
    onClick={() => navigator.clipboard.writeText(url)}
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
);
