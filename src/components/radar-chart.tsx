'use client';

import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from 'recharts';

interface RadarChartProps {
  scores: {
    backend: number;
    frontend: number;
    cloud: number;
    softSkills: number;
    architecture: number;
  };
}

export function CompetenciesRadar({ scores }: RadarChartProps) {
  // Mapeia os dados brutos no formato exigido pela biblioteca Recharts
  const data = [
    { subject: 'Backend', A: scores.backend, fullMark: 100 },
    { subject: 'Frontend', A: scores.frontend, fullMark: 100 },
    { subject: 'Cloud / DevOps', A: scores.cloud, fullMark: 100 },
    { subject: 'Soft Skills', A: scores.softSkills, fullMark: 100 },
    { subject: 'Arquitetura', A: scores.architecture, fullMark: 100 },
  ];

  return (
    <div className="w-full h-[320px] flex items-center justify-center bg-slate-900/40 border border-slate-800/80 rounded-2xl p-4">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="75%" data={data}>
          <PolarGrid stroke="#334155" />
          <PolarAngleAxis 
            dataKey="subject" 
            tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 500 }}
          />
          <PolarRadiusAxis 
            angle={30} 
            domain={[0, 100]} 
            tick={{ fill: '#475569', fontSize: 10 }}
          />
          <Radar
            name="Vaga"
            dataKey="A"
            stroke="#10b981"
            fill="#10b981"
            fillOpacity={0.25}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
