import { prisma } from '@/services/db/client';
import { CompetenciesRadar } from '@/components/radar-chart';
import { notFound } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import Link from 'next/link';

interface RelatorioPageProps {
  params: Promise<{ id: string }>;
}

export default async function RelatorioPage({ params }: RelatorioPageProps) {
  const { id } = await params;

  // 1. BUSCA DIRETAMENTE NO BANCO COM SERVER COMPONENTS
  const interview = await prisma.interview.findUnique({
    where: { id },
  });

  // Se o ID for inválido ou não existir no PostgreSQL, joga para a página 404 nativa
  if (!interview) {
    notFound();
  }

  // Agrupa os scores em um objeto limpo para o gráfico
  const chartScores = {
    backend: interview.scoreBackend ?? 0,
    frontend: interview.scoreFrontend ?? 0,
    cloud: interview.scoreCloud ?? 0,
    softSkills: interview.scoreSoft ?? 0,
    architecture: interview.scoreArch ?? 0,
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-12">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Navegação e Voltar */}
        <div className="flex justify-between items-center">
          <Link 
            href="/entrevista" 
            className="text-xs text-slate-400 hover:text-emerald-400 transition-colors flex items-center gap-1"
          >
            ← Simular Nova Vaga
          </Link>
          <span className="text-xs text-slate-500 font-mono">ID: {interview.id}</span>
        </div>

        {/* Header Principal da Análise */}
        <div className="border-b border-slate-800 pb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest bg-emerald-500/10 px-2.5 py-1 rounded-full">
              {interview.seniority}
            </span>
            <h1 className="text-2xl md:text-3xl font-extrabold mt-2 text-slate-100">{interview.position}</h1>
            <p className="text-sm text-slate-400 mt-1">Análise diagnóstica e score de maturidade técnica da vaga estruturada.</p>
          </div>
          
          {/* Badge de Score Geral */}
          <div className="flex items-center gap-3 bg-slate-900 border border-slate-800 px-5 py-3 rounded-2xl shadow-xl">
            <div className="text-right">
              <p className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">Score Geral</p>
              <p className="text-xs text-slate-400">Garantia de Escopo</p>
            </div>
            <span className="text-3xl font-black text-emerald-400 font-mono">
              {interview.scoreGeneral ?? 0}
            </span>
          </div>
        </div>

        {/* Grid Principal: Gráfico e Metadados */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Box do Gráfico de Radar (Ocupa 2 colunas no desktop) */}
          <div className="md:col-span-2 space-y-3">
            <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Radar de Competências Requeridas</h2>
            <CompetenciesRadar scores={chartScores} />
          </div>

          {/* Resumo Rápido da Stack/Skills (Ocupa 1 coluna) */}
          <div className="bg-slate-900/50 border border-slate-800/60 rounded-2xl p-5 space-y-5">
            <h2 className="text-sm font-bold text-slate-300 border-b border-slate-800 pb-2">Metadados da Vaga</h2>
            
            <div>
              <h3 className="text-xs font-bold text-slate-500 uppercase">Tecnologias Essenciais</h3>
              <p className="text-sm text-slate-300 mt-1 whitespace-pre-line">{interview.stack}</p>
            </div>

            <div>
              <h3 className="text-xs font-bold text-slate-500 uppercase">Comportamental Proposto</h3>
              <p className="text-sm text-slate-300 mt-1 whitespace-pre-line">{interview.softSkills}</p>
            </div>

            <div>
              <h3 className="text-xs font-bold text-slate-500 uppercase">Data da Avaliação</h3>
              <p className="text-sm text-slate-400 font-mono mt-1">
                {new Date(interview.createdAt).toLocaleDateString('pt-BR')}
              </p>
            </div>
          </div>
        </div>

        {/* Relatório Técnico Descritivo (Markdown gerado pela Segunda IA) */}
        <div className="bg-slate-900/30 border border-slate-800/80 rounded-2xl p-6 md:p-8 shadow-inner">
          <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-6 border-b border-slate-800 pb-3">
            Análise Avançada do Especialista (Relatório de Engenharia)
          </h2>
          
          {/* Renderização Semântica do Markdown com classes utilitárias do Tailwind */}
          <article className="prose prose-invert prose-sm max-w-none text-slate-300 space-y-4 
            prose-headings:text-slate-100 prose-headings:font-bold prose-headings:mt-6 prose-headings:mb-2
            prose-h3:text-emerald-400 prose-h3:text-base
            prose-ul:list-disc prose-ul:pl-5 prose-li:my-1">
            <ReactMarkdown>
              {interview.feedback ?? '*Nenhum relatório descritivo disponível para esta vaga.*'}
            </ReactMarkdown>
          </article>
        </div>

      </div>
    </div>
  );
}
