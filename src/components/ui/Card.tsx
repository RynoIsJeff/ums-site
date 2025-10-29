export default function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-black/[0.06] bg-white shadow-[0_8px_30px_rgba(3,3,3,0.06)] p-6">
      {children}
    </div>
  );
}
