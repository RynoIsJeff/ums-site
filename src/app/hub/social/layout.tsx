import { SocialNav } from "./_components/SocialNav";

export default function SocialLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-6">
      <SocialNav />
      {children}
    </div>
  );
}
