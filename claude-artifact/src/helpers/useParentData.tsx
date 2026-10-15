import { useMutation } from "@tanstack/react-query";
import { postParentOverview } from "../endpoints/parent/overview_POST.schema";
import { postParentPin } from "../endpoints/parent/pin_POST.schema";

export const useParentOverview = () => useMutation({ mutationFn: postParentOverview });
export const useChangeParentPin = () => useMutation({ mutationFn: postParentPin });
