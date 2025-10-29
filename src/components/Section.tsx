export default function Section({
  children,
  className = "",
}: { children: React.ReactNode; className?: string }) {
  // Keep the blue glow everywhere, but no stripe here
  return (
    <section className={`bg-white ums-bg-glow py-16 md:py-24 ${className}`}>
      {children}
    </section>
  );
}
