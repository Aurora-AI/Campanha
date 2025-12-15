import Papa from "papaparse";

export interface StoreMetric {
  name: string;
  group: string;
  total: number;
  approved: number;
  rejected: number;
  analyzing: number;
  pending: number;
  // Specific OS flags
  is_aprovado: number;
  is_reprovado: number;
  is_cancelado: number;
  is_em_analise: number;
  is_pendente: number;
}

export interface GroupMetric {
  name: string;
  total: number;
  approved: number;
  stores: string[];
}

export interface DashboardData {
  raw: string[][];
  metrics: {
    total: number;
    approved: number;
    stores: Record<string, StoreMetric>;
    groups: Record<string, GroupMetric>;
    dailyEvolution: { date: string, approved: number }[];
  };
}

// OS: CNPJ Map - Fixed
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

// Helper to clean date strings "dd/mm/yyyy hh:mm:ss" -> "dd/mm/yyyy"
const cleanDate = (val: string) => {
  if (!val || typeof val !== 'string') return "";
  return val.split(" ")[0]; // Keep only date part
};

const normalizeSituation = (sit: string) => {
  const s = sit?.trim();
  // Binary flags per OS
  const res = {
    is_aprovado: s === "Aprovado" ? 1 : 0,
    is_reprovado: s === "Reprovado" ? 1 : 0,
    is_cancelado: s === "Cancelado" ? 1 : 0,
    is_em_analise: s === "Em análise" ? 1 : 0,
    is_pendente: s === "Pendente" ? 1 : 0,
    is_status_desconhecido: 0
  };
  
  if (!res.is_aprovado && !res.is_reprovado && !res.is_cancelado && !res.is_em_analise && !res.is_pendente) {
    res.is_status_desconhecido = 1;
  }
  
  return res;
};

export const processCSV = (file: File): Promise<DashboardData> => {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      encoding: "UTF-8",
      skipEmptyLines: true,
      complete: (results) => {
        // OS Rule: Ignorar as 4 primeiras linhas. A linha 5 contém os cabeçalhos.
        
        const allRows = results.data as string[][];
        
        if (allRows.length < 5) {
          reject("Arquivo inválido: Menos de 5 linhas.");
          return;
        }

        // Line 5 (index 4) is header
        const headerRow = allRows[4].map((h: string) => h.trim());
        const dataRows = allRows.slice(5) as string[][];

        const stores: Record<string, StoreMetric> = {};
        const dailyEvolution: Record<string, { date: string, approved: number }> = {};
        
        // Metrics totals
        let totalRecords = 0;
        let totalApproved = 0;

        // Process rows
        dataRows.forEach((row: string[]) => {
            // Map row to header
            const rowObj: Record<string, string> = {};
            headerRow.forEach((key: string, index: number) => {
                rowObj[key] = row[index];
            });

            // ETAPA 3: Tratamento de Datas
            const dataEntrada = rowObj["Data de entrada"] ? cleanDate(rowObj["Data de entrada"]) : "";
            // const dataFinalizada = rowObj["Data Finalizada"] ? cleanDate(rowObj["Data Finalizada"]) : "";

            // ETAPA 4: Mapeamento de Lojas
            const cnpj = rowObj["CNPJ"]?.trim();
            const lojaNome = CNPJ_MAP[cnpj] || "DESCONHECIDA";

            // ETAPA 5: Normalização Situação
            const situacao = rowObj["Situação"];
            const flags = normalizeSituation(situacao);

            // Populate Metric Aggregations
            totalRecords++;
            if (flags.is_aprovado) totalApproved++;

            // Initializing Store Entry
            if (!stores[lojaNome]) {
                stores[lojaNome] = {
                    name: lojaNome,
                    group: "GERAL", // Placeholder as mapping is missing in OS text
                    total: 0,
                    approved: 0,
                    rejected: 0,
                    analyzing: 0,
                    pending: 0,
                    is_aprovado: 0,
                    is_reprovado: 0,
                    is_cancelado: 0,
                    is_em_analise: 0,
                    is_pendente: 0
                };
            }

            // Aggregating Store Data
            stores[lojaNome].total++;
            stores[lojaNome].approved += flags.is_aprovado;
            stores[lojaNome].rejected += flags.is_reprovado;
            stores[lojaNome].analyzing += flags.is_em_analise;
            stores[lojaNome].pending += flags.is_pendente;
            
            stores[lojaNome].is_aprovado += flags.is_aprovado;
            stores[lojaNome].is_reprovado += flags.is_reprovado;
            stores[lojaNome].is_cancelado += flags.is_cancelado;
            stores[lojaNome].is_em_analise += flags.is_em_analise;
            stores[lojaNome].is_pendente += flags.is_pendente;

            // Daily Evolution (by Entry Date)
            if (dataEntrada) {
                if (!dailyEvolution[dataEntrada]) {
                    dailyEvolution[dataEntrada] = { date: dataEntrada, approved: 0 };
                }
                dailyEvolution[dataEntrada].approved += flags.is_aprovado;
            }
        });

        const dashboardData: DashboardData = {
            raw: dataRows,
            metrics: {
                total: totalRecords,
                approved: totalApproved,
                stores,
                groups: {}, // Logic for groups requires map
                dailyEvolution: Object.values(dailyEvolution).sort((a,b) => a.date.localeCompare(b.date))
            }
        };

        resolve(dashboardData);
      },
      error: (err: Error) => {
        reject(err.message);
      }
    });
  });
};
