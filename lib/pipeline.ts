import Papa from "papaparse";
import { parse, startOfWeek, format, getDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CNPJ_MAP } from "./cnpjMap";

// --- TIPOS ---
export type SituationFlags = {
  is_aprovado: number;
  is_reprovado: number;
  is_cancelado: number;
  is_em_analise: number;
  is_pendente: number;
  is_status_desconhecido: number;
};

export type CampaignStage = "aceleracao" | "consolidacao" | "sprint_final";

export interface StoreMetric {
  name: string;
  group: string;
  goal: number; // meta individual da loja
  total: number;
  approved: number;
  rejected: number;
  analyzing: number;
  pending: number;
  canceled: number;
  flags: SituationFlags;
  eligible?: boolean; // loja elegível na semana
  missingStore?: number; // faltam da loja
  pct?: number; // % atingimento
}

export interface GroupMetric {
  id: string;
  name: string;
  goal: number; // meta individual
  groupGoal: number; // meta do grupo (goal * qtd lojas do grupo)
  approved: number; // soma do grupo na semana
  stores: StoreMetric[];
  metGoal: boolean; // grupo elegível
  missing: number; // faltam para meta do grupo
}

export interface WeeklyMetrics {
  weekId: string; // "2025-12-01"
  label: string;  // "01 dez - 07 dez"
  stage: CampaignStage;
  groups: Record<string, GroupMetric>;
  stores: Record<string, StoreMetric>;
}

export interface DashboardMetrics {
  total: number;
  approved: number;
  weeks: Record<string, WeeklyMetrics>; // Métricas separadas por semana
  dailyEvolution: { date: string; approved: number }[];
}

export interface DashboardData {
  raw: string[][];
  metrics: DashboardMetrics;
}

const GROUP_DEFINITIONS = [
  { id: "G1", name: "Grupo 1 - Alto Potencial", goal: 20, storeNumbers: ["12", "15", "11"] },
  { id: "G2", name: "Grupo 2 - Médio Potencial", goal: 12, storeNumbers: ["21", "20", "04", "19", "05", "07", "13", "03", "10"] },
  { id: "G3", name: "Grupo 3 - Em Desenvolvimento", goal: 6, storeNumbers: ["01", "09", "17", "02", "06", "14", "08", "18", "16"] }
];

// --- HELPERS DE TEMPO ---
const getWeekId = (dateStr: string) => {
  if (!dateStr) return "SEM DATA";
  // Assume formato DD/MM/YYYY do CSV
  const date = parse(dateStr.split(" ")[0], "dd/MM/yyyy", new Date());
  // Semana começa na segunda (weekStartsOn: 1)
  const monday = startOfWeek(date, { weekStartsOn: 1 });
  return format(monday, "yyyy-MM-dd");
};

const getWeekLabel = (weekId: string) => {
  if (weekId === "SEM DATA") return "Sem Data";
  const start = parse(weekId, "yyyy-MM-dd", new Date());
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  return `${format(start, "dd MMM", { locale: ptBR })} - ${format(end, "dd MMM", { locale: ptBR })}`;
};

const getStage = (dateStr: string): CampaignStage => {
  if (!dateStr) return "aceleracao";
  const date = parse(dateStr.split(" ")[0], "dd/MM/yyyy", new Date());
  const day = getDay(date); // 0=Dom, 1=Seg, ... 6=Sab
  
  if (day === 1 || day === 2) return "aceleracao"; // Seg, Ter
  if (day === 3 || day === 4) return "consolidacao"; // Qua, Qui
  return "sprint_final"; // Sex, Sab, Dom
};

// --- PROCESSAMENTO ---
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
    for (const num of group.storeNumbers) {
      if (storeName.includes(`LOJA ${num} `)) return group;
    }
  }
  return null;
};

const buildDashboardData = (allRows: string[][]): DashboardData => {
  if (allRows.length < 6) throw new Error("Arquivo inválido.");

  const headerRow = (allRows[4] ?? []).map((h) => (h ?? "").trim());
  const dataRows = allRows.slice(5);

  const weeks: Record<string, WeeklyMetrics> = {};
  const dailyEvolution: Record<string, { date: string; approved: number }> = {};
  let total = 0, approved = 0;

  for (const row of dataRows) {
    const rowObj: Record<string, string> = {};
    headerRow.forEach((key, idx) => { rowObj[key] = row[idx] ?? ""; });

    const dataEntradaRaw = rowObj["Data de entrada"];
    if (!dataEntradaRaw) continue; // Pula linhas sem data

    const weekId = getWeekId(dataEntradaRaw);
    const stage = getStage(dataEntradaRaw);
    const cnpj = (rowObj["CNPJ"] ?? "").trim();
    const lojaNome = CNPJ_MAP[cnpj] || `DESCONHECIDA (${cnpj})`;
    const flags = normalizeSituation(rowObj["Situação"]);

    total++;
    approved += flags.is_aprovado;

    // Inicializa Semana se não existir
    if (!weeks[weekId]) {
      weeks[weekId] = {
        weekId,
        label: getWeekLabel(weekId),
        stage: "aceleracao", // Default, será atualizado pelo dia mais recente
        groups: {},
        stores: {}
      };
      // Inicializa Grupos na Semana
      GROUP_DEFINITIONS.forEach(g => {
        weeks[weekId].groups[g.id] = {
          id: g.id, name: g.name, goal: g.goal, groupGoal: g.goal * g.storeNumbers.length, approved: 0, stores: [], metGoal: false, missing: g.goal * g.storeNumbers.length
        };
      });
    }

    // Atualiza Etapa da Semana (Pega a mais avançada encontrada no arquivo)
    // Lógica simplificada: se encontrarmos um dia de sprint, a semana toda está em sprint visualmente
    const currentStageWeight = { aceleracao: 1, consolidacao: 2, sprint_final: 3 };
    if (currentStageWeight[stage] > currentStageWeight[weeks[weekId].stage]) {
      weeks[weekId].stage = stage;
    }

    // Agrega na Loja (Contexto Semanal)
    const groupDef = getStoreGroup(lojaNome);
    const groupId = groupDef ? groupDef.id : "OUTROS";

    if (!weeks[weekId].stores[lojaNome]) {
      weeks[weekId].stores[lojaNome] = {
        name: lojaNome, group: groupId, goal: groupDef ? groupDef.goal : 0, total: 0, approved: 0, rejected: 0, analyzing: 0, pending: 0, canceled: 0, flags: { ...flags }
      };
    }
    const s = weeks[weekId].stores[lojaNome];
    s.total++; s.approved += flags.is_aprovado;

    // Agrega no Grupo (Contexto Semanal)
    if (groupDef) {
       weeks[weekId].groups[groupId].approved += flags.is_aprovado;
    }

    // Evolução Diária (Global)
    const dateKey = dataEntradaRaw.split(" ")[0];
    if (!dailyEvolution[dateKey]) dailyEvolution[dateKey] = { date: dateKey, approved: 0 };
    dailyEvolution[dateKey].approved += flags.is_aprovado;
  }

  // Consolidação Final por Semana
  Object.values(weeks).forEach(week => {
    // 1. Popula stores dentro dos groups
    Object.values(week.stores).forEach(store => {
       if (week.groups[store.group]) {
          week.groups[store.group].stores.push(store);
       }
    });

    // 2. Calcula Metas e Ordena
    Object.values(week.groups).forEach(g => {
      // Grupo elegível por soma
      g.metGoal = g.approved >= g.groupGoal;
      g.missing = Math.max(0, g.groupGoal - g.approved);
      // Enriquecer lojas com elegibilidade da semana
      g.stores.forEach(s => {
        s.missingStore = Math.max(0, g.goal - s.approved);
        s.pct = g.goal > 0 ? s.approved / g.goal : 0;
        s.eligible = g.metGoal && s.approved >= g.goal;
      });
      // Ranking: apenas elegíveis; ordenar por % atingimento, depois aprovadas, depois nome
      g.stores.sort((a, b) => {
        const ea = a.eligible ? 1 : 0; const eb = b.eligible ? 1 : 0;
        if (eb !== ea) return eb - ea; // elegíveis primeiro
        const pctDiff = (b.pct ?? 0) - (a.pct ?? 0);
        if (pctDiff !== 0) return pctDiff;
        const apprDiff = b.approved - a.approved;
        if (apprDiff !== 0) return apprDiff;
        return a.name.localeCompare(b.name);
      });
    });
  });

  return {
    raw: dataRows,
    metrics: {
      total, approved,
      weeks, // AGORA TEMOS MÚLTIPLAS SEMANAS
      dailyEvolution: Object.values(dailyEvolution).sort((a, b) =>
         parse(a.date, "dd/MM/yyyy", new Date()).getTime() - parse(b.date, "dd/MM/yyyy", new Date()).getTime()
      )
    },
  };
};

// --- PROCESSAMENTO ---
export const processCSV = (file: File): Promise<DashboardData> =>
  new Promise((resolve, reject) => {
    Papa.parse(file, {
      encoding: "UTF-8", delimiter: ";", skipEmptyLines: true,
      complete: (results) => {
        const allRows = results.data as string[][];
        try {
          resolve(buildDashboardData(allRows));
        } catch (err) {
          reject(err instanceof Error ? err.message : String(err));
        }
      },
      error: (err: unknown) =>
        reject(err instanceof Error ? err.message : String(err)),
    });
  });

export const processCSVText = (csvText: string): Promise<DashboardData> =>
  new Promise((resolve, reject) => {
    Papa.parse(csvText, {
      encoding: "UTF-8", delimiter: ";", skipEmptyLines: true,
      complete: (results) => {
        const allRows = results.data as string[][];
        try {
          resolve(buildDashboardData(allRows));
        } catch (err) {
          reject(err instanceof Error ? err.message : String(err));
        }
      },
      error: (err: unknown) =>
        reject(err instanceof Error ? err.message : String(err)),
    });
  });
