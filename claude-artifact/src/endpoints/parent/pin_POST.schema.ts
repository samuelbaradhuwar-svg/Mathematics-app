import { z } from "zod";
import superjson from "superjson";

export const schema = z.object({
  currentPin: z.string().regex(/^\d{4,6}$/),
  newPin: z.string().regex(/^\d{4,6}$/, "The new PIN must be 4 to 6 digits"),
});
export type InputType = z.infer<typeof schema>;
export type OutputType = { ok: true };

export const postParentPin = async (body: InputType, init?: RequestInit): Promise<OutputType> => {
  const result = await fetch(`/_api/parent/pin`, {
    method: "POST",
    body: superjson.stringify(schema.parse(body)),
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
  });
  if (!result.ok) throw new Error(superjson.parse<{ error: string }>(await result.text()).error);
  return superjson.parse<OutputType>(await result.text());
};