"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, CheckCircle2, Building2, Users2, FileSearch, ClipboardList } from "lucide-react";
import { classNames } from "@/lib/format";

const items = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/approvals", label: "Approvals Queue", icon: ClipboardList },
  { href: "/approvals/facilities", label: "Facilities", icon: Building2 },
  { href: "/approvals/providers", label: "Providers", icon: CheckCircle2 },
  { href: "/users", label: "Users", icon: Users2 },
  
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-64 shrink-0 border-r border-slate-200 bg-white lg:block">
      <div className="px-5 py-5">
        <div className="text-sm font-extrabold tracking-tight text-slate-900">NIEMR</div>
        <div className="text-xs text-slate-500">Super Admin</div>
      </div>

      <nav className="px-3 pb-5">
        {items.map((it) => {
          const active = pathname === it.href || (it.href !== "/" && pathname.startsWith(it.href));
          const Icon = it.icon;
          return (
            <Link
              key={it.href}
              href={it.href}
              className={classNames(
                "flex items-center gap-3 rounded-xl px-3 py-2 text-sm",
                active ? "bg-slate-100 text-slate-900" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              )}
            >
              <Icon size={18} />
              <span>{it.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
