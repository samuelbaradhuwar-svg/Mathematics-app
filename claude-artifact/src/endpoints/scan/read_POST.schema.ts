import { z } from "zod";
import superjson from "superjson";
import type { ScanReading } from "../../helpers/scanTypes";

export const schema = z.object({
  imageBase64: z.string().min(100).max(6_500_000),
  mediaType: z.enum(["image/jpeg", "image/png", "image/webp", "image/gif"]),
  note: z.string().max(300).optional(),
});
export type InputType = z.infer<typeof schema>;
export type OutputType = { scanId: number; reading: ScanReading };

export const postScanRead = async (body: InputType, init?: RequestInit): Promise<OutputType> => {
  const result = await fetch(`/_api/scan/read`, {
    method: "POST",
    body: superjson.stringify(schema.parse(body)),
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
  });
  if (!result.ok) throw new Error(superjson.parse<{ error: string }>(await result.text()).error);
  return superjson.parse<OutputType>(await result.text());
};