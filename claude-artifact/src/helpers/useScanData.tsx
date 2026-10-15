import { useMutation } from "@tanstack/react-query";
import { postScanRead } from "../endpoints/scan/read_POST.schema";
import { postScanExplain } from "../endpoints/scan/explain_POST.schema";
import { postScanPractice } from "../endpoints/scan/practice_POST.schema";

export const useScanRead = () => useMutation({ mutationFn: postScanRead });
export const useScanExplain = () => useMutation({ mutationFn: postScanExplain });
export const useScanPractice = () => useMutation({ mutationFn: postScanPractice });
