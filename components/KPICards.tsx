"use client";

import { motion } from "framer-motion";
import { CheckCircle, FileText } from "lucide-react";

interface KPICardsProps {
  metrics: {
    total: number;
    approved: number;
    rejected?: number; // Optional: not required for display
  }
}

export default function KPICards({ metrics }: KPICardsProps) {
  const cards = [
    {
      label: "Total de Propostas",
      value: metrics.total,
      icon: FileText,
      color: "text-gray-950",
      bg: "bg-gray-50",
      delay: 0,
    },
    {
      label: "Aprovados",
      value: metrics.approved,
      icon: CheckCircle,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
      delay: 0.1,
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {cards.map((card, idx) => (
        <motion.div
           key={idx}
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ delay: card.delay }}
           className="p-6 rounded-2xl bg-white border border-gray-100 shadow-sm"
        >
          <div className="flex justify-between items-start mb-4">
             <div className={`p-3 rounded-xl ${card.bg}`}>
                <card.icon className={`w-6 h-6 ${card.color}`} />
             </div>
          </div>
          <div className="space-y-1">
             <h3 className="text-3xl font-bold text-gray-900">{card.value}</h3>
             <p className="text-sm font-medium text-gray-500">{card.label}</p>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
