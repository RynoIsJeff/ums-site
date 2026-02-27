const inputBase =
  "rounded-md border border-(--hub-border-light) px-3 py-2 text-sm focus:border-(--primary) focus:outline-none focus:ring-1 focus:ring-(--primary)";

type InputProps = React.ComponentPropsWithoutRef<"input"> & {
  id: string;
  label: string;
  error?: string;
};

export function Input({ id, label, error, className = "", ...props }: InputProps) {
  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-xs font-medium text-(--hub-muted)">
        {label}
      </label>
      <input
        id={id}
        className={`${inputBase} ${error ? "border-red-500" : ""} ${className}`.trim()}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        {...props}
      />
      {error && (
        <p id={`${id}-error`} className="mt-1 text-xs text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}
