import { PendingSubmitButton } from "@/app/hub/_components/PendingSubmitButton";

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
      <PendingSubmitButton className="rounded-md border border-transparent bg-(--primary) px-4 py-2 text-sm font-medium text-white hover:opacity-95">
        Apply
      </PendingSubmitButton>
    </form>
  );
}
