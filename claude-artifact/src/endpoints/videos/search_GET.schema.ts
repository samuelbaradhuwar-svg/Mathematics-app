import superjson from "superjson";
import type { VideoSearchResult } from "../../helpers/videoTypes";

export type OutputType = VideoSearchResult;

// Either a subtopicId/topicId (curriculum-based) or a free search text.
export const getVideoSearch = async (params: { subtopicId?: string; topicId?: string; q?: string }, init?: RequestInit): Promise<OutputType> => {
  const sp = new URLSearchParams();
  if (params.subtopicId) sp.set("subtopicId", params.subtopicId);
  if (params.topicId) sp.set("topicId", params.topicId);
  if (params.q) sp.set("q", params.q);
  const result = await fetch(`/_api/videos/search?${sp.toString()}`, {
    method: "GET",
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
  });
  if (!result.ok) throw new Error(superjson.parse<{ error: string }>(await result.text()).error);
  return superjson.parse<OutputType>(await result.text());
};