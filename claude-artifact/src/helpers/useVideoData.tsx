import { useQuery } from "@tanstack/react-query";
import { getVideoSearch } from "../endpoints/videos/search_GET.schema";
import { useAuth } from "./useAuth";

export interface VideoParams {
  subtopicId?: string;
  topicId?: string;
  q?: string;
}

export const useVideos = (params: VideoParams, enabled = true) => {
  const { authState } = useAuth();
  return useQuery({
    queryKey: ["videos", params.subtopicId ?? "", params.topicId ?? "", params.q ?? ""],
    queryFn: () => getVideoSearch(params),
    enabled: enabled && authState.type === "authenticated" && !!(params.subtopicId || params.topicId || params.q),
    staleTime: 10 * 60_000,
    retry: 1,
  });
};
