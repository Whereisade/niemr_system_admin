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

export default function ProviderApprovalsPage() {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [category, setCategory] = useState("INDEPENDENT");
  // Independent providers are auto-approved by default now.
  const [status, setStatus] = useState("APPROVED");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [data, setData] = useState({ count: 0, results: [] });

  async function load() {
    setBusy(true);
    setErr("");
    try {
      const facility = category === "FACILITY_LINKED" ? "linked" : "none";
      const query = qs({ s: q, status, facility, limit: 50 });
      const res = await apiFetch(`providers/?${query}`);
      // NOTE: /api/providers/ is not paginated in this backend (it returns an array).
      // Normalize so the UI can render regardless of pagination config.
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

  useEffect(() => { load(); }, [status, category]);

  const columns = useMemo(() => [
    {
      key: "display_name",
      header: "Provider",
      cell: (r) => (
        <div>
          <div className="font-medium text-slate-900">{r.display_name || r.email}</div>
          <div className="text-xs text-slate-500">{r.email}</div>
        </div>
      ),
    },
    {
      key: "provider_source",
      header: "Category",
      cell: (r) => (
        r.provider_source === "FACILITY_LINKED"
          ? <Badge tone="slate">FACILITY-LINKED</Badge>
          : <Badge tone="slate">INDEPENDENT</Badge>
      ),
    },
    { key: "provider_type", header: "Type", cell: (r) => r.provider_type || "—" },
    { key: "state", header: "State", cell: (r) => r.state || "—" },
    { key: "facility_name", header: "Facility", cell: (r) => r.facility_name || "Independent" },
    {
      key: "verification_status",
      header: "Status",
      cell: (r) => {
        const s = r.verification_status || "—";
        const tone = s === "APPROVED" ? "green" : s === "REJECTED" ? "red" : "yellow";
        return <Badge tone={tone}>{s}</Badge>;
      },
    },
    { key: "created_at", header: "Created", cell: (r) => formatDate(r.created_at) },
  ], []);

  return (
    <div className="space-y-4">
      <Card
        title="Provider verification"
        actions={
          <div className="flex items-end gap-2">
            <div className="w-72"><Input label="Search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="name, email..." /></div>
            <div className="w-64">
              <Select label="Category" value={category} onChange={(e) => setCategory(e.target.value)}>
                <option value="INDEPENDENT">Independent providers</option>
                <option value="FACILITY_LINKED">Facility-linked providers</option>
              </Select>
            </div>
            <div className="w-48">
              <Select label="Status" value={status} onChange={(e) => setStatus(e.target.value)}>
                <option value="">ALL</option>
                <option value="PENDING">PENDING</option>
                <option value="APPROVED">APPROVED</option>
                <option value="REJECTED">REJECTED</option>
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
          onRowClick={(r) => router.push(`/approvals/providers/${r.id}`)}
        />
        <div className="mt-3 text-xs text-slate-500">{data?.count ?? 0} total</div>
      </Card>
    </div>
  );
}
