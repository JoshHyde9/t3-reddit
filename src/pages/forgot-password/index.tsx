import { type NextPage } from "next";
import { type z } from "zod";

import { sendEmailSchema } from "../../utils/schema";

import { Form } from "../../components/Form";
import { api } from "../../utils/api";

const ForgotPassword: NextPage = () => {
  const {
    mutate: sendEmail,
    isLoading,
    isSuccess,
  } = api.user.forgotPassword.useMutation();

  const handleSubmit = (data: z.infer<typeof sendEmailSchema>) => {
    sendEmail({ email: data.email });
  };

  return (
    <div className="mx-auto max-w-prose">
      <Form
        className="flex flex-col"
        schema={sendEmailSchema}
        onSubmit={handleSubmit}
        isLoading={isLoading}
        buttonMessage="Change password"
      />
      {isSuccess && (
        <p className="mt-2">
          If an account with that email exists, we sent you an email.
        </p>
      )}
    </div>
  );
};

export default ForgotPassword;
