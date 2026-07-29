import {
  streamText,
  UIMessage,
  convertToModelMessages,
  tool,
  InferUITools,
  UIDataTypes,
  isStepCount,
  createUIMessageStreamResponse,
  toUIMessageStream,
  stepCountIs,
} from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import { auth } from "@clerk/nextjs/server";

import { z } from "zod";
import { searchDocuments } from "@/lib/search";

const tools = {
  searchKnowledgeBase: tool({
    description: "Search the knowledge base for relevant information",
    inputSchema: z.object({
      query: z.string().describe("The search query to find relevant documents"),
    }),
    execute: async ({ query }) => {
      try {
        // Search the vector database
        const results = await searchDocuments(query, 3, 0.5);

        if (results.length === 0) {
          return "No relevant information found in the knowledge base.";
        }

        // Format results for the AI
        const formattedResults = results
          .map((r, i) => `[${i + 1}] ${r.content}`)
          .join("\n\n");

        return formattedResults;
      } catch (error) {
        console.error("Search error:", error);
        return "Error searching the knowledge base.";
      }
    },
  }),
};

export type ChatTools = InferUITools<typeof tools>;
export type ChatMessage = UIMessage<never, UIDataTypes, ChatTools>;

export async function POST(req: Request) {
  try {
    await auth.protect();
    const { messages }: { messages: ChatMessage[] } = await req.json();
    const result = streamText({
      model: anthropic("claude-haiku-4-5"),
      messages: await convertToModelMessages(messages),
      tools,
      system: `You are a conversational assistant representing Krishn's professional profile on their portfolio site. 
      Help visitors learn about their experience, skills, and projects by searching the resume.
      
      Guidelines:
      1. Search the resume for relevant information before answering
      2. Answer only what's documented—don't extrapolate or add context not in the resume
      3. Be conversational and concise (2-3 sentences typical)
      4. For work experience: mention role, company, and key highlights
      5. For skills: explain where/how they were used (projects, roles) not just list them
      6. If asked about something not in the resume, politely say "That's not something I can speak to"
      7. Gently redirect off-topic questions back to professional background
      
      You're helping visitors get to know Krishn—make it easy for them to see what you can do.`,
      stopWhen: stepCountIs(3),
    });
    return createUIMessageStreamResponse({
      stream: toUIMessageStream({ stream: result.stream }),
    });
  } catch (error) {
    console.error("Error streaming chat completion: ", error);
    return new Response("Failed to stream chat completion", { status: 500 });
  }
}
