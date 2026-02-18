"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Card from "@/components/Card";
import Badge from "@/components/Badge";
import Button from "@/components/Button";
import ConfirmDialog from "@/components/ConfirmDialog";
import Table from "@/components/Table";
import { apiFetch } from "@/lib/api";
import { formatDate } from "@/lib/format";

function toneForStatus(s) {
  if (s === "ACTIVE") return "green";
  if (s === "CLOSED") return "red";
  return "yellow";
}

export default function OutreachDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id;

  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [evt, setEvt] = useState(null);
  const [staff, setStaff] = useState([]);

  const [confirm, setConfirm] = useState({ open: false, mode: null });

  async function load() {
    if (!id) return;
    setBusy(true);
    setErr("");
    try {
      const [eventRes, staffRes] = await Promise.all([
        apiFetch(`outreach/events/${id}/`),
        apiFetch(`outreach/events/${id}/staff/`).catch(() => []),
      ]);

      setEvt(eventRes);
      setStaff(Array.isArray(staffRes) ? staffRes : (staffRes?.results || []));
    } catch (e) {
      setErr(e.message);
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => {
    load();
  }, [id]);

  async function doActivate() {
    setConfirm({ open: false, mode: null });
    setBusy(true);
    setErr("");
    try {
      await apiFetch(`outreach/events/${id}/activate/`, { method: "POST" });
      await load();
    } catch (e) {
      setErr(e.message);
      setBusy(false);
    }
  }

  async function doClose() {
    setConfirm({ open: false, mode: null });
    setBusy(true);
    setErr("");
    try {
      await apiFetch(`outreach/events/${id}/close/`, { method: "POST" });
      await load();
    } catch (e) {
      setErr(e.message);
      setBusy(false);
    }
  }

  const stats = evt?.stats || {};

  const staffColumns = useMemo(
    () => [
      {
        key: "user",
        header: "Staff",
        cell: (r) => (
          <div>
            <div className="font-medium text-slate-900">{r?.user?.email || "—"}</div>
            <div className="text-xs text-slate-500">
              {(r?.user?.first_name || "") + " " + (r?.user?.last_name || "")}
            </div>
          </div>
        ),
      },
      { key: "role_template", header: "Role template", cell: (r) => r.role_template || "—" },
      {
        key: "is_active",
        header: "Status",
        cell: (r) => (r.is_active ? <Badge tone="green">ACTIVE</Badge> : <Badge tone="red">DISABLED</Badge>),
      },
      { key: "created_at", header: "Added", cell: (r) => formatDate(r.created_at) },
    ],
    []
  );

  const siteColumns = useMemo(
    () => [
      { key: "name", header: "Site", cell: (r) => <div className="font-medium text-slate-900">{r.name}</div> },
      { key: "community", header: "Community", cell: (r) => r.community || "—" },
      { key: "address", header: "Address", cell: (r) => r.address || "—" },
      { key: "is_active", header: "Active", cell: (r) => (r.is_active ? <Badge tone="green">YES</Badge> : <Badge tone="red">NO</Badge>) },
    ],
    []
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-xs text-slate-500">Outreach</div>
          <div className="text-lg font-semibold text-slate-900">{evt?.title || (busy ? "Loading..." : "—")}</div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" onClick={() => router.push("/outreach")}>Back</Button>
          {evt?.status === "DRAFT" ? (
            <Button variant="primary" onClick={() => setConfirm({ open: true, mode: "activate" })} disabled={busy}>Activate</Button>
          ) : null}
          {evt?.status !== "CLOSED" ? (
            <Button variant="danger" onClick={() => setConfirm({ open: true, mode: "close" })} disabled={busy}>Close</Button>
          ) : null}
        </div>
      </div>

      {err ? (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{err}</div>
      ) : null}

      <Card
        title="Overview"
        actions={
          evt?.status ? <Badge tone={toneForStatus(evt.status)}>{evt.status}</Badge> : null
        }
      >
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-xl border border-slate-200 p-4">
            <div className="text-xs text-slate-500">Created by</div>
            <div className="text-sm font-medium text-slate-900">{evt?.created_by_name || evt?.created_by_email || "—"}</div>
          </div>
          <div className="rounded-xl border border-slate-200 p-4">
            <div className="text-xs text-slate-500">Starts</div>
            <div className="text-sm font-medium text-slate-900">{formatDate(evt?.starts_at)}</div>
          </div>
          <div className="rounded-xl border border-slate-200 p-4">
            <div className="text-xs text-slate-500">Ends</div>
            <div className="text-sm font-medium text-slate-900">{formatDate(evt?.ends_at)}</div>
          </div>
          <div className="rounded-xl border border-slate-200 p-4">
            <div className="text-xs text-slate-500">Created</div>
            <div className="text-sm font-medium text-slate-900">{formatDate(evt?.created_at)}</div>
          </div>
          <div className="rounded-xl border border-slate-200 p-4">
            <div className="text-xs text-slate-500">Updated</div>
            <div className="text-sm font-medium text-slate-900">{formatDate(evt?.updated_at)}</div>
          </div>
          <div className="rounded-xl border border-slate-200 p-4">
            <div className="text-xs text-slate-500">Closed</div>
            <div className="text-sm font-medium text-slate-900">{formatDate(evt?.closed_at)}</div>
          </div>
        </div>
      </Card>

      <Card title="Quick stats">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            ["Sites", stats.sites],
            ["Staff", stats.staff],
            ["Patients", stats.patients],
            ["Vitals", stats.vitals],
            ["Encounters", stats.encounters],
            ["Lab orders", stats.lab_orders],
            ["Lab results", stats.lab_results],
            ["Dispenses", stats.dispenses],
          ].map(([label, value]) => (
            <div key={label} className="rounded-xl border border-slate-200 p-4">
              <div className="text-xs text-slate-500">{label}</div>
              <div className="text-xl font-semibold text-slate-900">{value ?? 0}</div>
            </div>
          ))}
        </div>
      </Card>

      <Card title="Sites">
        <Table columns={siteColumns} rows={evt?.sites || []} rowKey={(r) => r.id} />
      </Card>

      <Card title="Staff">
        <Table columns={staffColumns} rows={staff || []} rowKey={(r) => r.id} />
      </Card>

      <ConfirmDialog
        open={confirm.open}
        title={confirm.mode === "close" ? "Close outreach" : "Activate outreach"}
        description={
          confirm.mode === "close"
            ? "Closing an outreach disables all staff access and makes the event read-only. Continue?"
            : "This will activate the outreach event. Continue?"
        }
        confirmText={confirm.mode === "close" ? "Close" : "Activate"}
        onClose={() => setConfirm({ open: false, mode: null })}
        onConfirm={confirm.mode === "close" ? doClose : doActivate}
      />
    </div>
  );
}
