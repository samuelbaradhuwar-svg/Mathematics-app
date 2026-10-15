import superjson from "superjson";
import type { BaselineState } from "../../helpers/baselineServer";

export type OutputType = { state: BaselineState };

export const getBaselineState = async (init?: RequestInit): Promise<OutputType> => {
  const result = await fetch(`/_api/baseline/state`, {
    method: "GET",
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
  });
  if (!result.ok) throw new Error(superjson.parse<{ error: string }>(await result.text()).error);
  return superjson.parse<OutputType>(await result.text());
};