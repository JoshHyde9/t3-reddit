import type { ChangeEvent } from "react";
import { useRef } from "react";
import { useDescription, useTsController } from "@ts-react/form";

export const TextAreaField = () => {
  const { field, error } = useTsController<string>();
  const { label, placeholder } = useDescription();

  const ref = useRef<HTMLTextAreaElement>(null);

  const handleInput = (e: ChangeEvent<HTMLTextAreaElement>) => {
    if (ref.current) {
      ref.current.style.height = "auto";
      ref.current.style.height = `${e.target.scrollHeight - 16}px`;
    }
  };

  return (
    <div className="my-1">
      <label className="mb-2 block text-xs font-extrabold uppercase tracking-wide">
        {label}
      </label>
      <div className="flex h-fit flex-col">
        <textarea
          ref={ref}
          value={field.value ? field.value : ""}
          className="min-h-[100px] w-full appearance-none rounded-md border-2 border-teal-600 p-2 leading-tight transition-colors duration-300 ease-in-out focus:border-teal-500 focus:outline-none"
          placeholder={placeholder}
          rows={1}
          onInput={handleInput}
          onChange={(e) => {
            field.onChange(e.target.value);
          }}
        />

        <div className="h-5">
          <span
            className={`text-sm italic${error?.errorMessage ? "" : "hidden"}`}
          >
            {error?.errorMessage}
          </span>
        </div>
      </div>
    </div>
  );
};
