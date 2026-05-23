export function ProofBar() {
  return (
    <div className="border-b border-neutral-border bg-neutral-bg">
      <div className="container-x flex items-center gap-6 py-7">
        <span className="hidden h-px flex-1 bg-neutral-border sm:block" />
        <p className="text-center font-mono text-[12px] uppercase tracking-[0.12em] text-content-muted">
          Trusted by thousands of businesses across borders
        </p>
        <span className="hidden h-px flex-1 bg-neutral-border sm:block" />
      </div>
    </div>
  );
}
