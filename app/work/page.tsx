"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useApiQuery } from "@/hooks/useApiQuery";
import { meQuery } from "@/lib/api/account";
import { landingPathFor } from "@/lib/api/staff";

/** `/work` is the catch-all entry point for staff. Reads `me.user.staffRole`
 *  and forwards to the role-specific landing. Owners land here only if they
 *  somehow bookmarked it — we forward them to `/dashboard`. */
export default function WorkIndex() {
  const router = useRouter();
  const { data: me, loading } = useApiQuery(meQuery);

  useEffect(() => {
    if (!me) return;
    if (me.user.role === "TENANT_ADMIN" || me.user.role === "SUPER_ADMIN") {
      router.replace("/dashboard");
      return;
    }
    router.replace(landingPathFor(me.user.staffRole));
  }, [me, router]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-neutral-bg">
      <Loader2 className="animate-spin text-primary" size={28} />
      {loading && <span className="ml-3 text-[13px] text-content-muted">Loading your workspace…</span>}
    </main>
  );
}
