/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        upvote: "#ff4500",
        downvote: "#7193ff",
      },
    },
  },
  plugins: [],
};
