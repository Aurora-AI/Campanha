"use client";

import { motion } from "framer-motion";
import { TrendingUp, Users, CreditCard } from "lucide-react";
import Image from "next/image";

export default function CampaignReportLight() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: [0.2, 0.65, 0.3, 0.9] as const,
      },
    },
  };

  return (
    <main className="min-h-screen w-full bg-white selection:bg-gray-100 selection:text-gray-900 overflow-hidden relative">
      {/* Background Texture - Puzzle Head */}
      <div className="absolute inset-0 z-0 opacity-[0.07] pointer-events-none select-none">
        <Image
          src="/images/puzzle.png"
          alt=""
          fill
          className="object-cover object-top"
          priority
        />
        {/* Gradient Fade */}
        <div className="absolute inset-0 bg-linear-to-t from-white via-transparent to-transparent" />
      </div>

      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="relative z-10 max-w-7xl mx-auto px-6 py-24 md:py-32"
      >
        {/* Hero Section */}
        <motion.header variants={itemVariants} className="mb-32 text-center">
          <div className="inline-block mb-6 px-4 py-1.5 rounded-full border border-gray-100 bg-gray-50/50 backdrop-blur-sm">
            <span className="font-mono text-xs tracking-widest text-gray-400 uppercase">Período Q4 2024</span>
          </div>
          
          {/* Hero Final Image */}
          <div className="relative w-full max-w-5xl mx-auto mb-6 overflow-hidden rounded-3xl">
            <Image
              src="/images/hero-final.png"
              alt="Campanha CALCELEVE 2025"
              width={1600}
              height={600}
              className="w-full h-auto"
              priority
            />
          </div>
          
          <p className="font-mono text-gray-400 tracking-widest text-sm uppercase">Relatório de Performance Comercial</p>
        </motion.header>

        {/* KPI Gallery */}
        <motion.section variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-40">
           {/* Card 1 */}
           <div className="group relative p-10 rounded-2xl bg-white/70 backdrop-blur-xl border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all duration-500 hover:scale-105 hover:shadow-[0_20px_40px_rgb(0,0,0,0.06)]">
              <div className="flex justify-between items-start mb-12">
                <div className="p-3 bg-gray-50 rounded-full text-gray-950">
                   <CreditCard strokeWidth={1} size={24} />
                </div>
                <span className="font-mono text-xs text-gray-400">+12% vs Q3</span>
              </div>
              <h3 className="font-serif text-5xl font-medium text-gray-950 mb-2">3.2k</h3>
              <p className="font-sans text-sm text-gray-500 font-medium">Propostas Aprovadas</p>
           </div>

           {/* Card 2 */}
           <div className="group relative p-10 rounded-2xl bg-white/70 backdrop-blur-xl border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all duration-500 hover:scale-105 hover:shadow-[0_20px_40px_rgb(0,0,0,0.06)]">
              <div className="flex justify-between items-start mb-12">
                <div className="p-3 bg-gray-50 rounded-full text-gray-950">
                   <TrendingUp strokeWidth={1} size={24} />
                </div>
                <span className="font-mono text-xs text-emerald-500">+45% YoY</span>
              </div>
              <h3 className="font-serif text-5xl font-medium text-gray-950 mb-2">+45%</h3>
              <p className="font-sans text-sm text-gray-500 font-medium">Crescimento Líquido</p>
           </div>

           {/* Card 3 */}
           <div className="group relative p-10 rounded-2xl bg-white/70 backdrop-blur-xl border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all duration-500 hover:scale-105 hover:shadow-[0_20px_40px_rgb(0,0,0,0.06)]">
              <div className="flex justify-between items-start mb-12">
                <div className="p-3 bg-gray-50 rounded-full text-gray-950">
                   <Users strokeWidth={1} size={24} />
                </div>
                 <span className="font-mono text-xs text-gray-400">Target Atingido</span>
              </div>
              <h3 className="font-serif text-5xl font-medium text-gray-950 mb-2">15.4k</h3>
              <p className="font-sans text-sm text-gray-500 font-medium">Leads Qualificados</p>
           </div>
        </motion.section>

        {/* Narrative Section */}
        <motion.section variants={itemVariants} className="max-w-3xl mx-auto">
            <div className="pl-8 border-l border-gray-200">
                <h2 className="font-serif text-3xl md:text-4xl leading-tight text-gray-950 mb-8">
                   &quot;A precisão não é apenas um detalhe técnico, é a linguagem do luxo moderno. Nossos resultados refletem uma estratégia desenhada com rigor cirúrgico.&quot;
                </h2>
                <div className="flex items-center gap-4">
                    <div className="h-px w-12 bg-gray-300"></div>
                    <p className="font-mono text-xs tracking-[0.2em] text-gray-400 uppercase">Diretoria Executiva</p>
                </div>
            </div>
        </motion.section>
      </motion.div>
    </main>
  );
}
