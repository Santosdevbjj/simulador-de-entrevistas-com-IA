# 🤖 AI TalentSpec Architect: Engenharia de Requisitos de Vagas Tech via IA Dupla


## Bootcamp CAIXA - Inteligência Artificial na Prática.

<img width="130" height="120" alt="1000126386" src="https://github.com/user-attachments/assets/cf10de84-15d2-4c28-87d0-1533df3bbad1" />


---


> **Status do Projeto:** Em produção (Pronto para deploy)  
> **Metodologia:** Desenvolvimento Baseado em Evidências Técnicas & Impacto de Negócio

---

## 📌 Visão Geral do Produto (The Business Problem)

No mercado de tecnologia, contratações erradas (*bad hires*) custam caro. O maior gargalo não está na triagem, mas sim na **origem**: gestores técnicos e recrutadores que não sabem estruturar detalhadamente os requisitos, competências e arquiteturas que a vaga exige. 

O **AI TalentSpec Architect** resolve essa dor de negócio. Trata-se de uma aplicação full-stack que utiliza um ecossistema de **Inteligência Artificial Dupla Assíncrona** para atuar como engenheira de requisitos. O sistema extrai métricas de contratação através de um chat dinâmico e gera diagnósticos técnicos profundos estruturados em Gráficos de Radar de competências e relatórios descritivos.

---

## 🛠️ Arquitetura do Sistema e Decisões Técnicas

A engenharia deste projeto priorizou alta performance (*TTI - Time to Interactive* reduzido), blindagem de tipos com TypeScript estrito e consumo consciente de tokens de IA.


```
[ Fluxo de IA Dupla Assíncrona ]
+-----------+     1. Chat Stream     +--------------------+
|  Usuário  | ---------------------> | IA 1: Entrevistador|
+-----------+                        +--------------------+
^                                        |
|                                        | 2. Fecha Escopo (JSON)
|                                        v
| 4. Renderiza Dashboard       +--------------------+
+----------------------------- | IA 2: Avaliadora   |
(Radar Recharts + MD)       +--------------------+
|
| 3. Persistência Direta
v
[( PostgreSQL / Prisma )]
```

### 🧱 Escolha da Stack e Justificativas de Engenharia

* **Next.js 15 (App Router):** Utilizado para colher os benefícios de **React Server Components (RSC)**. Toda a listagem do dashboard central e a busca de dados do relatório são feitas *server-side* diretamente no PostgreSQL. O usuário recebe HTML estático e dados prontos, eliminando *spinners* de carregamento no lado do cliente.
* **Prisma ORM & PostgreSQL:** Garantia de consistência transacional e tipagem estrita de ponta a ponta. O modelo de dados suporta relações em cascata para mensagens e relatórios de métricas.
* **OpenAI API (GPT-4o / GPT-3.5-Turbo):** Abordagem híbrida. A IA 1 utiliza streaming para manter a latência do chat imperceptível ao usuário. A IA 2 processa o payload de forma assíncrona, injetando técnicas de *Few-Shot Prompting* para garantir saídas JSON estritas sem desvios de formato.
* **Tailwind CSS & Recharts:** Interface construída com foco em legibilidade profissional (estética Dark Mode / Slate e Emerald) e isolamento de estado do gráfico através da diretiva `'use client'`, permitindo animações fluidas nos eixos do Radar.

---

## 📊 Estrutura do Banco de Dados (Data Modeling)

O modelo relacional foi desenhado para registrar o progresso de aprendizado do usuário técnico e manter históricos imutáveis das iterações:

* **User:** Identificação única e segmentação de sessões.
* **Interview:** Centraliza os inputs colhidos (Vaga, Senioridade, Stack, Soft Skills) e armazena os Scores numéricos desmembrados de **0 a 100** para alimentação direta do gráfico de radar, além de guardar o payload do relatório técnico em formato `Text` (Markdown).
* **Message:** Log completo do chat estruturado por `role` (`user` ou `assistant`), permitindo resiliência de estado (o usuário pode continuar entrevistas interrompidas).

---

## 🚀 Como Executar o Projeto Localmente

### Pré-requisitos
* Node.js v20+ instalado.
* Instância de banco de dados PostgreSQL ativa (Local via Docker, Supabase, Neon ou similar).

### Passo 1: Clonar o Repositório e Instalar Dependências
```bash
git clone [https://github.com/seu-usuario/simulador-de-entrevistas-com-ia.git](https://github.com/seu-usuario/simulador-de-entrevistas-com-ia.git)
cd simulador-de-entrevistas-com-ia
npm install

```
### Passo 2: Configurar Variáveis de Ambiente
Crie um arquivo .env na raiz do projeto baseando-se no arquivo .env.example:
```env
DATABASE_URL="postgresql://usuario:senha@localhost:5432/nome_do_banco?schema=public"
OPENAI_API_KEY="sk-proj-suachaveaqui..."

```
### Passo 3: Executar as Migrations e Rodar o Seed de Negócios
Este projeto acompanha um script de **Seed** contendo dados históricos prontos para simular o comportamento de produção imediatamente:
```bash
# Executa as migrations do Prisma para estruturar o PostgreSQL
npx prisma migrate dev --name init

# Popula o banco com um usuário de teste e relatórios simulados
npx prisma db seed

```
### Passo 4: Iniciar o Servidor de Desenvolvimento
```bash
npm run dev

```
Abra o navegador em http://localhost:3000/dashboard para acessar o painel analítico central.
## 🎯 Entregas de Valor (Business Value Delivered)
Abaixo estão descritos os principais módulos da plataforma, construídos sob a ótica de usabilidade limpa e tomada de decisão orientada a dados:
### 1. Painel de Engenharia de Vagas (Dashboard Central)
Centraliza os indicadores-chave de performance (KPIs) do usuário. Exibe volumetria de simulações, média agregada do score de maturidade das vagas e traz um filtro visual inteligente que separa vagas por nível de senioridade, além de tratar graficamente fluxos de entrevistas que ficaram incompletas.
### 2. Chat de Escopo Guiado por IA (Módulo Entrevistador)
Uma interface ultra responsiva que consome a API da OpenAI via stream de texto. Conduz o usuário através de perguntas cirúrgicas e assíncronas sobre Stack de Tecnologia, Soft Skills e Escopo de Arquitetura, salvando cada linha do histórico para auditoria técnica.
### 3. Radar de Competências & Análise de Especialista
A tela de fechamento de relatório lê os dados tratados nativamente no servidor do Next.js e renderiza:
 * Um gráfico de Radar construído em SVG dinâmico (recharts) que aponta as fraquezas e fortalezas da descrição da vaga nos eixos Backend, Frontend, Cloud/DevOps, Soft Skills e Arquitetura.
 * Um parecer técnico detalhado formatado dinamicamente via react-markdown com sugestões de planos de desenvolvimento de equipe.
## 🛡️ Diferenciais Técnicos Prontos para Produção
 * **CI/CD Build-Safe:** O projeto possui scripts injetados no postinstall (prisma generate) que blindam deploys automáticos em ambientes PaaS como Vercel ou Netlify, garantindo que o client do banco esteja gerado antes da transpilação do Next.js.
 * **Tratamento de Hydration Erros:** O gráfico foi desacoplado de componentes do servidor evitando conflitos comuns de renderização entre o HTML gerado no server e a árvore DOM do client.
 * **Controle Estrito de Inputs:** Interfaces blindadas contra dados nulos no histórico através de fallback em tempo de execução no mapeamento de propriedades.
 * 

---

## Autor

**Sergio Santos**
Senior Data Engineer & Cloud Architect | DIO Campus Expert



[![Portfólio](https://img.shields.io/badge/Portfólio-Sérgio_Santos-111827?style=for-the-badge&logo=githubpages&logoColor=00eaff)](https://portfoliosantossergio.vercel.app)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-Sérgio_Santos-0A66C2?style=for-the-badge&logo=linkedin&logoColor=white)](https://linkedin.com/in/santossergioluiz)



---


