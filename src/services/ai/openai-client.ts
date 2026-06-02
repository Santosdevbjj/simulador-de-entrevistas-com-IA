import OpenAI from 'openai';

if (!process.env.OPENAI_API_KEY) {
  throw new Error('A variável de ambiente OPENAI_API_KEY não foi configurada.');
}

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});
