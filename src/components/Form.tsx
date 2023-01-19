/* eslint-disable @typescript-eslint/no-explicit-any */
import { createTsForm } from "@ts-react/form";
import { type FunctionComponent } from "react";
import { z, type ZodType, type AnyZodObject } from "zod";

import { TextField } from "./TextField";

const mapping = [[z.string(), TextField]] as const;
const CreateForm = createTsForm(mapping);

type SchemaType = ZodType<any, any, any>;

type FormProps = {
  className: string;
  schema: (SchemaType & z.ZodEffects<any, any, any>) | AnyZodObject;
  onSubmit: (values: z.TypeOf<SchemaType>) => void;
  buttonMessage: string;
};

export const Form: FunctionComponent<FormProps> = ({
  className,
  schema,
  onSubmit,
  buttonMessage,
}) => {
  return (
    <CreateForm
      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      onSubmit={onSubmit}
      schema={schema}
      formProps={{ className: className }}
      renderAfter={() => <button type="submit">{buttonMessage}</button>}
    />
  );
};
