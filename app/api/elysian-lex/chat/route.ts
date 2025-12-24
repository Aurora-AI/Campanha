// app/api/elysian-lex/chat/route.ts
import { streamText, UIMessage } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import { searchContext } from "@/lib/elysian-lex/rag";
import { SYSTEM_PROMPT } from "@/lib/elysian-lex/prompts";

// Configure OpenAI provider (or Groq via compatible endpoint)
const groq = createOpenAI({
  baseURL: 'https://api.groq.com/openai/v1',
  apiKey: process.env.GROQ_API_KEY || process.env.OPENAI_API_KEY || "", // Fallback
});

// Use 'llama-3-70b-versatile' or 'mixtral-8x7b' as requested
const model = groq('llama-3-70b-versatile');

interface ContextChunk {
  content: string;
  page: number;
  source: string;
}

export async function POST(req: Request) {
  const { messages, mode, sessionId } = await req.json();
  const lastMessage = messages[messages.length - 1];

  if (!sessionId) {
      return new Response("Session ID required", { status: 400 });
  }

  // 1. Retrieve Context
  const contextChunks = await searchContext(lastMessage.content, sessionId, 10);

  const contextText = contextChunks
    .map((c: ContextChunk) => `[Pág. ${c.page}] ${c.content}`)
    .join("\n\n---\n\n");

  // 2. Augment Prompt
  const augmentedSystemPrompt = `
${SYSTEM_PROMPT}

CONTEXTO DOS AUTOS (RECORTES RELEVANTES):
${contextText}

Se o contexto estiver vazio, avise o usuário que não encontrou informações específicas nos autos para essa consulta, mas prossiga se for uma questão puramente jurídica (marcando como tese).
`;

  // 3. Call LLM
  try {
    const result = streamText({
      model: model,
      messages: [
        { role: 'system', content: augmentedSystemPrompt },
        ...messages
      ],
      temperature: 0.3, // Low temp for factual accuracy
    });

    return (result as any).toDataStreamResponse();
  } catch (error: any) {
    console.error("LLM Error:", error);
    return new Response("Error processing request: " + error.message, { status: 500 });
  }
}
