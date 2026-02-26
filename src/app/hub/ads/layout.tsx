import { AdsNav } from "./_components/AdsNav";

export default function AdsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-6">
      <AdsNav />
      {children}
    </div>
  );
}
