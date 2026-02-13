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

export default function FacilityApprovalsPage() {
  const router = useRouter();
  const [q, setQ] = useState("");
  // Facilities are PENDING by default (login blocked until approved)
  const [status, setStatus] = useState("PENDING");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [data, setData] = useState({ count: 0, results: [] });

  async function load() {
    setBusy(true);
    setErr("");
    try {
      const params = { q, limit: 50 };
      if (status === "APPROVED") params.is_approved = "true";
      if (status === "REJECTED") params.is_rejected = "true";
      if (status === "PENDING") {
        params.is_approved = "false";
        params.is_rejected = "false";
      }
      const query = qs(params);
      const res = await apiFetch(`system-admin/facilities/?${query}`);
      setData(res);
    } catch (e) {
      setErr(e.message);
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => { load(); }, [status]);

  const columns = useMemo(() => [
    { key: "name", header: "Facility", cell: (r) => <div className="font-medium text-slate-900">{r.name}</div> },
    { key: "state", header: "State", cell: (r) => r.state || "—" },
    { key: "email", header: "Email", cell: (r) => r.email || "—" },
    {
      key: "is_approved",
      header: "Approval",
      cell: (r) => (
        r.is_rejected
          ? <Badge tone="red">REJECTED</Badge>
          : r.is_approved
          ? <Badge tone="green">APPROVED</Badge>
          : <Badge tone="yellow">PENDING</Badge>
      ),
    },
    {
      key: "is_publicly_visible",
      header: "Visibility",
      cell: (r) => (r.is_publicly_visible ? <Badge tone="green">VISIBLE</Badge> : <Badge tone="yellow">HIDDEN</Badge>),
    },
    { key: "created_at", header: "Created", cell: (r) => formatDate(r.created_at) },
  ], []);

  return (
    <div className="space-y-4">
      <Card
        title="Facility approvals"
        actions={
          <div className="flex items-end gap-2">
            <div className="w-72"><Input label="Search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="name, email, state..." /></div>
            <div className="w-48">
              <Select label="Status" value={status} onChange={(e) => setStatus(e.target.value)}>
                <option value="PENDING">Pending</option>
                <option value="APPROVED">Approved</option>
                <option value="REJECTED">Rejected</option>
                <option value="">All</option>
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
        {err ? <div className="mb-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{err}</div> : null}
        <Table
          columns={columns}
          rows={data?.results || []}
          rowKey={(r) => r.id}
          onRowClick={(r) => router.push(`/approvals/facilities/${r.id}`)}
        />
        <div className="mt-3 text-xs text-slate-500">{data?.count ?? 0} total</div>
      </Card>
    </div>
  );
}
