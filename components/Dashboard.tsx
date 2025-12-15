"use client";

import { useState } from "react";
import { UploadCloud, Loader2 } from "lucide-react";
import { processCSV, DashboardData } from "@/lib/pipeline";
import KPICards from "./KPICards";
import RankingTable from "./RankingTable";
import EvolutionChart from "./EvolutionChart";
import { motion } from "framer-motion";

export default function CalceleveDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setError(null);
    setData(null);

    try {
      const result = await processCSV(file);
      setData(result);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="w-full max-w-7xl mx-auto px-6 py-24 border-t border-gray-100">
      <div className="mb-12">
        <h2 className="font-serif text-3xl md:text-4xl text-gray-950 mb-4">Dashboard Aceleração</h2>
        <p className="text-gray-500">Importe o CSV diário para atualizar os indicadores.</p>
      </div>

      {/* Upload Zone */}
      {!data && (
        <div className="border-2 border-dashed border-gray-200 rounded-2xl p-12 text-center hover:border-gray-400 transition-colors bg-gray-50/50">
           <input 
              type="file" 
              accept=".csv" 
              onChange={handleFileUpload} 
              className="hidden" 
              id="csv-upload"
           />
           <label htmlFor="csv-upload" className="cursor-pointer flex flex-col items-center">
              {loading ? (
                  <Loader2 className="w-12 h-12 text-gray-400 animate-spin mb-4" />
              ) : (
                  <UploadCloud className="w-12 h-12 text-gray-400 mb-4" />
              )}
              <span className="text-lg font-medium text-gray-900">
                  {loading ? "Processando..." : "Clique para selecionar o CSV"}
              </span>
              <p className="text-sm text-gray-500 mt-2">Suporta apenas formato .csv (UTF-8)</p>
           </label>
           {error && (
             <div className="mt-4 p-4 bg-red-50 text-red-600 rounded-lg text-sm">
                {error}
             </div>
           )}
        </div>
      )}

      {/* Dashboard View */}
      {data && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="flex justify-between items-center mb-8">
               <div className="flex items-center gap-2 px-3 py-1 bg-green-50 text-green-700 rounded-full text-sm font-medium">
                  <span className="w-2 h-2 rounded-full bg-green-500"></span>
                  Dados Atualizados
               </div>
               <button 
                 onClick={() => setData(null)}
                 className="text-sm text-gray-500 hover:text-gray-900 underline"
               >
                 Importar outro arquivo
               </button>
            </div>

            <KPICards metrics={{
                total: data.metrics.total,
                approved: data.metrics.approved,
                rejected: 0 // Simplification for now, strictly strictly strictly following aggregation in pipeline
            }} />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
               <div className="lg:col-span-2">
                   <RankingTable stores={Object.values(data.metrics.stores)} />
               </div>
               <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                   <h3 className="font-bold text-gray-900 mb-4">Evolução Diária</h3>
                   <EvolutionChart data={data.metrics.dailyEvolution} />
               </div>
            </div>
        </motion.div>
      )}
    </section>
  );
}
