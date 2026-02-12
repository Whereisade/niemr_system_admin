"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import Card from "@/components/Card";
import Badge from "@/components/Badge";
import Button from "@/components/Button";
import Table from "@/components/Table";
import Select from "@/components/Select";
import Input from "@/components/Input";
import ConfirmDialog from "@/components/ConfirmDialog";
import { apiFetch } from "@/lib/api";
import { formatDate, qs } from "@/lib/format";

function DocLink({ href, label }) {
  if (!href) return <span className="text-slate-400">—</span>;
  return (
    <a href={href} target="_blank" rel="noreferrer" className="text-slate-900 underline underline-offset-4 hover:text-slate-700">
      {label || "View"}
    </a>
  );
}

export default function FacilityApprovalDetail() {
  const { id } = useParams();
  const router = useRouter();
  const [facility, setFacility] = useState(null);
  const [usersData, setUsersData] = useState({ count: 0, results: [] });
  const [userRole, setUserRole] = useState("");
  const [userActive, setUserActive] = useState("");
  const [userSearch, setUserSearch] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [confirm, setConfirm] = useState({ open: false, action: null });

  async function loadFacility() {
    setBusy(true);
    setErr("");
    try {
      const data = await apiFetch(`system-admin/facilities/${id}/`);
      setFacility(data);
    } catch (e) {
      setErr(e.message);
    } finally {
      setBusy(false);
    }
  }

  async function loadUsers() {
    try {
      const query = qs({ s: userSearch, role: userRole, is_active: userActive, limit: 15 });
      const res = await apiFetch(`system-admin/facilities/${id}/users/?${query}`);
      setUsersData(res);
    } catch (e) {
      // non-blocking
    }
  }

  useEffect(() => { loadFacility(); }, [id]);
  useEffect(() => { loadUsers(); }, [id, userRole, userActive]);

  const visibilityTone = facility?.is_publicly_visible ? "green" : "yellow";
  const visibilityLabel = facility?.is_publicly_visible ? "VISIBLE" : "HIDDEN";

  const approvalTone = facility?.is_approved ? "green" : "yellow";
  const approvalLabel = facility?.is_approved ? "APPROVED" : "PENDING";

  async function act(kind) {
    setBusy(true);
    setErr("");
    try {
      if (kind === "approve") await apiFetch(`system-admin/facilities/${id}/approve/`, { method: "POST" });
      if (kind === "unapprove") await apiFetch(`system-admin/facilities/${id}/unapprove/`, { method: "POST" });
      if (kind === "show") await apiFetch(`system-admin/facilities/${id}/show/`, { method: "POST" });
      if (kind === "hide") await apiFetch(`system-admin/facilities/${id}/hide/`, { method: "POST" });
      await loadFacility();
    } catch (e) {
      setErr(e.message);
    } finally {
      setBusy(false);
      setConfirm({ open: false, action: null });
    }
  }

  async function toggleActive() {
    if (!facility) return;
    setBusy(true);
    setErr("");
    try {
      await apiFetch(`system-admin/facilities/${id}/`, { method: "PATCH", body: { is_active: !facility.is_active } });
      await loadFacility();
    } catch (e) {
      setErr(e.message);
    } finally {
      setBusy(false);
    }
  }

  async function toggleUserActive(user) {
    try {
      if (user.is_active) await apiFetch(`system-admin/users/${user.id}/deactivate/`, { method: "POST" });
      else await apiFetch(`system-admin/users/${user.id}/reactivate/`, { method: "POST" });
      await loadUsers();
    } catch {}
  }

  const userColumns = useMemo(() => [
    { key: "email", header: "Email", cell: (u) => <div className="font-medium text-slate-900">{u.email}</div> },
    { key: "name", header: "Name", cell: (u) => `${u.first_name || ""} ${u.last_name || ""}`.trim() || "—" },
    { key: "role", header: "Role", cell: (u) => u.role || "—" },
    { key: "is_active", header: "Status", cell: (u) => u.is_active ? <Badge tone="green">ACTIVE</Badge> : <Badge tone="red">INACTIVE</Badge> },
    { key: "actions", header: "", cell: (u) => (
      <Button
        variant={u.is_active ? "secondary" : "primary"}
        size="sm"
        onClick={(e) => { e.stopPropagation(); toggleUserActive(u); }}
      >
        {u.is_active ? "Deactivate" : "Activate"}
      </Button>
    )},
  ], [usersData]);

  if (!facility && !err) return <div className="text-sm text-slate-500">Loading...</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-sm text-slate-500"><Link href="/approvals/facilities" className="hover:underline">Facilities</Link> / {facility?.name || id}</div>
          <div className="mt-1 flex items-center gap-2">
            <div className="text-xl font-extrabold">{facility?.name}</div>
            <Badge tone={approvalTone}>{approvalLabel}</Badge>
            <Badge tone={visibilityTone}>{visibilityLabel}</Badge>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" onClick={() => router.push(`/audit?s=${encodeURIComponent(facility?.name || "")}`)}>Audit logs</Button>
          <Button variant="secondary" onClick={toggleActive} disabled={busy}>
            {facility?.is_active ? "Deactivate facility" : "Activate facility"}
          </Button>
          {facility?.is_approved ? (
            <>
              <Button variant="danger" onClick={() => setConfirm({ open: true, action: "unapprove" })} disabled={busy}>
                Unapprove
              </Button>
              {facility?.is_publicly_visible ? (
                <Button variant="secondary" onClick={() => setConfirm({ open: true, action: "hide" })} disabled={busy}>Hide</Button>
              ) : (
                <Button variant="primary" onClick={() => setConfirm({ open: true, action: "show" })} disabled={busy}>Show</Button>
              )}
            </>
          ) : (
            <Button variant="primary" onClick={() => setConfirm({ open: true, action: "approve" })} disabled={busy}>Approve</Button>
          )}
        </div>
      </div>

      {err ? <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{err}</div> : null}

      <div className="grid gap-4 lg:grid-cols-2">
        <Card title="Facility details">
          <dl className="grid grid-cols-2 gap-3 text-sm">
            <div><dt className="text-xs text-slate-500">Type</dt><dd className="font-medium">{facility?.facility_type || "—"}</dd></div>
            <div><dt className="text-xs text-slate-500">Controlled by</dt><dd className="font-medium">{facility?.controlled_by || "—"}</dd></div>
            <div><dt className="text-xs text-slate-500">State</dt><dd className="font-medium">{facility?.state || "—"}</dd></div>
            <div><dt className="text-xs text-slate-500">LGA</dt><dd className="font-medium">{facility?.lga || "—"}</dd></div>
            <div className="col-span-2"><dt className="text-xs text-slate-500">Address</dt><dd className="font-medium">{facility?.address || "—"}</dd></div>
            <div><dt className="text-xs text-slate-500">Email</dt><dd className="font-medium">{facility?.email || "—"}</dd></div>
            <div><dt className="text-xs text-slate-500">Phone</dt><dd className="font-medium">{facility?.phone || "—"}</dd></div>
            <div><dt className="text-xs text-slate-500">Created</dt><dd className="font-medium">{formatDate(facility?.created_at)}</dd></div>
            <div><dt className="text-xs text-slate-500">Updated</dt><dd className="font-medium">{formatDate(facility?.updated_at)}</dd></div>
            <div><dt className="text-xs text-slate-500">Approval</dt><dd className="font-medium"><Badge tone={approvalTone}>{approvalLabel}</Badge></dd></div>
            <div><dt className="text-xs text-slate-500">Approved at</dt><dd className="font-medium">{formatDate(facility?.approved_at)}</dd></div>
          </dl>
        </Card>

        <Card title="Verification documents">
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between rounded-xl border border-slate-100 px-3 py-2"><span>NHIS Certificate</span><DocLink href={facility?.nhis_certificate} /></div>
            <div className="flex items-center justify-between rounded-xl border border-slate-100 px-3 py-2"><span>MD Practice License</span><DocLink href={facility?.md_practice_license} /></div>
            <div className="flex items-center justify-between rounded-xl border border-slate-100 px-3 py-2"><span>State Registration Cert</span><DocLink href={facility?.state_registration_cert} /></div>
          </div>
          {Array.isArray(facility?.extra_docs) && facility.extra_docs.length ? (
            <div className="mt-3">
              <div className="mb-2 text-xs font-semibold text-slate-500">Extra documents</div>
              <div className="space-y-2">
                {facility.extra_docs.map((d) => (
                  <div key={d.id} className="flex items-center justify-between rounded-xl border border-slate-100 px-3 py-2 text-sm">
                    <span className="truncate">{d.title}</span>
                    <DocLink href={d.file} />
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </Card>
      </div>

      <Card
        title={`Facility users (${usersData?.count ?? 0})`}
        actions={
          <div className="flex items-end gap-2">
            <div className="w-52"><Input label="Search" value={userSearch} onChange={(e) => setUserSearch(e.target.value)} placeholder="email / name..." /></div>
            <div className="w-44">
              <Select label="Role" value={userRole} onChange={(e) => setUserRole(e.target.value)}>
                <option value="">All</option>
                <option value="SUPER_ADMIN">SUPER_ADMIN</option>
                <option value="ADMIN">ADMIN</option>
                <option value="DOCTOR">DOCTOR</option>
                <option value="NURSE">NURSE</option>
                <option value="LAB">LAB</option>
                <option value="PHARMACY">PHARMACY</option>
                <option value="FRONTDESK">FRONTDESK</option>
                <option value="PATIENT">PATIENT</option>
              </Select>
            </div>
            <div className="w-36">
              <Select label="Active" value={userActive} onChange={(e) => setUserActive(e.target.value)}>
                <option value="">All</option>
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </Select>
            </div>
            <Button variant="secondary" onClick={loadUsers}>Search</Button>
          </div>
        }
      >
        <Table
          columns={userColumns}
          rows={usersData?.results || []}
          rowKey={(u) => u.id}
          onRowClick={(u) => router.push(`/users/${u.id}`)}
        />
      </Card>

      <ConfirmDialog
        open={confirm.open}
        title={
          confirm.action === "approve"
            ? "Approve facility?"
            : confirm.action === "unapprove"
            ? "Unapprove facility?"
            : confirm.action === "show"
            ? "Show facility?"
            : "Hide facility?"
        }
        description={
          confirm.action === "approve"
            ? "This will approve the facility (unlock login) and make it publicly visible/bookable."
            : confirm.action === "unapprove"
            ? "This will block facility logins and hide it from public search."
            : confirm.action === "show"
            ? "This will make the facility publicly visible/bookable."
            : "This will hide the facility from public search and online booking."
        }
        confirmText={
          confirm.action === "approve"
            ? "Approve"
            : confirm.action === "unapprove"
            ? "Unapprove"
            : confirm.action === "show"
            ? "Show"
            : "Hide"
        }
        onConfirm={() => act(confirm.action)}
        onClose={() => setConfirm({ open: false, action: null })}
      />
    </div>
  );
}
