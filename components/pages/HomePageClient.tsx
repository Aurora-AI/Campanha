"use client";

import Link from "next/link";

import Hero from "@/components/organisms/Hero";
import type { HeroPayload } from "@/schemas/hero.schema";

export type HomePageClientState =
  | { status: "empty" }
  | { status: "error"; message: string }
  | { status: "ok"; payload: HeroPayload };

export default function HomePageClient({ state }: { state: HomePageClientState }) {
  if (state.status === "empty") {
    return (
      <div className="mx-auto w-full max-w-5xl px-6 py-16">
        <div className="rounded-4xl border border-black/10 bg-background p-10 text-center space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-background px-4 py-2 text-[11px] font-bold tracking-[0.25em] uppercase">
            Sem dados publicados
          </div>
          <h1 className="font-serif text-4xl md:text-5xl leading-[1.05]">Cognitive Puzzle</h1>
          <p className="text-foreground/70">Envie o CSV para publicar a campanha e alimentar os slots editoriais.</p>
          <div className="pt-2">
            <Link href="/dashboard" className="text-sm underline underline-offset-4 hover:text-foreground">
              Ir para upload e detalhamento
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (state.status === "error") {
    return (
      <div className="mx-auto w-full max-w-5xl px-6 py-16">
        <div className="rounded-4xl border border-red-200 bg-red-50 p-10 text-center space-y-4">
          <div className="text-sm font-bold text-red-800">Erro ao carregar</div>
          <p className="text-sm text-red-800">{state.message}</p>
          <div className="pt-2 flex items-center justify-center gap-5">
            <Link
              href="/"
              className="px-4 py-2 rounded-full border border-red-200 bg-white text-xs font-bold tracking-widest hover:border-red-700 hover:bg-red-700 hover:text-white transition-colors"
            >
              RECARREGAR
            </Link>
            <Link href="/dashboard" className="text-sm underline underline-offset-4 text-red-900 hover:text-red-950">
              Abrir dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const payload = state.payload;

  return (
    <>
      <Hero payload={payload} />

      <section className="mx-auto w-full max-w-7xl px-6 py-16 space-y-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <article className="rounded-4xl border border-black/10 bg-background p-8">
            <div className="text-[11px] font-bold tracking-[0.25em] uppercase text-foreground/60">Resultado do dia</div>
            <div className="mt-3 font-serif text-4xl">{payload.rightSatellite.value}</div>
            <div className="mt-2 text-sm text-foreground/70">
              {payload.rightSatellite.labelTop} — {payload.rightSatellite.labelBottom}
            </div>
          </article>
          <article className="rounded-4xl border border-black/10 bg-background p-8">
            <div className="text-[11px] font-bold tracking-[0.25em] uppercase text-foreground/60">Estado da campanha</div>
            <div className="mt-3 font-serif text-2xl">{payload.campaign.statusLabel}</div>
            <div className="mt-2 text-sm text-foreground/70">{payload.campaign.nextAction}</div>
          </article>
          <article className="rounded-4xl border border-black/10 bg-background p-8">
            <div className="text-[11px] font-bold tracking-[0.25em] uppercase text-foreground/60">Contrato</div>
            <div className="mt-3 text-sm text-foreground/70">
              Ativos imutáveis; conteúdo mutável. A UI manifesta estados — não calcula.
            </div>
            <div className="mt-4">
              <Link href="/sandbox" className="text-sm underline underline-offset-4 hover:text-foreground">
                Ver sandbox (referência)
              </Link>
            </div>
          </article>
        </div>

        <div className="rounded-4xl border border-black/10 bg-background p-10">
          <div className="text-[11px] font-bold tracking-[0.25em] uppercase text-foreground/60">KPIs editoriais</div>
          <div className="mt-4 text-sm text-foreground/70">Slots reservados para KPIs narrativos (sem gráfico-dashboards).</div>
        </div>

        <div className="rounded-4xl border border-black/10 bg-background p-10">
          <div className="text-[11px] font-bold tracking-[0.25em] uppercase text-foreground/60">
            Produção mensal acumulada
          </div>
          <div className="mt-4 text-sm text-foreground/70">Slot editorial de fechamento (a ser alimentado pela Ponte Neural).</div>
        </div>
      </section>
    </>
  );
}
