import { type NextPage } from "next";
import { type z } from "zod";

import { api } from "../utils/api";
import { registerUser } from "../utils/schema";

import { Form } from "../components/Form";

const Register: NextPage = () => {
  const {
    mutate: mutateRegisterUser,
    error,
    isLoading,
  } = api.user.register.useMutation();

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
