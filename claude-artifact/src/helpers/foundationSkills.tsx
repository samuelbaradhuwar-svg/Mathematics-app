// Short refreshers for foundation skills that Grade 8 builds on.
import type { ExplainBlock } from "./curriculumTypes";

export interface FoundationSkill {
  id: string; // generator key
  name: string;
  intro: string;
  explain: ExplainBlock[];
  helpsWith: string[]; // Grade 8 subtopic ids
}

export const FOUNDATION_SKILLS: FoundationSkill[] = [
  {
    id: "fnd-times",
    name: "Times tables",
    intro: "Knowing your times tables makes almost every other topic easier.",
    explain: [
      { heading: "Break it into friendly pieces", body: "If you forget 7 × 8, break the 8 into 5 + 3. 7 × 5 = 35 and 7 × 3 = 21. Add them: 35 + 21 = 56.", example: "$7 × 8 = 7 × 5 + 7 × 3 = 35 + 21 = 56$" },
      { heading: "Use the ones you know", body: "Multiplying by 10 is easy: add a zero. Multiplying by 9 is 10 times minus 1 lot: 9 × 7 = 70 − 7 = 63. Doubling helps too: 4 × is double double." },
    ],
    helpsWith: ["wn-calc", "wn-factors", "frac-equiv", "exp-meaning", "eq-onestep"],
  },
  {
    id: "fnd-division",
    name: "Division facts",
    intro: "Division is the opposite of multiplying, so your times tables can help.",
    explain: [
      { heading: "Turn it into a times question", body: "To work out 56 ÷ 7, ask: 7 × ? = 56. You know 7 × 8 = 56, so 56 ÷ 7 = 8.", example: "$56 ÷ 7 = 8$ because $7 × 8 = 56$" },
      { heading: "Check by multiplying", body: "After you divide, multiply your answer by the number you divided by. You should get back to the number you started with." },
    ],
    helpsWith: ["wn-calc", "wn-factors", "frac-equiv", "eq-onestep"],
  },
  {
    id: "fnd-place",
    name: "Place value",
    intro: "Every digit in a number has a value that depends on where it sits.",
    explain: [
      { heading: "Read from the right", body: "From the right, the places are ones, tens, hundreds, thousands. In 3 764 the digit 7 is in the hundreds place, so it is worth 700.", example: "$3 764 = 3 000 + 700 + 60 + 4$" },
    ],
    helpsWith: ["wn-calc", "dec-place"],
  },
  {
    id: "fnd-fraction-shape",
    name: "What a fraction means",
    intro: "A fraction is part of a whole, cut into equal pieces.",
    explain: [
      { heading: "Bottom number: how many equal pieces", body: "The denominator (bottom number) tells us how many equal parts the whole is cut into.", visual: { type: "fractionbar", parts: 4, shaded: 3 } },
      { heading: "Top number: how many we take", body: "The numerator (top number) tells us how many of those parts we are talking about. 3 shaded out of 4 parts is 3/4." },
    ],
    helpsWith: ["frac-equiv", "frac-addsub", "frac-muldiv", "frac-forms"],
  },
  {
    id: "fnd-tenths",
    name: "Tenths and hundredths",
    intro: "Decimals are fractions with 10, 100 or 1 000 as the bottom number.",
    explain: [
      { heading: "The first place after the comma", body: "The first digit after the decimal comma is tenths. 0,7 means seven tenths (7/10). The second digit is hundredths. 0,07 means seven hundredths (7/100). Tenths are bigger than hundredths.", example: "$0,7 > 0,07$" },
    ],
    helpsWith: ["dec-place", "dec-addsub", "dec-muldiv", "frac-forms"],
  },
  {
    id: "fnd-negative",
    name: "Numbers below zero",
    intro: "Negative numbers are numbers less than zero, like a freezing temperature.",
    explain: [
      { heading: "The number line goes both ways", body: "Zero is in the middle. Numbers to the right are positive. Numbers to the left are negative. The further left, the smaller the number.", visual: { type: "numberline", min: -6, max: 6, marks: [-4, 0, 3] } },
    ],
    helpsWith: ["int-order", "int-addsub", "int-muldiv"],
  },
];

export const foundationSkillById = (id: string): FoundationSkill | undefined =>
  FOUNDATION_SKILLS.find((s) => s.id === id);