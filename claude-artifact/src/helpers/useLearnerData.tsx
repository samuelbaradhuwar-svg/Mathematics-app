import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getLearnerMe } from "../endpoints/learner/me_GET.schema";
import { postLearnerSetup } from "../endpoints/learner/setup_POST.schema";
import { getProgressOverview } from "../endpoints/progress/overview_GET.schema";
import { postPracticeRecord } from "../endpoints/practice/record_POST.schema";
import { postLessonProgress } from "../endpoints/lesson/progress_POST.schema";
import { useAuth } from "./useAuth";

export const LEARNER_KEY = ["learner", "me"] as const;
export const PROGRESS_KEY = ["progress", "overview"] as const;

export const useLearnerMe = () => {
  const { authState } = useAuth();
  return useQuery({
    queryKey: LEARNER_KEY,
    queryFn: getLearnerMe,
    enabled: authState.type === "authenticated",
    staleTime: 60_000,
  });
};

export const useProgress = () => {
  const { authState } = useAuth();
  return useQuery({
    queryKey: PROGRESS_KEY,
    queryFn: getProgressOverview,
    enabled: authState.type === "authenticated",
    staleTime: 10_000,
  });
};

export const useSetupLearner = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: postLearnerSetup,
    onSuccess: () => qc.invalidateQueries({ queryKey: LEARNER_KEY }),
  });
};

export const useRecordPractice = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: postPracticeRecord,
    onSuccess: () => qc.invalidateQueries({ queryKey: PROGRESS_KEY }),
  });
};

export const useLessonProgress = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: postLessonProgress,
    onSuccess: () => qc.invalidateQueries({ queryKey: PROGRESS_KEY }),
  });
};