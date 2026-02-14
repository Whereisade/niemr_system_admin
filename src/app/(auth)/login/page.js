"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Card from "@/components/Card";
import Input from "@/components/Input";
import Button from "@/components/Button";
import { apiFetch } from "@/lib/api";
import { getToken, setTokens } from "@/lib/auth";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    // If already logged in, skip the login screen.
    if (getToken()) router.replace("/dashboard");
  }, [router]);

  async function onSubmit(e) {
    e.preventDefault();
    setErr("");
    setBusy(true);
    try {
      // Backend enforces strict portal boundaries.
      // System Admin console users authenticate through the SYSTEM_ADMIN portal group.
      const data = await apiFetch("accounts/login/", {
        method: "POST",
        body: { email, password, portal: "system_admin" },
      });

      // NIEMR backend returns: { tokens: { access, refresh }, user: {...} }
      const access =
        data?.tokens?.access ||
        data?.access ||
        data?.token ||
        data?.jwt ||
        null;

      const refresh =
        data?.tokens?.refresh ||
        data?.refresh ||
        null;

      if (!access) throw new Error("Login succeeded but token not found.");

      setTokens({ access, refresh });
      router.replace("/dashboard");
    } catch (e) {
      setErr(e.message || "Login failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen grid place-items-center p-6">
      <div className="w-full max-w-md">
        <Card title="Sign in">
          <form className="space-y-3" onSubmit={onSubmit}>
            <Input label="Email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="admin@niemr.app" />
            <Input label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
            {err ? <div className="text-sm text-rose-600">{err}</div> : null}
            <Button className="w-full" disabled={busy}>
              {busy ? "Signing in..." : "Sign in"}
            </Button>
            <div className="text-xs text-slate-500">
              This console expects an <span className="font-medium">application-level SUPER_ADMIN</span> (role SUPER_ADMIN with no facility) or a Django superuser.
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
