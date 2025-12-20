'use client';

import { useMemo, useState } from 'react';

export default function AdminPage() {
  const [adminToken, setAdminToken] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<string>('');

  const canPublish = useMemo(() => adminToken.trim().length > 10 && !!file, [adminToken, file]);

  async function publish() {
    if (!file) return;

    setStatus('Publicando CSV...');
    try {
      const fd = new FormData();
      fd.append('file', file);

      const res = await fetch('/api/publish-csv', {
        method: 'POST',
        headers: {
          'x-admin-token': adminToken.trim(),
        },
        body: fd,
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setStatus(`Falha: ${data?.error ?? res.status}`);
        return;
      }

      setStatus(
        `Publicado com sucesso. Linhas processadas: ${data.proposals ?? '-'}. Verifique /api/latest e a Home.`
      );
    } catch (e: any) {
      setStatus(`Erro: ${e?.message ?? 'publish failed'}`);
    }
  }

  return (
    <main className="min-h-[100svh] bg-stone-50">
      <div className="mx-auto w-[min(1100px,92vw)] py-20">
        <h1 className="font-serif text-5xl tracking-tighter md:text-6xl">Admin Publish</h1>
        <p className="mt-4 text-sm tracking-wide text-black/55">
          Protegido por Access + ADMIN_TOKEN. Faca upload do CSV original (consulta-cartoes-solicitados.csv) e
          publique.
        </p>

        <div className="mt-10 grid grid-cols-1 gap-6">
          <div className="rounded-sm border border-black/10 bg-white p-6 shadow-sm">
            <div className="text-[10px] uppercase tracking-[0.28em] text-black/40">ADMIN_TOKEN</div>
            <input
              value={adminToken}
              onChange={(e) => setAdminToken(e.target.value)}
              className="mt-3 w-full rounded-sm border border-black/10 px-4 py-3 text-sm"
              placeholder="Cole o ADMIN_TOKEN aqui"
            />
          </div>

          <div className="rounded-sm border border-black/10 bg-white p-6 shadow-sm">
            <div className="text-[10px] uppercase tracking-[0.28em] text-black/40">CSV</div>
            <input
              type="file"
              accept=".csv,text/csv"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              className="mt-3 w-full rounded-sm border border-black/10 px-4 py-3 text-sm"
            />
            <div className="mt-2 text-xs text-black/50">
              O parser ignora as 4 primeiras linhas e le a tabela a partir do header real.
            </div>
          </div>

          <button
            disabled={!canPublish}
            onClick={publish}
            className="w-fit rounded-sm bg-black px-6 py-3 text-xs font-semibold uppercase tracking-[0.22em] text-white disabled:opacity-40"
          >
            Publish latest
          </button>

          {status ? <div className="text-sm tracking-wide text-black/60">{status}</div> : null}
        </div>
      </div>
    </main>
  );
}
