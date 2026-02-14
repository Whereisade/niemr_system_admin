"use client";

import { useEffect, useState } from "react";
import Card from "@/components/Card";
import Badge from "@/components/Badge";
import { apiFetch } from "@/lib/api";

export default function DashboardPage() {
  const [stats, setStats] = useState({ facilitiesHidden: 0, providersPending: 0, usersTotal: 0 });
  const [err, setErr] = useState("");

  useEffect(() => {
    (async () => {
      try {
        setErr("");
        const [fac, prov, usr] = await Promise.all([
          apiFetch("system-admin/facilities/?is_publicly_visible=false&limit=1"),
          apiFetch("providers/?status=PENDING&limit=1"),
          apiFetch("system-admin/users/?limit=1"),
        ]);
        setStats({
          facilitiesHidden: fac?.count ?? 0,
          providersPending: prov?.count ?? 0,
          usersTotal: usr?.count ?? 0,
        });
      } catch (e) {
        setErr(e.message);
      }
    })();
  }, []);

  return (
    <div className="space-y-4">
      {err ? (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{err}</div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-3">
        <Card title="Facilities awaiting approval">
          <div className="text-3xl font-extrabold">{stats.facilitiesHidden}</div>
          <div className="mt-2">
            <Badge tone="yellow">Hidden</Badge>
          </div>
        </Card>
        <Card title="Providers pending verification">
          <div className="text-3xl font-extrabold">{stats.providersPending}</div>
          <div className="mt-2">
            <Badge tone="yellow">Pending</Badge>
          </div>
        </Card>
        <Card title="Total users">
          <div className="text-3xl font-extrabold">{stats.usersTotal}</div>
          <div className="mt-2">
            <Badge tone="blue">All users</Badge>
          </div>
        </Card>
      </div>
    </div>
  );
}
