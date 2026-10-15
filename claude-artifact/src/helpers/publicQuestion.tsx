// A question as the browser sees it when we must NOT reveal the answer (baseline, scan check).
import type { GeneratedQuestion } from "./curriculumTypes";
import type { GeneratedWithId } from "./questionRegistry";

export type PublicQuestion = Pick<
  GeneratedQuestion,
  "kind" | "prompt" | "visual" | "choices" | "unit" | "placeholder"
> & { id: string };

export const toPublicQuestion = (q: GeneratedWithId): PublicQuestion => ({
  id: q.id,
  kind: q.kind,
  prompt: q.prompt,
  visual: q.visual,
  choices: q.choices,
  unit: q.unit,
  placeholder: q.placeholder,
});