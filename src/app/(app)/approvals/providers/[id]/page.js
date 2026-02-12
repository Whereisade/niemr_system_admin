"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import Card from "@/components/Card";
import Badge from "@/components/Badge";
import Button from "@/components/Button";
import Table from "@/components/Table";
import ConfirmDialog from "@/components/ConfirmDialog";
import { apiFetch } from "@/lib/api";
import { formatDate } from "@/lib/format";

function DocLink({ href, label }) {
  if (!href) return <span className="text-slate-400">—</span>;
  return (
    <a href={href} target="_blank" rel="noreferrer" className="text-slate-900 underline underline-offset-4 hover:text-slate-700">
      {label || "View"}
    </a>
  );
}

export default function ProviderApprovalDetail() {
  const { id } = useParams();
  const router = useRouter();
  const [provider, setProvider] = useState(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [confirm, setConfirm] = useState({ open: false, action: null });
  const [rejectReason, setRejectReason] = useState("");

  async function load() {
    setBusy(true);
    setErr("");
    try {
      const data = await apiFetch(`providers/${id}/`);
      setProvider(data);
    } catch (e) {
      setErr(e.message);
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => { load(); }, [id]);

  async function approve() {
    setBusy(true);
    setErr("");
    try {
      await apiFetch(`providers/${id}/approve/`, { method: "POST" });
      await load();
    } catch (e) {
      setErr(e.message);
    } finally {
      setBusy(false);
      setConfirm({ open: false, action: null });
    }
  }

  async function reject() {
    setBusy(true);
    setErr("");
    try {
      await apiFetch(`providers/${id}/reject/`, { method: "POST", body: { reason: rejectReason } });
      await load();
    } catch (e) {
      setErr(e.message);
    } finally {
      setBusy(false);
      setConfirm({ open: false, action: null });
    }
  }

  async function toggleLinkedUser() {
    const uid = provider?.user;
    if (!uid) return;
    try {
      if (provider?.is_active) await apiFetch(`system-admin/users/${uid}/deactivate/`, { method: "POST" });
      else await apiFetch(`system-admin/users/${uid}/reactivate/`, { method: "POST" });
      await load();
    } catch (e) {
      setErr(e.message);
    }
  }

  const status = provider?.verification_status || "—";
  const tone = status === "APPROVED" ? "green" : status === "REJECTED" ? "red" : "yellow";

  const docColumns = useMemo(() => [
    { key: "kind", header: "Type", cell: (d) => d.kind || "—" },
    { key: "uploaded_at", header: "Uploaded", cell: (d) => formatDate(d.uploaded_at) },
    { key: "file", header: "File", cell: (d) => <DocLink href={d.file} /> },
  ], []);

  if (!provider && !err) return <div className="text-sm text-slate-500">Loading...</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-sm text-slate-500"><Link href="/approvals/providers" className="hover:underline">Providers</Link> / {provider?.display_name || provider?.email || id}</div>
          <div className="mt-1 flex items-center gap-2">
            <div className="text-xl font-extrabold">{provider?.display_name || provider?.email}</div>
            <Badge tone={tone}>{status}</Badge>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="secondary" onClick={() => router.push(`/audit?s=${encodeURIComponent(provider?.email || "")}`)}>Audit logs</Button>
          {provider?.user ? (
            <Button variant="secondary" onClick={toggleLinkedUser}>
              {provider?.is_active ? "Deactivate account" : "Activate account"}
            </Button>
          ) : null}
          {status !== "REJECTED" ? (
            <Button variant="danger" onClick={() => setConfirm({ open: true, action: "reject" })} disabled={busy}>Reject</Button>
          ) : null}
          {status !== "APPROVED" ? (
            <Button variant="primary" onClick={() => setConfirm({ open: true, action: "approve" })} disabled={busy}>Approve</Button>
          ) : null}
        </div>
      </div>

      {err ? <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{err}</div> : null}

      <div className="grid gap-4 lg:grid-cols-2">
        <Card title="Provider details">
          <dl className="grid grid-cols-2 gap-3 text-sm">
            <div><dt className="text-xs text-slate-500">Type</dt><dd className="font-medium">{provider?.provider_type || "—"}</dd></div>
            <div><dt className="text-xs text-slate-500">Council</dt><dd className="font-medium">{provider?.license_council || "—"}</dd></div>
            <div><dt className="text-xs text-slate-500">License No</dt><dd className="font-medium">{provider?.license_number || "—"}</dd></div>
            <div><dt className="text-xs text-slate-500">State</dt><dd className="font-medium">{provider?.state || "—"}</dd></div>
            <div className="col-span-2"><dt className="text-xs text-slate-500">Bio</dt><dd className="font-medium">{provider?.bio || "—"}</dd></div>
            <div><dt className="text-xs text-slate-500">Created</dt><dd className="font-medium">{formatDate(provider?.created_at)}</dd></div>
            <div><dt className="text-xs text-slate-500">Verified at</dt><dd className="font-medium">{formatDate(provider?.verified_at)}</dd></div>
          </dl>
        </Card>

        <Card title="Linked account">
          <dl className="grid grid-cols-2 gap-3 text-sm">
            <div><dt className="text-xs text-slate-500">Email</dt><dd className="font-medium">{provider?.email || "—"}</dd></div>
            <div><dt className="text-xs text-slate-500">Active</dt><dd className="font-medium">{provider?.is_active ? <Badge tone="green">ACTIVE</Badge> : <Badge tone="red">INACTIVE</Badge>}</dd></div>
            <div><dt className="text-xs text-slate-500">User role</dt><dd className="font-medium">{provider?.user_role || "—"}</dd></div>
            <div><dt className="text-xs text-slate-500">Facility</dt><dd className="font-medium">{provider?.facility_name || "Independent"}</dd></div>
            <div><dt className="text-xs text-slate-500">Visibility</dt><dd className="font-medium">{provider?.is_publicly_visible ? <Badge tone="green">VISIBLE</Badge> : <Badge tone="yellow">HIDDEN</Badge>}</dd></div>
            <div><dt className="text-xs text-slate-500">Sacked</dt><dd className="font-medium">{provider?.is_sacked ? <Badge tone="red">SACKED</Badge> : <Badge tone="slate">NO</Badge>}</dd></div>
          </dl>
          <div className="mt-3 text-xs text-slate-500">
            Note: Activate/deactivate uses <code className="rounded bg-slate-100 px-1">/api/system-admin/users/:id</code>.
          </div>
        </Card>
      </div>

      <Card title={`Documents (${(provider?.documents_read || []).length})`}>
        <Table columns={docColumns} rows={provider?.documents_read || []} rowKey={(d) => d.id} />
      </Card>

      <ConfirmDialog
        open={confirm.open}
        title={confirm.action === "approve" ? "Approve provider?" : "Reject provider?"}
        description={
          confirm.action === "approve"
            ? "This will set the provider verification status to APPROVED."
            : (
              <div className="space-y-2">
                <div>Rejecting will set status to REJECTED.</div>
                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  rows={3}
                  className="w-full rounded-xl border border-slate-200 p-3 text-sm outline-none focus:border-slate-300 focus:ring-2 focus:ring-slate-100"
                  placeholder="Reason (optional)"
                />
              </div>
            )
        }
        confirmText={confirm.action === "approve" ? "Approve" : "Reject"}
        onConfirm={confirm.action === "approve" ? approve : reject}
        onClose={() => setConfirm({ open: false, action: null })}
      />
    </div>
  );
}
