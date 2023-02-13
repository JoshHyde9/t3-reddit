import { useDescription, useTsController } from "@ts-react/form";

export const CheckBoxField = () => {
  const { field, error } = useTsController<string>();
  const { label } = useDescription();

  return (
    <div className="my-1 flex gap-x-4">
      <label className="mb-2 block text-xs font-extrabold uppercase tracking-wide">
        {label}
      </label>
      <div className="flex h-fit flex-col">
        <input
          onChange={(e) => {
            field.onChange(e.target.value);
          }}
          value={field.value ? field.value : ""}
          type="checkbox"
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
