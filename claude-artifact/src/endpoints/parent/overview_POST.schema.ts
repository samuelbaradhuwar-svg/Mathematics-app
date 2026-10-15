import { z } from "zod";
import superjson from "superjson";
import type { ProgressPayload } from "../../helpers/loadProgress";

export const schema = z.object({ pin: z.string().regex(/^\d{4,6}$/, "The PIN is 4 to 6 digits") });
export type InputType = z.infer<typeof schema>;

export type PracticeTogether = {
  subtopicId: string;
  name: string;
  topicName: string;
  why: string;
  tip: string;
};

export type ParentMistake = { tag: string; text: string; count: number; subtopicName: string };

export type OutputType = {
  learnerName: string;
  payload: ProgressPayload;
  practiceTogether: PracticeTogether[];
  mistakes: ParentMistake[];
  thresholds: { windowSize: number; requiredClean: number; understoodDays: number };
};

export const postParentOverview = async (body: InputType, init?: RequestInit): Promise<OutputType> => {
  const result = await fetch(`/_api/parent/overview`, {
    method: "POST",
    body: superjson.stringify(schema.parse(body)),
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
  });
  if (!result.ok) throw new Error(superjson.parse<{ error: string }>(await result.text()).error);
  return superjson.parse<OutputType>(await result.text());
};