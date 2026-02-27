type FilterFormProps = {
  children: React.ReactNode;
  basePath: string;
};

export function FilterForm({ children, basePath }: FilterFormProps) {
  return (
    <form
      method="get"
      action={basePath}
      className="flex flex-wrap items-end gap-4 rounded-lg border border-(--hub-border-light) bg-white p-4"
    >
      <input type="hidden" name="page" value="1" />
      {children}
      <button
        type="submit"
        className="rounded-md bg-(--primary) px-4 py-2 text-sm font-medium text-white hover:opacity-90"
      >
        Apply
      </button>
    </form>
  );
}
