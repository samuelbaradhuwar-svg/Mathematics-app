// Shared types for the curriculum data layer. Everything that describes
// "what Judah learns" is data conforming to these types; UI components never
// hardcode curriculum content, so Grade 9+ can be added by adding data files.

export type Level = "beginner" | "intermediate" | "advanced";
export const LEVELS: Level[] = ["beginner", "intermediate", "advanced"];
export const LEVEL_LABEL: Record<Level, string> = {
  beginner: "Beginner",
  intermediate: "Intermediate",
  advanced: "Advanced",
};

export type LearningStatus =
  | "understood"
  | "practising"
  | "needs-help"
  | "not-started";

// Small interactive diagrams (rendered by components/MathVisual).
export type Visual =
  | {
      type: "numberline";
      min: number;
      max: number;
      marks?: number[];
      jumps?: { from: number; to: number; label?: string }[];
      caption?: string;
    }
  | { type: "fractionbar"; parts: number; shaded: number; caption?: string }
  | { type: "balance"; left: string; right: string; caption?: string }
  | { type: "gridrect"; w: number; h: number; unit?: string; caption?: string }
  | { type: "angleline"; a: number; caption?: string }
  | { type: "cuboid"; l: number; w: number; h: number; caption?: string }
  | {
      type: "bars";
      labels: string[];
      values: number[];
      title?: string;
      caption?: string;
    }
  | {
      type: "pie";
      labels: string[];
      values: number[];
      title?: string;
      caption?: string;
    }
  | {
      type: "coordplane";
      points: { x: number; y: number; label?: string }[];
      line?: { m: number; c: number };
      range?: number;
      caption?: string;
    }
  | { type: "circle"; r: number; caption?: string }
  | {
      type: "triangle";
      angles: [string, string, string];
      caption?: string;
    }
  | { type: "parallel"; angle: number; caption?: string };

export interface WorkedStep {
  title: string; // "Look at the +5"
  say: string; // the plain-English explanation of this tiny step
  math?: string; // maths shown for this step (MathText syntax)
  why?: string; // WHY we do this step
  // Used in "practise together": Judah answers this before the step is revealed.
  ask?: { prompt: string; answer: string };
}

export interface WorkedExample {
  title: string;
  problem: string; // MathText
  visual?: Visual;
  steps: WorkedStep[];
  answer: string; // MathText
}

export interface TermDef {
  word: string;
  meaning: string;
}

export interface ExplainBlock {
  heading?: string;
  body: string; // MathText; ONE idea per block
  example?: string; // a single line of maths to look at
  visual?: Visual;
}

export interface Mistake {
  tag: string; // stable id used to track recurring mistakes
  mistake: string;
  fix: string;
}

export interface Subtopic {
  id: string;
  name: string;
  // "I can ..." learning objectives
  objectives: string[];
  // Plain-text description of knowledge Judah should already have.
  priorKnowledge: string[];
  // Prerequisite subtopic ids (used to find foundation gaps).
  prerequisites: string[];
  explain: ExplainBlock[];
  // A genuinely different way to explain it (used when Judah says "I don't understand").
  altExplain: ExplainBlock[];
  terms: TermDef[];
  rules: string[];
  workedExamples: WorkedExample[];
  mistakes: Mistake[];
  realWorld: string;
  // Key into the question generator registry (helpers/questionRegistry).
  generator: string;
}

export interface Topic {
  id: string;
  name: string;
  // CAPS content area
  strand:
    | "Numbers, Operations and Relationships"
    | "Patterns, Functions and Algebra"
    | "Space and Shape (Geometry)"
    | "Measurement"
    | "Data Handling";
  term: 1 | 2 | 3 | 4;
  // Order within the year (1 = first)
  order: number;
  icon: string; // lucide icon name
  summary: string; // one friendly sentence
  whatYouLearn: string[];
  priorKnowledge: string[];
  // Topic-level prerequisites (topic ids)
  prerequisites: string[];
  subtopics: Subtopic[];
  // YouTube search queries for the video library
  videoQueries: string[];
  // Description of how this topic is assessed in CAPS-style tests
  assessmentNote: string;
  // Honest provenance of term/scope placement.
  placement: {
    source: "secondary-sources" | "author-knowledge";
    note: string;
  };
}

export interface GradeCurriculum {
  grade: number;
  subject: "Mathematics";
  country: "South Africa";
  framework: "CAPS";
  topics: Topic[];
}

export type QuestionKind =
  | "numeric"
  | "fraction"
  | "expression"
  | "text"
  | "choice";

export interface WrongAnswerNote {
  // For numeric/fraction: the wrong value as text; for choice/text: the option text.
  answer: string;
  tag: string; // recurring mistake tag
  message: string; // gentle note about the METHOD that produced this answer
}

export interface GeneratedQuestion {
  kind: QuestionKind;
  prompt: string; // MathText
  visual?: Visual;
  choices?: string[]; // for kind "choice" (already shuffled)
  answer: string; // canonical answer (numeric: dot decimal; fraction: "3/4" or "1 1/2")
  accept?: string[]; // other accepted answers
  unit?: string; // shown beside the box
  placeholder?: string;
  simplest?: boolean; // fraction must be in simplest form
  tolerance?: number; // numeric tolerance
  answerText: string; // how to show the answer to Judah (MathText)
  hints: string[]; // progressively stronger; last hint nearly gives the method away
  steps: WorkedStep[]; // full worked solution
  wrongAnswers?: WrongAnswerNote[];
  skillTag: string; // fine-grained skill for gap analysis
}

export interface Question extends GeneratedQuestion {
  id: string; // "<generatorKey>|<level>|<seed>"
  topicId: string;
  subtopicId: string;
  level: Level;
}