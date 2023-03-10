import { type NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import React from "react";
import { LoadingSpinner } from "../components/layout/LoadingSpinner";
import { PostCard } from "../components/post/PostCard";

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
      <main className="mx-auto flex max-w-5xl justify-between gap-x-7 px-2 pb-10 lg:px-0">
        <section className="w-full">
          {isLoading && !data ? <LoadingSpinner /> : null}
          {data?.pages.map((pages, i) => (
            <React.Fragment key={i}>
              {pages.items.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  voteStatus={post.votes?.find(
                    (status) => post.id === status.postId
                  )}
                />
              ))}
            </React.Fragment>
          ))}
          {!isLoading && data?.pages[0] ? (
            <div className="flex justify-center">
              <button
                onClick={() => fetchNextPage()}
                className="rounded-md bg-teal-600 py-2 px-4 text-white duration-300 hover:bg-teal-500"
              >
                Load more
              </button>
            </div>
          ) : null}
        </section>
        <section className="my-4 hidden h-fit max-w-[312px] rounded-md border p-4 text-sm md:block">
          <h1 className="mb-2 text-base font-semibold">All</h1>
          <p>
            The most active posts from all of Reddit. Come here to see new posts
            rising and be a part of the conversation.
          </p>
          <hr className="my-4" />
          <div className="flex flex-col gap-y-2 text-center">
            <Link
              href="/post/create"
              className="rounded-full bg-teal-600 py-2 text-white duration-300 hover:bg-teal-500"
            >
              Create Post
            </Link>
            <Link
              href="/create"
              className="rounded-full border-2 border-teal-600 py-2 text-teal-600 duration-300 hover:border-teal-500 hover:text-teal-500"
            >
              Create Community
            </Link>
          </div>
        </section>
      </main>
    </>
  );
};

export default Home;
