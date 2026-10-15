// Server-only: one place that talks to the AI model through Floot AI.
import { flootAi } from "@floot/ai";
import { HttpError } from "./serverAuth";

export type ImageBlock = { type: "image"; source: { type: "base64"; media_type: "image/jpeg" | "image/png" | "image/webp" | "image/gif"; data: string } };
export type TextBlock = { type: "text"; text: string };
export type ChatMessage = { role: "user" | "assistant"; content: string | (TextBlock | ImageBlock)[] };

export interface AskJsonOptions {
  system: string;
  messages: ChatMessage[];
  schema: Record<string, unknown>;
  effort?: "low" | "medium" | "high";
  maxTokens?: number;
}

// Calls the model and returns the parsed JSON. Throws HttpError for refusals / bad output.
export async function askJson<T>(opts: AskJsonOptions): Promise<T> {
  const r = await flootAi.chat({
    model: "claude-sonnet-latest",
    max_tokens: opts.maxTokens ?? 3000,
    system: opts.system,
    messages: opts.messages as never,
    output_config: { effort: opts.effort ?? "medium", format: { type: "json_schema", schema: opts.schema } } as never,
  } as never);
  const res = r as unknown as { stop_reason?: string; content: { type: string; text?: string }[] };
  if (res.stop_reason === "refusal") {
    throw new HttpError(422, "I can't help with that one. Let's try a different maths question.", "REFUSED");
  }
  const text = res.content.flatMap((b) => (b.type === "text" && b.text ? [b.text] : [])).join("");
  try {
    return JSON.parse(text) as T;
  } catch {
    console.error("AI returned non-JSON:", text.slice(0, 400), "stop_reason:", res.stop_reason);
    throw new HttpError(502, "The tutor got muddled for a moment. Please try again.", "AI_BAD_OUTPUT");
  }
}