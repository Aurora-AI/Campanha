"use client";

import { useState, useEffect } from "react";
import { UploadCloud, Loader2 } from "lucide-react";
import { processCSV, DashboardData } from "@/lib/pipeline";
import { storage, LoadBatch } from "@/lib/storage";
import KPICards from "./KPICards";
import EvolutionChart from "./EvolutionChart";
import GroupPerformance from "./GroupPerformance";
import { v4 as uuidv4 } from "uuid";

export default function CalceleveDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cargaInfo, setCargaInfo] = useState<{ nome: string; data: string } | null>(null);

  // Load active batch on mount
  useEffect(() => {
    const loadActive = async () => {
      try {
        const activeCargaId = await storage.getActiveBatchId();
        if (activeCargaId) {
          const batch = await storage.loadBatch(activeCargaId);
          if (batch) {
            setData(batch.dados_normalizados);
            setCargaInfo({ nome: batch.arquivo_nome, data: batch.data_carga });
          }
        }
      } catch (err) {
        console.error("Erro ao carregar carga ativa:", err);
      }
    };
    loadActive();
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setError(null);
    setData(null);

    try {
      const result = await processCSV(file);
      
      // Create and persist batch
      const batch: LoadBatch = {
        carga_id: uuidv4(),
        data_carga: new Date().toISOString(),
        tipo_carga: "aprovadas",
        arquivo_nome: file.name,
        dados_normalizados: result,
      };
      
      await storage.saveBatch(batch);
      await storage.setActiveBatch(batch.carga_id);
      
      setData(result);
      setCargaInfo({ nome: file.name, data: batch.data_carga });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="w-full space-y-10">
      
      {/* Header with Load Info */}
      {cargaInfo && (
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-4xl p-4 border border-blue-200">
          <p className="text-sm text-blue-900">
            <span className="font-bold">📊 Última atualização:</span> {new Date(cargaInfo.data).toLocaleString("pt-BR")} — <span className="italic">{cargaInfo.nome}</span>
          </p>
        </div>
      )}

      {/* Upload Section */}
      <div className="bg-white rounded-4xl p-8 shadow-sm border border-gray-100 text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Painel Aceleração 2025</h1>
        <p className="text-gray-500 mb-8">Importe o CSV diário para apuração de metas e grupos.</p>
        
        {!data && (
          <label className="inline-flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50 px-12 py-10 transition hover:bg-gray-100 hover:border-gray-300">
            <input type="file" accept=".csv" className="hidden" onChange={handleFileUpload} />
            {loading ? <Loader2 className="h-8 w-8 animate-spin text-gray-400" /> : <UploadCloud className="h-8 w-8 text-gray-400" />}
            <span className="mt-2 text-sm font-semibold text-gray-600">{loading ? "Processando..." : "Selecionar Arquivo CSV"}</span>
          </label>
        )}

        {error && <div className="mt-4 text-red-600 bg-red-50 p-3 rounded-lg text-sm">{error}</div>}
        
        {data && (
           <div className="mt-4 flex justify-center gap-4">
             <div className="text-sm text-green-600 font-bold bg-green-50 px-4 py-2 rounded-full">
               ✅ Base Carregada: {data.metrics.total} registros
             </div>
             <button onClick={() => setData(null)} className="text-sm text-gray-400 hover:text-black underline">
               Trocar Arquivo
             </button>
           </div>
        )}
      </div>

      {data && (
        <div className="space-y-16 animate-in fade-in slide-in-from-bottom-8 duration-700">
          
          {/* 1. Visão Geral (KPIs) */}
          <KPICards metrics={data.metrics} />

          {/* 2. Performance por Grupo (O Coração da Campanha) */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Apuração por Grupos</h2>
            <GroupPerformance weeks={data.metrics.weeks} />
          </div>

          {/* 3. Evolução */}
          <div className="bg-white p-6 rounded-4xl border border-gray-100">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Evolução Diária de Aprovações</h2>
            <EvolutionChart data={data.metrics.dailyEvolution} />
          </div>

          {/* 4. Como funciona */}
          <div className="bg-blue-50 rounded-4xl p-6 border border-blue-200">
            <h3 className="text-lg font-bold text-blue-900 mb-4">ℹ️ Como Funciona</h3>
            <ul className="space-y-2 text-sm text-blue-800">
              <li><strong>Meta do Grupo:</strong> soma das metas individuais (G1: 60, G2: 108, G3: 54)</li>
              <li><strong>Grupo Elegível:</strong> quando a soma de aprovações bate a meta do grupo</li>
              <li><strong>Loja Elegível:</strong> quando o grupo é elegível E a loja bate sua meta individual</li>
              <li><strong>Vencedores (Top 3):</strong> apenas lojas elegíveis, ordenadas por % atingimento</li>
              <li><strong>Zeramento:</strong> metas reiniciam a cada segunda-feira (semana canônica)</li>
            </ul>
          </div>
          
        </div>
      )}
    </section>
  );
}
