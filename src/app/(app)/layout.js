"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";
import { getToken } from "@/lib/auth";

export default function AppLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const t = getToken();
    if (!t) router.push("/login");
  }, [router, pathname]);

  return (
    <div className="min-h-screen">
      <div className="flex min-h-screen">
        <Sidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <Topbar title="NIEMR Super Admin" subtitle="Platform management" />
          <main className="flex-1 p-6">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
