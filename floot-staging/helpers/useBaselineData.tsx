import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getBaselineState } from "../endpoints/baseline/state_GET.schema";
import { postBaselineStart } from "../endpoints/baseline/start_POST.schema";
import { postBaselineAnswer } from "../endpoints/baseline/answer_POST.schema";
import { useAuth } from "./useAuth";
import { LEARNER_KEY, PROGRESS_KEY } from "./useLearnerData";

export const BASELINE_KEY = ["baseline", "state"] as const;

export const useBaselineState = () => {
  const { authState } = useAuth();
  return useQuery({
    queryKey: BASELINE_KEY,
    queryFn: getBaselineState,
    enabled: authState.type === "authenticated",
    staleTime: 0,
  });
};

export const useStartBaseline = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: postBaselineStart,
    onSuccess: (data) => {
      qc.setQueryData(BASELINE_KEY, data);
      qc.invalidateQueries({ queryKey: LEARNER_KEY });
    },
  });
};

export const useAnswerBaseline = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: postBaselineAnswer,
    onSuccess: (data) => {
      qc.setQueryData(BASELINE_KEY, data);
      if (data.state.status === "completed") {
        qc.invalidateQueries({ queryKey: LEARNER_KEY });
        qc.invalidateQueries({ queryKey: PROGRESS_KEY });
      }
    },
  });
};
