// Shared types for the photo-scan feature.
import type { Visual } from "./curriculumTypes";

export interface ScanQuestion {
  number: string;
  text: string; // MathText
  kind: "equation" | "calculation" | "word-problem" | "geometry" | "graph" | "data" | "other";
  hasDiagram: boolean;
  diagramDescription: string;
  handwrittenWork: string;
}

export interface ScanUncertainty {
  questionIndex: number;
  whatISaw: string;
  options: string[];
  why: string;
}

export interface ScanReading {
  quality: "clear" | "okay" | "blurry" | "dark" | "cut-off" | "no-maths";
  qualityNote: string;
  questions: ScanQuestion[];
  uncertain: ScanUncertainty[];
  summary: string;
  subtopicGuess: string; // a subtopic id or "unknown"
}

export interface ScanStep {
  title: string;
  say: string;
  math: string;
  why: string;
}

export type VerificationStatus = "calculator-checked" | "double-checked" | "unsure" | "not-checked";

// What we keep on the server about the practice question (the answer is never sent to the browser).
export interface ScanServerData {
  practice:
    | { source: "similar"; answerPlain: string; kind: "numeric" | "expression"; solutionSteps: { title: string; say: string; math: string }[]; answerText: string }
    | { source: "curriculum"; questionId: string }
    | null;
}

export interface ScanExplanationDto {
  scanId: number;
  subtopicId: string | null;
  topicName: string;
  question: string;
  asking: string;
  concepts: { name: string; explanation: string }[];
  steps: ScanStep[];
  finalAnswer: string;
  check: string;
  alternative: string;
  similar: { problem: string; steps: { title: string; say: string; math: string }[]; answer: string };
  practice: {
    question: string;
    kind: "numeric" | "expression" | "text" | "choice";
    choices?: string[];
    unit?: string;
    hints: string[];
    visual?: Visual;
    source: "similar" | "curriculum";
  } | null;
  encouragement: string;
  verification: { status: VerificationStatus; note: string };
}