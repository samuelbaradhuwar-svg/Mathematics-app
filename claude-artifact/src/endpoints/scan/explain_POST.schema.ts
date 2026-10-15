import { z } from "zod";
import superjson from "superjson";
import type { ScanExplanationDto } from "../../helpers/scanTypes";

export const schema = z.object({
  scanId: z.number().int().positive(),
  confirmedText: z.string().trim().min(2, "Please check the question text first").max(1800),
  diagramNote: z.string().max(800).optional(),
  handwrittenWork: z.string().max(800).optional(),
});
export type InputType = z.infer<typeof schema>;
export type OutputType = { explanation: ScanExplanationDto };

export const postScanExplain = async (body: InputType, init?: RequestInit): Promise<OutputType> => {
  const result = await fetch(`/_api/scan/explain`, {
    method: "POST",
    body: superjson.stringify(schema.parse(body)),
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
  });
  if (!result.ok) throw new Error(superjson.parse<{ error: string }>(await result.text()).error);
  return superjson.parse<OutputType>(await result.text());
};