// The adaptive baseline assessment.
//  Round 1: one friendly entry question in each of 14 areas.
//  Round 2: if the entry question was right, one "stretch" question (a step harder);
//           if it was wrong or "not sure", one foundation question (an earlier-grade skill)
//           to find out where the gap really starts.
//  Learners can take breaks at any time: state is saved after every answer.
import type { Level } from "./curriculumTypes";
import { curriculumRegistry } from "./curriculumRegistry";

export interface ProbeDef {
  id: string;
  generator: string;
  level: Level;
}

export interface AreaDef {
  id: string;
  label: string;
  entry: ProbeDef;
  stretch?: ProbeDef;
  foundation?: ProbeDef;
  // Grade 8 subtopics this area covers (used to build the plan)
  subtopics: string[];
}

const p = (generator: string, level: Level): ProbeDef => ({ id: `${generator}:${level}`, generator, level });

export const BASELINE_AREAS: AreaDef[] = [
  { id: "number-ops", label: "Calculating with whole numbers", entry: p("wn-calc", "beginner"), stretch: p("wn-calc", "intermediate"), foundation: p("fnd-times", "beginner"), subtopics: ["wn-properties", "wn-calc"] },
  { id: "fractions", label: "Fractions", entry: p("frac-equiv", "beginner"), stretch: p("frac-addsub", "intermediate"), foundation: p("fnd-fraction-shape", "beginner"), subtopics: ["frac-equiv", "frac-addsub", "frac-muldiv", "frac-forms"] },
  { id: "decimals", label: "Decimals", entry: p("dec-place", "beginner"), stretch: p("dec-addsub", "intermediate"), foundation: p("fnd-tenths", "beginner"), subtopics: ["dec-place", "dec-addsub", "dec-muldiv"] },
  { id: "integers", label: "Negative numbers", entry: p("int-order", "beginner"), stretch: p("int-addsub", "beginner"), foundation: p("fnd-negative", "beginner"), subtopics: ["int-order", "int-addsub", "int-muldiv"] },
  { id: "factors", label: "Factors and multiples", entry: p("wn-factors", "beginner"), stretch: p("wn-factors", "intermediate"), foundation: p("fnd-division", "beginner"), subtopics: ["wn-factors"] },
  { id: "percent", label: "Percentages", entry: p("pct-of", "beginner"), stretch: p("pct-of", "intermediate"), foundation: p("frac-forms", "beginner"), subtopics: ["pct-of", "pct-change", "pct-express"] },
  { id: "algebra", label: "Algebra and equations", entry: p("eq-onestep", "beginner"), stretch: p("eq-twostep", "beginner"), foundation: p("func-tables", "beginner"), subtopics: ["alg-language", "alg-like", "alg-sub", "alg-expand", "eq-onestep", "eq-twostep", "eq-words"] },
  { id: "patterns", label: "Number patterns", entry: p("pat-sequences", "beginner"), stretch: p("pat-rules", "intermediate"), subtopics: ["pat-sequences", "pat-rules", "func-tables", "func-formula"] },
  { id: "ratio", label: "Ratio and rate", entry: p("ratio-simplify", "beginner"), stretch: p("ratio-share", "beginner"), foundation: p("frac-equiv", "beginner"), subtopics: ["ratio-simplify", "ratio-share", "rate-prop"] },
  { id: "exponents", label: "Powers and roots", entry: p("exp-meaning", "beginner"), stretch: p("exp-roots", "beginner"), foundation: p("fnd-times", "beginner"), subtopics: ["exp-meaning", "exp-roots", "exp-laws"] },
  { id: "geometry", label: "Angles and shapes", entry: p("gsl-lines", "beginner"), stretch: p("g2d-triangles", "intermediate"), foundation: p("gsl-angles", "beginner"), subtopics: ["gsl-angles", "gsl-lines", "gsl-parallel", "g2d-triangles", "g2d-quads", "g2d-congruent", "g2d-construct", "g3d-names", "g3d-nets", "gr-plane", "gr-linear", "gr-interpret"] },
  { id: "area", label: "Perimeter and area", entry: p("pa-area", "beginner"), stretch: p("sv-volume", "beginner"), foundation: p("pa-perimeter", "beginner"), subtopics: ["pa-perimeter", "pa-area", "pa-circle", "sv-surface", "sv-volume", "sv-capacity", "meas-convert", "meas-time"] },
  { id: "data", label: "Data handling", entry: p("dh-average", "beginner"), stretch: p("dh-average", "intermediate"), foundation: p("dh-organise", "beginner"), subtopics: ["dh-organise", "dh-average", "dh-graphs"] },
  { id: "probability", label: "Probability", entry: p("prob-basic", "beginner"), stretch: p("prob-calc", "beginner"), subtopics: ["prob-basic", "prob-calc", "prob-freq"] },
];

export type ProbeRole = "entry" | "stretch" | "foundation";
export type ProbeResult = "correct" | "wrong" | "unsure";

export interface BaselineAnswer {
  areaId: string;
  role: ProbeRole;
  questionId: string;
  result: ProbeResult;
}

export interface NextProbe {
  area: AreaDef;
  role: ProbeRole;
  probe: ProbeDef;
  index: number; // how many answered so far
  estimatedTotal: number;
}

export const BREAK_EVERY = 6;
export const MAX_QUESTIONS = 28;

const findAnswer = (history: BaselineAnswer[], areaId: string, role: ProbeRole) =>
  history.find((h) => h.areaId === areaId && h.role === role);

export const nextProbe = (history: BaselineAnswer[]): NextProbe | null => {
  if (history.length >= MAX_QUESTIONS) return null;
  const estimatedTotal = Math.min(MAX_QUESTIONS, BASELINE_AREAS.length * 2 - BASELINE_AREAS.filter((a) => !a.stretch && !a.foundation).length);
  // Round 1: entry questions in order
  for (const area of BASELINE_AREAS) {
    if (!findAnswer(history, area.id, "entry")) {
      return { area, role: "entry", probe: area.entry, index: history.length, estimatedTotal };
    }
  }
  // Round 2: follow-ups
  for (const area of BASELINE_AREAS) {
    const entry = findAnswer(history, area.id, "entry");
    if (!entry) continue;
    if (entry.result === "correct") {
      if (area.stretch && !findAnswer(history, area.id, "stretch")) {
        return { area, role: "stretch", probe: area.stretch, index: history.length, estimatedTotal };
      }
    } else if (area.foundation && !findAnswer(history, area.id, "foundation")) {
      return { area, role: "foundation", probe: area.foundation, index: history.length, estimatedTotal };
    }
  }
  return null;
};

export type AreaResult = "strong" | "developing" | "needs-foundation";

export interface AreaOutcome {
  areaId: string;
  label: string;
  result: AreaResult;
  note: string; // friendly sentence
  foundationGap?: string; // foundation generator id
}

export interface BaselinePlan {
  outcomes: AreaOutcome[];
  strengths: string[];
  needsWork: string[];
  foundationGaps: string[]; // foundation generator ids to warm up first
  order: string[]; // recommended order of Grade 8 subtopic ids
  message: string;
}

export const buildPlan = (grade: number, history: BaselineAnswer[]): BaselinePlan => {
  const outcomes: AreaOutcome[] = [];
  for (const area of BASELINE_AREAS) {
    const entry = findAnswer(history, area.id, "entry");
    const stretch = findAnswer(history, area.id, "stretch");
    const found = findAnswer(history, area.id, "foundation");
    if (!entry) continue;
    if (entry.result === "correct" && stretch?.result === "correct") {
      outcomes.push({ areaId: area.id, label: area.label, result: "strong", note: "You answered the harder question too. Nice work!" });
    } else if (entry.result === "correct") {
      outcomes.push({ areaId: area.id, label: area.label, result: "developing", note: stretch ? "You know the basics. The next step needs more practice." : "You know the basics here." });
    } else if (found?.result === "correct") {
      outcomes.push({ areaId: area.id, label: area.label, result: "developing", note: "The basics are there. We will build on them step by step." });
    } else {
      outcomes.push({ areaId: area.id, label: area.label, result: "needs-foundation", note: area.foundation ? "Let's go back to the starting point and build this up slowly." : "We'll teach this carefully from the start.", foundationGap: area.foundation && area.foundation.generator.startsWith("fnd-") ? area.foundation.generator : undefined });
    }
  }

  const rank: Record<AreaResult, number> = { "needs-foundation": 0, developing: 1, strong: 2 };
  const sortedAreas = [...outcomes].sort((a, b) => rank[a.result] - rank[b.result]);
  const allSubs = curriculumRegistry.allSubtopics(grade).map((r) => r.subtopic.id);
  const subIndex = new Map(allSubs.map((id, i) => [id, i]));

  // Weak areas first (their subtopics in curriculum order, prerequisites first), then the rest in curriculum order.
  const order: string[] = [];
  const push = (id: string) => {
    if (order.includes(id) || !subIndex.has(id)) return;
    const ref = curriculumRegistry.subtopic(grade, id);
    ref?.subtopic.prerequisites.forEach(push);
    order.push(id);
  };
  for (const o of sortedAreas) {
    if (o.result === "strong") continue;
    const area = BASELINE_AREAS.find((a) => a.id === o.areaId)!;
    [...area.subtopics].sort((a, b) => (subIndex.get(a) ?? 0) - (subIndex.get(b) ?? 0)).forEach(push);
  }
  allSubs.forEach(push);

  const strengths = outcomes.filter((o) => o.result === "strong").map((o) => o.label);
  const needsWork = outcomes.filter((o) => o.result !== "strong").map((o) => o.label);
  const foundationGaps = Array.from(new Set(outcomes.map((o) => o.foundationGap).filter((g): g is string => !!g)));
  const message =
    strengths.length >= 8
      ? "You already know a lot! We'll move steadily through the harder parts."
      : needsWork.length >= 10
        ? "Thank you for trying every question. We will start from the basics and go slowly, one small step at a time. There is no rush."
        : "Good effort! Here is your personal plan. We will start where it will help you most.";

  return { outcomes, strengths, needsWork, foundationGaps, order, message };
};

export const baselineProgressLabel = (answered: number, total: number): string =>
  `Question ${Math.min(answered + 1, total)} of about ${total}`;