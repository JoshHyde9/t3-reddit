export const NotFound = ({ message }: { message: string }) => (
  <div className="mx-auto my-4 flex max-w-5xl flex-col items-center rounded-md border p-3">
    <h1 className="mb-2 text-2xl font-semibold">{message}</h1>
    {message.includes("result") && (
      <p>Double-check your spelling or try different keywords.</p>
    )}
  </div>
);
