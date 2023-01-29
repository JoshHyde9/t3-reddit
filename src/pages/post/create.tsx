import { type NextPage } from "next";

import { api } from "../../utils/api";
import { CreatePost, createPostSchema } from "../../utils/schema";

import { Form } from "../../components/Form";
import { useRouter } from "next/router";
import { useIsAuth } from "../../hooks/useIsAuth";

const CreatePost: NextPage = () => {
  useIsAuth();

  const router = useRouter();

  const {
    mutate: createPostMutation,
    isLoading,
    error,
  } = api.post.createPost.useMutation({
    onSuccess: async ({ id }) => {
      await router.replace(`/post/${id}`);
    },
  });

  const onSubmit = (data: CreatePost) => {
    createPostMutation({
      title: data.title,
      text: data.text,
      subName: data.subName,
    });
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
