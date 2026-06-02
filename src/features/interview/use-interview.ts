import { useState, useEffect } from 'react';

export interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export function useInterview(userId: string) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [interviewId, setInterviewId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  // Inicia o chat com a saudação padrão exigida pelo escopo do projeto
  useEffect(() => {
    setMessages([
      {
        role: 'assistant',
        content: 'Olá! Vou fazer perguntas sobre a vaga que você está estruturando.\nPara começar: qual é o título da vaga e qual o propósito principal desse cargo?',
      },
    ]);
  }, []);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading || isEvaluating) return;

    const userMessageContent = input.trim();
    setInput('');
    
    // Atualiza a tela com a mensagem do usuário imediatamente
    const updatedMessages: Message[] = [
      ...messages,
      { role: 'user', content: userMessageContent },
    ];
    setMessages(updatedMessages);
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: updatedMessages,
          interviewId,
          userId,
        }),
      });

      if (!response.ok) throw new Error('Falha ao obter resposta da IA');

      // CAPTURA O ID DA ENTREVISTA ENVIADO VIA HEADER CUSTOMIZADO PELO BACKEND
      const headerInterviewId = response.headers.get('X-Interview-Id');
      if (headerInterviewId && !interviewId) {
        setInterviewId(headerInterviewId);
      }

      // Prepara o leitor de Stream (ReadableStream)
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      if (!reader) throw new Error('Stream não disponível');

      // Adiciona um balão vazio para a IA que vai ser preenchido por partes
      setMessages((prev) => [...prev, { role: 'assistant', content: '' }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        
        // Atualiza a última mensagem do array (a da IA) adicionando o novo pedaço de texto
        setMessages((prev) => {
          const newMessages = [...prev];
          const lastIndex = newMessages.length - 1;
          newMessages[lastIndex] = {
            ...newMessages[lastIndex],
            content: newMessages[lastIndex].content + chunk,
          };
          return newMessages;
        });
      }
    } catch (error) {
      console.error('Erro no streaming do chat:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Dispara a segunda IA para rodar a esteira analítica e fechar o relatório
  const triggerEvaluation = async () => {
    if (!interviewId || isEvaluating) return;

    setIsEvaluating(true);
    try {
      const response = await fetch('/api/avaliar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ interviewId }),
      });

      if (!response.ok) throw new Error('Falha na avaliação diagnóstica');

      setIsCompleted(true);
    } catch (error) {
      console.error('Erro ao avaliar entrevista:', error);
    } finally {
      setIsEvaluating(false);
    }
  };

  return {
    messages,
    input,
    setInput,
    isLoading,
    isEvaluating,
    isCompleted,
    interviewId,
    sendMessage,
    triggerEvaluation,
  };
}
