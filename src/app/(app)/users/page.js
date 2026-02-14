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

export default function UsersPage() {
  const PAGE_SIZE = 50;
  const router = useRouter();
  const [q, setQ] = useState("");
  const [role, setRole] = useState("");
  const [facility, setFacility] = useState("");
  const [isActive, setIsActive] = useState("");
  const [offset, setOffset] = useState(0);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [data, setData] = useState({ count: 0, results: [] });
  const [facilities, setFacilities] = useState([]);

  async function loadFacilities() {
    try {
      const res = await apiFetch("system-admin/facilities/?limit=200");
      setFacilities(res?.results || []);
    } catch {}
  }

  async function load(nextOffset = offset) {
    setBusy(true);
    setErr("");
    try {
      const query = qs({ q, role, facility, is_active: isActive, limit: PAGE_SIZE, offset: nextOffset });
      const res = await apiFetch(`system-admin/users/?${query}`);
      setData(res);
    } catch (e) {
      setErr(e.message);
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => { loadFacilities(); load(); }, []);

  const total = data?.count ?? 0;
  const currentPage = Math.floor(offset / PAGE_SIZE) + 1;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const hasPrevious = offset > 0;
  const hasNext = Boolean(data?.next) || (offset + (data?.results?.length || 0) < total);

  const columns = useMemo(() => [
    { key: "email", header: "Email", cell: (u) => <div className="font-medium text-slate-900">{u.email}</div> },
    { key: "name", header: "Name", cell: (u) => `${u.first_name || ""} ${u.last_name || ""}`.trim() || "—" },
    { key: "role", header: "Role", cell: (u) => u.role || "—" },
    { key: "facility_name", header: "Facility", cell: (u) => u.facility_name || "—" },
    { key: "is_active", header: "Status", cell: (u) => u.is_active ? <Badge tone="green">ACTIVE</Badge> : <Badge tone="red">INACTIVE</Badge> },
    { key: "date_joined", header: "Joined", cell: (u) => formatDate(u.date_joined) },
  ], []);

  return (
    <div className="space-y-4">
      <Card
        title="Users"
        actions={
          <div className="flex items-end gap-2">
            <div className="w-72"><Input label="Search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="email, name..." /></div>
            <div className="w-44">
              <Select label="Role" value={role} onChange={(e) => setRole(e.target.value)}>
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
            <div className="w-56">
              <Select label="Facility" value={facility} onChange={(e) => setFacility(e.target.value)}>
                <option value="">All</option>
                <option value="none">No facility</option>
                {facilities.map((f) => <option key={f.id} value={String(f.id)}>{f.name}</option>)}
              </Select>
            </div>
            <div className="w-36">
              <Select label="Active" value={isActive} onChange={(e) => setIsActive(e.target.value)}>
                <option value="">All</option>
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </Select>
            </div>
            <button
              className="h-10 rounded-lg bg-slate-900 px-4 text-sm font-medium text-white hover:bg-slate-800"
              onClick={() => {
                setOffset(0);
                load(0);
              }}
              disabled={busy}
            >
              {busy ? "Loading..." : "Search"}
            </button>
          </div>
        }
      >
        {err ? <div className="mb-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{err}</div> : null}
        <Table columns={columns} rows={data?.results || []} rowKey={(u) => u.id} onRowClick={(u) => router.push(`/users/${u.id}`)} />
        <div className="mt-3 flex items-center justify-between gap-3">
          <div className="text-xs text-slate-500">{total} total</div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">Page {currentPage} of {totalPages}</span>
            <button
              className="h-8 rounded-lg border border-slate-200 px-3 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              onClick={() => {
                const nextOffset = Math.max(0, offset - PAGE_SIZE);
                setOffset(nextOffset);
                load(nextOffset);
              }}
              disabled={busy || !hasPrevious}
            >
              Previous
            </button>
            <button
              className="h-8 rounded-lg border border-slate-200 px-3 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              onClick={() => {
                const nextOffset = offset + PAGE_SIZE;
                setOffset(nextOffset);
                load(nextOffset);
              }}
              disabled={busy || !hasNext}
            >
              Next
            </button>
          </div>
        </div>
      </Card>
    </div>
  );
}
