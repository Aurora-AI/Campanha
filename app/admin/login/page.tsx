"use client";

import React from "react";

export default function AdminLoginPage() {
  const [username, setUsername] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (!res.ok) {
        const json = await res.json().catch(() => null);
        throw new Error(json?.error ?? `HTTP ${res.status}`);
      }

      window.location.href = "/admin";
    } catch (err: any) {
      setError(err?.message ?? "Falha no login.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-[100svh] bg-white flex items-center justify-center">
      <div className="w-[min(420px,92vw)] border border-neutral-200 rounded-2xl p-6">
        <h1 className="text-lg font-medium">Admin</h1>
        <p className="text-sm text-neutral-600 mt-1">Acesso restrito.</p>

        <form className="mt-6 space-y-3" onSubmit={onSubmit}>
          <div>
            <label className="text-sm text-neutral-700">Usuário</label>
            <input
              className="mt-1 w-full rounded-xl border border-neutral-200 px-3 py-2 outline-none"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
            />
          </div>

          <div>
            <label className="text-sm text-neutral-700">Senha</label>
            <input
              className="mt-1 w-full rounded-xl border border-neutral-200 px-3 py-2 outline-none"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />
          </div>

          {error ? <p className="text-sm text-red-600">{error}</p> : null}

          <button
            className="w-full rounded-xl bg-black text-white py-2 disabled:opacity-60"
            disabled={loading}
            type="submit"
          >
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>
      </div>
    </main>
  );
}
