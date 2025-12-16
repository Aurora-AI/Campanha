import { formatIsoDateUTC, parseDateCellUTC } from "./time";

export type NormalizedStatus = "APROVADO" | "REPROVADO" | `PENDENTE:${string}`;

export type PendingType =
  | "AGUARDANDO_DOCUMENTOS"
  | "AGUARDANDO_FINALIZAR_CADASTRO"
  | "ANALISE"
  | "PENDENTE";

export type NormalizedRow = {
  date: string; // YYYY-MM-DD
  store: string;
  cnpj?: string;
  cpfMasked?: string;
  status: NormalizedStatus;
  group?: string;
  firstPurchaseTicket: number | null;
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

const findColumnIndex = (headers: string[], patterns: string[]): number | undefined => {
  const normalized = headers.map(normalizeText);
  for (let i = 0; i < normalized.length; i++) {
    const h = normalized[i];
    for (const p of patterns) {
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
  date: number;
  store: number;
  cnpj: number;
  cpf: number;
  status: number;
  ticket: number;
  group?: number;
};

export function inferColumns(headers: string[]): ColumnIndexes {
  const date = requireColumn(
    headers,
    [
      "data da proposta",
      "data proposta",
      "data de proposta",
      "data solicitacao",
      "data de solicitacao",
      "data cadastro",
      "data de cadastro",
      "data de entrada",
      "data entrada",
    ],
    "data da proposta"
  );

  const store = requireColumn(headers, ["loja", "nome da loja", "filial", "estabelecimento", "unidade"], "loja");
  const cnpj = requireColumn(headers, ["cnpj"], "cnpj");
  const cpf = requireColumn(headers, ["cpf"], "cpf");
  const status = requireColumn(headers, ["situacao", "situação", "status"], "situação");
  const ticket = requireColumn(
    headers,
    [
      "ticket 1a compra",
      "ticket 1 compra",
      "ticket primeira compra",
      "ticket 1ª compra",
      "primeira compra",
      "1a compra",
      "1ª compra",
    ].map(normalizeText),
    "ticket 1ª compra"
  );

  const groupIdx = findColumnIndex(headers, ["grupo", "group"]);

  return { date, store, cnpj, cpf, status, ticket, ...(groupIdx != null ? { group: groupIdx } : {}) };
}

export function detectHeaderAndRows(rawRows: string[][]): { header: string[]; rows: string[][] } {
  if (!Array.isArray(rawRows) || rawRows.length === 0) throw new DatasetError("Dataset vazio.");

  const scanLimit = Math.min(rawRows.length, 25);
  let bestIndex = 0;
  let bestScore = -1;

  for (let i = 0; i < scanLimit; i++) {
    const row = rawRows[i] ?? [];
    if (!Array.isArray(row) || row.length === 0) continue;
    const headers = row.map((c) => String(c ?? "").trim());

    const score =
      (findColumnIndex(headers, ["data", "cadastro", "proposta", "solicitacao", "entrada"]) != null ? 1 : 0) +
      (findColumnIndex(headers, ["loja", "filial", "estabelecimento"]) != null ? 1 : 0) +
      (findColumnIndex(headers, ["cnpj"]) != null ? 1 : 0) +
      (findColumnIndex(headers, ["cpf"]) != null ? 1 : 0) +
      (findColumnIndex(headers, ["situacao", "status"]) != null ? 1 : 0);

    if (score > bestScore) {
      bestScore = score;
      bestIndex = i;
    }
  }

  const header = (rawRows[bestIndex] ?? []).map((c) => String(c ?? "").trim());
  const rows = rawRows.slice(bestIndex + 1);
  return { header, rows };
}

export function normalizeStatus(raw: string): NormalizedStatus {
  const s = normalizeText(raw);
  if (s === "aprovado" || s === "aprovada") return "APROVADO";
  if (s === "reprovado" || s === "reprovada") return "REPROVADO";

  if (s === "analise" || s === "em analise") return "PENDENTE:analise";
  if (s === "pendente") return "PENDENTE:pendente";
  if (s === "aguardando documentos" || s === "aguardando documentacao") return "PENDENTE:aguardando_documentos";
  if (
    s === "aguardando finalizar o cadastro" ||
    s === "aguardando finalizar cadastro" ||
    s === "aguardando finalizacao do cadastro" ||
    s === "aguardando finalizacao cadastro"
  ) {
    return "PENDENTE:aguardando_finalizar_cadastro";
  }

  return "PENDENTE:pendente";
}

export function pendingTypeFromStatus(status: NormalizedStatus): PendingType | null {
  if (status === "APROVADO" || status === "REPROVADO") return null;
  const slug = status.slice("PENDENTE:".length);
  switch (slug) {
    case "aguardando_documentos":
      return "AGUARDANDO_DOCUMENTOS";
    case "aguardando_finalizar_cadastro":
      return "AGUARDANDO_FINALIZAR_CADASTRO";
    case "analise":
      return "ANALISE";
    case "pendente":
    default:
      return "PENDENTE";
  }
}

export function parseNumberPtBR(value: string): number | null {
  const raw = String(value ?? "").trim();
  if (!raw) return null;
  const cleaned = raw.replace(/[R$\s]/g, "").replace(/[^0-9,.-]/g, "");
  if (!cleaned) return null;

  const hasComma = cleaned.includes(",");
  const hasDot = cleaned.includes(".");

  let normalized = cleaned;
  if (hasComma && hasDot) {
    normalized = cleaned.replace(/\./g, "").replace(",", ".");
  } else if (hasComma && !hasDot) {
    normalized = cleaned.replace(",", ".");
  }

  const n = Number.parseFloat(normalized);
  return Number.isFinite(n) ? n : null;
}

export function normalizeRows(header: string[], rows: string[][]): NormalizedRow[] {
  const cols = inferColumns(header);

  const out: NormalizedRow[] = [];
  for (const row of rows) {
    if (!Array.isArray(row) || row.length === 0) continue;

    const store = String(row[cols.store] ?? "").trim();
    if (!store) continue;

    const dateRaw = String(row[cols.date] ?? "");
    const dateObj = parseDateCellUTC(dateRaw);
    if (!dateObj) continue;

    const status = normalizeStatus(String(row[cols.status] ?? ""));

    const cnpj = String(row[cols.cnpj] ?? "").trim() || undefined;
    const cpfMasked = String(row[cols.cpf] ?? "").trim() || undefined;
    const group = cols.group != null ? String(row[cols.group] ?? "").trim() || undefined : undefined;
    const firstPurchaseTicket = parseNumberPtBR(String(row[cols.ticket] ?? ""));

    out.push({
      date: formatIsoDateUTC(dateObj),
      store,
      cnpj,
      cpfMasked,
      status,
      group,
      firstPurchaseTicket,
    });
  }

  return out;
}

