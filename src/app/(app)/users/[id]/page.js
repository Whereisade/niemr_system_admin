"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import Card from "@/components/Card";
import Badge from "@/components/Badge";
import Button from "@/components/Button";
import { apiFetch } from "@/lib/api";
import { formatDate } from "@/lib/format";

export default function UserDetailPage() {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  async function load() {
    setErr("");
    try {
      const data = await apiFetch(`system-admin/users/${id}/`);
      setUser(data);
    } catch (e) {
      setErr(e.message);
    }
  }

  useEffect(() => { load(); }, [id]);

  async function toggle() {
    setBusy(true);
    setErr("");
    try {
      if (user?.is_active) await apiFetch(`system-admin/users/${id}/deactivate/`, { method: "POST" });
      else await apiFetch(`system-admin/users/${id}/reactivate/`, { method: "POST" });
      await load();
    } catch (e) {
      setErr(e.message);
    } finally {
      setBusy(false);
    }
  }

  if (!user && !err) return <div className="text-sm text-slate-500">Loading...</div>;

  return (
    <div className="space-y-4">
      <div className="text-sm text-slate-500"><Link href="/users" className="hover:underline">Users</Link> / {user?.email || id}</div>

      {err ? <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{err}</div> : null}

      <div className="grid gap-4 lg:grid-cols-2">
        <Card title="Account">
          <dl className="grid grid-cols-2 gap-3 text-sm">
            <div><dt className="text-xs text-slate-500">Email</dt><dd className="font-medium">{user?.email}</dd></div>
            <div><dt className="text-xs text-slate-500">Role</dt><dd className="font-medium">{user?.role || "—"}</dd></div>
            <div><dt className="text-xs text-slate-500">Name</dt><dd className="font-medium">{`${user?.first_name || ""} ${user?.last_name || ""}`.trim() || "—"}</dd></div>
            <div><dt className="text-xs text-slate-500">Status</dt><dd className="font-medium">{user?.is_active ? <Badge tone="green">ACTIVE</Badge> : <Badge tone="red">INACTIVE</Badge>}</dd></div>
            <div><dt className="text-xs text-slate-500">Facility</dt><dd className="font-medium">{user?.facility_name || "—"}</dd></div>
            <div><dt className="text-xs text-slate-500">Email verified</dt><dd className="font-medium">{user?.email_verified ? "Yes" : "No"}</dd></div>
            <div><dt className="text-xs text-slate-500">Joined</dt><dd className="font-medium">{formatDate(user?.date_joined)}</dd></div>
            <div><dt className="text-xs text-slate-500">Last login</dt><dd className="font-medium">{formatDate(user?.last_login)}</dd></div>
          </dl>

          <div className="mt-4 flex items-center gap-2">
            <Button variant={user?.is_active ? "secondary" : "primary"} onClick={toggle} disabled={busy}>
              {user?.is_active ? "Deactivate" : "Activate"}
            </Button>
            <Link href={`/audit?s=${encodeURIComponent(user?.email || "")}`} className="text-sm font-medium text-slate-900 hover:underline">
              View audit logs
            </Link>
          </div>
        </Card>

        <Card title="Profiles">
          <dl className="grid grid-cols-2 gap-3 text-sm">
            <div><dt className="text-xs text-slate-500">Provider profile</dt><dd className="font-medium">{user?.has_provider_profile ? "Yes" : "No"}</dd></div>
            <div><dt className="text-xs text-slate-500">Patient profile</dt><dd className="font-medium">{user?.has_patient_profile ? "Yes" : "No"}</dd></div>
            <div><dt className="text-xs text-slate-500">Sacked</dt><dd className="font-medium">{user?.is_sacked ? <Badge tone="red">SACKED</Badge> : <Badge tone="slate">NO</Badge>}</dd></div>
            <div><dt className="text-xs text-slate-500">Sacked at</dt><dd className="font-medium">{formatDate(user?.sacked_at)}</dd></div>
          </dl>
          <div className="mt-3 text-xs text-slate-500">
            (Role edits and password resets are intentionally not exposed yet.)
          </div>
        </Card>
      </div>
    </div>
  );
}
