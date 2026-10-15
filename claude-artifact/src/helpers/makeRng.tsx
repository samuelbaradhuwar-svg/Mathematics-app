// Small deterministic random number generator (mulberry32). Questions are
// generated from a seed, so the server can regenerate exactly the same
// question to verify an answer and nothing depends on stored question text.

export interface Rng {
  next: () => number;
  int: (min: number, max: number) => number;
  pick: <T>(items: readonly T[]) => T;
  shuffle: <T>(items: readonly T[]) => T[];
  chance: (p: number) => boolean;
  // integer in [min,max] that is not in `not`
  intNot: (min: number, max: number, not: number[]) => number;
}

export const makeRng = (seed: number): Rng => {
  let a = (seed >>> 0) || 0x9e3779b9;
  const next = () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const int = (min: number, max: number) =>
    min + Math.floor(next() * (max - min + 1));
  const pick = <T,>(items: readonly T[]): T => items[int(0, items.length - 1)];
  const shuffle = <T,>(items: readonly T[]): T[] => {
    const arr = items.slice();
    for (let i = arr.length - 1; i > 0; i--) {
      const j = int(0, i);
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  };
  const chance = (p: number) => next() < p;
  const intNot = (min: number, max: number, not: number[]) => {
    for (let i = 0; i < 50; i++) {
      const v = int(min, max);
      if (!not.includes(v)) return v;
    }
    // fall back to first allowed value
    for (let v = min; v <= max; v++) if (!not.includes(v)) return v;
    return min;
  };
  return { next, int, pick, shuffle, chance, intNot };
};