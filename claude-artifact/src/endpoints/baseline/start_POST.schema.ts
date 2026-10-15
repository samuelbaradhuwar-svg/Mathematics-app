import { z } from "zod";
import superjson from "superjson";
import type { BaselineState } from "../../helpers/baselineServer";

export const schema = z.object({ restart: z.boolean().optional() });
export type InputType = z.infer<typeof schema>;
export type OutputType = { state: BaselineState };

export const postBaselineStart = async (body: InputType = {}, init?: RequestInit): Promise<OutputType> => {
  const result = await fetch(`/_api/baseline/start`, {
    method: "POST",
    body: superjson.stringify(schema.parse(body)),
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
  });
  if (!result.ok) throw new Error(superjson.parse<{ error: string }>(await result.text()).error);
  return superjson.parse<OutputType>(await result.text());
};