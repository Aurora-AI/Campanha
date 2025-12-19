"use client";

import { useState } from "react";
import { WeeklyMetrics } from "@/lib/pipeline";
import { CheckCircle, AlertCircle, Trophy, Rocket, RefreshCw, Flame } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ProgressBar from "./ProgressBar";

const StageBadge = ({ stage }: { stage: string }) => {
  switch (stage) {
    case "aceleracao": return <span className="flex items-center gap-1 text-blue-600 bg-blue-100 px-3 py-1 rounded-full text-xs font-bold uppercase"><Rocket className="w-3 h-3"/> Aceleração</span>;
    case "consolidacao": return <span className="flex items-center gap-1 text-purple-600 bg-purple-100 px-3 py-1 rounded-full text-xs font-bold uppercase"><RefreshCw className="w-3 h-3"/> Consolidação</span>;
    case "sprint_final": return <span className="flex items-center gap-1 text-orange-600 bg-orange-100 px-3 py-1 rounded-full text-xs font-bold uppercase"><Flame className="w-3 h-3"/> Sprint Final</span>;
    default: return null;
  }
};

export default function GroupPerformance({ weeks }: { weeks: Record<string, WeeklyMetrics> }) {
  // Ordena semanas (mais recente primeiro) e seleciona a primeira
  const weekIds = Object.keys(weeks).sort().reverse();
  const [selectedWeekId, setSelectedWeekId] = useState(weekIds[0]);
  
  const currentWeek = weeks[selectedWeekId];
  if (!currentWeek) return <div>Sem dados.</div>;

  const groupList = ["G1", "G2", "G3"].map(id => currentWeek.groups[id]).filter(Boolean);

  return (
    <div className="space-y-8">
      
      {/* Seletor de Semana e Etapa */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 w-full md:w-auto">
          {weekIds.map(id => (
            <button
              key={id}
              onClick={() => setSelectedWeekId(id)}
              className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-colors
                ${selectedWeekId === id ? "bg-black text-white" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}
              `}
            >
              {weeks[id].label}
            </button>
          ))}
        </div>
        <StageBadge stage={currentWeek.stage} />
      </div>

      {/* Grid de Grupos */}
      <AnimatePresence mode="wait">
        <motion.div 
          key={selectedWeekId}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
        >
          {groupList.map((group) => (
            <div
              key={group.id}
              className={`
                relative overflow-hidden rounded-4xl border-2 
                ${group.metGoal ? "border-green-100 bg-green-50/30" : "border-red-100 bg-red-50/30"}
              `}
            >
              {/* Header */}
              <div className={`p-6 border-b ${group.metGoal ? "border-green-100" : "border-red-100"}`}>
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-bold text-gray-900">{group.name}</h3>
                  {group.metGoal ? (
                    <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" /> Meta Batida
                    </span>
                  ) : (
                    <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> Faltam {group.missing}
                    </span>
                  )}
                </div>
                
                <div className="flex items-baseline gap-2 mt-4">
                  <span className="text-4xl font-black text-gray-900">{group.approved}</span>
                  <span className="text-sm font-medium text-gray-500">/ {group.groupGoal}</span>
                </div>
                
                {/* Progress Bar */}
                <ProgressBar 
                  value={group.approved} 
                  max={group.goal} 
                  color={group.metGoal ? "green" : "red"}
                />
              </div>

              {/* Ranking Semanal */}
              <div className="p-6">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">
                  Ranking Semanal
                </h4>
                
                {!group.metGoal && (
                  <div className="mb-4 rounded-lg border border-amber-400 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-900">
                    🔒 PRÊMIOS AINDA NÃO DESBLOQUEADOS — resultados exibidos para reconhecimento.
                  </div>
                )}

                <div className="space-y-3">
                  {group.stores.map((store, i) => {
                    const isTop3 = i < 3;
                    const isWinner = group.metGoal && store.eligible && isTop3;
                    const prizesLocked = !group.metGoal && isTop3;
                    const storePercentage = store.pct ? Math.round(store.pct) : 0;
                    return (
                      <div key={store.name} className={`flex items-center justify-between text-sm p-2 rounded-lg ${store.eligible ? "bg-blue-50/50" : "bg-gray-50/50"}`}>
                        <div className="flex items-center gap-3 flex-1">
                          <span className={`w-5 h-5 flex items-center justify-center rounded-full text-[10px] font-bold ${isWinner ? "bg-yellow-100 text-yellow-700" : "bg-gray-100 text-gray-500"}`}>
                            {i + 1}
                          </span>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className={`font-medium ${isWinner ? "text-gray-900" : "text-gray-600"}`}>
                                {store.name.replace("LOJA ", "L")}
                              </span>
                              {prizesLocked && (
                                <span className="bg-amber-100 text-amber-700 px-2 py-0.5 rounded text-[9px] font-bold uppercase">Prêmios bloqueados</span>
                              )}
                              {!prizesLocked && store.eligible && (
                                <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-[9px] font-bold uppercase">Elegível</span>
                              )}
                              {!prizesLocked && !store.eligible && (
                                <span className="bg-red-100 text-red-700 px-2 py-0.5 rounded text-[9px] font-bold uppercase">Inelegível</span>
                              )}
                            </div>
                            <div className="text-[11px] text-gray-500 mt-0.5">
                              {store.approved}/{store.goal} ({storePercentage}%)
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-right">{store.approved}</span>
                          {isWinner && <Trophy className="w-3 h-3 text-yellow-500 flex-shrink-0" />}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ))}
        </motion.div>
      </AnimatePresence>

      <div className="text-center text-xs text-gray-400 italic">
        * Resultados zeram a cada segunda-feira.
      </div>
    </div>
  );
}
