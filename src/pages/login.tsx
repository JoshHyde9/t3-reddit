import { type NextPage } from "next";
import { signIn } from "next-auth/react";
import { useRouter } from "next/router";
import { type z } from "zod";

import { loginUser } from "../utils/schema";

import { Form } from "../components/Form";
import { useState } from "react";

const Login: NextPage = () => {
  const router = useRouter();

  const [error, setError] = useState("");

  const handleLogin = async (data: z.infer<typeof loginUser>) => {
    const result = await signIn("credentials", {
      ...data,
      redirect: false,
      callbackUrl: "/",
    });

    if (result?.error) {
      setError("Invalid credentials.");
    } else {
      await router.push("/");
    }
  };

  return (
    <Form
      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      onSubmit={handleLogin}
      schema={loginUser}
      className="flex flex-col"
      buttonMessage="Login"
      globalError={error}
    />
  );
};

export default Login;
