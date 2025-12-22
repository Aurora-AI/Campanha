"use client";

import React from "react";
import { DateTime } from "luxon";

type PublishResult = {
  ok?: boolean;
  version?: string | number;
  publishedVersion?: string | number;
  message?: string;
  error?: string;
  months?: number;
  updatedAtISO?: string;
  spilloverFinalizedOutsideMonthCount?: number;
  canonicalMonthField?: { key: string; strategy: string };
};

type MonthlyIndex = {
  schemaVersion: "campaign-monthly-index/v1";
  updatedAtISO: string;
  months: Array<{ year: number; month: number; source: string; uploadedAtISO: string; pathname?: string }>;
  current?: { year: number; month: number };
};

function isMonthlyIndex(value: unknown): value is MonthlyIndex {
  if (!value || typeof value !== "object") return false;
  const rec = value as Record<string, unknown>;
  if (rec.schemaVersion !== "campaign-monthly-index/v1") return false;
  if (!Array.isArray(rec.months)) return false;
  return true;
}

export default function AdminUploadClient() {
  const [publishFile, setPublishFile] = React.useState<File | null>(null);
  const [monthlyFile, setMonthlyFile] = React.useState<File | null>(null);
  const [year, setYear] = React.useState<number>(new Date().getFullYear());
  const [month, setMonth] = React.useState<number>(new Date().getMonth() + 1);
  const [overwriteMonthly, setOverwriteMonthly] = React.useState(false);

  const [loadingPublish, setLoadingPublish] = React.useState(false);
  const [loadingMonthly, setLoadingMonthly] = React.useState(false);
  const [publishResult, setPublishResult] = React.useState<PublishResult | null>(null);
  const [monthlyResult, setMonthlyResult] = React.useState<PublishResult | null>(null);

  const [monthlyIndex, setMonthlyIndex] = React.useState<MonthlyIndex | null>(null);

  const nowSP = DateTime.now().setZone("America/Sao_Paulo");
  const isCurrentMonthSelected = year === nowSP.year && month === nowSP.month;
  const monthExists = !!monthlyIndex?.months?.some((m) => m.year === year && m.month === month);
  const canPublishMonth = !!monthlyFile && !loadingMonthly && !isCurrentMonthSelected && (!monthExists || overwriteMonthly);

  const reloadMonthlyIndex = React.useCallback(async () => {
    try {
      const res = await fetch("/api/monthly-index", { cache: "no-store" });
      if (res.status === 204) {
        setMonthlyIndex(null);
        return;
      }
      if (!res.ok) return;
      const json = await res.json();
      setMonthlyIndex(isMonthlyIndex(json) ? json : null);
    } catch {
      setMonthlyIndex(null);
    }
  }, []);

  React.useEffect(() => {
    reloadMonthlyIndex();
  }, [reloadMonthlyIndex]);

  async function publish() {
    if (!publishFile) return;

    setLoadingPublish(true);
    setPublishResult(null);

    try {
      const fd = new FormData();
      fd.append("file", publishFile);

      const res = await fetch("/api/publish-csv", {
        method: "POST",
        body: fd,
      });

      const json = (await res.json().catch(() => ({}))) as PublishResult;

      if (!res.ok) throw new Error(json?.error ?? `HTTP ${res.status}`);

      setPublishResult(json);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Falha ao publicar.";
      setPublishResult({ ok: false, error: message });
    } finally {
      setLoadingPublish(false);
    }
  }

  async function publishMonth() {
    if (!monthlyFile) return;
    if (isCurrentMonthSelected) {
      setMonthlyResult({
        ok: false,
        error: "Mês corrente vem do “Publicar CSV”. Aqui só registramos meses encerrados (histórico).",
      });
      return;
    }
    if (monthExists && !overwriteMonthly) {
      setMonthlyResult({
        ok: false,
        error: "Esse mês já existe no histórico. Marque overwrite para substituir.",
      });
      return;
    }

    setLoadingMonthly(true);
    setMonthlyResult(null);

    try {
      const fd = new FormData();
      fd.append("file", monthlyFile);
      fd.append("year", String(year));
      fd.append("month", String(month));
      fd.append("overwrite", overwriteMonthly ? "1" : "0");

      const res = await fetch("/api/publish-month", { method: "POST", body: fd });
      const json = (await res.json().catch(() => ({}))) as PublishResult;

      if (!res.ok) throw new Error(json?.message ?? json?.error ?? `HTTP ${res.status}`);

      setMonthlyResult(json);
      await reloadMonthlyIndex();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Falha ao publicar mês.";
      setMonthlyResult({ ok: false, error: message });
    } finally {
      setLoadingMonthly(false);
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
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPublishFile(e.target.files?.[0] ?? null)}
        />

        <button
          className="rounded-xl bg-black text-white px-4 py-2 disabled:opacity-60"
          disabled={!publishFile || loadingPublish}
          onClick={publish}
        >
          {loadingPublish ? "Publicando..." : "Publicar"}
        </button>

        {publishResult ? (
          <div className="text-sm">
            {publishResult.ok === false ? (
              <p className="text-red-600">Erro: {publishResult.error ?? "Falha"}</p>
            ) : (
              <div className="space-y-1">
                <p className="text-green-700">Snapshot publicado com sucesso.</p>
                {publishResult.publishedVersion ?? publishResult.version ? (
                  <p className="text-neutral-700">
                    Versão: {String(publishResult.publishedVersion ?? publishResult.version)}
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

      <div className="border border-neutral-200 rounded-2xl p-4 space-y-4">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-sm font-medium">Ingestão mensal (histórico — meses encerrados)</h2>
          <button className="text-xs underline" onClick={reloadMonthlyIndex} type="button">
            Recarregar índice
          </button>
        </div>

        <div className="text-xs text-neutral-600">
          O mês corrente vem do <span className="font-medium">Publicar CSV</span>. Use aqui apenas para registrar meses anteriores (data lake).
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <label className="text-xs text-neutral-600">
            Ano
            <input
              type="number"
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
              className="mt-1 w-full rounded-xl border border-neutral-200 px-3 py-2 text-sm"
            />
          </label>
          <label className="text-xs text-neutral-600">
            Mês
            <input
              type="number"
              min={1}
              max={12}
              value={month}
              onChange={(e) => setMonth(Number(e.target.value))}
              className="mt-1 w-full rounded-xl border border-neutral-200 px-3 py-2 text-sm"
            />
          </label>
          <div className="md:col-span-1">
            <div className="text-xs text-neutral-600">Arquivo</div>
            <input
              type="file"
              accept=".csv,text/csv"
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setMonthlyFile(e.target.files?.[0] ?? null)}
              className="mt-1"
            />
          </div>
        </div>

        <label className="flex items-center gap-2 text-xs text-neutral-600">
          <input
            type="checkbox"
            checked={overwriteMonthly}
            onChange={(e) => setOverwriteMonthly(e.target.checked)}
          />
          Overwrite (se esse mês já estiver no histórico)
        </label>

        {isCurrentMonthSelected ? (
          <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-900">
            Mês corrente bloqueado: publique via “Publicar CSV”.
          </div>
        ) : null}

        {!isCurrentMonthSelected && monthExists && !overwriteMonthly ? (
          <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-900">
            Esse mês já existe no histórico. Marque overwrite para substituir.
          </div>
        ) : null}

        <button
          className="rounded-xl bg-black text-white px-4 py-2 disabled:opacity-60"
          disabled={!canPublishMonth}
          onClick={publishMonth}
        >
          {loadingMonthly ? "Registrando mês..." : "Registrar mês histórico"}
        </button>

        {monthlyResult ? (
          <div className="text-sm">
            {monthlyResult.ok === false ? (
              <p className="text-red-600">Erro: {monthlyResult.error ?? "Falha"}</p>
            ) : (
              <div className="space-y-1">
                <p className="text-green-700">Mês publicado e indexado.</p>
                {typeof monthlyResult.spilloverFinalizedOutsideMonthCount === "number" &&
                monthlyResult.spilloverFinalizedOutsideMonthCount > 0 ? (
                  <p className="text-neutral-700">
                    Aviso: {monthlyResult.spilloverFinalizedOutsideMonthCount} registros finalizaram fora do mês (normal).
                  </p>
                ) : null}
                {typeof monthlyResult.months === "number" ? (
                  <p className="text-neutral-700">Meses no índice: {monthlyResult.months}</p>
                ) : null}
                {monthlyResult.updatedAtISO ? (
                  <p className="text-neutral-700">Atualizado em: {monthlyResult.updatedAtISO}</p>
                ) : null}
              </div>
            )}
          </div>
        ) : null}

        <details className="rounded-xl border border-neutral-200 bg-neutral-50 p-4">
          <summary className="cursor-pointer text-xs font-semibold uppercase tracking-widest text-neutral-600">
            Índice mensal
          </summary>
          <pre className="mt-3 max-h-64 overflow-auto rounded-lg bg-white p-3 text-[11px] text-neutral-800 border border-neutral-200">
            {JSON.stringify(monthlyIndex, null, 2)}
          </pre>
        </details>
      </div>
    </div>
  );
}
