export default function Section({
  children, className = "",
}: { children: React.ReactNode; className?: string }) {
  return <section className={`bg-white py-16 md:py-24 ${className}`}>{children}</section>;
}
