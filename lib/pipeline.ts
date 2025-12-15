import Papa from "papaparse";

// --- TIPOS ---
export type SituationFlags = {
  is_aprovado: number;
  is_reprovado: number;
  is_cancelado: number;
  is_em_analise: number;
  is_pendente: number;
  is_status_desconhecido: number;
};

export interface StoreMetric {
  name: string;
  group: string; // "Grupo 1", "Grupo 2", "Grupo 3"
  total: number;
  approved: number;
  rejected: number;
  analyzing: number;
  pending: number;
  canceled: number;
  flags: SituationFlags;
}

export interface GroupMetric {
  id: string;
  name: string;
  goal: number;
  approved: number;
  stores: StoreMetric[];
  metGoal: boolean;
  missing: number;
}

export interface DashboardMetrics {
  total: number;
  approved: number;
  rejected: number;
  analyzing: number;
  pending: number;
  canceled: number;
  stores: Record<string, StoreMetric>;
  groups: Record<string, GroupMetric>; // Nova estrutura por grupo
  dailyEvolution: { date: string; approved: number }[];
}

export interface DashboardData {
  raw: string[][];
  metrics: DashboardMetrics;
}

// --- CONSTANTES DE NEGÓCIO ---
const CNPJ_MAP: Record<string, string> = {
  "07.316.252/0011-45": "LOJA 16 Cerro Azul - Centro",
  "07.316.252/0001-73": "LOJA 06 Rio Branco do Sul - Centro",
  "07.316.252/0007-69": "LOJA 01 Curitiba - Pinheirinho",
  "07.316.252/0005-05": "LOJA 12 Araucária - Centro",
  "07.316.252/0016-50": "LOJA 21 Curitiba - Cajuru",
  "07.316.252/0014-98": "LOJA 19 Colombo - Guaraituba",
  "03.749.830/0004-57": "LOJA 07 Piraquara - Centro",
  "07.316.252/0015-79": "LOJA 20 Almirante Tamandaré - Centro",
  "07.316.252/0006-88": "LOJA 04 Colombo - Alto Maracanã",
  "03.749.830/0002-95": "LOJA 02 Fazenda Rio Grande - Pioneiros",
  "07.316.252/0009-20": "LOJA 15 Campo Largo - Centro",
  "07.316.252/0003-35": "LOJA 11 Guaratuba - Centro",
  "03.749.830/0006-19": "LOJA 09 Curitiba - Pinheirinho",
  "03.749.830/0003-76": "LOJA 05 Fazenda Rio Grande - Pioneiros",
  "07.316.252/0004-16": "LOJA 10 Fazenda Rio Grande - Eucaliptos",
  "07.316.252/0012-26": "LOJA 18 Bocaiuva do Sul - Centro",
  "07.316.252/0013-07": "LOJA 17 Colombo - São Gabriel",
  "07.316.252/0008-40": "LOJA 03 Fazenda Rio Grande - Pioneiros",
  "07.316.252/0010-64": "LOJA 14 Campina Grande do Sul - JD Paulista",
  "03.749.830/0005-38": "LOJA 13 Colombo - Centro",
  "07.316.252/0002-54": "LOJA 08 Campina Grande do Sul - JD Paulista",
};

// Definição dos Grupos (Lógica Fixa)
const GROUP_DEFINITIONS = [
  {
    id: "G1",
    name: "Grupo 1 - Alto Potencial",
    goal: 20,
    storeNumbers: ["12", "15", "11"]
  },
  {
    id: "G2",
    name: "Grupo 2 - Médio Potencial",
    goal: 12,
    storeNumbers: ["21", "20", "04", "19", "05", "07", "13", "03", "10"]
  },
  {
    id: "G3",
    name: "Grupo 3 - Em Desenvolvimento",
    goal: 6,
    storeNumbers: ["01", "09", "17", "02", "06", "14", "08", "18", "16"]
  }
];

// --- HELPERS ---
const cleanDate = (val: string) => val ? val.split(" ")[0] : "";

const normalizeSituation = (sit: string): SituationFlags => {
  const s = (sit ?? "").trim();
  const flags = {
    is_aprovado: s === "Aprovado" ? 1 : 0,
    is_reprovado: s === "Reprovado" ? 1 : 0,
    is_cancelado: s === "Cancelado" ? 1 : 0,
    is_em_analise: s === "Em análise" ? 1 : 0,
    is_pendente: s === "Pendente" ? 1 : 0,
    is_status_desconhecido: 0,
  };
  if (!Object.values(flags).some(v => v === 1)) flags.is_status_desconhecido = 1;
  return flags;
};

const getStoreGroup = (storeName: string) => {
  for (const group of GROUP_DEFINITIONS) {
    // Verifica se o número da loja está no nome (ex: "LOJA 12" contém "12")
    // Usamos regex para garantir que "LOJA 1" não dê match em "LOJA 12"
    for (const num of group.storeNumbers) {
      if (storeName.includes(`LOJA ${num} `)) return group;
    }
  }
  return null;
};

// --- PROCESSAMENTO ---
export const processCSV = (file: File): Promise<DashboardData> =>
  new Promise((resolve, reject) => {
    Papa.parse(file, {
      encoding: "UTF-8",
      delimiter: ";",
      skipEmptyLines: true,
      complete: (results) => {
        const allRows = results.data as string[][];
        if (allRows.length < 6) return reject("Arquivo inválido (linhas insuficientes).");

        const headerRow = (allRows[4] ?? []).map((h) => (h ?? "").trim());
        const dataRows = allRows.slice(5);

        const stores: Record<string, StoreMetric> = {};
        const dailyEvolution: Record<string, { date: string; approved: number }> = {};
        const groups: Record<string, GroupMetric> = {};

        // Inicializa Grupos
        GROUP_DEFINITIONS.forEach(g => {
          groups[g.id] = {
            id: g.id,
            name: g.name,
            goal: g.goal,
            approved: 0,
            stores: [],
            metGoal: false,
            missing: g.goal
          };
        });

        let total = 0, approved = 0, rejected = 0, analyzing = 0, pending = 0, canceled = 0;

        for (const row of dataRows) {
          const rowObj: Record<string, string> = {};
          headerRow.forEach((key, idx) => { rowObj[key] = row[idx] ?? ""; });

          const dataEntrada = cleanDate(rowObj["Data de entrada"]);
          const cnpj = (rowObj["CNPJ"] ?? "").trim();
          const lojaNome = CNPJ_MAP[cnpj] || `DESCONHECIDA (${cnpj})`;
          const flags = normalizeSituation(rowObj["Situação"]);
          
          // Agrega totais
          total++;
          approved += flags.is_aprovado;
          rejected += flags.is_reprovado;
          analyzing += flags.is_em_analise;
          pending += flags.is_pendente;
          canceled += flags.is_cancelado;

          // Agrega por Loja
          const groupDef = getStoreGroup(lojaNome);
          const groupId = groupDef ? groupDef.id : "OUTROS";

          if (!stores[lojaNome]) {
            stores[lojaNome] = {
              name: lojaNome,
              group: groupId,
              total: 0,
              approved: 0,
              rejected: 0,
              analyzing: 0,
              pending: 0,
              canceled: 0,
              flags: { is_aprovado: 0, is_reprovado: 0, is_cancelado: 0, is_em_analise: 0, is_pendente: 0, is_status_desconhecido: 0 }
            };
          }
          const s = stores[lojaNome];
          s.total++;
          s.approved += flags.is_aprovado;
          s.rejected += flags.is_reprovado;
          s.analyzing += flags.is_em_analise;
          s.pending += flags.is_pendente;
          s.canceled += flags.is_cancelado;

          // Evolução Diária
          if (dataEntrada) {
            if (!dailyEvolution[dataEntrada]) dailyEvolution[dataEntrada] = { date: dataEntrada, approved: 0 };
            dailyEvolution[dataEntrada].approved += flags.is_aprovado;
          }
        }

        // Consolida Grupos
        Object.values(stores).forEach(store => {
          if (groups[store.group]) {
            groups[store.group].stores.push(store);
            groups[store.group].approved += store.approved;
          }
        });

        // Calcula Metas dos Grupos
        Object.values(groups).forEach(g => {
          g.metGoal = g.approved >= g.goal;
          g.missing = Math.max(0, g.goal - g.approved);
          // Ordena lojas por aprovados (para o ranking)
          g.stores.sort((a, b) => b.approved - a.approved);
        });

        resolve({
          raw: dataRows,
          metrics: { 
            total, approved, rejected, analyzing, pending, canceled, 
            stores, 
            groups, 
            dailyEvolution: Object.values(dailyEvolution).sort((a, b) => a.date.localeCompare(b.date)) 
          },
        });
      },
      error: (err) => reject(err.message),
    });
  });
