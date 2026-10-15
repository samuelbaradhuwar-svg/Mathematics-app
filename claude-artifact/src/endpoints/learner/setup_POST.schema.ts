import { z } from "zod";
import superjson from "superjson";

export const schema = z.object({
  name: z.string().trim().min(1, "Please enter a name").max(40),
  parentPin: z.string().regex(/^\d{4,6}$/, "The parent PIN must be 4 to 6 digits"),
});

export type InputType = z.infer<typeof schema>;

export type LearnerDto = {
  id: number;
  name: string;
  grade: number;
  hasPin: boolean;
  baseline: "none" | "in_progress" | "completed";
};

export type OutputType = { learner: LearnerDto };

export const postLearnerSetup = async (body: InputType, init?: RequestInit): Promise<OutputType> => {
  const validated = schema.parse(body);
  const result = await fetch(`/_api/learner/setup`, {
    method: "POST",
    body: superjson.stringify(validated),
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
  });
  if (!result.ok) {
    const errorObject = superjson.parse<{ error: string }>(await result.text());
    throw new Error(errorObject.error);
  }
  return superjson.parse<OutputType>(await result.text());
};