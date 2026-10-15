import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { postTutorChat } from "../endpoints/tutor/chat_POST.schema";
import { getTutorHistory } from "../endpoints/tutor/history_GET.schema";
import { useAuth } from "./useAuth";

export const useTutorHistory = (threadId?: number) => {
  const { authState } = useAuth();
  return useQuery({
    queryKey: ["tutor", "history", threadId ?? "latest"],
    queryFn: () => getTutorHistory({ threadId }),
    enabled: authState.type === "authenticated",
    staleTime: 30_000,
  });
};

export const useTutorChat = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: postTutorChat,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["tutor"] }),
  });
};