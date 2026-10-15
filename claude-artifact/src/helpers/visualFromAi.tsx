// Turns the loose "visual" object the AI returns into a safe, validated Visual.
import type { Visual } from "./curriculumTypes";

export interface AiVisual {
  type: string;
  numbers: number[];
  left: string;
  right: string;
  caption: string;
}

const num = (n: unknown, lo: number, hi: number, fallback: number): number => {
  const v = typeof n === "number" && isFinite(n) ? n : fallback;
  return Math.max(lo, Math.min(hi, v));
};

export const sanitiseVisual = (raw: AiVisual | null | undefined): Visual | null => {
  if (!raw || typeof raw !== "object") return null;
  const n = Array.isArray(raw.numbers) ? raw.numbers.filter((x) => typeof x === "number" && isFinite(x)) : [];
  const caption = typeof raw.caption === "string" && raw.caption ? raw.caption.slice(0, 160) : undefined;
  switch (raw.type) {
    case "numberline": {
      if (n.length < 2) return null;
      const min = Math.floor(num(n[0], -50, 49, -10));
      const max = Math.ceil(num(n[1], min + 1, 50, min + 10));
      return { type: "numberline", min, max: Math.min(max, min + 40), marks: n.slice(2, 8).filter((x) => x >= min && x <= max), caption };
    }
    case "fractionbar": {
      if (n.length < 2) return null;
      const parts = Math.round(num(n[0], 1, 24, 4));
      return { type: "fractionbar", parts, shaded: Math.round(num(n[1], 0, parts, 1)), caption };
    }
    case "balance": {
      const left = (raw.left || "").slice(0, 40);
      const right = (raw.right || "").slice(0, 40);
      return left && right ? { type: "balance", left, right, caption } : null;
    }
    case "gridrect":
      return n.length >= 2 ? { type: "gridrect", w: Math.round(num(n[0], 1, 12, 4)), h: Math.round(num(n[1], 1, 12, 3)), caption } : null;
    case "angleline":
      return n.length >= 1 ? { type: "angleline", a: Math.round(num(n[0], 5, 175, 60)), caption } : null;
    case "coordplane": {
      const points: { x: number; y: number }[] = [];
      for (let i = 0; i + 1 < n.length && points.length < 8; i += 2) points.push({ x: num(n[i], -8, 8, 0), y: num(n[i + 1], -8, 8, 0) });
      return points.length ? { type: "coordplane", points, range: 8, caption } : null;
    }
    case "cuboid":
      return n.length >= 3 ? { type: "cuboid", l: num(n[0], 1, 20, 4), w: num(n[1], 1, 20, 3), h: num(n[2], 1, 20, 2), caption } : null;
    case "circle":
      return n.length >= 1 ? { type: "circle", r: num(n[0], 1, 30, 5), caption } : null;
    default:
      return null;
  }
};