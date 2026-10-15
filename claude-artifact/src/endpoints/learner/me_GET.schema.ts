import superjson from "superjson";
import type { LearnerDto } from "./setup_POST.schema";

export type OutputType = { learner: LearnerDto | null };

export const getLearnerMe = async (init?: RequestInit): Promise<OutputType> => {
  const result = await fetch(`/_api/learner/me`, {
    method: "GET",
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
  });
  if (!result.ok) {
    const errorObject = superjson.parse<{ error: string }>(await result.text());
    throw new Error(errorObject.error);
  }
  return superjson.parse<OutputType>(await result.text());
};