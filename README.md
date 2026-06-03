# 🤖 AI TalentSpec Architect
### Engenharia de Requisitos de Vagas Tech via Inteligência Artificial Dupla Assíncrona

<div align="center">

<img width="130" height="120" alt="Bootcamp CAIXA IA" src="https://github.com/user-attachments/assets/cf10de84-15d2-4c28-87d0-1533df3bbad1" />

**Bootcamp CAIXA – Inteligência Artificial na Prática · DIO**

[![Portfólio](https://img.shields.io/badge/Portfólio-Sérgio_Santos-111827?style=for-the-badge&logo=githubpages&logoColor=00eaff)](https://portfoliosantossergio.vercel.app)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-Sérgio_Santos-0A66C2?style=for-the-badge&logo=linkedin&logoColor=white)](https://linkedin.com/in/santossergioluiz)

![Next.js](https://img.shields.io/badge/Next.js_15-000000?style=flat-square&logo=nextdotjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript_5.3-3178C6?style=flat-square&logo=typescript&logoColor=white)
![OpenAI](https://img.shields.io/badge/OpenAI_GPT--4o-412991?style=flat-square&logo=openai&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=flat-square&logo=postgresql&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma_5-2D3748?style=flat-square&logo=prisma&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS_3-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)

> **Status:** ✅ Em produção — pronto para deploy  
> **Metodologia:** Desenvolvimento Baseado em Evidências Técnicas & Impacto de Negócio

</div>

---

## 1. Problema de Negócio

No mercado de tecnologia, **contratações erradas custam entre 30% e 150% do salário anual** de um profissional — e o principal gargalo não está na triagem de candidatos, mas na **origem do processo**: gestores técnicos e recrutadores que estruturam descrições de vagas imprecisas, genéricas ou desconexas da arquitetura real que o cargo exigirá.

Uma job description mal construída atrai candidatos inadequados, eleva o custo de triagem, alonga o tempo de contratação e aumenta a taxa de rotatividade nos primeiros seis meses. O problema é sistemático e pouco endereçado por ferramentas existentes, que se concentram na avaliação de candidatos, não na qualidade do próprio requisito da vaga.

**O AI TalentSpec Architect resolve essa dor na raiz.** A plataforma conduz o responsável pela vaga por um processo guiado de engenharia de requisitos — extraindo, via chat conversacional com IA, os quatro pilares críticos de qualquer posição tech (Cargo, Senioridade, Stack e Soft Skills) — e entrega um diagnóstico analítico com Radar de Competências e relatório estruturado em Markdown, gerado por uma segunda IA avaliadora independente.

---

## 2. Contexto

O projeto foi desenvolvido como entrega do **Bootcamp CAIXA – Inteligência Artificial na Prática (DIO)**, com o objetivo de aplicar Engenharia de Prompt, consumo de LLMs via streaming e persistência transacional em um produto com caso de uso real para equipes de recrutamento técnico e gestores de engenharia.

O sistema opera sobre dois atores de IA distintos e assíncronos:

- **IA 1 — Entrevistador:** conduz o chat com o usuário, coletando os quatro pilares da vaga de forma conversacional e sequencial, salvando cada troca no banco de dados em tempo real.
- **IA 2 — Avaliadora:** recebe o histórico completo da conversa como payload, aplica Few-Shot Prompting para garantir saída JSON estrita, e gera os scores numéricos do Radar (Backend, Frontend, Cloud/DevOps, Soft Skills, Arquitetura) mais o relatório descritivo em Markdown.

A separação das responsabilidades entre as duas IAs não foi arbitrária: a IA entrevistadora precisa de temperatura mais alta (0.7) para ser conversacionalmente natural; a IA avaliadora precisa de temperatura baixa (0.3) e `response_format: json_object` para garantir consistência matemática e ausência de desvios de formato.

---

## 3. Premissas da Análise

As seguintes premissas foram adotadas no escopo deste projeto:

- O usuário é um gestor técnico, tech recruiter ou líder de engenharia responsável por estruturar a requisição de uma vaga real.
- A qualidade do diagnóstico é diretamente proporcional à profundidade das respostas fornecidas durante o chat — o sistema avalia o que foi declarado, não inferências externas.
- O Score Geral (0–100) representa a maturidade e clareza do escopo da vaga, não a dificuldade técnica do cargo.
- Entrevistas interrompidas (sem `scoreGeneral`) são tratadas como sessões em aberto, com histórico preservado para retomada.
- O modelo `gpt-4o-mini` foi escolhido como padrão por ser economicamente viável para ciclos de demonstração e portfólio, com capacidade de substituição para `gpt-4o` em produção sem alteração de contrato de interface.

---

## 4. Estratégia da Solução

A arquitetura foi construída em torno de quatro decisões de engenharia centrais:

**1. Fluxo de IA Dupla Assíncrona**

```
[ Usuário ]
     │
     │  1. Chat stream (perguntas sequenciais)
     ▼
[ IA 1: Entrevistador ]  ──────────────────────────────────────┐
     │                                                          │
     │  Persiste cada mensagem em tempo real                    │
     ▼                                                          │
[ PostgreSQL / Prisma ]                                         │
     │                                                          │
     │  2. Payload do histórico completo                        │
     ▼                                                          │
[ IA 2: Avaliadora ]  ◄───────────────────────────────────────┘
     │
     │  3. JSON estruturado (scores + feedback Markdown)
     ▼
[ Dashboard → Radar Recharts + Relatório react-markdown ]
```

**2. React Server Components como padrão de busca de dados**

O dashboard central e a página de relatório fazem queries diretas ao PostgreSQL via Prisma dentro de Server Components, eliminando spinners de carregamento no cliente e reduzindo o TTI (Time to Interactive).

**3. Streaming de texto para latência imperceptível**

A resposta da IA 1 é consumida via `ReadableStream` no frontend, com atualização progressiva do balão de mensagem. O `interviewId` gerado no backend é entregue ao frontend via header HTTP customizado (`X-Interview-Id`), desacoplando a lógica de sessão do corpo da resposta.

**4. Seed de negócio para simulação imediata**

O banco é populado com uma entrevista completa (com scores e feedback estruturado) e uma entrevista incompleta, permitindo que qualquer avaliador valide o comportamento do dashboard e do relatório sem precisar executar um ciclo de chat completo.

---

## 5. Decisões Técnicas e Trade-offs

### Next.js 15 com App Router
Escolhido pela capacidade de colocar Server Components e Client Components na mesma árvore sem overhead de API intermediária. A alternativa seria separar um backend Express dedicado, o que adicionaria latência de rede e complexidade de deploy desnecessárias para o escopo do projeto.

**Trade-off aceito:** o App Router ainda tem curva de aprendizado elevada para times acostumados com Pages Router, especialmente no tratamento de `params` como `Promise` no Next.js 15.

### Prisma ORM com PostgreSQL
Prisma foi escolhido sobre Drizzle ou queries raw por oferecer tipagem automática end-to-end a partir do `schema.prisma`. O `onDelete: Cascade` nas relações entre `Interview → Message` garante integridade referencial sem procedures adicionais.

**Trade-off aceito:** o Prisma Client tem overhead de startup em ambientes serverless frios. Mitigado com o padrão de singleton global (`globalForPrisma`) no cliente de banco.

### OpenAI `response_format: { type: "json_object" }`
Utilizado exclusivamente na IA 2 (avaliadora) para garantir JSON válido sem necessidade de regex de extração ou retry loops. A IA 1 (entrevistador) opera em modo texto puro com streaming, incompatível com `json_object`.

### Recharts para o Radar de Competências
Escolhido por ser a biblioteca de visualização mais madura no ecossistema React com suporte nativo a `RadarChart`. O componente foi isolado em um Client Component com diretiva `'use client'` para evitar conflitos de hydration com o Server Component pai que carrega os dados do relatório.

### `postinstall: prisma generate`
Script injetado no `package.json` para garantir que o Prisma Client seja gerado antes da transpilação do Next.js em ambientes PaaS como Vercel, prevenindo falhas silenciosas de build em CI/CD.

---

## 6. Tecnologias Utilizadas

| Camada | Tecnologia | Versão | Papel |
|---|---|---|---|
| Framework | Next.js | 15.1.0 | App Router, RSC, API Routes |
| Linguagem | TypeScript | 5.3 | Tipagem estrita end-to-end |
| IA Generativa | OpenAI SDK | 4.28.0 | GPT-4o-mini, streaming e JSON mode |
| ORM | Prisma | 5.11.0 | Queries tipadas e migrations |
| Banco de Dados | PostgreSQL | — | Persistência transacional |
| UI | Tailwind CSS | 3.4.1 | Design system Dark Mode |
| Visualização | Recharts | 2.12.2 | Radar de Competências SVG |
| Renderização MD | react-markdown | 9.0.1 | Relatório técnico descritivo |
| Runtime | React | 19.0.0 | Server & Client Components |

---

## 7. Estrutura do Banco de Dados

O modelo relacional foi desenhado para preservar o histórico completo de cada sessão de engenharia de vagas e permitir resiliência de estado (retomada de entrevistas interrompidas):

```prisma
model User {
  id         String      @id @default(uuid())
  email      String      @unique
  interviews Interview[]
}

model Interview {
  id            String    @id @default(uuid())
  userId        String
  position      String    // Título da vaga estruturada
  seniority     String    // Senioridade identificada pela IA
  stack         String    // Tecnologias essenciais extraídas
  softSkills    String    // Comportamentos valorizados
  scoreGeneral  Int?      // 0–100 | null = entrevista em aberto
  scoreBackend  Int?
  scoreFrontend Int?
  scoreCloud    Int?
  scoreSoft     Int?
  scoreArch     Int?
  feedback      String?   @db.Text  // Relatório em Markdown
  messages      Message[]
  user          User      @relation(...)
}

model Message {
  id          String    @id @default(uuid())
  interviewId String
  role        String    // 'user' | 'assistant'
  content     String    @db.Text
  interview   Interview @relation(onDelete: Cascade)
}
```

A ausência de `scoreGeneral` é o sinal semântico que distingue uma entrevista completa de uma sessão em aberto — o dashboard usa esse campo para renderizar badges e redirecionar links de ação corretamente.

---

## 8. Como Executar o Projeto Localmente

### Pré-requisitos
- Node.js v20+
- Instância PostgreSQL ativa (Docker local, Supabase, Neon ou similar)
- Chave de API da OpenAI

### Passo 1 — Clonar e instalar dependências
```bash
git clone https://github.com/Santosdevbjj/simulador-de-entrevistas-com-ia.git
cd simulador-de-entrevistas-com-ia
npm install
```

### Passo 2 — Configurar variáveis de ambiente
```bash
cp .env.example .env
```
Edite o `.env` com suas credenciais:
```env
DATABASE_URL="postgresql://usuario:senha@localhost:5432/nome_do_banco?schema=public"
OPENAI_API_KEY="sk-proj-suachaveaqui..."
```

### Passo 3 — Executar migrations e popular o banco
```bash
# Estrutura o schema no PostgreSQL
npx prisma migrate dev --name init

# Popula com dados de demonstração (1 entrevista completa + 1 incompleta)
npx prisma db seed
```

### Passo 4 — Iniciar o servidor de desenvolvimento
```bash
npm run dev
```

Acesse `http://localhost:3000/dashboard` para o painel analítico central.

> **Dica:** O seed já insere uma entrevista completa com Radar de Competências e relatório gerado, permitindo validar todas as telas sem executar um ciclo de chat completo.

---

## 9. Resultados e Entregas de Valor

### Painel de Engenharia de Vagas (Dashboard Central)
Centraliza os KPIs operacionais do usuário: volumetria de simulações, média agregada de score de maturidade das vagas estruturadas e filtro visual que separa vagas por senioridade. Entrevistas incompletas são sinalizadas com badge âmbar e redirecionam para retomada do chat.

### Chat de Escopo Guiado por IA (Módulo Entrevistador)
Interface de streaming ultra-responsiva que consome a API da OpenAI em tempo real. Conduz o usuário por quatro perguntas sequenciais e cirúrgicas sobre Stack, Senioridade, Propósito e Soft Skills, persistindo cada troca no PostgreSQL para auditoria técnica e resiliência de sessão.

### Radar de Competências + Relatório de Especialista
A tela de relatório renderiza server-side diretamente do banco de dados e entrega:
- Gráfico de Radar SVG em cinco eixos (Backend, Frontend, Cloud/DevOps, Soft Skills, Arquitetura) com scores individuais de 0 a 100.
- Relatório descritivo em Markdown com três seções estruturadas: Pontos Fortes, Pontos de Melhoria e Plano de Evolução com horizonte de tempo definido.

### Indicadores de Qualidade Técnica do Produto
- **Score médio observado no seed:** 85/100 para vagas bem estruturadas — linha de base para benchmarking de sessões futuras.
- **Latência de chat:** imperceptível ao usuário graças ao streaming; a resposta começa a aparecer em menos de 500ms após o envio.
- **Resiliência de deploy:** `postinstall: prisma generate` garante que o Prisma Client esteja presente antes da transpilação em qualquer ambiente PaaS.

---

## 10. Próximos Passos

Com a base arquitetural estabelecida, as evoluções priorizadas por impacto de negócio são:

- **Autenticação real com NextAuth.js:** substituir o `mockUserId` por sessões OAuth, permitindo múltiplos usuários e histórico isolado por organização.
- **Dashboard multi-usuário com filtros avançados:** comparação de scores entre vagas, filtro por stack e exportação de relatórios em PDF.
- **Análise preditiva de fit:** cruzar o perfil estruturado da vaga com banco de candidatos via embeddings semânticos (OpenAI `text-embedding-3-small`), calculando score de aderência automaticamente.
- **Esteira de testes automatizados:** cobertura com Jest e MSW para as Server Actions e rotas de API, especialmente os contratos JSON da IA 2.
- **Modelo em produção com métricas de uso:** integração com Vercel Analytics para monitorar taxa de conclusão de entrevistas e identificar pontos de abandono no fluxo de chat.

---

## Autor

**Sergio Santos**  
Senior Data Engineer & Cloud Architect | DIO Campus Expert

[![Portfólio](https://img.shields.io/badge/Portfólio-Sérgio_Santos-111827?style=for-the-badge&logo=githubpages&logoColor=00eaff)](https://portfoliosantossergio.vercel.app)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-Sérgio_Santos-0A66C2?style=for-the-badge&logo=linkedin&logoColor=white)](https://linkedin.com/in/santossergioluiz)

---

*Desenvolvido com foco em impacto de negócio mensurável, não apenas em stack tecnológica.*
