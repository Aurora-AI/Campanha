import { getLatestSnapshot } from '@/lib/publisher';
import {
  buildSimpleDashboardViewModel,
  type DashboardMetric,
  type DashboardStoreSection,
  type DashboardStoreSummaryRow,
  type DashboardTimelineRow,
} from '@/lib/server/simpleDashboardViewModel';
import type { Snapshot } from '@/lib/analytics/types';

export const dynamic = 'force-dynamic';

function formatUpdatedAt(value: string): string {
  try {
    return new Date(value).toLocaleString('pt-BR');
  } catch {
    return value;
  }
}

function formatPercent(value: number): string {
  return `${Math.round(value * 1000) / 10}%`;
}

function formatCurrency(value: number): string {
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
  });
}

function MetricCard({ metric }: { metric: DashboardMetric }) {
  return (
    <article className="rounded-[2rem] border border-black/8 bg-white/92 p-6 shadow-[0_18px_50px_rgba(24,22,17,0.06)] backdrop-blur">
      <div className="text-[11px] uppercase tracking-[0.28em] text-black/45">{metric.label}</div>
      <div className="mt-4 text-4xl font-semibold tracking-tight text-stone-950">{metric.value}</div>
      <p className="mt-3 max-w-xs text-sm leading-6 text-black/55">{metric.helper}</p>
    </article>
  );
}

function StoreSummaryTable({ rows }: { rows: DashboardStoreSummaryRow[] }) {
  return (
    <section className="rounded-[2rem] border border-black/8 bg-white p-6 shadow-[0_18px_50px_rgba(24,22,17,0.06)]">
      <div className="flex items-end justify-between gap-4">
        <div>
          <div className="text-[11px] uppercase tracking-[0.28em] text-black/45">Acompanhamento de venda</div>
          <h2 className="mt-3 font-serif text-3xl tracking-tight text-stone-950">Resumo por loja</h2>
        </div>
        <div className="text-sm text-black/50">Digitadas = soma de todos os status</div>
      </div>

      <div className="mt-8 overflow-hidden rounded-[1.5rem] border border-black/8">
        <div className="grid grid-cols-[minmax(0,1.6fr)_110px_110px_90px] gap-4 bg-stone-100/80 px-5 py-4 text-[11px] font-semibold uppercase tracking-[0.24em] text-black/45">
          <div>Loja</div>
          <div className="text-right">Digitadas</div>
          <div className="text-right">Aprovadas</div>
          <div className="text-right">Indice</div>
        </div>

        <div className="max-h-[32rem] overflow-y-auto">
          {rows.map((row) => (
            <div
              key={row.store}
              className="grid grid-cols-[minmax(0,1.6fr)_110px_110px_90px] gap-4 border-t border-black/6 px-5 py-4 text-sm text-stone-900"
            >
              <div className="font-medium">{row.store}</div>
              <div className="text-right tabular-nums">{row.submitted}</div>
              <div className="text-right tabular-nums">{row.approved}</div>
              <div className="text-right tabular-nums text-black/55">{formatPercent(row.approvalRate)}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function DailyTimeline({ rows }: { rows: DashboardTimelineRow[] }) {
  const maxValue = rows.reduce((highest, row) => Math.max(highest, row.submitted, row.approved), 1);

  return (
    <section className="rounded-[2rem] border border-black/8 bg-white p-6 shadow-[0_18px_50px_rgba(24,22,17,0.06)]">
      <div className="flex items-end justify-between gap-4">
        <div>
          <div className="text-[11px] uppercase tracking-[0.28em] text-black/45">Linha do tempo</div>
          <h2 className="mt-3 font-serif text-3xl tracking-tight text-stone-950">Controle diario</h2>
        </div>
        <div className="flex items-center gap-4 text-xs uppercase tracking-[0.24em] text-black/45">
          <span className="inline-flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
            Digitadas
          </span>
          <span className="inline-flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
            Aprovadas
          </span>
        </div>
      </div>

      <div className="mt-8 space-y-3">
        <div className="grid grid-cols-[112px_minmax(0,1fr)_54px_54px] gap-3 px-1 text-[11px] uppercase tracking-[0.24em] text-black/40">
          <div>Data</div>
          <div>Volume</div>
          <div className="text-right">Dig.</div>
          <div className="text-right">Aprov.</div>
        </div>

        <div className="max-h-[32rem] space-y-3 overflow-y-auto pr-1">
          {[...rows].reverse().map((row) => (
            <div
              key={row.dateISO}
              className="grid grid-cols-[112px_minmax(0,1fr)_54px_54px] items-center gap-3 rounded-[1.25rem] bg-stone-50 px-4 py-3"
            >
              <div className="text-sm font-medium text-stone-900">{row.dateISO}</div>
              <div className="space-y-2">
                <div className="h-2 overflow-hidden rounded-full bg-stone-200">
                  <div
                    className="h-full rounded-full bg-emerald-500"
                    style={{ width: `${Math.max((row.submitted / maxValue) * 100, row.submitted > 0 ? 6 : 0)}%` }}
                  />
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-stone-200">
                  <div
                    className="h-full rounded-full bg-amber-500"
                    style={{ width: `${Math.max((row.approved / maxValue) * 100, row.approved > 0 ? 6 : 0)}%` }}
                  />
                </div>
              </div>
              <div className="text-right text-sm tabular-nums text-stone-900">{row.submitted}</div>
              <div className="text-right text-sm tabular-nums text-stone-900">{row.approved}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function SalesBreakdown({ stores }: { stores: DashboardStoreSection[] }) {
  return (
    <section className="rounded-[2.5rem] border border-black/8 bg-white p-7 shadow-[0_24px_70px_rgba(24,22,17,0.08)]">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="text-[11px] uppercase tracking-[0.28em] text-black/45">Acompanhamento por loja</div>
          <h2 className="mt-3 font-serif text-4xl tracking-tight text-stone-950">Detalhamento por colaborador</h2>
        </div>
        <p className="max-w-2xl text-sm leading-6 text-black/55">
          Cada bloco consolida as propostas digitadas e aprovadas por usuario dentro da loja, sem regras antigas de grupo.
        </p>
      </div>

      <div className="mt-8 grid gap-5">
        {stores.map((store) => (
          <details key={store.store} className="group rounded-[1.75rem] border border-black/8 bg-stone-50/90 p-5" open>
            <summary className="cursor-pointer list-none">
              <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
                <div>
                  <div className="text-[11px] uppercase tracking-[0.24em] text-black/40">Loja</div>
                  <h3 className="mt-2 text-2xl font-semibold tracking-tight text-stone-950">{store.store}</h3>
                </div>

                <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                  <div className="rounded-[1.25rem] bg-white px-4 py-3 text-right">
                    <div className="text-[10px] uppercase tracking-[0.22em] text-black/40">Digitadas</div>
                    <div className="mt-2 text-xl font-semibold tabular-nums text-stone-950">{store.submitted}</div>
                  </div>
                  <div className="rounded-[1.25rem] bg-white px-4 py-3 text-right">
                    <div className="text-[10px] uppercase tracking-[0.22em] text-black/40">Aprovadas</div>
                    <div className="mt-2 text-xl font-semibold tabular-nums text-stone-950">{store.approved}</div>
                  </div>
                  <div className="rounded-[1.25rem] bg-white px-4 py-3 text-right">
                    <div className="text-[10px] uppercase tracking-[0.22em] text-black/40">Colaboradores</div>
                    <div className="mt-2 text-xl font-semibold tabular-nums text-stone-950">{store.members.length}</div>
                  </div>
                </div>
              </div>
            </summary>

            <div className="mt-6 overflow-hidden rounded-[1.5rem] border border-black/8 bg-white">
              <div className="grid grid-cols-[minmax(0,0.9fr)_minmax(0,1.2fr)_110px_110px] gap-4 bg-stone-100/80 px-5 py-4 text-[11px] font-semibold uppercase tracking-[0.24em] text-black/45">
                <div>Cargo</div>
                <div>Nome</div>
                <div className="text-right">Digitadas</div>
                <div className="text-right">Aprovadas</div>
              </div>

              {store.members.map((member) => (
                <div
                  key={`${store.store}-${member.role}-${member.name}`}
                  className="grid grid-cols-[minmax(0,0.9fr)_minmax(0,1.2fr)_110px_110px] gap-4 border-t border-black/6 px-5 py-4 text-sm"
                >
                  <div className="text-black/60">{member.role}</div>
                  <div className="font-medium text-stone-950">{member.name}</div>
                  <div className="text-right tabular-nums text-stone-950">{member.submitted}</div>
                  <div className="text-right tabular-nums text-stone-950">{member.approved}</div>
                </div>
              ))}
            </div>
          </details>
        ))}
      </div>
    </section>
  );
}

function CampaignBreakdown({ stores }: { stores: DashboardStoreSection[] }) {
  return (
    <section className="rounded-[2.5rem] border border-black/8 bg-[#181611] p-7 text-white shadow-[0_28px_80px_rgba(24,22,17,0.18)]">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="text-[11px] uppercase tracking-[0.28em] text-white/45">Campanha vigente</div>
          <h2 className="mt-3 font-serif text-4xl tracking-tight text-white">Premiacao por loja</h2>
        </div>
        <p className="max-w-2xl text-sm leading-6 text-white/60">
          O calculo considera apenas os perfis Atendente da Loja e Gerente de Loja. Premiacao: R$ 10,00 por aprovada.
        </p>
      </div>

      <div className="mt-8 grid gap-5">
        {stores.map((store) => (
          <article key={store.store} className="rounded-[1.75rem] border border-white/10 bg-white/4 p-5 backdrop-blur">
            <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
              <div>
                <div className="text-[11px] uppercase tracking-[0.24em] text-white/45">Loja</div>
                <h3 className="mt-2 text-2xl font-semibold tracking-tight text-white">{store.store}</h3>
              </div>

              <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                <div className="rounded-[1.25rem] border border-white/10 bg-black/10 px-4 py-3 text-right">
                  <div className="text-[10px] uppercase tracking-[0.22em] text-white/45">Digitadas</div>
                  <div className="mt-2 text-xl font-semibold tabular-nums text-white">{store.submitted}</div>
                </div>
                <div className="rounded-[1.25rem] border border-white/10 bg-black/10 px-4 py-3 text-right">
                  <div className="text-[10px] uppercase tracking-[0.22em] text-white/45">Aprovadas</div>
                  <div className="mt-2 text-xl font-semibold tabular-nums text-white">{store.approved}</div>
                </div>
                <div className="rounded-[1.25rem] border border-white/10 bg-black/10 px-4 py-3 text-right">
                  <div className="text-[10px] uppercase tracking-[0.22em] text-white/45">Premiacao</div>
                  <div className="mt-2 text-xl font-semibold tabular-nums text-[#ecb613]">{formatCurrency(store.prize)}</div>
                </div>
              </div>
            </div>

            <div className="mt-6 overflow-hidden rounded-[1.5rem] border border-white/10">
              <div className="grid grid-cols-[minmax(0,0.9fr)_minmax(0,1.2fr)_96px_96px_132px] gap-4 bg-white/6 px-5 py-4 text-[11px] font-semibold uppercase tracking-[0.24em] text-white/50">
                <div>Cargo</div>
                <div>Nome</div>
                <div className="text-right">Digit.</div>
                <div className="text-right">Aprov.</div>
                <div className="text-right">Premiacao</div>
              </div>

              {store.members.length === 0 ? (
                <div className="px-5 py-5 text-sm text-white/60">Sem participantes elegiveis nesta loja.</div>
              ) : (
                store.members.map((member) => (
                  <div
                    key={`${store.store}-${member.role}-${member.name}`}
                    className="grid grid-cols-[minmax(0,0.9fr)_minmax(0,1.2fr)_96px_96px_132px] gap-4 border-t border-white/8 px-5 py-4 text-sm"
                  >
                    <div className="text-white/62">{member.role}</div>
                    <div className="font-medium text-white">{member.name}</div>
                    <div className="text-right tabular-nums text-white">{member.submitted}</div>
                    <div className="text-right tabular-nums text-white">{member.approved}</div>
                    <div className="text-right tabular-nums text-[#ecb613]">{formatCurrency(member.prize)}</div>
                  </div>
                ))
              )}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

export default async function HomePage() {
  const snapshot = (await getLatestSnapshot().catch(() => null)) as Snapshot | null;
  const model = buildSimpleDashboardViewModel(snapshot);

  return (
    <main className="min-h-screen bg-[#f5f1e8] text-stone-950">
      <section className="relative overflow-hidden border-b border-black/8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(236,182,19,0.18),_transparent_28%),radial-gradient(circle_at_85%_15%,_rgba(16,185,129,0.12),_transparent_22%),linear-gradient(180deg,_rgba(255,255,255,0.78),_rgba(245,241,232,0.92))]" />
        <div className="absolute inset-x-0 top-0 h-px bg-black/6" />

        <div className="relative mx-auto w-[min(1400px,92vw)] py-16 md:py-20">
          <div className="flex flex-col gap-10 md:flex-row md:items-end md:justify-between">
            <div className="max-w-4xl">
              <div className="text-[11px] uppercase tracking-[0.32em] text-black/45">Painel operacional</div>
              <h1 className="mt-5 max-w-5xl font-serif text-5xl leading-none tracking-tight text-stone-950 md:text-7xl">
                Vendas e campanha em uma leitura unica, limpa e objetiva.
              </h1>
              <p className="mt-6 max-w-2xl text-base leading-7 text-black/60 md:text-lg">
                Sem grupos, sem regras antigas e sem camadas desnecessarias. O foco agora e loja, volume digitado,
                aprovacao diaria e premiacao por colaborador elegivel.
              </p>
            </div>

            <div className="rounded-[2rem] border border-black/8 bg-white/80 px-6 py-5 shadow-[0_18px_50px_rgba(24,22,17,0.06)] backdrop-blur">
              <div className="text-[11px] uppercase tracking-[0.24em] text-black/45">Atualizacao</div>
              <div className="mt-3 text-2xl font-semibold tracking-tight text-stone-950">
                {formatUpdatedAt(model.updatedAtISO)}
              </div>
              {model.status === 'ok' ? (
                <div className="mt-3 text-sm text-black/55">Periodo consolidado: {model.periodLabel}</div>
              ) : (
                <div className="mt-3 text-sm text-black/55">Aguardando publicacao de snapshot.</div>
              )}
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto w-[min(1400px,92vw)] py-10 md:py-14">
        {model.status === 'empty' ? (
          <section className="rounded-[2.5rem] border border-dashed border-black/12 bg-white/90 px-8 py-20 text-center shadow-[0_24px_70px_rgba(24,22,17,0.06)]">
            <div className="text-[11px] uppercase tracking-[0.32em] text-black/45">Sem dados publicados</div>
            <h2 className="mt-5 font-serif text-4xl tracking-tight text-stone-950">Publique um CSV para iniciar o novo painel.</h2>
            <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-black/55">
              Assim que o snapshot estiver disponivel, esta tela passa a mostrar o acompanhamento por loja, a linha do
              tempo diaria e a campanha vigente por colaborador elegivel.
            </p>
          </section>
        ) : (
          <div className="space-y-12">
            <section className="space-y-7">
              <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                <div>
                  <div className="text-[11px] uppercase tracking-[0.32em] text-black/45">Controle 01</div>
                  <h2 className="mt-3 font-serif text-4xl tracking-tight text-stone-950">Acompanhamento de venda</h2>
                </div>
                <p className="max-w-2xl text-sm leading-6 text-black/55">
                  Volume consolidado por loja, leitura diaria do desempenho e abertura por colaborador para operacao.
                </p>
              </div>

              <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
                {model.overview.map((metric) => (
                  <MetricCard key={metric.label} metric={metric} />
                ))}
              </div>

              <div className="grid gap-5 xl:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
                <StoreSummaryTable rows={model.storeSummary} />
                <DailyTimeline rows={model.dailyTimeline} />
              </div>

              <SalesBreakdown stores={model.salesByStore} />
            </section>

            <section className="space-y-7">
              <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                <div>
                  <div className="text-[11px] uppercase tracking-[0.32em] text-black/45">Controle 02</div>
                  <h2 className="mt-3 font-serif text-4xl tracking-tight text-stone-950">Campanha vigente</h2>
                </div>
                <p className="max-w-2xl text-sm leading-6 text-black/55">
                  Acompanhe cargo, nome, digitadas, aprovadas e premiacao por loja somente com os perfis participantes.
                </p>
              </div>

              <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
                {model.campaignOverview.map((metric) => (
                  <MetricCard key={metric.label} metric={metric} />
                ))}
              </div>

              <CampaignBreakdown stores={model.campaignByStore} />
            </section>
          </div>
        )}
      </div>
    </main>
  );
}
