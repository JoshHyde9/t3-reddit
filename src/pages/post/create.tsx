import type { NextPage } from "next";
import type { ChangeEvent } from "react";
import { string, z } from "zod";
import { useState } from "react";

import { api } from "../../utils/api";
import {
  createImagePostSchema,
  createPostSchema,
  createTextPostSchema,
} from "../../utils/schema";

type S3Upload = {
  uploadUrl: string;
  key: string;
};

import { Form } from "../../components/Form";
import { useRouter } from "next/router";
import { useIsAuth } from "../../hooks/useIsAuth";

const CreatePost: NextPage = () => {
  useIsAuth();

  const [postType, setPostType] = useState<"text" | "image">("text");
  const [fields, setFields] = useState<{ subName: string; title: string }>({
    subName: "",
    title: "",
  });
  const router = useRouter();

  const {
    mutate: createPostMutation,
    isLoading,
    error,
  } = api.post.createPost.useMutation({
    onSuccess: async ({ id, subName }) => {
      await router.replace(`/r/${subName}/${id}`);
    },
  });

  const handleImagePost = async (event: ChangeEvent<HTMLFormElement>) => {
    event.preventDefault();

    const formData = new FormData(event.target);

    const image = formData.get("image") as string;
    const subName = formData.get("subName") as string;
    const title = formData.get("title") as string;

    if (!image || !subName || !title) {
      return null;
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const fileType = encodeURIComponent(image.type);

    const response = await fetch(`/api/media?fileType=${fileType}`);

    if (!response.ok) {
      return console.log("Something dun goofed");
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

  const handleFieldChange = (event) => {
    setFields((prevValue) => {
      return {
        ...prevValue,
        [event.target.name]: event.target.value,
      };
    });
  };

  return (
    <div className="mx-auto max-w-prose">
      <div className="flex justify-around">
        <h2 onClick={() => setPostType("text")}>Text</h2>
        <h2 onClick={() => setPostType("image")}>Image</h2>
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
          <label htmlFor="title">Title: </label>
          <input
            value={fields.title}
            onChange={handleFieldChange}
            className="w-full appearance-none rounded-md border-2 border-teal-600 p-2 leading-tight transition-colors duration-300 ease-in-out focus:border-teal-500 focus:outline-none"
            type="text"
            name="title"
          />
          <input
            className="my-2"
            accept="image/jpeg image/png"
            type="file"
            name="image"
          />
          <label htmlFor="Community">Community: </label>
          <input
            value={fields.subName}
            onChange={handleFieldChange}
            className="w-full appearance-none rounded-md border-2 border-teal-600 p-2 leading-tight transition-colors duration-300 ease-in-out focus:border-teal-500 focus:outline-none"
            type="text"
            name="subName"
          />
          <button className="mt-2 rounded-md bg-teal-600 py-2 text-white duration-300 hover:bg-teal-500">
            Create Post
          </button>
        </form>
      )}
    </div>
  );
};

export default CreatePost;
