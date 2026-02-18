"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import Card from "@/components/Card";
import Badge from "@/components/Badge";
import Table from "@/components/Table";
import { apiFetch } from "@/lib/api";
import { formatDate } from "@/lib/format";

export default function OutreachDetailPage() {
  const { id } = useParams();
  const [evt, setEvt] = useState(null);
  const [err, setErr] = useState("");

  async function load() {
    setErr("");
    try {
      const data = await apiFetch(`outreach/events/${id}/`);
      setEvt(data);
    } catch (e) {
      setErr(e.message);
    }
  }

  useEffect(() => {
    load();
  }, [id]);

  const statusTone = useMemo(() => {
    const s = evt?.status;
    if (s === "ACTIVE") return "green";
    if (s === "CLOSED") return "red";
    if (s === "DRAFT") return "slate";
    return "yellow";
  }, [evt?.status]);

  const siteColumns = useMemo(
    () => [
      { key: "name", header: "Site", cell: (r) => <div className="font-medium text-slate-900">{r.name || "—"}</div> },
      { key: "community", header: "Community", cell: (r) => r.community || "—" },
      { key: "address", header: "Address", cell: (r) => <div className="max-w-[520px] whitespace-normal">{r.address || "—"}</div> },
      {
        key: "is_active",
        header: "Active",
        cell: (r) => (r.is_active ? <Badge tone="green">YES</Badge> : <Badge tone="red">NO</Badge>),
      },
      { key: "created_at", header: "Created", cell: (r) => formatDate(r.created_at) },
    ],
    []
  );

  if (!evt && !err) return <div className="text-sm text-slate-500">Loading...</div>;

  return (
    <div className="space-y-4">
      <div className="text-sm text-slate-500">
        <Link href="/outreach" className="hover:underline">Outreach</Link> / {evt?.title || id}
      </div>

      {err ? (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{err}</div>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-2">
        <Card title="Overview">
          <dl className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <dt className="text-xs text-slate-500">Title</dt>
              <dd className="font-medium">{evt?.title || "—"}</dd>
            </div>
            <div>
              <dt className="text-xs text-slate-500">Status</dt>
              <dd className="font-medium"><Badge tone={statusTone}>{evt?.status || "—"}</Badge></dd>
            </div>
            <div className="col-span-2">
              <dt className="text-xs text-slate-500">Description</dt>
              <dd className="text-slate-700">{evt?.description || "—"}</dd>
            </div>
            <div>
              <dt className="text-xs text-slate-500">Starts</dt>
              <dd className="font-medium">{formatDate(evt?.starts_at)}</dd>
            </div>
            <div>
              <dt className="text-xs text-slate-500">Ends</dt>
              <dd className="font-medium">{formatDate(evt?.ends_at)}</dd>
            </div>
            <div>
              <dt className="text-xs text-slate-500">Created by</dt>
              <dd className="font-medium">{evt?.created_by_name || "—"}</dd>
            </div>
            <div>
              <dt className="text-xs text-slate-500">Creator email</dt>
              <dd className="font-medium">{evt?.created_by_email || "—"}</dd>
            </div>
            <div>
              <dt className="text-xs text-slate-500">Created</dt>
              <dd className="font-medium">{formatDate(evt?.created_at)}</dd>
            </div>
            <div>
              <dt className="text-xs text-slate-500">Updated</dt>
              <dd className="font-medium">{formatDate(evt?.updated_at)}</dd>
            </div>
            <div>
              <dt className="text-xs text-slate-500">Closed at</dt>
              <dd className="font-medium">{formatDate(evt?.closed_at)}</dd>
            </div>
          </dl>
        </Card>

        <Card title="Quick stats">
          <dl className="grid grid-cols-2 gap-3 text-sm">
            {Object.entries(evt?.stats || {}).map(([k, v]) => (
              <div key={k}>
                <dt className="text-xs text-slate-500">{k.replaceAll("_", " ")}</dt>
                <dd className="font-medium">{typeof v === "number" ? v : (v ?? "—")}</dd>
              </div>
            ))}
          </dl>
          {!evt?.stats ? <div className="text-xs text-slate-500">No stats available.</div> : null}
        </Card>
      </div>

      <Card title={`Sites (${(evt?.sites || []).length})`}>
        <Table columns={siteColumns} rows={evt?.sites || []} rowKey={(r) => r.id} />
      </Card>
    </div>
  );
}
