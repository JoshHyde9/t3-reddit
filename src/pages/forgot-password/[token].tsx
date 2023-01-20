import { type NextPage } from "next";
import { signIn } from "next-auth/react";
import { type z } from "zod";

import { api } from "../../utils/api";
import { forgotPassword } from "../../utils/schema";

import { Form } from "../../components/Form";

export const ForgotPassword: NextPage<{ token: string }> = ({ token }) => {
  const {
    data: returnedUser,
    mutate: changePassword,
    error,
    isLoading,
    isSuccess,
  } = api.user.changePassword.useMutation();

  const handleSubmit = async (data: z.infer<typeof forgotPassword>) => {
    changePassword({ token, newPassword: data.newPassword });

    if (isSuccess) {
      await signIn("credentials", {
        username: returnedUser.username,
        password: data.newPassword,
        redirect: true,
        callbackUrl: "/",
      });
    }
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

ForgotPassword.getInitialProps = ({ query }) => {
  return {
    token: query.token as string,
  };
};

export default ForgotPassword;
