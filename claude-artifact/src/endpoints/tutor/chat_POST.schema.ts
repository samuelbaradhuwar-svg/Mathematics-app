import { z } from "zod";
import superjson from "superjson";
import type { Visual } from "../../helpers/curriculumTypes";

export const schema = z.object({
  threadId: z.number().int().optional(),
  message: z.string().trim().min(1, "Type a message first").max(2000),
  mode: z.enum(["chat", "hint", "explain-differently"]).default("chat"),
  context: z
    .object({
      subtopicId: z.string().max(60).optional(),
      question: z.string().max(1500).optional(),
      studentAnswer: z.string().max(500).optional(),
      hintsShown: z.array(z.string().max(800)).max(6).optional(),
    })
    .optional(),
});
export type InputType = z.input<typeof schema>;

export type TutorMessageDto = {
  id: number;
  role: "user" | "assistant";
  content: string;
  visual: Visual | null;
  createdAt: Date;
};

export type OutputType = {
  threadId: number;
  title: string;
  message: TutorMessageDto;
};

export const postTutorChat = async (body: InputType, init?: RequestInit): Promise<OutputType> => {
  const validated = schema.parse(body);
  const result = await fetch(`/_api/tutor/chat`, {
    method: "POST",
    body: superjson.stringify(validated),
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
  });
  if (!result.ok) throw new Error(superjson.parse<{ error: string }>(await result.text()).error);
  return superjson.parse<OutputType>(await result.text());
};