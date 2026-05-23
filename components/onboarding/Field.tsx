// Labeled input matching the DESIGN.md spec: white surface, 10px radius,
// 1px border, border turns violet on focus (no glow). Placeholder/uncontrolled
// for the scaffold — real validation (React Hook Form + Zod) wires in later.

export function Field({
  label,
  name,
  type = "text",
  placeholder,
  hint,
  optional = false,
}: {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
  hint?: string;
  optional?: boolean;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 flex items-center gap-2 text-[14px] font-medium text-ink">
        {label}
        {optional && (
          <span className="font-mono text-[11px] font-normal text-content-muted">
            optional
          </span>
        )}
      </span>
      <input
        name={name}
        type={type}
        placeholder={placeholder}
        className="h-11 w-full rounded-md border border-neutral-strong bg-neutral-surface px-3.5 text-[15px] text-ink placeholder:text-content-muted focus:border-primary focus:outline-none"
      />
      {hint && <span className="mt-1.5 block text-[13px] text-content-muted">{hint}</span>}
    </label>
  );
}
