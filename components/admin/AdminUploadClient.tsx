"use client";

import React from "react";

type PublishResult = {
  ok?: boolean;
  version?: string | number;
  publishedVersion?: string | number;
  message?: string;
  error?: string;
};

export default function AdminUploadClient() {
  const [file, setFile] = React.useState<File | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [result, setResult] = React.useState<PublishResult | null>(null);

  async function publish() {
    if (!file) return;

    setLoading(true);
    setResult(null);

    try {
      const fd = new FormData();
      fd.append("file", file);

      const res = await fetch("/api/publish-csv", {
        method: "POST",
        body: fd,
      });

      const json = (await res.json().catch(() => ({}))) as PublishResult;

      if (!res.ok) throw new Error(json?.error ?? `HTTP ${res.status}`);

      setResult(json);
    } catch (e: any) {
      setResult({ ok: false, error: e?.message ?? "Falha ao publicar." });
    } finally {
      setLoading(false);
    }
  }

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" }).catch(() => null);
    window.location.href = "/admin/login";
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-medium">Admin · Publicar CSV</h1>
        <button className="text-sm underline" onClick={logout}>
          Sair
        </button>
      </div>

      <div className="border border-neutral-200 rounded-2xl p-4 space-y-3">
        <input
          type="file"
          accept=".csv,text/csv"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        />

        <button
          className="rounded-xl bg-black text-white px-4 py-2 disabled:opacity-60"
          disabled={!file || loading}
          onClick={publish}
        >
          {loading ? "Publicando..." : "Publicar"}
        </button>

        {result ? (
          <div className="text-sm">
            {result.ok === false ? (
              <p className="text-red-600">Erro: {result.error ?? "Falha"}</p>
            ) : (
              <div className="space-y-1">
                <p className="text-green-700">Snapshot publicado com sucesso.</p>
                {result.publishedVersion ?? result.version ? (
                  <p className="text-neutral-700">
                    Versão: {String(result.publishedVersion ?? result.version)}
                  </p>
                ) : null}
                <div className="flex gap-3 pt-2">
                  <a className="underline" href="/" target="_blank" rel="noreferrer">
                    Abrir Home
                  </a>
                  <a className="underline" href="/api/latest" target="_blank" rel="noreferrer">
                    Ver /api/latest
                  </a>
                  <a className="underline" href="/api/editorial-summary" target="_blank" rel="noreferrer">
                    Ver /api/editorial-summary
                  </a>
                </div>
              </div>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
}
