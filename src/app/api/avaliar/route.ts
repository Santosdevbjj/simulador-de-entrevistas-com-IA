import { NextResponse } from 'next/server';
import { openai } from '@/services/ai/openai-client';
import { prisma } from '@/services/db/client';
import { EVALUATOR_PROMPT } from '@/services/ai/prompts/evaluator';

export async function POST(req: Request) {
  try {
    const { interviewId } = await req.json();

    if (!interviewId) {
      return NextResponse.json(
        { error: 'O identificador da entrevista (interviewId) é obrigatório.' },
        { status: 400 }
      );
    }

    // 1. BUSCA O HISTÓRICO COMPLETO DA ENTREVISTA NO BANCO
    const interview = await prisma.interview.findUnique({
      where: { id: interviewId },
      include: { messages: { orderBy: { createdAt: 'asc' } } },
    });

    if (!interview) {
      return NextResponse.json(
        { error: 'Entrevista não encontrada no sistema.' },
        { status: 404 }
      );
    }

    // Formata o histórico de mensagens para a IA compreender o contexto
    const conversationHistory = interview.messages.map(msg => ({
      role: msg.role === 'assistant' ? 'assistant' : 'user',
      content: msg.content,
    }));

    // 2. ENVIA O HISTÓRICO PARA A SEGUNDA IA (AVALIADORA) COM RIGOR DE JSON
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini', // Veloz, preciso para JSON estructured e altamente econômico
      messages: [
        { role: 'system', content: EVALUATOR_PROMPT },
        { role: 'user', content: `Analise esta conversa completa e gere o relatório final estruturado: ${JSON.stringify(conversationHistory)}` }
      ],
      response_format: { type: "json_object" }, // Garante que a resposta venha como JSON válido
      temperature: 0.3, // Temperatura baixa para maior consistência matemática e analítica
    });

    const aiAnalysisRaw = response.choices[0]?.message?.content;

    if (!aiAnalysisRaw) {
      throw new Error('A IA não retornou uma análise válida.');
    }

    // Converte a string JSON da IA em objeto Javascript
    const analysisData = JSON.parse(aiAnalysisRaw);

    // 3. ATUALIZA A ENTREVISTA NO BANCO COM OS DADOS COLETADOS E SCORES DO RADAR
    const updatedInterview = await prisma.interview.update({
      where: { id: interviewId },
      data: {
        position: analysisData.position || interview.position,
        seniority: analysisData.seniority || interview.seniority,
        stack: analysisData.stack || interview.stack,
        softSkills: analysisData.softSkills || interview.softSkills,
        scoreGeneral: Number(analysisData.scoreGeneral) || 0,
        scoreBackend: Number(analysisData.scoreBackend) || 0,
        scoreFrontend: Number(analysisData.scoreFrontend) || 0,
        scoreCloud: Number(analysisData.scoreCloud) || 0,
        scoreSoft: Number(analysisData.scoreSoft) || 0,
        scoreArch: Number(analysisData.scoreArch) || 0,
        feedback: analysisData.feedback || 'Não foi possível gerar o feedback descritivo.',
      },
    });

    // 4. RETORNA A ANÁLISE PRONTA PARA O FRONTEND
    return NextResponse.json({
      success: true,
      message: 'Avaliação concluída com sucesso e persistida no banco de dados.',
      data: updatedInterview,
    });

  } catch (error: any) {
    console.error('Erro crítico na rota do avaliador:', error);
    return NextResponse.json(
      { error: 'Erro interno ao processar a avaliação diagnóstica da vaga.' },
      { status: 500 }
    );
  }
}
