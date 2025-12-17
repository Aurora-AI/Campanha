import { formatIsoDateUTC, parseDateCellUTC } from "./time";
import { CNPJ_MAP } from "../cnpjMap";

export type StatusClass = "APROVADO" | "EM_ANDAMENTO" | "REPROVADO" | "IGNORADO";

export type PendingType =
  | "AGUARDANDO_DOCUMENTOS"
  | "AGUARDANDO_FINALIZAR_CADASTRO"
  | "ANALISE"
  | "PENDENTE";

export type NormalizedRow = {
  proposalId: string;
  store: string;
  cnpj: string;
  cpfMasked?: string;
  date?: string; // YYYY-MM-DD (quando disponível)
  status: StatusClass;
  pendingType?: PendingType;
  isApproved: boolean;
};

export class ColumnNotFoundError extends Error {
  columnLabel: string;

  constructor(columnLabel: string) {
    super(`Coluna ${columnLabel} não encontrada`);
    this.name = "ColumnNotFoundError";
    this.columnLabel = columnLabel;
  }
}

export class DatasetError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "DatasetError";
  }
}

const stripAccents = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\u00a0/g, " ");

export const normalizeText = (value: string) =>
  stripAccents(String(value ?? ""))
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");

const normalizeCnpj = (value: string): string | undefined => {
  const raw = String(value ?? "").trim();
  if (!raw) return undefined;

  const digits = raw.replace(/\D/g, "");
  if (digits.length === 13) {
    const padded = digits.padStart(14, "0");
    return `${padded.slice(0, 2)}.${padded.slice(2, 5)}.${padded.slice(5, 8)}/${padded.slice(8, 12)}-${padded.slice(12, 14)}`;
  }
  if (digits.length !== 14) return raw;

  return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8, 12)}-${digits.slice(12, 14)}`;
};

const storeFromCnpj = (cnpj: string | undefined): string | undefined =>
  cnpj ? CNPJ_MAP[cnpj] ?? `CNPJ ${cnpj}` : undefined;

const findColumnIndex = (headers: string[], patterns: string[]): number | undefined => {
  const normalized = headers.map(normalizeText);
  const pats = patterns.map(normalizeText).filter(Boolean);
  for (let i = 0; i < normalized.length; i++) {
    const h = normalized[i];
    for (const p of pats) {
      if (h.includes(p)) return i;
    }
  }
  return undefined;
};

const requireColumn = (headers: string[], patterns: string[], label: string): number => {
  const idx = findColumnIndex(headers, patterns);
  if (idx == null) throw new ColumnNotFoundError(label);
  return idx;
};

export type ColumnIndexes = {
  proposalId: number;
  cnpj: number;
  status: number;
  date?: number;
  cpf?: number;
};

export function inferColumns(headers: string[]): ColumnIndexes {
  const cnpj = requireColumn(headers, ["cnpj"], "cnpj");
  const proposalId = requireColumn(
    headers,
    [
      "numero da proposta",
      "número da proposta",
      "numero proposta",
      "n proposta",
      "nº proposta",
      "n da proposta",
      "nº da proposta",
    ],
    "número da proposta"
  );
  const status = requireColumn(headers, ["situacao", "situação", "status"], "situação");

  const date = findColumnIndex(
    headers,
    [
      "data de entrada",
      "data entrada",
      "data da proposta",
      "data proposta",
      "data de proposta",
      "data solicitacao",
      "data de solicitacao",
      "data cadastro",
      "data de cadastro",
    ]
  );

  const cpf = findColumnIndex(headers, ["cpf"]);

  return { proposalId, cnpj, status, ...(date != null ? { date } : {}), ...(cpf != null ? { cpf } : {}) };
}

export function detectHeaderAndRows(
  rawRows: string[][]
): { header: string[]; rows: string[][]; headerIndex: number } {
  if (!Array.isArray(rawRows) || rawRows.length === 0) throw new DatasetError("Dataset vazio.");

  const scanLimit = Math.min(rawRows.length, 200);
  const proposalPatterns = [
    "numero da proposta",
    "número da proposta",
    "numero proposta",
    "n proposta",
    "nº proposta",
    "n da proposta",
    "nº da proposta",
  ];

  const optionalSignals = [
    "nome do usuario",
    "nome do usuário",
    "cpf",
    "telefone",
    "e mail",
    "e-mail",
    "data de entrada",
    "canal de entrada",
    "data finalizada",
    "canal finalizado",
    "seguro",
    "nome promotor",
    "perfil promotor",
    "indicacao",
    "indicação",
    "nome indicacao",
    "nome indicação",
  ];

  let bestIndex: number | null = null;
  let bestScore = -1;

  for (let i = 0; i < scanLimit; i++) {
    const row = rawRows[i] ?? [];
    if (!Array.isArray(row) || row.length === 0) continue;
    const headers = row.map((c) => String(c ?? "").trim());

    const hasCnpj = findColumnIndex(headers, ["cnpj"]) != null;
    const hasProposal = findColumnIndex(headers, proposalPatterns) != null;
    const hasStatus = findColumnIndex(headers, ["situacao", "situação", "status"]) != null;

    if (!hasCnpj || !hasProposal || !hasStatus) continue;

    let score = 100;
    for (const s of optionalSignals) {
      if (findColumnIndex(headers, [s]) != null) score += 1;
    }

    if (score > bestScore) {
      bestScore = score;
      bestIndex = i;
    } else if (score === bestScore && bestIndex != null && i < bestIndex) {
      bestIndex = i;
    }
  }

  if (bestIndex == null) {
    const header = (rawRows[0] ?? []).map((c) => String(c ?? "").trim());
    const rows = rawRows.slice(1);
    return { header, rows, headerIndex: 0 };
  }

  const header = (rawRows[bestIndex] ?? []).map((c) => String(c ?? "").trim());
  const rows = rawRows.slice(bestIndex + 1);
  return { header, rows, headerIndex: bestIndex };
}

export function normalizeStatus(raw: string): { status: StatusClass; pendingType?: PendingType } {
  const s = normalizeText(raw);
  if (!s) return { status: "IGNORADO" };
  if (s === "situacao" || s === "status") return { status: "IGNORADO" };

  if (s === "aprovado" || s === "aprovada") return { status: "APROVADO" };
  if (s === "reprovado" || s === "reprovada") return { status: "REPROVADO" };

  if (s === "analise" || s === "em analise") return { status: "EM_ANDAMENTO", pendingType: "ANALISE" };
  if (s === "pendente") return { status: "EM_ANDAMENTO", pendingType: "PENDENTE" };
  if (s === "aguardando documentos" || s === "aguardando documentacao") {
    return { status: "EM_ANDAMENTO", pendingType: "AGUARDANDO_DOCUMENTOS" };
  }
  if (
    s === "aguardando finalizar o cadastro" ||
    s === "aguardando finalizar cadastro" ||
    s === "aguardando finalizacao do cadastro" ||
    s === "aguardando finalizacao cadastro"
  ) {
    return { status: "EM_ANDAMENTO", pendingType: "AGUARDANDO_FINALIZAR_CADASTRO" };
  }

  return { status: "IGNORADO" };
}

export function normalizeRows(header: string[], rows: string[][]): NormalizedRow[] {
  const cols = inferColumns(header);

  const out: NormalizedRow[] = [];
  for (const row of rows) {
    if (!Array.isArray(row) || row.length === 0) continue;

    const proposalId = String(row[cols.proposalId] ?? "").trim();
    if (!proposalId) continue;

    const cnpj = normalizeCnpj(String(row[cols.cnpj] ?? ""));
    if (!cnpj) continue;

    const store = storeFromCnpj(cnpj) || "";
    if (!store) continue;

    const { status, pendingType } = normalizeStatus(String(row[cols.status] ?? ""));
    const cpfMasked = cols.cpf != null ? String(row[cols.cpf] ?? "").trim() || undefined : undefined;

    let date: string | undefined = undefined;
    if (cols.date != null) {
      const dateRaw = String(row[cols.date] ?? "");
      const dateObj = parseDateCellUTC(dateRaw);
      if (dateObj) date = formatIsoDateUTC(dateObj);
    }

    out.push({
      proposalId,
      store,
      cnpj,
      cpfMasked,
      status,
      ...(pendingType ? { pendingType } : {}),
      ...(date ? { date } : {}),
      isApproved: status === "APROVADO",
    });
  }

  return out;
}
