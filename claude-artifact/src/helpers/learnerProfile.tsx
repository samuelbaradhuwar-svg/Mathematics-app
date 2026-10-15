// Server-only: a short plain-text summary of what the tutor "remembers" about the learner.
import { curriculumRegistry } from "./curriculumRegistry";
import type { ProgressPayload } from "./loadProgress";

const mistakeText = (grade: number, tag: string): string | null => {
  for (const r of curriculumRegistry.allSubtopics(grade)) {
    const m = r.subtopic.mistakes.find((x) => x.tag === tag);
    if (m) return `${m.mistake} (in "${r.subtopic.name}")`;
  }
  return null;
};

export const describeMistake = (grade: number, tag: string): string => mistakeText(grade, tag) ?? tag.replace(/[._]/g, " ");

export function buildLearnerProfile(grade: number, payload: ProgressPayload): string {
  const s = payload.summary;
  const name = (id: string) => curriculumRegistry.subtopic(grade, id)?.subtopic.name ?? id;
  const lines: string[] = [];
  const needsHelp = Object.values(s.subtopics).filter((p) => p.status === "needs-help").map((p) => name(p.subtopicId));
  const understood = Object.values(s.subtopics).filter((p) => p.status === "understood").map((p) => name(p.subtopicId));
  const practising = Object.values(s.subtopics).filter((p) => p.status === "practising" && p.attempts > 0).map((p) => name(p.subtopicId));
  if (needsHelp.length) lines.push(`Struggles with: ${needsHelp.slice(0, 6).join("; ")}.`);
  if (practising.length) lines.push(`Currently practising: ${practising.slice(0, 6).join("; ")}.`);
  if (understood.length) lines.push(`Understands well: ${understood.slice(0, 6).join("; ")}.`);
  if (s.stats.recurringMistakes.length) {
    lines.push(`Recurring mistakes: ${s.stats.recurringMistakes.slice(0, 4).map((m) => `${describeMistake(grade, m.tag)} (${m.count} times)`).join("; ")}.`);
  }
  if (payload.plan) {
    if (payload.plan.foundationGaps.length) lines.push(`The baseline check suggests shaky foundations in: ${payload.plan.foundationGaps.join(", ")}.`);
    if (payload.plan.needsWork.length) lines.push(`Baseline weak areas: ${payload.plan.needsWork.slice(0, 6).join("; ")}.`);
  }
  if (!lines.length) lines.push("This is a new learner: no history yet. Start gently and check what he already knows.");
  return lines.join("\n");
}

export function subtopicFocus(grade: number, subtopicId: string | undefined): string {
  if (!subtopicId) return "";
  const ref = curriculumRegistry.subtopic(grade, subtopicId);
  if (!ref) return "";
  const s = ref.subtopic;
  return [
    `Topic: ${ref.topic.name} - ${s.name}`,
    `Key rules: ${s.rules.slice(0, 4).join(" | ")}`,
    `Common mistakes: ${s.mistakes.map((m) => m.mistake).join(" | ")}`,
  ].join("\n");
}