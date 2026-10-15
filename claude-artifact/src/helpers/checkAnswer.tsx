import type { GeneratedQuestion, WrongAnswerNote } from "./curriculumTypes";
import { parseNum, parseRational, sameRational } from "./mathUtils";
import { isParsable, polyEquals } from "./polynomial";

export type CheckStatus =
  | "correct"
  | "almost" // right value, wrong form (e.g. not simplified). Not counted as wrong.
  | "incorrect"
  | "unreadable" // we could not read it; not counted as an attempt
  | "empty";

export interface CheckResult {
  status: CheckStatus;
  // Friendly note to show Judah
  note?: string;
  // Recurring-mistake tag if the wrong answer matches a known misconception
  tag?: string;
  // Targeted note about the METHOD behind a wrong answer
  methodNote?: string;
}

const norm = (s: string): string =>
  s
    .toLowerCase()
    .replace(/[.!]+$/g, "")
    .replace(/\s*:\s*/g, ":")
    .replace(/\s+/g, " ")
    .trim();

// "T_n = 4n - 1" or "C = 15 + 8k" -> the part after the single "="
const afterEquals = (s: string): string => {
  const parts = s.split("=");
  return parts.length === 2 ? parts[1] : s;
};

const stripUnit = (raw: string, unit?: string): string => {
  if (!unit) return raw;
  const u = unit
    .replace(/²/g, "2")
    .replace(/³/g, "3")
    .toLowerCase();
  let s = raw.trim();
  const lower = s
    .replace(/²/g, "2")
    .replace(/³/g, "3")
    .toLowerCase();
  if (lower.endsWith(u)) {
    s = s.slice(0, s.length - u.length).trim();
  }
  return s;
};

const matchWrong = (
  q: GeneratedQuestion,
  raw: string
): WrongAnswerNote | undefined => {
  if (!q.wrongAnswers) return undefined;
  return q.wrongAnswers.find((w) => {
    if (q.kind === "numeric") {
      const a = parseNum(stripUnit(raw, q.unit));
      const b = parseNum(w.answer);
      return a !== null && b !== null && Math.abs(a - b) < 1e-9;
    }
    if (q.kind === "fraction") {
      const a = parseRational(raw);
      const b = parseRational(w.answer);
      return !!a && !!b && sameRational(a, b);
    }
    if (q.kind === "expression") return polyEquals(raw, w.answer);
    return norm(raw) === norm(w.answer);
  });
};

const wrong = (q: GeneratedQuestion, raw: string): CheckResult => {
  const w = matchWrong(q, raw);
  return w
    ? { status: "incorrect", tag: w.tag, methodNote: w.message }
    : { status: "incorrect" };
};

export const checkAnswer = (q: GeneratedQuestion, input: string): CheckResult => {
  const raw = (input ?? "").trim();
  if (!raw) return { status: "empty" };

  switch (q.kind) {
    case "choice":
      return norm(raw) === norm(q.answer) ? { status: "correct" } : wrong(q, raw);

    case "text": {
      const options = [q.answer, ...(q.accept ?? [])].map(norm);
      return options.includes(norm(raw)) ? { status: "correct" } : wrong(q, raw);
    }

    case "numeric": {
      const v = parseNum(stripUnit(raw, q.unit));
      if (v === null) {
        return {
          status: "unreadable",
          note: "I couldn't read that as a number. Type just the number, for example 12 or 3,5.",
        };
      }
      const options = [q.answer, ...(q.accept ?? [])]
        .map((a) => parseNum(a))
        .filter((a): a is number => a !== null);
      const tol = q.tolerance ?? 1e-6;
      const ok = options.some((a) => Math.abs(a - v) <= tol * Math.max(1, Math.abs(a)));
      return ok ? { status: "correct" } : wrong(q, raw);
    }

    case "fraction": {
      const v = parseRational(raw);
      const a = parseRational(q.answer);
      if (!v || !a) {
        return {
          status: "unreadable",
          note: "I couldn't read that. Write a fraction like 3/4, or a mixed number like 1 1/2.",
        };
      }
      if (!sameRational(v, a)) return wrong(q, raw);
      if (a.form !== "decimal" && v.form === "decimal" && a.form !== "integer") {
        return {
          status: "almost",
          note: "That's the right value! But the question wants a fraction, not a decimal.",
        };
      }
      if (q.simplest !== false && (v.form === "fraction" || v.form === "mixed") && !v.simplest && a.form !== "integer") {
        if (v.form === "fraction" && a.form === "mixed" && v.simplest) {
          // fall through to the mixed-number check below
        } else {
          return {
            status: "almost",
            note: "That's the right value! Can you write it in its simplest form?",
          };
        }
      }
      if (a.form === "mixed" && v.form === "fraction") {
        return {
          status: "almost",
          note: "Right value! Can you write it as a mixed number (whole number and a fraction)?",
        };
      }
      return { status: "correct" };
    }

    case "expression": {
      const rawExpr = afterEquals(raw);
      if (!isParsable(rawExpr)) {
        return {
          status: "unreadable",
          note: "I couldn't read that expression. Use letters and signs like 3x + 5. For powers type x^2.",
        };
      }
      const options = [q.answer, ...(q.accept ?? [])].map(afterEquals);
      return options.some((o) => polyEquals(rawExpr, o)) ? { status: "correct" } : wrong(q, rawExpr);
    }
  }
};