import clsx from "clsx";

type BadgeProps = {
  children: React.ReactNode;
  className?: string;
};

export default function Badge({ children, className }: BadgeProps) {
  return <span className={clsx("badge", className)}>{children}</span>;
}
