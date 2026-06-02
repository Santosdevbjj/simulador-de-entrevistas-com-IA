import { prisma } from '@/services/db/client';
import Link from 'next/link';

export const revalidate = 0; // Garante que o dashboard sempre busque dados frescos a cada recarregamento

export default async function DashboardPage() {
  const mockUserId = 'usr_santos_sergio_123'; // Mesmo ID fictício usado no chat

  // 1. BUSCA TODAS AS ENTREVISTAS DO USUÁRIO NO BANCO
  const interviews = await prisma.interview.findMany({
    where: { userId: mockUserId },
    orderBy: { createdAt: 'desc' },
  });

  // 2. CÁLCULO DE MÉTRICAS OPERACIONAIS (MINDSET DE NEGÓCIO - MEIGAROM)
  const totalInterviews = interviews.length;
  
  const interviewsWithScore = interviews.filter(i => i.scoreGeneral !== null);
  const averageScore = interviewsWithScore.length > 0
    ? Math.round(interviewsWithScore.reduce((acc, curr) => acc + (curr.scoreGeneral ?? 0), 0) / interviewsWithScore.length)
    : 0;

  // Conta quantas vagas são de nível Sênior/Especialista para fins de Analytics
  const seniorVagasCount = interviews.filter(i => 
    i.seniority.toLowerCase().includes('senior') || 
    i.seniority.toLowerCase().includes('sênior') || 
    i.seniority.toLowerCase().includes('especialista')
  ).length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-12">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Cabeçalho do Painel */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-800 pb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-100">
              Painel de Engenharia de Vagas
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Gerencie suas simulações estruturadas, acompanhe scores de maturidade e acesse relatórios de IA.
            </p>
          </div>
          <Link
            href="/entrevista"
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-sm rounded-xl transition-colors shadow-lg shadow-emerald-950/40 inline-flex items-center gap-2"
          >
            <span>+</span> Nova Simulação
          </Link>
        </div>

        {/* 📊 Seção de KPIs / Métricas Globais */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          
          {/* Card 1: Total Realizado */}
          <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-2xl flex flex-col justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Simulações Realizadas</span>
            <div className="flex items-baseline gap-2 mt-4">
              <span className="text-4xl font-black text-slate-100 font-mono">{totalInterviews}</span>
              <span className="text-xs text-slate-500">processamentos</span>
            </div>
          </div>

          {/* Card 2: Média de Score Geral */}
          <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-2xl flex flex-col justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Média de Score Geral</span>
            <div className="flex items-baseline gap-2 mt-4">
              <span className="text-4xl font-black text-emerald-400 font-mono">{averageScore}</span>
              <span className="text-xs text-slate-500">/ 100 pontos</span>
            </div>
          </div>

          {/* Card 3: Volumetria Estratégica */}
          <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-2xl flex flex-col justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Foco em Alta Senioridade</span>
            <div className="flex items-baseline gap-2 mt-4">
              <span className="text-4xl font-black text-sky-400 font-mono">{seniorVagasCount}</span>
              <span className="text-xs text-slate-500">vagas sênior / especialista</span>
            </div>
          </div>

        </div>

        {/* 📋 Histórico Analítico de Vagas */}
        <div className="space-y-4">
          <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Histórico Recente</h2>
          
          {totalInterviews === 0 ? (
            /* Estado Vazio de Forma Elegante */
            <div className="bg-slate-900/20 border border-slate-800 border-dashed rounded-2xl p-12 text-center max-w-md mx-auto">
              <p className="text-slate-400 font-medium">Nenhuma simulação registrada no seu banco de dados.</p>
              <p className="text-xs text-slate-500 mt-1 mb-6">Inicie sua primeira entrevista assistida por IA para gerar o dashboard.</p>
              <Link 
                href="/entrevista" 
                className="text-xs bg-slate-800 border border-slate-700 hover:border-emerald-500 px-4 py-2 rounded-lg transition-colors"
              >
                Iniciar Entrevista
              </Link>
            </div>
          ) : (
            /* Lista de Cards de Entrevistas */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {interviews.map((item) => (
                <div 
                  key={item.id} 
                  className="bg-slate-900/40 border border-slate-800 hover:border-slate-700/80 p-5 rounded-2xl flex flex-col justify-between gap-4 transition-all group shadow-sm"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-mono text-slate-500 bg-slate-800 px-2 py-0.5 rounded">
                        {new Date(item.createdAt).toLocaleDateString('pt-BR')}
                      </span>
                      {item.scoreGeneral !== null ? (
                        <span className="text-xs font-bold font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full">
                          Score: {item.scoreGeneral}
                        </span>
                      ) : (
                        <span className="text-xs font-medium text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-full">
                          Incompleta
                        </span>
                      )}
                    </div>

                    <div>
                      <h3 className="font-bold text-slate-100 text-base group-hover:text-emerald-400 transition-colors">
                        {item.position}
                      </h3>
                      <p className="text-xs text-slate-400 font-medium mt-0.5">
                        Senioridade: <span className="text-slate-300">{item.seniority}</span>
                      </p>
                    </div>

                    <p className="text-xs text-slate-400 line-clamp-1 mt-2">
                      <span className="font-semibold text-slate-500">Stack:</span> {item.stack}
                    </p>
                  </div>

                  <div className="border-t border-slate-800/80 pt-3 flex justify-between items-center">
                    <span className="text-[10px] text-slate-500 font-mono truncate max-w-[180px]">
                      {item.id}
                    </span>
                    <Link
                      href={item.scoreGeneral !== null ? `/relatorios/${item.id}` : `/entrevista`}
                      className="text-xs font-bold text-emerald-500 group-hover:text-emerald-400 flex items-center gap-1 transition-transform group-hover:translate-x-0.5"
                    >
                      {item.scoreGeneral !== null ? 'Acessar Relatório →' : 'Continuar Chat →'}
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
