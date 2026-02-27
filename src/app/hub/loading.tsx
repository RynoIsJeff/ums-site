export default function HubLoading() {
  return (
    <div className="hub-content__inner flex min-h-[200px] items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div
          className="h-8 w-8 animate-spin rounded-full border-2 border-(--primary) border-t-transparent"
          aria-hidden
        />
        <p className="text-sm text-(--ink)/60">Loading…</p>
      </div>
    </div>
  );
}
