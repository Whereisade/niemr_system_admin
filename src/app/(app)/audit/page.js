"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import Card from "@/components/Card";
import Input from "@/components/Input";
import Select from "@/components/Select";
import Table from "@/components/Table";
import Badge from "@/components/Badge";
import { apiFetch } from "@/lib/api";
import { qs, formatDate } from "@/lib/format";

export default function AuditPage() {
  const sp = useSearchParams();
  const [s, setS] = useState(sp.get("s") || "");
  const [verb, setVerb] = useState("");
  const [model, setModel] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [data, setData] = useState({ count: 0, results: [] });

  async function load() {
    setBusy(true);
    setErr("");
    try {
      const query = qs({ s, verb, model, limit: 50 });
      const res = await apiFetch(`audit/logs/?${query}`);
      setData(res);
    } catch (e) {
      setErr(e.message);
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => { load(); }, []);

  const columns = useMemo(() => [
    { key: "created_at", header: "Time", cell: (r) => formatDate(r.created_at) },
    { key: "verb", header: "Verb", cell: (r) => <Badge tone={r.verb === "DELETE" ? "red" : r.verb === "CREATE" ? "green" : "slate"}>{r.verb}</Badge> },
    { key: "actor_display", header: "Actor", cell: (r) => r.actor_display || r.actor_email || "System" },
    { key: "target_model", header: "Model", cell: (r) => r.target_model || "—" },
    { key: "target_display", header: "Target", cell: (r) => r.target_display || r.target_id || "—" },
    { key: "message", header: "Message", cell: (r) => <span className="whitespace-normal">{r.message || "—"}</span> },
  ], []);

  return (
    <div className="space-y-4">
      <Card
        title="Audit logs"
        actions={
          <div className="flex items-end gap-2">
            <div className="w-72"><Input label="Search" value={s} onChange={(e) => setS(e.target.value)} placeholder="message / email / target id..." /></div>
            <div className="w-44">
              <Select label="Verb" value={verb} onChange={(e) => setVerb(e.target.value)}>
                <option value="">All</option>
                <option value="CREATE">CREATE</option>
                <option value="UPDATE">UPDATE</option>
                <option value="DELETE">DELETE</option>
                <option value="M2M">M2M</option>
                <option value="LOGIN">LOGIN</option>
                <option value="LOGOUT">LOGOUT</option>
                <option value="ACTION">ACTION</option>
              </Select>
            </div>
            <div className="w-44"><Input label="Model" value={model} onChange={(e) => setModel(e.target.value)} placeholder="facility, user, ..." /></div>
            <button
              className="h-10 rounded-lg bg-slate-900 px-4 text-sm font-medium text-white hover:bg-slate-800"
              onClick={load}
              disabled={busy}
            >
              {busy ? "Loading..." : "Search"}
            </button>
          </div>
        }
      >
        {err ? <div className="mb-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{err}</div> : null}
        <Table columns={columns} rows={data?.results || []} rowKey={(r) => r.id} />
        <div className="mt-3 text-xs text-slate-500">{data?.count ?? 0} total</div>
      </Card>
    </div>
  );
}
