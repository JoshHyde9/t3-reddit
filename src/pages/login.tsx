import { type NextPage } from "next";
import { type z } from "zod";
import { signIn } from "next-auth/react";
import { useRouter } from "next/router";
import Link from "next/link";

import { loginUser } from "../utils/schema";

import { Form } from "../components/Form";
import { useState } from "react";

const Login: NextPage = () => {
  const router = useRouter();

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (data: z.infer<typeof loginUser>) => {
    setLoading(true);
    const result = await signIn("credentials", {
      ...data,
      redirect: false,
      callbackUrl: "/",
    });

    setLoading(false);

    if (result?.error) {
      setError("Invalid credentials.");
    } else if (typeof router.query.next === "string") {
      await router.replace(router.query.next);
    } else {
      await router.replace("/");
    }
  };

  return (
    <div className="mx-auto max-w-prose">
      <Form
        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        onSubmit={handleLogin}
        schema={loginUser}
        className="flex flex-col"
        buttonMessage="Login"
        globalError={error}
        isLoading={loading}
      />
      <div className="my-2 flex justify-between">
        <Link href="/forgot-password" className="hover:underline">
          Forgot password?
        </Link>
        <Link href="/register" className="hover:underline">
          Don&apos;t have an account?
        </Link>
      </div>
    </div>
  );
};

export default Login;
