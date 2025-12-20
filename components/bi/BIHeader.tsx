type Props = {
  title: string;
  subtitle: string;
  updatedAtISO?: string;
};

function formatISO(iso?: string) {
  if (!iso) return '-';
  try {
    const d = new Date(iso);
    return d.toLocaleString('pt-BR');
  } catch {
    return '-';
  }
}

export default function BIHeader({ title, subtitle, updatedAtISO }: Props) {
  return (
    <header className="mb-10">
      <div className="text-[10px] uppercase tracking-[0.28em] text-black/45">Painel</div>
      <h1 className="mt-4 text-4xl font-semibold tracking-tight">{title}</h1>
      <p className="mt-3 max-w-2xl text-sm text-black/60">{subtitle}</p>
      <div className="mt-4 text-xs text-black/45">
        Atualizado em: <span className="text-black/65">{formatISO(updatedAtISO)}</span>
      </div>
    </header>
  );
}
