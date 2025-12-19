import { NextResponse } from 'next/server';
import { buildEditorialSummaryVM } from '@/lib/viewmodels/editorialSummary.vm';

export const runtime = 'nodejs';

function jsonResponse(payload: unknown) {
  const response = NextResponse.json(payload, { status: 200 });
  response.headers.set('Cache-Control', 'public, s-maxage=10, stale-while-revalidate=30');
  return response;
}

export async function GET(request: Request) {
  try {
    const url = new URL('/api/latest', request.url);
    const res = await fetch(url.toString(), { cache: 'no-store' });

    if (!res.ok || res.status === 204) {
      const vm = buildEditorialSummaryVM(null);
      return jsonResponse({
        ...vm,
        headline: {
          title: 'Resumo indisponivel',
          subtitle: 'Falha ao carregar /api/latest.',
        },
      });
    }

    const snapshot = await res.json();
    const vm = buildEditorialSummaryVM(snapshot);
    return jsonResponse(vm);
  } catch {
    const vm = buildEditorialSummaryVM(null);
    return jsonResponse({
      ...vm,
      headline: {
        title: 'Resumo indisponivel',
        subtitle: 'Erro interno ao gerar resumo editorial.',
      },
    });
  }
}
