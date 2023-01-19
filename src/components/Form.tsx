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
  globalError?: string;
  isLoading: boolean;
};

export const Form: FunctionComponent<FormProps> = ({
  className,
  schema,
  onSubmit,
  buttonMessage,
  globalError: errorResponse,
  isLoading,
}) => {
  return (
    <CreateForm
      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      onSubmit={onSubmit}
      schema={schema}
      formProps={{ className }}
      renderAfter={() => (
        <>
          <div className="my-1 h-5">
            {errorResponse && (
              <p className={`${errorResponse ? "text-sm italic" : "hidden"}`}>
                {errorResponse}
              </p>
            )}
          </div>
          <button
            type="submit"
            className={`rounded-md bg-teal-600 py-2 text-white duration-300 hover:bg-teal-500${
              !isLoading ? "" : " bg-teal-300 disabled:cursor-not-allowed"
            }`}
          >
            {buttonMessage}
          </button>
        </>
      )}
    />
  );
};
