import { Construction } from "lucide-react";

/** Placeholder body for app sections not yet built (keeps the shell consistent). */
export function ComingSoon({ title }: { title: string }) {
  return (
    <div className="flex min-h-[55vh] flex-col items-center justify-center text-center">
      <span className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-primary/[0.08] text-primary">
        <Construction size={26} />
      </span>
      <h2 className="text-[22px] font-medium tracking-[-0.01em] text-white">
        {title} is coming soon
      </h2>
      <p className="mt-2 max-w-sm text-[15px] leading-relaxed text-white/65">
        We&apos;re building this screen from the design. It&apos;ll live right here, in the
        same workspace.
      </p>
    </div>
  );
}
