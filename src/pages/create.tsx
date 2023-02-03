import type { NextPage } from "next";
import type { z } from "zod";

import { api } from "../utils/api";
import { createSubSchema } from "../utils/schema";

import { useIsAuth } from "../hooks/useIsAuth";

import { Form } from "../components/Form";
import { useRouter } from "next/router";

const CreateSub: NextPage = () => {
  useIsAuth();

  const router = useRouter();

  const {
    mutate: createSub,
    isLoading: isCreateSubLoading,
    error,
  } = api.sub.createSub.useMutation({
    onSettled: async (data) => {
      if (data) {
        await router.replace(`/r/${data.name}`);
      }
    },
  });

  const handleCreateSub = (data: z.infer<typeof createSubSchema>) => {
    createSub(data);
  };

  return (
    <section className="mx-auto max-w-prose">
      <Form
        className="flex flex-col"
        schema={createSubSchema}
        onSubmit={handleCreateSub}
        isLoading={isCreateSubLoading}
        globalError={error?.message}
        buttonMessage="Create Community"
      />
    </section>
  );
};

export default CreateSub;
