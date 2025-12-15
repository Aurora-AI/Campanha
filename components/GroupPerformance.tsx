"use client";

import { GroupMetric } from "@/lib/pipeline";
import { CheckCircle, AlertCircle, Trophy, Clock } from "lucide-react";
import { motion } from "framer-motion";

export default function GroupPerformance({ groups }: { groups: Record<string, GroupMetric> }) {
  const groupList = ["G1", "G2", "G3"].map(id => groups[id]).filter(Boolean);

  return (
    <div className="space-y-12">
      {/* Aviso Legal */}
      <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 flex gap-3 items-start">
        <Clock className="w-5 h-5 text-blue-600 mt-0.5" />
        <div>
          <h4 className="text-sm font-bold text-blue-900">Atenção: Aprovadas vs Ativadas</h4>
          <p className="text-sm text-blue-700 mt-1">
            Os resultados abaixo consideram propostas <strong>APROVADAS</strong>. 
            A confirmação final dos vencedores ocorre após a <strong>ATIVAÇÃO</strong> do cartão (até 7 dias).
            O status de &quot;Potencial Vencedor&quot; é provisório.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {groupList.map((group, idx) => (
          <motion.div
            key={group.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className={`
              relative overflow-hidden rounded-[2rem] border-2 
              ${group.metGoal ? "border-green-100 bg-green-50/30" : "border-red-100 bg-red-50/30"}
            `}
          >
            {/* Cabeçalho do Grupo */}
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
                <span className="text-sm font-medium text-gray-500">/ {group.goal} aprovações</span>
              </div>
              
              {/* Barra de Progresso */}
              <div className="w-full h-2 bg-gray-200 rounded-full mt-4 overflow-hidden">
                <div 
                  className={`h-full rounded-full ${group.metGoal ? "bg-green-500" : "bg-red-400"}`} 
                  style={{ width: `${Math.min(100, (group.approved / group.goal) * 100)}%` }}
                />
              </div>
            </div>

            {/* Ranking Interno */}
            <div className="p-6">
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">
                Ranking Interno
              </h4>
              
              {/* Se não bateu a meta, mostra aviso */}
              {!group.metGoal && (
                <div className="text-center py-6">
                  <p className="text-sm text-gray-500 italic">
                    Ranking de vencedores liberado apenas<br/>após o grupo bater a meta.
                  </p>
                </div>
              )}

              <div className="space-y-3">
                {group.stores.map((store, i) => {
                  // É Top 3 E o grupo bateu a meta?
                  const isWinner = group.metGoal && i < 3;
                  
                  return (
                    <div key={store.name} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-3">
                        <span className={`
                          w-5 h-5 flex items-center justify-center rounded-full text-[10px] font-bold
                          ${isWinner ? "bg-yellow-100 text-yellow-700" : "bg-gray-100 text-gray-500"}
                        `}>
                          {i + 1}
                        </span>
                        <span className={`font-medium ${isWinner ? "text-gray-900" : "text-gray-600"}`}>
                          {store.name.replace("LOJA ", "L")}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <span className="font-bold">{store.approved}</span>
                        {isWinner && <Trophy className="w-3 h-3 text-yellow-500" />}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
