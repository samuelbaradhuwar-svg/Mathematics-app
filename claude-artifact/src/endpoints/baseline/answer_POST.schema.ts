import { z } from "zod";
import superjson from "superjson";
import type { BaselineState } from "../../helpers/baselineServer";

export const schema = z.object({
  questionId: z.string().min(3).max(200),
  // null means "I'm not sure yet": that is a perfectly good answer in the baseline.
  answer: z.string().max(500).nullable(),
});
export type InputType = z.infer<typeof schema>;
export type OutputType = { state: BaselineState };

export const postBaselineAnswer = async (body: InputType, init?: RequestInit): Promise<OutputType> => {
  const result = await fetch(`/_api/baseline/answer`, {
    method: "POST",
    body: superjson.stringify(schema.parse(body)),
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
  });
  if (!result.ok) throw new Error(superjson.parse<{ error: string }>(await result.text()).error);
  return superjson.parse<OutputType>(await result.text());
};