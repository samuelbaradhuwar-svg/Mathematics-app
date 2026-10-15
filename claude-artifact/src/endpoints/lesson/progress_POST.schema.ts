import { z } from "zod";
import superjson from "superjson";

export const schema = z.object({
  subtopicId: z.string().min(2).max(60),
  stage: z.enum(["explain", "demonstrate", "together", "try", "check", "done"]),
  completed: z.boolean(),
});
export type InputType = z.infer<typeof schema>;
export type OutputType = { ok: true };

export const postLessonProgress = async (body: InputType, init?: RequestInit): Promise<OutputType> => {
  const result = await fetch(`/_api/lesson/progress`, {
    method: "POST",
    body: superjson.stringify(schema.parse(body)),
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
  });
  if (!result.ok) throw new Error(superjson.parse<{ error: string }>(await result.text()).error);
  return superjson.parse<OutputType>(await result.text());
};