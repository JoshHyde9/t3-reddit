import type { NextPage } from "next";
import type { z } from "zod";
import type { SubmitHandler } from "react-hook-form";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { api } from "../../utils/api";
import {
  type createPostSchema,
  createTextPostSchema,
  createImagePostSchema,
  type CreateImagePostSchema,
} from "../../utils/schema";

import { useIsAuth } from "../../hooks/useIsAuth";

import { Form } from "../../components/Form";
import { useOutsideAlerter } from "../../hooks/useOutsideAlerter";

type S3Upload = {
  uploadUrl: string;
  key: string;
};

const isImage = (fileType: string) => {
  console.log(fileType);

  return !!fileType.match("image/*");
};

const CreatePost: NextPage = () => {
  useIsAuth();

  const [postType, setPostType] = useState<"text" | "image">("text");
  const [globalError, setGlobalError] = useState<string | null>(null);
  const router = useRouter();
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CreateImagePostSchema>({
    resolver: zodResolver(createImagePostSchema),
  });

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

  const handleImagePost: SubmitHandler<CreateImagePostSchema> = async (
    formValues
  ) => {
    const { image, nsfw, subName, title } = formValues;

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const validFileType = isImage(image[0]!.type);

    if (!validFileType) {
      return setGlobalError("Unsupported file type.");
    }

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const fileType = encodeURIComponent(image[0]!.type);

    const response = await fetch(`/api/media?fileType=${fileType}`);

    if (!response.ok) {
      return setGlobalError("Server error, please try again.");
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const data: S3Upload = await response.json();

    await fetch(data.uploadUrl, {
      method: "PUT",
      body: image[0],
    });

    createPostMutation({
      subName,
      title,
      image: data.key,
      nsfw: !!nsfw,
    });
  };

  const onSubmit = (data: z.infer<typeof createPostSchema>) => {
    createPostMutation({
      title: data.title,
      text: data.text,
      subName: data.subName,
      nsfw: !!data.nsfw,
    });
  };

  const subName = watch("subName");

  useEffect(() => {
    if (!subName || subName.trim() === "") return;

    const getData = setTimeout(() => {
      searchSubs({ searchTerm: subName });
    }, 2000);

    return () => {
      clearTimeout(getData);
      setDropDown(true);
    };
  }, [searchSubs, subName]);

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
        <form
          className="flex flex-col"
          onSubmit={handleSubmit(handleImagePost)}
        >
          <div className="mb-2">
            <label
              htmlFor="title"
              className="my-2 block text-xs font-extrabold uppercase tracking-wide"
            >
              Title:
            </label>
            <input
              className="w-full appearance-none rounded-md border-2 border-teal-600 p-2 leading-tight transition-colors duration-300 ease-in-out focus:border-teal-500 focus:outline-none"
              type="text"
              placeholder="Title..."
              {...register("title", { required: true })}
            />
            <div className="h-5">
              <span className={`text-sm italic${errors.title ? "" : "hidden"}`}>
                {errors.title?.message}
              </span>
            </div>
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
              {...register("image", { required: true })}
            />
            <div className="h-5">
              <span className={`text-sm italic${errors.image ? "" : "hidden"}`}>
                {errors.image?.message}
              </span>
            </div>
          </div>
          <div className="my-2">
            <label
              className="my-2 block text-xs font-extrabold uppercase tracking-wide"
              htmlFor="Community"
            >
              Community:
            </label>
            <input
              autoComplete="off"
              className="w-full appearance-none rounded-md border-2 border-teal-600 p-2 leading-tight transition-colors duration-300 ease-in-out focus:border-teal-500 focus:outline-none"
              type="text"
              placeholder="KitchenConfidential"
              {...register("subName", { required: true })}
            />
            <div className="h-5">
              <span
                className={`text-sm italic${errors.subName ? "" : "hidden"}`}
              >
                {errors.subName?.message}
              </span>
            </div>
            {dropDown && (
              <div
                onClick={() => setDropDown(false)}
                className="absolute z-10 w-full max-w-prose -translate-y-5 rounded-md rounded-t-none border-2 border-teal-600 bg-white px-2 pt-4"
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
                          <p onClick={() => setValue("subName", sub.name)}>
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

          <div className="my-2 flex gap-x-4">
            <label
              className="my-2 block text-xs font-extrabold uppercase tracking-wide"
              htmlFor="nsfw"
            >
              NSFW:
            </label>
            <input type="checkbox" {...register("nsfw")} />
            <div className="h-5">
              <span className={`text-sm italic${errors.nsfw ? "" : "hidden"}`}>
                {errors.nsfw?.message}
              </span>
            </div>
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
