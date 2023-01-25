/* eslint-disable @typescript-eslint/no-explicit-any */
import type { FunctionComponent } from "react";
import type { AnyZodObject, z, ZodType } from "zod";
import { Form } from "../Form";

type SchemaType = ZodType<any, any, any>;

type DefaultProps = {
  schema: (SchemaType & z.ZodEffects<any, any, any>) | AnyZodObject;
  onSubmit: (values: z.TypeOf<SchemaType>) => void;
  isLoading: boolean;
};

type ReplyEditProps =
  | (DefaultProps & { editing: true; commentUsername?: never })
  | (DefaultProps & { editing?: never; commentUsername: string });

export const ReplyEdit: FunctionComponent<ReplyEditProps> = ({
  isLoading,
  onSubmit,
  schema,
  editing,
  commentUsername,
}) => {
  return (
    <section className="m-2 border-l-2 border-gray-300">
      <div className="ml-4">
        <h1>{editing ? "Edit your comment" : `Reply to ${commentUsername}`}</h1>
        <Form
          className="flex flex-col"
          onSubmit={onSubmit}
          schema={schema}
          isLoading={isLoading}
          buttonMessage={editing ? "Edit comment" : "Create reply"}
        />
      </div>
    </section>
  );
};
