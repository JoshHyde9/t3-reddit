import { type NextPage } from "next";
import { type z } from "zod";
import { signIn } from "next-auth/react";
import { useRouter } from "next/router";

import { api } from "../../utils/api";
import { forgotPassword } from "../../utils/schema";

import { Form } from "../../components/Form";

export const ForgotPassword: NextPage = () => {
  const router = useRouter();

  const { token } = router.query;

  const {
    mutate: changePassword,
    error,
    isLoading,
  } = api.user.changePassword.useMutation({
    onSuccess: async ({ username }, { newPassword }) => {
      await signIn("credentials", {
        username: username,
        password: newPassword,
        redirect: true,
        callbackUrl: "/",
      });
    },
  });

  const handleSubmit = (data: z.infer<typeof forgotPassword>) => {
    changePassword({
      token: typeof token === "string" ? token : "",
      newPassword: data.newPassword,
    });
  };

  return (
    <div className="mx-auto max-w-prose">
      <Form
        className="flex flex-col"
        schema={forgotPassword}
        isLoading={isLoading}
        onSubmit={handleSubmit}
        buttonMessage="Update my password"
        globalError={error?.message}
      />
    </div>
  );
};

export default ForgotPassword;
