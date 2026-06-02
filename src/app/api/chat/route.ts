import { NextResponse } from 'next/server';
import { openai } from '@/services/ai/openai-client';
import { prisma } from '@/services/db/client';
import { INTERVIEWER_PROMPT } from '@/services/ai/prompts/interviewer';

export async function POST(req: Request) {
  try {
    const { messages, interviewId, userId } = await req.json();

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: 'O histórico de mensagens é obrigatório e não pode estar vazio.' },
        { status: 400 }
      );
    }

    if (!userId) {
      return NextResponse.json(
        { error: 'O identificador do usuário (userId) é obrigatório.' },
        { status: 400 }
      );
    }

    const lastUserMessage = messages[messages.length - 1];

    let currentInterviewId = interviewId;

    // 1. SE NÃO HOUVER INTERVIEW_ID, INICIA UMA NOVA SESSÃO NO BANCO
    if (!currentInterviewId) {
      const newInterview = await prisma.interview.create({
        data: {
          userId: userId,
          position: 'Aguardando definição...', // Será atualizado pela IA avaliadora depois
          seniority: 'Aguardando...',
          stack: 'Aguardando...',
          softSkills: 'Aguardando...',
        },
      });
      currentInterviewId = newInterview.id;
    }

    // 2. SALVA A MENSAGEM DO USUÁRIO NO BANCO DE DADOS
    await prisma.message.create({
      data: {
        interviewId: currentInterviewId,
        role: lastUserMessage.role,
        content: lastUserMessage.content,
      },
    });

    // Injeta as instruções mestres para a OpenAI
    const formattedMessages = [
      { role: 'system', content: INTERVIEWER_PROMPT },
      ...messages,
    ];

    // Solicita a resposta via streaming à OpenAI
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: formattedMessages as any,
      stream: true,
      temperature: 0.7,
    });

    const encoder = new TextEncoder();
    let completeAiResponse = '';

    // 3. RETORNA O STREAM COMPILANDO A RESPOSTA PARA SALVAR NO FECHAMENTO
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of response) {
            const content = chunk.choices[0]?.delta?.content || '';
            if (content) {
              completeAiResponse += content; // Vai montando a string final da IA
              controller.enqueue(encoder.encode(content));
            }
          }
          
          // ASSIM QUE O STREAM TERMINAR COM SUCESSO, GRAVA A RESPOSTA DA IA NO BANCO
          if (completeAiResponse.trim()) {
            await prisma.message.create({
              data: {
                interviewId: currentInterviewId,
                role: 'assistant',
                content: completeAiResponse,
              },
            });
          }
        } catch (streamError) {
          console.error('Erro durante o processamento do stream:', streamError);
        } finally {
          controller.close();
        }
      },
    });

    // Retorna a resposta contínua adicionando o ID da entrevista nos headers customizados 
    // para que o frontend saiba qual ID reutilizar na próxima mensagem
    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache',
        'X-Interview-Id': currentInterviewId, // Entrega o ID gerado/utilizado para o frontend
      },
    });

  } catch (error: any) {
    console.error('Erro crítico na persistência do chat:', error);
    return NextResponse.json(
      { error: 'Erro interno ao processar e salvar a conversa.' },
      { status: 500 }
    );
  }
}
