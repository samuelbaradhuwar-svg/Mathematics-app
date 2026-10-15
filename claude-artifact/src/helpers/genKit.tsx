// Builders used by every question generator. They keep generators short and
// make sure every question has the same shape (3 hints, worked steps, answer text).

import type {
  GeneratedQuestion,
  Level,
  Visual,
  WorkedStep,
  WrongAnswerNote,
} from "./curriculumTypes";
import type { Rng } from "./makeRng";
import { canon, fmtNum, frac, gcd, mixed, mixedText, fracText } from "./mathUtils";

export type Gen = (r: Rng, level: Level) => GeneratedQuestion;

export const S = (
  title: string,
  say: string,
  math?: string,
  why?: string,
  ask?: { prompt: string; answer: string }
): WorkedStep => {
  const step: WorkedStep = { title, say };
  if (math !== undefined) step.math = math;
  if (why !== undefined) step.why = why;
  if (ask !== undefined) step.ask = ask;
  return step;
};

// Wrap a line of maths for MathText.
export const M = (s: string): string => `$${s}$`;

export const wr = (
  answer: number | string,
  tag: string,
  message: string
): WrongAnswerNote => ({
  answer: typeof answer === "number" ? canon(answer) : answer,
  tag,
  message,
});

interface Common {
  prompt: string;
  visual?: Visual;
  hints: string[];
  steps: WorkedStep[];
  skillTag: string;
  wrong?: WrongAnswerNote[];
}

export const numQ = (
  c: Common & {
    answer: number;
    dp?: number;
    unit?: string;
    answerText?: string;
    accept?: number[];
    tolerance?: number;
    placeholder?: string;
  }
): GeneratedQuestion => ({
  kind: "numeric",
  prompt: c.prompt,
  visual: c.visual,
  answer: canon(c.answer),
  accept: c.accept?.map(canon),
  unit: c.unit,
  tolerance: c.tolerance,
  placeholder: c.placeholder,
  answerText:
    c.answerText ?? `${M(fmtNum(c.answer, c.dp))}${c.unit ? " " + c.unit : ""}`,
  hints: c.hints,
  steps: c.steps,
  wrongAnswers: c.wrong,
  skillTag: c.skillTag,
});

export const choiceQ = (
  r: Rng,
  c: Common & {
    correct: string;
    wrongs: string[];
    answerText?: string;
    notes?: Record<string, { tag: string; message: string }>;
  }
): GeneratedQuestion => {
  const wrongs = Array.from(new Set(c.wrongs.filter((w) => w !== c.correct)));
  const choices = r.shuffle([c.correct, ...wrongs]);
  const wrongAnswers: WrongAnswerNote[] = [];
  for (const w of wrongs) {
    const n = c.notes?.[w];
    if (n) wrongAnswers.push({ answer: w, tag: n.tag, message: n.message });
  }
  return {
    kind: "choice",
    prompt: c.prompt,
    visual: c.visual,
    choices,
    answer: c.correct,
    answerText: c.answerText ?? c.correct,
    hints: c.hints,
    steps: c.steps,
    wrongAnswers,
    skillTag: c.skillTag,
  };
};

export const fracQ = (
  c: Common & {
    n: number;
    d: number;
    mixedForm?: boolean;
    simplest?: boolean;
    placeholder?: string;
  }
): GeneratedQuestion => {
  const g = gcd(c.n, c.d) || 1;
  const n = c.n / g;
  const d = c.d / g;
  const useMixed = !!c.mixedForm && n > d;
  return {
    kind: "fraction",
    prompt: c.prompt,
    visual: c.visual,
    answer: useMixed ? mixedText(n, d) : fracText(n, d),
    answerText: M(useMixed || d === 1 ? mixed(n, d) : frac(n, d)),
    simplest: c.simplest ?? true,
    placeholder: c.placeholder ?? "e.g. 3/4",
    hints: c.hints,
    steps: c.steps,
    wrongAnswers: c.wrong,
    skillTag: c.skillTag,
  };
};

export const exprQ = (
  c: Common & {
    answer: string;
    accept?: string[];
    answerText?: string;
    placeholder?: string;
  }
): GeneratedQuestion => ({
  kind: "expression",
  prompt: c.prompt,
  visual: c.visual,
  answer: c.answer,
  accept: c.accept,
  answerText: c.answerText ?? M(c.answer),
  placeholder: c.placeholder ?? "e.g. 3x + 5",
  hints: c.hints,
  steps: c.steps,
  wrongAnswers: c.wrong,
  skillTag: c.skillTag,
});

export const textQ = (
  c: Common & {
    answer: string;
    accept?: string[];
    answerText?: string;
    placeholder?: string;
  }
): GeneratedQuestion => ({
  kind: "text",
  prompt: c.prompt,
  visual: c.visual,
  answer: c.answer,
  accept: c.accept,
  answerText: c.answerText ?? c.answer,
  placeholder: c.placeholder,
  hints: c.hints,
  steps: c.steps,
  wrongAnswers: c.wrong,
  skillTag: c.skillTag,
});