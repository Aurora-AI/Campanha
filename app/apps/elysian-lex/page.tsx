// app/apps/elysian-lex/page.tsx
"use client";

import { useState, useEffect } from "react";
// @ts-ignore
import { useChat } from "@ai-sdk/react";
import { Upload, FileText, Send, AlertCircle, CheckCircle2 } from "lucide-react";
import { v4 as uuidv4 } from 'uuid';

export default function ElysianLexPage() {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStats, setUploadStats] = useState<{ pageCount: number; chunkCount: number } | null>(null);
  const [mode, setMode] = useState<'chat' | 'analysis' | 'drafting'>('chat');
  const [error, setError] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string>("");

  useEffect(() => {
    // Generate or retrieve session ID on mount
    let sid = localStorage.getItem("elysian_session_id");
    if (!sid) {
      sid = uuidv4();
      localStorage.setItem("elysian_session_id", sid);
    }
    setSessionId(sid);
  }, []);

  // Use 'any' casting to bypass TS strictness in MVP for now, given the complexity of 'ai' SDK types in this env
  const chat = useChat({
    api: '/api/elysian-lex/chat',
    body: { mode, sessionId },
    onError: (e: any) => console.error("Chat Error:", e)
  } as any) as any;

  // Destructure safely with defaults to prevent runtime crash "cannot read properties of undefined"
  const {
    messages = [],
    input = "",
    handleInputChange = () => {},
    handleSubmit = (e: any) => e?.preventDefault(),
    isLoading = false
  } = chat || {};

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;

    const file = e.target.files[0];
    setIsUploading(true);
    setError(null);
    setUploadStats(null);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("sessionId", sessionId);

    try {
      const res = await fetch("/api/elysian-lex/ingest", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        throw new Error(await res.text());
      }

      const data = await res.json();
      if (data.success) {
        setUploadStats(data.stats);
      } else {
        throw new Error(data.error || "Upload failed");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-slate-50 text-slate-900 font-sans">
      {/* Header */}
      <header className="bg-slate-900 text-white p-4 shadow-md flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center">
            <span className="font-bold text-slate-900">E</span>
          </div>
          <h1 className="text-xl font-semibold tracking-tight">Elysian-Lex <span className="text-slate-400 text-sm font-normal">| Aurora Legal Co-Pilot</span></h1>
        </div>
        <div className="text-xs text-slate-400 flex flex-col items-end">
           <span>MVP v0.1</span>
           <span className="opacity-50 text-[10px] font-mono">SID: {sessionId ? sessionId.slice(0, 8) : '...'}</span>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex overflow-hidden">

        {/* Sidebar / Context Area */}
        <aside className="w-80 bg-white border-r border-slate-200 p-6 flex flex-col gap-6 overflow-y-auto">

          {/* Upload Section */}
          <div className="p-4 border-2 border-dashed border-slate-300 rounded-lg bg-slate-50 text-center transition-colors hover:bg-slate-100 hover:border-emerald-400">
            <label className="cursor-pointer flex flex-col items-center gap-2">
              <Upload className="w-8 h-8 text-slate-400" />
              <span className="text-sm font-medium text-slate-600">
                {isUploading ? "Indexando Autos..." : "Carregar Processo (PDF)"}
              </span>
              <input
                type="file"
                accept=".pdf"
                onChange={handleFileUpload}
                className="hidden"
                disabled={isUploading}
              />
            </label>
          </div>

          {/* Status Indicators */}
          {error && (
            <div className="p-3 bg-red-50 text-red-700 text-sm rounded-md flex items-start gap-2">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {uploadStats && (
            <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-md text-emerald-800 animate-in fade-in slide-in-from-top-2">
              <div className="flex items-center gap-2 mb-2 font-semibold">
                <CheckCircle2 className="w-5 h-5" />
                <span>Autos Indexados</span>
              </div>
              <ul className="text-xs space-y-1 opacity-80">
                <li>Páginas: {uploadStats.pageCount}</li>
                <li>Chunks: {uploadStats.chunkCount}</li>
                <li>Status: 🟢 Pronto para Análise</li>
              </ul>
            </div>
          )}

          {/* Mode Selector */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Modo Cognitivo</h3>
            <div className="flex flex-col gap-1">
              <button
                onClick={() => setMode('analysis')}
                className={`p-2 text-left text-sm rounded-md transition-colors ${mode === 'analysis' ? 'bg-emerald-100 text-emerald-900 font-medium' : 'hover:bg-slate-100'}`}
              >
                🔍 Modo A: Análise de Risco
              </button>
              <button
                onClick={() => setMode('drafting')}
                className={`p-2 text-left text-sm rounded-md transition-colors ${mode === 'drafting' ? 'bg-emerald-100 text-emerald-900 font-medium' : 'hover:bg-slate-100'}`}
              >
                ⚖️ Modo B: Redação de Peças
              </button>
              <button
                onClick={() => setMode('chat')}
                className={`p-2 text-left text-sm rounded-md transition-colors ${mode === 'chat' ? 'bg-emerald-100 text-emerald-900 font-medium' : 'hover:bg-slate-100'}`}
              >
                💬 Modo C: Interrogatório
              </button>
            </div>
          </div>

          <div className="mt-auto pt-4 border-t border-slate-100">
             <div className="text-xs text-slate-400">
               <p className="mb-1"><strong>Trustware Ativo:</strong></p>
               <ul className="list-disc pl-4 space-y-1">
                 <li>Grounding Absoluto</li>
                 <li>Alucinação Zero</li>
                 <li>Isolamento de Dados</li>
               </ul>
             </div>
          </div>
        </aside>

        {/* Chat Interface */}
        <section className="flex-1 flex flex-col bg-white">
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {messages.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 opacity-50">
                <FileText className="w-16 h-16 mb-4" />
                <p className="text-lg font-medium">Aguardando instruções...</p>
                <p className="text-sm">Carregue um PDF e escolha um modo.</p>
              </div>
            )}

            {messages.map((m: any) => (
              <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-3xl p-4 rounded-lg text-sm leading-relaxed whitespace-pre-wrap ${
                    m.role === 'user'
                      ? 'bg-slate-800 text-white'
                      : 'bg-slate-50 border border-slate-200 text-slate-800 shadow-sm'
                  }`}
                >
                  {m.role === 'assistant' && (
                    <div className="text-xs font-bold text-emerald-600 mb-1 uppercase tracking-wide">
                      Elysian-Lex
                    </div>
                  )}
                  {m.content}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                 <div className="bg-slate-50 border border-slate-200 p-4 rounded-lg shadow-sm">
                   <div className="flex items-center gap-2 text-sm text-slate-500">
                     <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" />
                     <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce delay-75" />
                     <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce delay-150" />
                     <span>Processando raciocínio jurídico...</span>
                   </div>
                 </div>
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="p-4 border-t border-slate-200 bg-slate-50">
            <form onSubmit={handleSubmit} className="max-w-4xl mx-auto relative flex gap-2">
              <input
                className="flex-1 p-3 pr-12 rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent shadow-sm"
                value={input}
                onChange={handleInputChange}
                placeholder={
                   mode === 'analysis' ? "Ex: Analise os riscos de insalubridade..." :
                   mode === 'drafting' ? "Ex: Redija uma contestação preliminar..." :
                   "Faça uma pergunta sobre o processo..."
                }
                disabled={isLoading || !uploadStats}
              />
              <button
                type="submit"
                disabled={isLoading || !input?.trim() || !uploadStats}
                className="bg-slate-900 text-white p-3 rounded-md hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
              >
                <Send className="w-5 h-5" />
              </button>
            </form>
            {!uploadStats && (
              <p className="text-xs text-center text-amber-600 mt-2">
                ⚠️ Necessário carregar um PDF (Autos) antes de iniciar.
              </p>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
