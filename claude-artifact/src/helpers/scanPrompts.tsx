// Prompts and JSON schemas for the "Scan a question" feature.
import { MATHTEXT_GUIDE, TUTOR_RULES, VISUAL_GUIDE, subtopicCatalogue } from "./tutorPersona";

export const readSystemPrompt = (learnerName: string, grade: number): string =>
  [
    `You are the eyes of a maths tutor. ${learnerName} (Grade ${grade}, South Africa) has taken a photograph of maths work. Your job is ONLY to read it carefully and transcribe it. Do not solve anything yet.`,
    `RULES FOR READING:
1. Transcribe every question exactly as written, using the maths format below. Keep the question numbers (for example "3", "2(b)").
2. NEVER silently guess an unclear symbol, digit or sign. If something could be read in more than one way (for example 1 or 7, + or ×, x or ×, a smudged exponent, a missing minus sign, a fraction bar that is hard to see), write your best reading in the text AND add an entry to "uncertain" with the 2-4 possible readings. Be honest: it is much better to ask than to guess wrong.
3. If a question depends on a diagram, graph or table, describe it carefully in "diagramDescription" (shapes, labels, angle sizes, side lengths, axis values, points). If you cannot read an important number in the diagram, add it to "uncertain".
4. If the learner has written their own working or answer, copy it into "handwrittenWork" exactly as written (including any mistakes). Do not correct it.
5. If the photo is blurry, too dark, cut off or has no maths in it, say so in "quality" and "qualityNote" (kindly, with a tip on how to take a better photo) and transcribe whatever you can.
6. "subtopicGuess" must be one id from the list below, or "unknown".`,
    MATHTEXT_GUIDE,
    `SUBTOPIC IDS:\n${subtopicCatalogue(grade)}`,
  ].join("\n\n");

export const READ_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["quality", "qualityNote", "questions", "uncertain", "summary", "subtopicGuess"],
  properties: {
    quality: { type: "string", enum: ["clear", "okay", "blurry", "dark", "cut-off", "no-maths"] },
    qualityNote: { type: "string" },
    questions: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["number", "text", "kind", "hasDiagram", "diagramDescription", "handwrittenWork"],
        properties: {
          number: { type: "string" },
          text: { type: "string" },
          kind: { type: "string", enum: ["equation", "calculation", "word-problem", "geometry", "graph", "data", "other"] },
          hasDiagram: { type: "boolean" },
          diagramDescription: { type: "string" },
          handwrittenWork: { type: "string" },
        },
      },
    },
    uncertain: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["questionIndex", "whatISaw", "options", "why"],
        properties: {
          questionIndex: { type: "integer" },
          whatISaw: { type: "string" },
          options: { type: "array", items: { type: "string" } },
          why: { type: "string" },
        },
      },
    },
    summary: { type: "string" },
    subtopicGuess: { type: "string" },
  },
};

export const explainSystemPrompt = (learnerName: string, grade: number, profile: string): string =>
  [
    TUTOR_RULES,
    MATHTEXT_GUIDE,
    `LEARNER: ${learnerName}, Grade ${grade}, South Africa.`,
    profile ? `WHAT YOU KNOW ABOUT HIM (use quietly):\n${profile}` : "",
    `TASK: ${learnerName} photographed a question he does not understand. He has confirmed the question text. Teach it to him like a patient private tutor and return JSON matching the schema.

HOW TO FILL IN THE JSON:
- "topic": pick the best "subtopicId" from the list below (or "unknown") and write its plain name.
- "asking": 1-3 short sentences saying in simple English what the question is asking. Explain any maths word.
- "concepts": the 1-3 ideas he needs to know to solve it. Each is explained in simple words with a tiny example.
- "steps": the full solution in SMALL numbered steps. Each step has a short "title" (for example "STEP 2: Look at the +5"), "say" (what we do, in simple English), "math" (the line of maths for this step, or an empty string), and "why" (WHY this step is needed). NEVER skip a step. For equations follow the STEP 1 to STEP 6 pattern including the final check.
- "finalAnswer": the answer, with units, in the maths format.
- "finalAnswerPlain": the answer as plain machine-readable text with NO units or words, for example "5", "x=5", "3x+5", "24". If there are several answers give the one the question asks for.
- "check": one or two sentences showing how to check the answer.
- "alternative": a second method, only if there is a genuinely useful one. Otherwise an empty string.
- "studentWorkFeedback": if the photo contained his own working, gently say what is right and whether any mistake is an ANSWER mistake or a METHOD mistake. Otherwise an empty string.
- "similar": a DIFFERENT but similar worked example with different numbers, fully worked in small steps, as a model for him.
- "practice": ONE small practice question of the same type with different numbers (he will try it himself). "answerPlain" is the exact answer (plain, no units). "answerKind" is "numeric" for a number or "expression" for an algebra answer. Give three "hints", each a little stronger than the one before (the last must NOT state the final answer). Also give "solutionSteps" and "answerText" for showing after he has tried.
- "encouragement": one warm, specific sentence (not over-excited).

If the question needs a diagram you cannot see, use the diagram description you were given. If the question cannot be answered without more information, say what is missing in "asking" and keep the steps empty.
Before answering, work out the answer carefully and double-check every calculation.

VISUAL TYPES you may mention: ${VISUAL_GUIDE.split("\n")[0]}`,
    `SUBTOPIC IDS:\n${subtopicCatalogue(grade)}`,
  ]
    .filter(Boolean)
    .join("\n\n");

const STEP_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["title", "say", "math"],
  properties: { title: { type: "string" }, say: { type: "string" }, math: { type: "string" } },
};

export const EXPLAIN_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["topic", "asking", "concepts", "steps", "finalAnswer", "finalAnswerPlain", "check", "alternative", "studentWorkFeedback", "similar", "practice", "encouragement"],
  properties: {
    topic: {
      type: "object",
      additionalProperties: false,
      required: ["subtopicId", "name"],
      properties: { subtopicId: { type: "string" }, name: { type: "string" } },
    },
    asking: { type: "string" },
    concepts: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["name", "explanation"],
        properties: { name: { type: "string" }, explanation: { type: "string" } },
      },
    },
    steps: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["title", "say", "math", "why"],
        properties: { title: { type: "string" }, say: { type: "string" }, math: { type: "string" }, why: { type: "string" } },
      },
    },
    finalAnswer: { type: "string" },
    finalAnswerPlain: { type: "string" },
    check: { type: "string" },
    alternative: { type: "string" },
    studentWorkFeedback: { type: "string" },
    similar: {
      type: "object",
      additionalProperties: false,
      required: ["problem", "steps", "answer"],
      properties: { problem: { type: "string" }, steps: { type: "array", items: STEP_SCHEMA }, answer: { type: "string" } },
    },
    practice: {
      type: "object",
      additionalProperties: false,
      required: ["question", "answerPlain", "answerKind", "hints", "solutionSteps", "answerText"],
      properties: {
        question: { type: "string" },
        answerPlain: { type: "string" },
        answerKind: { type: "string", enum: ["numeric", "expression"] },
        hints: { type: "array", items: { type: "string" } },
        solutionSteps: { type: "array", items: STEP_SCHEMA },
        answerText: { type: "string" },
      },
    },
    encouragement: { type: "string" },
  },
};

export interface ExplainJson {
  topic: { subtopicId: string; name: string };
  asking: string;
  concepts: { name: string; explanation: string }[];
  steps: { title: string; say: string; math: string; why: string }[];
  finalAnswer: string;
  finalAnswerPlain: string;
  check: string;
  alternative: string;
  studentWorkFeedback: string;
  similar: { problem: string; steps: { title: string; say: string; math: string }[]; answer: string };
  practice: {
    question: string;
    answerPlain: string;
    answerKind: "numeric" | "expression";
    hints: string[];
    solutionSteps: { title: string; say: string; math: string }[];
    answerText: string;
  };
  encouragement: string;
}

export const SOLVE_ONLY_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["finalAnswerPlain", "workingNote"],
  properties: { finalAnswerPlain: { type: "string" }, workingNote: { type: "string" } },
};

export const solveOnlySystemPrompt = (): string =>
  `You are a careful mathematics checker. Solve the question below completely on your own, step by step in your head, double-checking every calculation. Return JSON only. "finalAnswerPlain" is the answer as plain text with no units and no words, for example "5", "x=5", "3x+5", "24". "workingNote" is one short line summarising the method.\n\n${MATHTEXT_GUIDE}`;
