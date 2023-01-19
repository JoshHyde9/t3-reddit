import { useDescription, useTsController } from "@ts-react/form";

export const TextField = () => {
  const { field, error } = useTsController<string>();
  const { label, placeholder } = useDescription();
  return (
    <>
      <label className="">{label}</label>
      <input
        value={field.value ? field.value : ""}
        className="my-2"
        placeholder={placeholder}
        type={placeholder?.includes("password") ? "password" : "text"}
        onChange={(e) => {
          field.onChange(e.target.value);
        }}
      />
      {error?.errorMessage && <span className="">{error?.errorMessage}</span>}
    </>
  );
};
