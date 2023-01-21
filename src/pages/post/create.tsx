import { type NextPage } from "next";

import { api } from "../../utils/api";
import { CreatePost, createPostSchema } from "../../utils/schema";

import { Form } from "../../components/Form";
import { useRouter } from "next/router";

const CreatePost: NextPage = () => {
  const router = useRouter();
  const {
    mutate: createPostMutation,
    isLoading,
    error,
    data: createdPost,
  } = api.post.createPost.useMutation();

  const onSubmit = async (data: CreatePost) => {
    createPostMutation({ title: data.title, text: data.text });

    if (createdPost) {
      await router.replace(`/post/${createdPost.id}`);
    }
  };

  return (
    <div className="mx-auto max-w-prose">
      <Form
        schema={createPostSchema}
        onSubmit={onSubmit}
        isLoading={isLoading}
        globalError={error?.message}
        className="flex flex-col"
        buttonMessage="Create post"
      />
    </div>
  );
};

export default CreatePost;
