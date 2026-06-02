import { NextResponse } from 'next/server';
import { openai } from '@/services/ai/openai-client';
import { INTERVIEWER_PROMPT } from '@/services/ai/prompts/interviewer';

// Força a execução como edge/serverless runtime para suportar streaming eficiente na Vercel
export const runtime = 'edge';

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: 'O histórico de mensagens é obrigatório e deve ser um array.' },
        { status: 400 }
      );
    }

    // Injeta as instruções do especialista de IA como a diretriz mestre (system prompt)
    const formattedMessages = [
      { role: 'system', content: INTERVIEWER_PROMPT },
      ...messages,
    ];

    // Solicita a resposta à OpenAI habilitando o recurso de streaming
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini', // Modelo excelente, rápido e de custo-benefício ideal para portfólio
      messages: formattedMessages as any,
      stream: true,
      temperature: 0.7, // Balanço ideal entre consistência e naturalidade
    });

    // Converte o stream da OpenAI em um ReadableStream nativo para o Next.js responder em tempo real
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        for await (const chunk of response) {
          const content = chunk.choices[0]?.delta?.content || '';
          if (content) {
            controller.enqueue(encoder.encode(content));
          }
        }
        controller.close();
      },
    });

    // Retorna a resposta contínua com os headers apropriados para streaming
    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache',
      },
    });

  } catch (error: any) {
    console.error('Erro na rota de chat com IA:', error);
    return NextResponse.json(
      { error: 'Ocorreu um erro interno ao processar sua requisição.' },
      { status: 500 }
    );
  }
}
