import { z } from "zod";
import superjson from "superjson";

export const schema = z.object({
  scanId: z.number().int().positive(),
  givenAnswer: z.string().max(500),
  hintsUsed: z.number().int().min(0).max(5),
  tries: z.number().int().min(1).max(50),
  revealed: z.boolean(),
});
export type InputType = z.infer<typeof schema>;

export type OutputType = {
  status: "correct" | "almost" | "incorrect" | "unreadable" | "empty" | "revealed";
  note?: string;
  solution?: { steps: { title: string; say: string; math: string; why?: string }[]; answerText: string };
  outcome?: "clean" | "assisted" | "incorrect";
};

export const postScanPractice = async (body: InputType, init?: RequestInit): Promise<OutputType> => {
  const result = await fetch(`/_api/scan/practice`, {
    method: "POST",
    body: superjson.stringify(schema.parse(body)),
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
  });
  if (!result.ok) throw new Error(superjson.parse<{ error: string }>(await result.text()).error);
  return superjson.parse<OutputType>(await result.text());
};