import { z } from "zod";
import superjson from "superjson";
import type { Level } from "../../helpers/curriculumTypes";
import type { SubtopicProgress } from "../../helpers/mastery";

export const schema = z.object({
  questionId: z.string().min(3).max(200),
  // The last answer typed. The server re-checks it: the browser can't claim "correct".
  givenAnswer: z.string().max(500),
  // The first wrong answer (if any), used to spot recurring mistakes.
  firstWrongAnswer: z.string().max(500).optional(),
  hintsUsed: z.number().int().min(0).max(5),
  tries: z.number().int().min(1).max(50),
  // true if the learner asked to see the worked solution before answering correctly
  revealed: z.boolean(),
  source: z.enum(["practice", "lesson"]).default("practice"),
});
export type InputType = z.infer<typeof schema>;

export type PracticeEvent =
  | { type: "level-mastered"; level: Level }
  | { type: "understood" }
  | { type: "needs-help" }
  | { type: "stepped-back"; to: Level };

export type OutputType = {
  outcome: "clean" | "assisted" | "incorrect";
  subtopic: SubtopicProgress | null; // null for foundation warm-ups
  events: PracticeEvent[];
  duplicate: boolean;
};

export const postPracticeRecord = async (body: z.input<typeof schema>, init?: RequestInit): Promise<OutputType> => {
  const validated = schema.parse(body);
  const result = await fetch(`/_api/practice/record`, {
    method: "POST",
    body: superjson.stringify(validated),
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
  });
  if (!result.ok) throw new Error(superjson.parse<{ error: string }>(await result.text()).error);
  return superjson.parse<OutputType>(await result.text());
};