// Registry of every question generator, keyed by subtopic id.
import { checkAnswer } from "./checkAnswer";
import type { GeneratedQuestion, Level } from "./curriculumTypes";
import type { Gen } from "./genKit";
import { genAlgebra } from "./genAlgebra";
import { genFoundation } from "./genFoundation";
import { genFractions } from "./genFractions";
import { genGeometry } from "./genGeometry";
import { genMeasureData } from "./genMeasureData";
import { genPercentRatio } from "./genPercentRatio";
import { genWholeNumbers } from "./genWholeNumbers";
import { makeRng } from "./makeRng";

export const QUESTION_GENERATORS: Record<string, Gen> = {
  ...genWholeNumbers,
  ...genFractions,
  ...genPercentRatio,
  ...genAlgebra,
  ...genGeometry,
  ...genMeasureData,
  ...genFoundation,
};

export interface GeneratedWithId extends GeneratedQuestion {
  id: string;
  generator: string;
  level: Level;
  seed: number;
}

export const questionId = (generator: string, level: Level, seed: number): string =>
  `${generator}|${level}|${seed}`;

export const parseQuestionId = (
  id: string
): { generator: string; level: Level; seed: number } | null => {
  const parts = id.split("|");
  if (parts.length !== 3) return null;
  const [generator, level, seedStr] = parts;
  if (level !== "beginner" && level !== "intermediate" && level !== "advanced") return null;
  const seed = Number(seedStr);
  if (!Number.isInteger(seed) || !QUESTION_GENERATORS[generator]) return null;
  return { generator, level, seed };
};

// Deterministic: same (generator, level, seed) always gives the same question.
export const generateQuestion = (
  generator: string,
  level: Level,
  seed: number
): GeneratedWithId => {
  const gen = QUESTION_GENERATORS[generator];
  if (!gen) throw new Error(`Unknown question generator: ${generator}`);
  const q = gen(makeRng(seed), level);
  // A "known wrong answer" note must never describe an answer that is actually correct
  // (this can happen by coincidence for particular numbers).
  const wrongAnswers = q.wrongAnswers?.filter(
    (w) => checkAnswer(q, w.answer).status !== "correct"
  );
  return { ...q, wrongAnswers, id: questionId(generator, level, seed), generator, level, seed };
};

export const regenerateFromId = (id: string): GeneratedWithId | null => {
  const p = parseQuestionId(id);
  return p ? generateQuestion(p.generator, p.level, p.seed) : null;
};

export const randomSeed = (): number => 1 + Math.floor(Math.random() * 2147483000);
