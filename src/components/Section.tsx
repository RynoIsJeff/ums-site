export default function Section({
  children,
  className = "",
}: { children: React.ReactNode; className?: string }) {
  return (
    <section className={`bg-white ums-bg-glow py-16 md:py-24 ${className}`}>
      <div className="ums-stripe mb-10" />
      {children}
    </section>
  );
}
