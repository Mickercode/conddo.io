import { ArrowRight } from "lucide-react";
import { Button } from "./ui/Button";

export function FinalCTA() {
  return (
    <section className="bg-primary">
      <div className="container-x py-16 text-center md:py-24">
        <h2 className="mx-auto max-w-2xl text-balance text-[34px] font-medium leading-tight tracking-[-0.01em] text-white md:text-[44px]">
          Start your free trial today.
        </h2>
        <div className="mt-8 flex justify-center">
          <Button href="/onboarding/create-account" variant="on-violet" size="lg">
            Get Started
            <ArrowRight size={18} />
          </Button>
        </div>
        <p className="mt-5 font-mono text-[12px] text-white/70">
          14 days free · No credit card
        </p>
      </div>
    </section>
  );
}
