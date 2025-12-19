import Link from "next/link";
import CalceleveDashboard from "@/components/_legacy/Dashboard";

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-100 px-6 py-4 flex justify-between items-center sticky top-0 z-50">
        <div className="font-bold text-gray-900">Dashboard Captação</div>
        <Link href="/" className="text-xs text-gray-500 hover:text-black transition-colors">Voltar para Home</Link>
      </header>
      <main className="max-w-7xl mx-auto px-6 py-10">
        <CalceleveDashboard />
      </main>
    </div>
  );
}
