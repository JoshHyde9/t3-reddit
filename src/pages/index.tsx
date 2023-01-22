import { type NextPage } from "next";
import Head from "next/head";
import React from "react";
import { PostCard } from "../components/PostCard";

import { api } from "../utils/api";

const Home: NextPage = () => {
  const { data, isLoading, fetchNextPage } = api.post.getAll.useInfiniteQuery(
    { limit: 10 },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
      refetchOnWindowFocus: false,
    }
  );

  return (
    <>
      <Head>
        <title>Create T3 App</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="mx-auto min-h-screen max-w-prose pb-10">
        <div>
          {isLoading && <p>Loading...</p>}
          {data &&
            data.pages.map((posts) => (
              <React.Fragment key="posts">
                {posts.items.map((post) => (
                  <PostCard key={post.id} post={post} />
                ))}
              </React.Fragment>
            ))}
        </div>
        {!isLoading && (
          <div className="flex justify-center">
            <button
              onClick={() => fetchNextPage()}
              className="rounded-md bg-teal-600 py-2 px-4 text-white duration-300 hover:bg-teal-500"
            >
              Load more
            </button>
          </div>
        )}
      </main>
    </>
  );
};

export default Home;
