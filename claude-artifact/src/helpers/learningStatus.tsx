import type { LearningStatus } from "./curriculumTypes";

export const STATUS_META: Record<
  LearningStatus,
  { label: string; friendly: string; color: string; soft: string; icon: "check" | "pencil" | "help" | "circle" }
> = {
  understood: { label: "UNDERSTOOD", friendly: "I've got this", color: "var(--status-understood)", soft: "var(--status-understood-soft)", icon: "check" },
  practising: { label: "PRACTISING", friendly: "Getting there", color: "var(--status-practising)", soft: "var(--status-practising-soft)", icon: "pencil" },
  "needs-help": { label: "NEEDS MORE HELP", friendly: "Let's go slowly", color: "var(--status-help)", soft: "var(--status-help-soft)", icon: "help" },
  "not-started": { label: "NOT STARTED", friendly: "Not started yet", color: "var(--status-new)", soft: "var(--status-new-soft)", icon: "circle" },
};

export const STATUS_ORDER: LearningStatus[] = ["understood", "practising", "needs-help", "not-started"];