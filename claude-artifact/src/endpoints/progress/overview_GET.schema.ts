import superjson from "superjson";
import type { ProgressPayload } from "../../helpers/loadProgress";

export type OutputType = ProgressPayload;

export const getProgressOverview = async (init?: RequestInit): Promise<OutputType> => {
  const result = await fetch(`/_api/progress/overview`, {
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