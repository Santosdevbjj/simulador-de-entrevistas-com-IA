import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const mockUserId = 'usr_santos_sergio_123';

  // 1. Limpa o banco para evitar duplicidade de registros ao rodar o seed
  await prisma.message.deleteMany({});
  await prisma.interview.deleteMany({});
  await prisma.user.deleteMany({});

  // 2. Cria o usuário padrão de teste
  const user = await prisma.user.create({
    data: {
      id: mockUserId,
      name: 'Sérgio Santos',
      email: 'santossergio.dev@example.com',
    },
  });

  console.log('👤 Usuário de teste criado:', user.email);

  // 3. SEED 1: Uma entrevista COMPLETA com notas e feedback estruturado
  const completedInterview = await prisma.interview.create({
    data: {
      id: 'mock-interview-completed',
      userId: mockUserId,
      position: 'Desenvolvedor Full Stack Next.js',
      seniority: 'Pleno',
      stack: 'React, Next.js (App Router), TypeScript, TailwindCSS, Prisma, PostgreSQL',
      softSkills: 'Comunicação assertiva, Resolução de problemas complexos, Autonomia',
      scoreGeneral: 85,
      scoreBackend: 80,
      scoreFrontend: 90,
      scoreCloud: 70,
      scoreSoft: 85,
      scoreArch: 82,
      feedback: `### 🌟 Pontos Fortes
- Excelente domínio das mecânicas de renderização do Next.js (Server vs Client Components).
- Boa escolha de stack moderna focada em performance e escalabilidade.
- Demonstra maturidade ao justificar o uso do Prisma como facilitador de produtividade.

### 🎯 Pontos de Melhoria
- A arquitetura proposta de Cloud está muito acoplada à soluções Serverless tradicionais; poderia considerar estratégias de cache de borda (Edge Caching).
- Detalhamento de testes automatizados (unitários e de integração) ficou superficial nas respostas da stack.

### 🚀 Recomendações e Plano de Evolução
1. **Próximos 3 meses:** Implementar uma esteira de testes com *Jest* e *MSW* para blindar as Server Actions.
2. **Arquitetura:** Explorar o uso de Redis para camadas de cache em endpoints de alta concorrência.`,
    },
  });

  // Insere o histórico de mensagens da entrevista completa
  await prisma.message.createMany({
    data: [
      {
        interviewId: completedInterview.id,
        role: 'assistant',
        content: 'Olá! Vou fazer perguntas sobre a vaga que você está estruturando.\nPara começar: qual é o título da vaga e qual o propósito principal desse cargo?',
      },
      {
        interviewId: completedInterview.id,
        role: 'user',
        content: 'Vaga para Desenvolvedor Full Stack Next.js. O propósito é liderar o desenvolvimento de novas features da nossa plataforma de e-commerce.',
      },
      {
        interviewId: completedInterview.id,
        role: 'assistant',
        content: 'Excelente. E qual a Senioridade esperada para esse cargo e por qual motivo?',
      },
      {
        interviewId: completedInterview.id,
        role: 'user',
        content: 'Buscamos um profissional Pleno. Ele precisa ter autonomia para codificar, mas ainda terá o suporte de um arquiteto para decisões estruturais.',
      },
    ],
  });

  console.log('📊 Entrevista COMPLETA populada com sucesso.');

  // 4. SEED 2: Uma entrevista INCOMPLETA (Usuário abandonou o chat no meio)
  const incompleteInterview = await prisma.interview.create({
    data: {
      id: 'mock-interview-incomplete',
      userId: mockUserId,
      position: 'Engenheiro de IA Júnior',
      seniority: 'Júnior',
      stack: 'Python, OpenAI API, LangChain',
      softSkills: 'Curiosidade técnica, Aprendizado rápido',
      scoreGeneral: null, // Sem nota porque não foi avaliada ainda
    },
  });

  await prisma.message.create({
    data: {
      interviewId: incompleteInterview.id,
      role: 'user',
      content: 'Estou estruturando uma vaga de Engenheiro de IA Júnior para trabalhar com automação de prompts.',
    },
  });

  console.log('⏳ Entrevista INCOMPLETA populada com sucesso.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
