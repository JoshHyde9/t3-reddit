import { useTsController } from "@ts-react/form";

export const FileInput = () => {
  const { field, error } = useTsController<string>();
  return (
    <>
      <input
        type="file"
        accept="image/jpeg image/png"
        value={field.value ? field.value : ""} // conditional to prevent "uncontrolled to controlled" react warning
        onChange={(e) => {
          field.onChange(e.target.value);
        }}
      />
      {error?.errorMessage && <span>{error?.errorMessage}</span>}
    </>
  );
};
