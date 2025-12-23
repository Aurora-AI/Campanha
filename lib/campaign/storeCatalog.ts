// Fonte canônica: "LOJAS CALCELEVE.pdf"
// Regra editorial: "LOJA XX — CIDADE BAIRRO" (cidade antes do bairro)
// Observação: o CNPJ é o ID técnico (digits). A UI não deve inferir nomes por regex.

export type StoreCanonical = {
  storeNumber: number;          // 1..21
  cnpjDigits: string;           // 14 digits
  city: string;                 // ex: "CURITIBA"
  district: string;             // ex: "PINHEIRINHO"
  displayName: string;          // "LOJA 01 — CURITIBA PINHEIRINHO"
};

export function normalizeCnpjDigits(value: string): string {
  const digits = (value || "").replace(/\D/g, "");
  // CNPJ deve ter 14 dígitos; se vier diferente, devolve como está (a validação fica acima do pipeline).
  return digits;
}

function makeDisplayName(storeNumber: number, city: string, district: string): string {
  const nn = String(storeNumber).padStart(2, "0");
  const parts = [city, district].map(s => (s || "").trim()).filter(Boolean);
  return `LOJA ${nn} — ${parts.join(" ")}`.trim();
}

export const STORES_CANONICAL: readonly StoreCanonical[] = [
  { storeNumber: 1,  cnpjDigits: "07316252000769", city: "CURITIBA",              district: "PINHEIRINHO",      displayName: "" },
  { storeNumber: 2,  cnpjDigits: "03749830000295", city: "FAZENDA RIO GRANDE",    district: "PIONEIROS",        displayName: "" },
  { storeNumber: 3,  cnpjDigits: "07316252000840", city: "FAZENDA RIO GRANDE",    district: "PIONEIROS",        displayName: "" },
  { storeNumber: 4,  cnpjDigits: "07316252000688", city: "COLOMBO",               district: "ALTO MARACANÃ",     displayName: "" },
  { storeNumber: 5,  cnpjDigits: "03749830000376", city: "FAZENDA RIO GRANDE",    district: "PIONEIROS",        displayName: "" },
  { storeNumber: 6,  cnpjDigits: "07316252000173", city: "RIO BRANCO DO SUL",     district: "CENTRO",           displayName: "" },
  { storeNumber: 7,  cnpjDigits: "03749830000457", city: "PIRAQUARA",             district: "CENTRO",           displayName: "" },
  { storeNumber: 8,  cnpjDigits: "07316252000254", city: "CAMPINA GRANDE DO SUL", district: "JD PAULISTA",       displayName: "" },
  { storeNumber: 9,  cnpjDigits: "03749830000619", city: "CURITIBA",              district: "PINHEIRINHO",      displayName: "" },
  { storeNumber: 10, cnpjDigits: "07316252000416", city: "FAZENDA RIO GRANDE",    district: "EUCALIPTOS",       displayName: "" },
  { storeNumber: 11, cnpjDigits: "07316252000335", city: "GUARATUBA",             district: "CENTRO",           displayName: "" },
  { storeNumber: 12, cnpjDigits: "07316252000505", city: "ARAUCÁRIA",             district: "CENTRO",           displayName: "" },
  { storeNumber: 13, cnpjDigits: "03749830000538", city: "COLOMBO",               district: "CENTRO",           displayName: "" },
  { storeNumber: 14, cnpjDigits: "07316252001064", city: "CAMPINA GRANDE",        district: "JD PAULISTA",      displayName: "" },
  { storeNumber: 15, cnpjDigits: "07316252000920", city: "CAMPO LARGO",           district: "CENTRO",           displayName: "" },
  { storeNumber: 16, cnpjDigits: "07316252001145", city: "CERRO AZUL",            district: "CENTRO",           displayName: "" },
  { storeNumber: 17, cnpjDigits: "07316252001307", city: "COLOMBO",               district: "SÃO GABRIEL",      displayName: "" },
  { storeNumber: 18, cnpjDigits: "07316252001226", city: "BOCAIUVA DO SUL",       district: "CENTRO",           displayName: "" },
  { storeNumber: 19, cnpjDigits: "07316252001498", city: "COLOMBO",               district: "GUARAITUBA",       displayName: "" },
  { storeNumber: 20, cnpjDigits: "07316252001579", city: "ALMIRANTE TAMANDARÉ",   district: "CENTRO",           displayName: "" },
  { storeNumber: 21, cnpjDigits: "07316252001650", city: "CURITIBA",              district: "CAJURU",           displayName: "" },
].map(s => ({
  ...s,
  displayName: makeDisplayName(s.storeNumber, s.city, s.district),
}));

export const STORE_BY_CNPJ_DIGITS: Readonly<Record<string, StoreCanonical>> =
  Object.freeze(Object.fromEntries(STORES_CANONICAL.map(s => [s.cnpjDigits, s])));

/**
 * Resolve store by CNPJ, returning full canonical object.
 * Returns null if CNPJ not found in catalog.
 */
export function resolveStoreByCnpj(cnpj: string): StoreCanonical | null {
  const digits = normalizeCnpjDigits(cnpj);
  return STORE_BY_CNPJ_DIGITS[digits] ?? null;
}

/**
 * Backward compatibility: returns displayName string.
 * Use resolveStoreByCnpj() for full store object.
 */
export function resolveStoreNameFromCnpj(cnpj: string): string | null {
  return resolveStoreByCnpj(cnpj)?.displayName ?? null;
}

