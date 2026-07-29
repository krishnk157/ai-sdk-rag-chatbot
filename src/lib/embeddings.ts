import { embed, embedMany } from "ai";
import { voyage } from "@ai-sdk/voyage";

export async function generateEmbedding(text: string): Promise<number[]> {
  const input = text.replaceAll("\n", " ");

  const { embedding } = await embed({
    model: voyage.embedding("voyage-3.5-lite"),
    value: input,
  });

  return embedding;
}

export async function generateEmbeddings(texts: string[]): Promise<number[][]> {
  const inputs = texts.map((text) => text.replaceAll("\n", " "));

  const { embeddings } = await embedMany({
    model: voyage.embedding("voyage-3.5-lite"),
    values: inputs,
  });

  return embeddings;
}
