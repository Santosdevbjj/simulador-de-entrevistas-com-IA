'use client';

import { useInterview } from '@/features/interview/use-interview';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function EntrevistaPage() {
  // Simulando um ID de usuário logado para fins de portfólio (NextAuth popularia aqui)
  const mockUserId = 'usr_santos_sergio_123';
  
  const router = useRouter();
  const {
    messages,
    input,
    setInput,
    isLoading,
    isEvaluating,
    isCompleted,
    interviewId,
    sendMessage,
    triggerEvaluation,
  } = useInterview(mockUserId);

  // Assim que a Segunda IA terminar de processar o JSON, joga o dev direto para a página do relatório
  useEffect(() => {
    if (isCompleted && interviewId) {
      router.push(`/relatorios/${interviewId}`);
    }
  }, [isCompleted, interviewId, router]);

  return (
    <div className="flex flex-col h-screen bg-slate-950 text-slate-100">
      {/* Header da Ferramenta */}
      <header className="px-6 py-4 border-b border-slate-800 flex justify-between items-center bg-slate-900/50 backdrop-blur">
        <div>
          <h1 className="text-lg font-bold text-emerald-400">IA Entrevistador</h1>
          <p className="text-xs text-slate-400">Simulador Inteligente de Processos Seletivos</p>
        </div>
        {messages.length >= 8 && !isCompleted && (
          <button
            onClick={triggerEvaluation}
            disabled={isEvaluating || isLoading}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 text-white text-sm font-medium rounded-lg transition-colors shadow-lg shadow-emerald-900/20"
          >
            {isEvaluating ? 'Gerando Relatório Analítico...' : 'Finalizar e Gerar Notas'}
          </button>
        )}
      </header>

      {/* Janela de Conversa (Scrollable) */}
      <main className="flex-1 overflow-y-auto p-6 space-y-4 max-w-4xl w-full mx-auto style-scrollbar">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[75%] px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap shadow-md ${
                msg.role === 'user'
                  ? 'bg-emerald-600 text-white rounded-br-none'
                  : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-bl-none'
              }`}
            >
              {msg.content === '' ? (
                <div className="flex space-x-1 py-1 items-center justify-center">
                  <div className="h-2 w-2 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                  <div className="h-2 w-2 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                  <div className="h-2 w-2 bg-slate-400 rounded-full animate-bounce"></div>
                </div>
              ) : (
                msg.content
              )}
            </div>
          </div>
        ))}
        {isEvaluating && (
          <div className="flex justify-start animate-pulse">
            <div className="bg-slate-900 border border-slate-800 text-slate-400 px-4 py-3 rounded-2xl text-sm">
              🤖 Recrutador Sênior está computando suas respostas no Radar de Competências...
            </div>
          </div>
        )}
      </main>

      {/* Caixa de Input de Texto */}
      <footer className="p-4 border-t border-slate-800 bg-slate-900/40">
        <form onSubmit={sendMessage} className="max-w-4xl mx-auto flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading || isEvaluating}
            placeholder={
              isEvaluating 
                ? "Aguarde a análise..." 
                : "Digite sua resposta detalhada para o recrutador..."
            }
            className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 disabled:opacity-50 transition-all"
          />
          <button
            type="submit"
            disabled={isLoading || isEvaluating || !input.trim()}
            className="px-5 py-3 bg-slate-800 hover:bg-emerald-600 disabled:bg-slate-900 text-slate-200 disabled:text-slate-600 font-medium text-sm rounded-xl border border-slate-700 disabled:border-slate-800 transition-all cursor-pointer"
          >
            Enviar
          </button>
        </form>
      </footer>
    </div>
  );
}
