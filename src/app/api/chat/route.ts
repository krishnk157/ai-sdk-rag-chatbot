import {
  convertToModelMessages,
  createUIMessageStreamResponse,
  streamText,
  toUIMessageStream,
  UIMessage,
} from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import { auth } from "@clerk/nextjs/server";

export async function POST(req: Request) {
  try {
    await auth.protect();
    const { messages }: { messages: UIMessage[] } = await req.json();
    const result = streamText({
      model: anthropic("claude-haiku-4-5"),
      messages: await convertToModelMessages(messages),
    });
    return createUIMessageStreamResponse({
      stream: toUIMessageStream({ stream: result.stream }),
    });
  } catch (error) {
    console.error("Error streaming chat completion: ", error);
    return new Response("Failed to stream chat completion", { status: 500 });
  }
}
