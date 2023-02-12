import type { NextPage } from "next";
import type { ChangeEvent } from "react";
import { useEffect } from "react";
import type { z } from "zod";

import { useState, useRef } from "react";
import { useRouter } from "next/router";

import { api } from "../../utils/api";
import {
  type createPostSchema,
  createTextPostSchema,
} from "../../utils/schema";

import { useIsAuth } from "../../hooks/useIsAuth";

import { Form } from "../../components/Form";
import { useOutsideAlerter } from "../../hooks/useOutsideAlerter";

type S3Upload = {
  uploadUrl: string;
  key: string;
};

type ImageForm = {
  title: string;
  image: string;
  subName: string;
};

const isImage = (fileType: string) => {
  return !!fileType.match("image/*");
};

const CreatePost: NextPage = () => {
  useIsAuth();

  const [postType, setPostType] = useState<"text" | "image">("text");
  const [fields, setFields] = useState<{ subName: string; title: string }>({
    subName: "",
    title: "",
  });
  const [globalError, setGlobalError] = useState<string | null>(null);
  const router = useRouter();

  const [dropDown, setDropDown] = useState(false);

  const wrapperRef = useRef<HTMLInputElement>(null);
  useOutsideAlerter(wrapperRef, setDropDown);

  const {
    mutate: createPostMutation,
    isLoading,
    error,
  } = api.post.createPost.useMutation({
    onSuccess: async ({ id, subName }) => {
      await router.replace(`/r/${subName}/${id}`);
    },
  });

  const { mutate: searchSubs, data } = api.search.searchSubs.useMutation();

  const handleImagePost = async (event: ChangeEvent<HTMLFormElement>) => {
    event.preventDefault();

    const formData = new FormData(event.target);

    const image = formData.get("image") as File;
    const subName = formData.get("subName") as string;
    const title = formData.get("title") as string;

    if (image.size === 0) {
      return setGlobalError("Please select an image.");
    }

    if (!title || title.trim().length <= 0) {
      return setGlobalError("Title is required.");
    }

    if (!subName || subName.trim().length <= 0) {
      return setGlobalError("Community is required");
    }

    const validFileType = isImage(image.type);

    if (!validFileType) {
      return setGlobalError("Unsupported file type.");
    }

    const fileType = encodeURIComponent(image.type);

    const response = await fetch(`/api/media?fileType=${fileType}`);

    if (!response.ok) {
      return setGlobalError("Server error, please try again.");
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const data: S3Upload = await response.json();

    await fetch(data.uploadUrl, {
      method: "PUT",
      body: image,
    });

    createPostMutation({
      subName,
      title,
      image: data.key,
    });
  };

  const onSubmit = (data: z.infer<typeof createPostSchema>) => {
    createPostMutation({
      title: data.title,
      image: data.image,
      text: data.text,
      subName: data.subName,
    });
  };

  const handleFieldChange = (event: ChangeEvent<HTMLInputElement>) => {
    setFields((prevValue) => {
      return {
        ...prevValue,
        [event.target.name as keyof ImageForm]: event.target.value,
      };
    });
  };

  useEffect(() => {
    if (fields.subName.trim() === "") return;

    const getData = setTimeout(() => {
      searchSubs({ searchTerm: fields.subName });
    }, 2000);

    return () => {
      clearTimeout(getData);
      setDropDown(true);
    };
  }, [fields.subName, searchSubs]);

  return (
    <div className="mx-auto max-w-prose">
      <div className="flex justify-around">
        <button
          className={`w-1/4 py-2  duration-300 ${
            postType === "text"
              ? "border-b-2 border-teal-600"
              : "border-b-2 border-white hover:border-teal-500"
          }`}
          onClick={() => setPostType("text")}
        >
          Text
        </button>
        <button
          className={`w-1/4 py-2  duration-300 ${
            postType === "image"
              ? "border-b-2 border-teal-600"
              : "border-b-2 border-white hover:border-teal-500"
          }`}
          onClick={() => setPostType("image")}
        >
          Image
        </button>
      </div>
      {postType === "text" ? (
        <Form
          schema={createTextPostSchema}
          onSubmit={onSubmit}
          isLoading={isLoading}
          globalError={error?.message}
          className="flex flex-col"
          buttonMessage="Create post"
        />
      ) : (
        <form className="flex flex-col" onSubmit={handleImagePost}>
          <div className="mb-2">
            <label
              htmlFor="title"
              className="my-2 block text-xs font-extrabold uppercase tracking-wide"
            >
              Title:
            </label>
            <input
              value={fields.title}
              onChange={handleFieldChange}
              className="w-full appearance-none rounded-md border-2 border-teal-600 p-2 leading-tight transition-colors duration-300 ease-in-out focus:border-teal-500 focus:outline-none"
              type="text"
              placeholder="Title..."
              name="title"
            />
          </div>
          <div className="my-2">
            <label
              className="my-2 block text-xs font-extrabold uppercase tracking-wide"
              htmlFor="image"
            >
              Image:
            </label>
            <input
              className="w-full appearance-none rounded-md border-2 border-teal-600 p-2 leading-tight transition-colors duration-300 ease-in-out focus:border-teal-500 focus:outline-none"
              accept="image/jpeg, image/png"
              type="file"
              name="image"
            />
          </div>
          <div className="my-2">
            <label
              className="my-2 block text-xs font-extrabold uppercase tracking-wide"
              htmlFor="Community"
            >
              Community:
            </label>
            <input
              value={fields.subName}
              onChange={handleFieldChange}
              autoComplete="off"
              className="w-full appearance-none rounded-md border-2 border-teal-600 p-2 leading-tight transition-colors duration-300 ease-in-out focus:border-teal-500 focus:outline-none"
              type="text"
              placeholder="KitchenConfidential"
              name="subName"
            />
            {dropDown && (
              <div
                onClick={() => setDropDown(false)}
                className="absolute z-10 w-full max-w-prose rounded-md rounded-t-none border-2 border-teal-600 bg-white px-2 pt-4"
                ref={wrapperRef}
              >
                {!data?.subs ? (
                  <h1 className="py-2 font-semibold">No results found</h1>
                ) : (
                  <>
                    <h1 className="font-semibold">Communities</h1>
                    <hr className="my-2" />
                    <div>
                      {data.subs.map((sub, i) => (
                        <div key={i} className="cursor-pointer p-1">
                          <p
                            onClick={() =>
                              setFields({ ...fields, subName: sub.name })
                            }
                          >
                            r/{sub.name}
                          </p>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
          <div className="my-1 h-5">
            {error || globalError ? (
              <p
                className={`${
                  error || globalError ? "text-sm italic" : "hidden"
                }`}
              >
                {globalError ? globalError : error?.message}
              </p>
            ) : null}
          </div>
          <button className="mt-2 rounded-md bg-teal-600 py-2 text-white duration-300 hover:bg-teal-500">
            Create Post
          </button>
        </form>
      )}
    </div>
  );
};

export default CreatePost;
