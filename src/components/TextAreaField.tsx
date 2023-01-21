import { useDescription, useTsController } from "@ts-react/form";

export const TextAreaField = () => {
  const { field, error } = useTsController<string>();
  const { label, placeholder } = useDescription();

  return (
    <div className="my-1">
      <label>{label}</label>
      <div className="flex h-fit flex-col">
        <textarea
          value={field.value ? field.value : ""}
          className="w-full appearance-none rounded-md border-2 border-teal-600 p-2 leading-tight transition-colors duration-300 ease-in-out focus:border-teal-500 focus:outline-none"
          placeholder={placeholder}
          rows={4}
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