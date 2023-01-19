import { type NextPage } from "next";
import { signIn } from "next-auth/react";
import { type z } from "zod";

import { loginUser } from "../utils/schema";

import { Form } from "../components/Form";

const Login: NextPage = () => {
  const handleLogin = async (data: z.infer<typeof loginUser>) => {
    await signIn("credentials", {
      ...data,
      redirect: true,
      callbackUrl: "/",
    });
  };

  return (
    <Form
      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      onSubmit={handleLogin}
      schema={loginUser}
      className="flex flex-col"
      buttonMessage="Login"
    />
  );
};

export default Login;
