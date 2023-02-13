/* eslint-disable @typescript-eslint/no-explicit-any */
import { createTsForm } from "@ts-react/form";
import { type FunctionComponent } from "react";
import { z, type ZodType, type AnyZodObject } from "zod";

import { TextField } from "./TextField";
import { TextAreaField } from "./TextAreaField";
import {
  fileInputSchema,
  optionalTextAreaSchema,
  textAreaSchema,
} from "../utils/schema";
import { FileInput } from "./FileInput";
import { CheckBoxField } from "./CheckBoxField";

const mapping = [
  [z.string(), TextField] as const,
  [z.boolean(), CheckBoxField] as const,
  [textAreaSchema, TextAreaField] as const,
  [optionalTextAreaSchema, TextAreaField] as const,
  [fileInputSchema, FileInput] as const,
] as const;

const CreateForm = createTsForm(mapping);

type SchemaType = ZodType<any, any, any>;

type FormProps = {
  className: string;
  schema: (SchemaType & z.ZodEffects<any, any, any>) | AnyZodObject;
  onSubmit: (values: z.TypeOf<SchemaType>) => void;
  buttonMessage: string;
  globalError?: string;
  isLoading: boolean;
  image?: React.ReactNode;
  initialData?: Record<string, string | boolean>;
};

export const Form: FunctionComponent<FormProps> = ({
  className,
  schema,
  onSubmit,
  buttonMessage,
  globalError: errorResponse,
  isLoading,
  image,
  initialData,
}) => {
  return (
    <CreateForm
      onSubmit={onSubmit}
      schema={schema}
      defaultValues={initialData}
      formProps={{ className }}
      renderAfter={() => (
        <>
          {image && <div className="flex justify-center">{image}</div>}
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
