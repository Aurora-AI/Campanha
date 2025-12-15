"use client";

import { motion } from "framer-motion";

interface StoreData {
    name: string;
    total: number;
    approved: number;
}

interface RankingTableProps {
    stores: StoreData[];
}

export default function RankingTable({ stores }: RankingTableProps) {
    // Sort by Approved descending
    const sortedStores = [...stores].sort((a, b) => b.approved - a.approved);

    return (
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
        >
            <div className="p-6 border-b border-gray-100">
                <h3 className="text-lg font-bold text-gray-900">Ranking por Loja</h3>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50 text-gray-500 font-medium">
                        <tr>
                            <th className="px-6 py-4">Posição</th>
                            <th className="px-6 py-4">Loja</th>
                            <th className="px-6 py-4 text-center">Total</th>
                            <th className="px-6 py-4 text-center">Aprovados</th>
                            <th className="px-6 py-4 text-right">Performance</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {sortedStores.map((store, index) => (
                            <tr key={index} className="hover:bg-gray-50/50 transition-colors">
                                <td className="px-6 py-4 font-mono text-gray-400">#{index + 1}</td>
                                <td className="px-6 py-4 font-medium text-gray-900">{store.name}</td>
                                <td className="px-6 py-4 text-center text-gray-600">{store.total}</td>
                                <td className="px-6 py-4 text-center font-bold text-gray-900">{store.approved}</td>
                                <td className="px-6 py-4 text-right text-gray-500">
                                    {(store.total > 0 ? ((store.approved / store.total) * 100).toFixed(1) : "0.0")}%
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </motion.div>
    );
}
