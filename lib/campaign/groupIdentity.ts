/**
 * Identidade canônica de Grupo (A/B/C/OUTROS)
 * Garante que grupo é CHAVE, não label por index ou ranking
 * 
 * Regra de ouro: normalizeGroupKey e groupLabelFromKey são idempotentes
 */

export type GroupKey = "A" | "B" | "C" | "OUTROS";

/**
 * Normaliza qualquer representação de grupo para chave canônica
 * Aceita: "A", "Grupo A", "grupo a", "B", "GRUPO C", etc.
 * Retorna: "A" | "B" | "C" | "OUTROS"
 */
export function normalizeGroupKey(input: string | null | undefined): GroupKey {
  const raw = (input ?? "").trim().toUpperCase();

  // Já é uma chave simples?
  if (raw === "A" || raw === "B" || raw === "C") return raw;
  if (raw === "OUTROS") return "OUTROS";

  // Parse "Grupo X"?
  const m = raw.match(/^GRUPO\s+([ABC])$/);
  if (m && m[1]) return m[1] as GroupKey;

  // Não conseguiu decodificar
  return "OUTROS";
}

/**
 * Gera label visual a partir de chave canônica
 * Idempotente: se você passar "Grupo A", retorna "Grupo A"
 */
export function groupLabelFromKey(input: string | null | undefined): string {
  const key = normalizeGroupKey(input);
  if (key === "OUTROS") return "Outros";
  return `Grupo ${key}`;
}

/**
 * Shorthand para UI (quando você quer só a inicial ou similar)
 */
export function shortGroupLabel(input: string | null | undefined): string {
  return groupLabelFromKey(input);
}
