"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Card from "@/components/Card";
import Badge from "@/components/Badge";
import { apiFetch } from "@/lib/api";

export default function ApprovalsQueuePage() {
  const [pendingProviders, setPendingProviders] = useState([]);
  const [hiddenFacilities, setHiddenFacilities] = useState([]);
  const [err, setErr] = useState("");

  useEffect(() => {
    (async () => {
      try {
        setErr("");
        const [prov, fac] = await Promise.all([
          apiFetch("providers/?status=PENDING&limit=8"),
          apiFetch("system-admin/facilities/?is_publicly_visible=false&limit=8"),
        ]);
        setPendingProviders(prov?.results || []);
        setHiddenFacilities(fac?.results || []);
      } catch (e) {
        setErr(e.message);
      }
    })();
  }, []);

  return (
    <div className="space-y-4">
      {err ? <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{err}</div> : null}

      <div className="grid gap-4 lg:grid-cols-2">
        <Card
          title="Pending providers"
          actions={<Link className="text-sm font-medium text-slate-900 hover:underline" href="/approvals/providers">View all</Link>}
        >
          <div className="space-y-2">
            {pendingProviders.map((p) => (
              <Link key={p.id} href={`/approvals/providers/${p.id}`} className="flex items-center justify-between rounded-xl border border-slate-100 px-3 py-2 hover:bg-slate-50">
                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold">{p.display_name || `${p.first_name || ""} ${p.last_name || ""}`.trim() || p.email}</div>
                  <div className="truncate text-xs text-slate-500">{p.provider_type} • {p.state || "—"}</div>
                </div>
                <Badge tone="yellow">PENDING</Badge>
              </Link>
            ))}
            {pendingProviders.length === 0 ? <div className="text-sm text-slate-500">No pending providers.</div> : null}
          </div>
        </Card>

        <Card
          title="Hidden facilities"
          actions={<Link className="text-sm font-medium text-slate-900 hover:underline" href="/approvals/facilities">View all</Link>}
        >
          <div className="space-y-2">
            {hiddenFacilities.map((f) => (
              <Link key={f.id} href={`/approvals/facilities/${f.id}`} className="flex items-center justify-between rounded-xl border border-slate-100 px-3 py-2 hover:bg-slate-50">
                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold">{f.name}</div>
                  <div className="truncate text-xs text-slate-500">{f.state || "—"} • {f.email || "—"}</div>
                </div>
                <Badge tone="yellow">HIDDEN</Badge>
              </Link>
            ))}
            {hiddenFacilities.length === 0 ? <div className="text-sm text-slate-500">No hidden facilities.</div> : null}
          </div>
        </Card>
      </div>
    </div>
  );
}
