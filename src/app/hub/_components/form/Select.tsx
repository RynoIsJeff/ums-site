const selectBase =
  "rounded-md border border-(--hub-border-light) px-3 py-2 text-sm focus:border-(--primary) focus:outline-none focus:ring-1 focus:ring-(--primary)";

type SelectOption = { value: string; label: string };

type SelectProps = Omit<React.ComponentPropsWithoutRef<"select">, "children"> & {
  id: string;
  label: string;
  options: SelectOption[];
  placeholder?: string;
  error?: string;
};

export function Select({
  id,
  label,
  options,
  placeholder,
  error,
  className = "",
  ...props
}: SelectProps) {
  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-xs font-medium text-(--hub-muted)">
        {label}
      </label>
      <select
        id={id}
        className={`${selectBase} ${error ? "border-red-500" : ""} ${className}`.trim()}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        {...props}
      >
        {placeholder && (
          <option value="">{placeholder}</option>
        )}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && (
        <p id={`${id}-error`} className="mt-1 text-xs text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}
