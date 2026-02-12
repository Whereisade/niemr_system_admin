"use client";

import { useRouter } from "next/navigation";
import Button from "@/components/Button";
import { clearTokens } from "@/lib/auth";

export default function Topbar({ title, subtitle }) {
  const router = useRouter();
  return (
    <header className="flex items-center justify-between gap-4 border-b border-slate-200 bg-white px-6 py-4">
      <div className="min-w-0">
        <div className="truncate text-sm font-semibold text-slate-900">{title}</div>
        {subtitle ? <div className="truncate text-xs text-slate-500">{subtitle}</div> : null}
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="secondary"
          onClick={() => {
            clearTokens();
            router.push("/login");
          }}
        >
          Logout
        </Button>
      </div>
    </header>
  );
}
