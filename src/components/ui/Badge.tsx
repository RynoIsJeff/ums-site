export default function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-black/5 bg-black/[0.02] px-3 py-1 text-xs font-medium text-black/70">
      {children}
    </span>
  );
}
