import superjson from "superjson";
import type { TutorMessageDto } from "./chat_POST.schema";

export type OutputType = {
  threads: { id: number; title: string; updatedAt: Date }[];
  threadId: number | null;
  messages: TutorMessageDto[];
};

// threadId omitted -> the most recent chat
export const getTutorHistory = async (params: { threadId?: number } = {}, init?: RequestInit): Promise<OutputType> => {
  const q = params.threadId ? `?threadId=${params.threadId}` : "";
  const result = await fetch(`/_api/tutor/history${q}`, {
    method: "GET",
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
  });
  if (!result.ok) throw new Error(superjson.parse<{ error: string }>(await result.text()).error);
  return superjson.parse<OutputType>(await result.text());
};