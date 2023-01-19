import { type NextPage } from "next";
import { useRouter } from "next/router";
import { type z } from "zod";

import { api } from "../utils/api";
import { registerUser } from "../utils/schema";

import { Form } from "../components/Form";
import { signIn } from "next-auth/react";

const Register: NextPage = () => {
  const router = useRouter();

  const {
    mutate: mutateRegisterUser,
    error,
    isLoading,
  } = api.user.register.useMutation({
    onSuccess: async (_, { username, password }) => {
      await signIn("credentials", {
        username,
        password,
        redirect: true,
        callbackUrl: "/",
      });

      await router.push("/");
    },
  });

  const handleRegister = (data: z.infer<typeof registerUser>) => {
    mutateRegisterUser(data);
  };

  return (
    <div className="mx-auto max-w-prose">
      <Form
        className="flex flex-col"
        onSubmit={handleRegister}
        schema={registerUser}
        buttonMessage="Register"
        globalError={error?.message}
        isLoading={isLoading}
      />
    </div>
  );
};

export default Register;
