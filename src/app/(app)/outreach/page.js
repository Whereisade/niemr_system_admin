"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Card from "@/components/Card";
import Input from "@/components/Input";
import Select from "@/components/Select";
import Table from "@/components/Table";
import Badge from "@/components/Badge";
import { apiFetch } from "@/lib/api";
import { qs, formatDate } from "@/lib/format";

export default function OutreachPage() {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [data, setData] = useState({ count: 0, results: [] });

  async function load() {
    setBusy(true);
    setErr("");
    try {
      const query = qs({ s: q, status, limit: 50 });
      const res = await apiFetch(`outreach/events/?${query}`);
      // Normalize for both paginated and non-paginated responses
      if (Array.isArray(res)) {
        setData({ count: res.length, results: res });
      } else if (res && Array.isArray(res.results)) {
        setData(res);
      } else {
        setData({ count: 0, results: [] });
      }
    } catch (e) {
      setErr(e.message);
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => {
    load();
  }, [status]);

  const columns = useMemo(
    () => [
      {
        key: "title",
        header: "Outreach",
        cell: (r) => (
          <div className="min-w-[260px]">
            <div className="font-medium text-slate-900">{r.title || "—"}</div>
            <div className="text-xs text-slate-500 line-clamp-1">{r.description || ""}</div>
          </div>
        ),
      },
      {
        key: "created_by",
        header: "Created by",
        cell: (r) => (
          <div>
            <div className="font-medium text-slate-900">{r.created_by_name || "—"}</div>
            <div className="text-xs text-slate-500">{r.created_by_email || "—"}</div>
          </div>
        ),
      },
      {
        key: "status",
        header: "Status",
        cell: (r) => {
          const s = r.status || "—";
          const tone = s === "ACTIVE" ? "green" : s === "CLOSED" ? "red" : s === "DRAFT" ? "slate" : "yellow";
          return <Badge tone={tone}>{s}</Badge>;
        },
      },
      { key: "starts_at", header: "Starts", cell: (r) => formatDate(r.starts_at) },
      { key: "ends_at", header: "Ends", cell: (r) => formatDate(r.ends_at) },
      { key: "created_at", header: "Created", cell: (r) => formatDate(r.created_at) },
    ],
    []
  );

  return (
    <div className="space-y-4">
      <Card
        title="Outreach"
        actions={
          <div className="flex items-end gap-2">
            <div className="w-72">
              <Input
                label="Search"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="title, description..."
              />
            </div>
            <div className="w-48">
              <Select label="Status" value={status} onChange={(e) => setStatus(e.target.value)}>
                <option value="">ALL</option>
                <option value="DRAFT">DRAFT</option>
                <option value="ACTIVE">ACTIVE</option>
                <option value="CLOSED">CLOSED</option>
              </Select>
            </div>
            <button
              className="h-10 rounded-lg bg-slate-900 px-4 text-sm font-medium text-white hover:bg-slate-800"
              onClick={load}
              disabled={busy}
            >
              {busy ? "Loading..." : "Refresh"}
            </button>
          </div>
        }
      >
        {err ? (
          <div className="mb-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {err}
          </div>
        ) : null}

        <Table
          columns={columns}
          rows={data?.results || []}
          rowKey={(r) => r.id}
          onRowClick={(r) => router.push(`/outreach/${r.id}`)}
        />

        <div className="mt-3 text-xs text-slate-500">{data?.count ?? 0} total</div>
      </Card>
    </div>
  );
}
