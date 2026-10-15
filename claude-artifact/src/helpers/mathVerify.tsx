// Programmatic double-check of AI-written solutions.
// We try to read the question as plain arithmetic or a one-letter linear equation,
// solve it with code, and compare with the answer the AI gave.
import { parseNum } from "./mathUtils";
import { evalNumber, solveLinear } from "./polynomial";

export type VerifyStatus = "verified" | "mismatch" | "unverifiable";
export interface VerifyResult {
  status: VerifyStatus;
  expected?: number;
  detail?: string;
}

const clean = (s: string): string =>
  s
    .replace(/\$/g, " ")
    .replace(/[a-zA-Z]{2,}/g, " ") // drop words like "Solve", "for", "cm": single letters stay (they are variables)
    .replace(/\{([^/{}]*)\/([^{}]*)\}/g, "(($1)/($2))")
    .replace(/(\d)\(\(/g, "$1*((")
    .replace(/[−–]/g, "-")
    .replace(/×/g, "*")
    .replace(/÷/g, "/")
    .replace(/(\d)\s+(?=\()/g, "$1*")
    .replace(/\s+/g, " ")
    .trim();

const candidates = (text: string): string[] => {
  const out: string[] = [];
  const dollar = text.match(/\$[^$]+\$/g);
  if (dollar) out.push(...dollar);
  // otherwise: any run that looks like maths
  const runs = text.match(/[0-9a-zA-Z(){}\/^+\-*×÷−=., ]{3,}/g);
  if (runs) out.push(...runs);
  return out.map(clean).filter((c) => /[0-9]/.test(c));
};

export const readFinalNumber = (finalAnswer: string): number | null => {
  const direct = parseNum(finalAnswer);
  if (direct !== null) return direct;
  const m = finalAnswer.replace(/\$/g, "").match(/=\s*([-+−]?[0-9][0-9 .,]*)\s*(?:[a-zA-Z°%]*)\s*$/);
  if (m) return parseNum(m[1]);
  const last = finalAnswer.replace(/\$/g, "").match(/([-+−]?[0-9][0-9 .,]*)\s*[a-zA-Z°%²³]*\s*$/);
  return last ? parseNum(last[1]) : null;
};

export const verifyAgainstCalculator = (questionText: string, finalAnswer: string): VerifyResult => {
  const given = readFinalNumber(finalAnswer);
  if (given === null) return { status: "unverifiable", detail: "answer is not a single number" };

  for (const c of candidates(questionText)) {
    // an equation with one unknown letter
    if (c.includes("=") && /[a-zA-Z]/.test(c)) {
      const parts = c.split("=");
      if (parts.length === 2 && parts[0].trim() && parts[1].trim()) {
        const sol = solveLinear(c.replace(/^[^0-9a-zA-Z(-]+/, ""));
        if (sol) {
          return Math.abs(sol.value - given) < 1e-6 * Math.max(1, Math.abs(sol.value))
            ? { status: "verified", expected: sol.value }
            : { status: "mismatch", expected: sol.value, detail: `solving ${c} gives ${sol.variable} = ${sol.value}` };
        }
      }
    }
    // plain arithmetic, e.g. "3(5) + 5 =" or "2^3 - 4/2"
    if (!/[a-zA-Z]/.test(c.replace(/√|∛/g, ""))) {
      const expr = c.replace(/=\s*\??\s*$/, "").replace(/^[^0-9(-]+/, "");
      if (expr.includes("=")) continue;
      const v = evalNumber(expr);
      if (v !== null && /[+\-*/^]/.test(expr)) {
        return Math.abs(v - given) < 1e-6 * Math.max(1, Math.abs(v))
          ? { status: "verified", expected: v }
          : { status: "mismatch", expected: v, detail: `${expr} = ${v}` };
      }
    }
  }
  return { status: "unverifiable", detail: "could not read the question as arithmetic or a simple equation" };
};