// Compare two answers written as text (numbers, algebra or plain words).
import { parseNum } from "./mathUtils";
import { polyEquals } from "./polynomial";
import { readFinalNumber } from "./mathVerify";

const norm = (s: string) => s.toLowerCase().replace(/\s+/g, "").replace(/[−]/g, "-").replace(/^[a-z]=/, "");

export const sameAnswer = (a: string, b: string): boolean => {
  const na = readFinalNumber(a) ?? parseNum(a);
  const nb = readFinalNumber(b) ?? parseNum(b);
  if (na !== null && nb !== null) return Math.abs(na - nb) <= 1e-6 * Math.max(1, Math.abs(na));
  const ea = a.replace(/^\s*[a-zA-Z]\s*=\s*/, "");
  const eb = b.replace(/^\s*[a-zA-Z]\s*=\s*/, "");
  if (polyEquals(ea, eb)) return true;
  return norm(a) === norm(b);
};