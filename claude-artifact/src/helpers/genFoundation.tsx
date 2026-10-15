// Foundation (earlier-grade) skills. The baseline assessment uses these to find
// missing basics that make Grade 8 topics hard. They are not CAPS Grade 8 content.
import { type Gen, S, M, numQ, choiceQ } from "./genKit";
import { fmtNum, frac } from "./mathUtils";

const PLACE = ["ones", "tens", "hundreds", "thousands", "ten thousands"];

const fndTimes: Gen = (r) => {
  const a = r.int(3, 12);
  const b = r.int(6, 12);
  const small = 5;
  return numQ({
    prompt: `${M(`${a} × ${b}`)} = ?`,
    answer: a * b,
    hints: ["Break the second number into two easy parts.", `${b} = 5 + ${b - small}. Work out ${a} × 5 and ${a} × ${b - small}.`, `${a} × 5 = ${a * 5} and ${a} × ${b - small} = ${a * (b - small)}. Add them.`],
    steps: [S("Break up the number", `${b} is 5 + ${b - small}.`, M(`${a} × ${b} = ${a} × 5 + ${a} × ${b - small}`)), S("Work out each part", "", M(`${a * 5} + ${a * (b - small)} = ${a * b}`))],
    skillTag: "fnd.times",
  });
};

const fndDivision: Gen = (r) => {
  const d = r.int(2, 12);
  const q = r.int(3, 12);
  return numQ({
    prompt: `${M(`${d * q} ÷ ${d}`)} = ?`,
    answer: q,
    hints: ["Division asks: how many groups of the second number fit into the first?", `Think: ${d} × ? = ${d * q}`, `Count up in ${d}s: ${[1, 2, 3, 4].map((k) => d * k).join(", ")}...`],
    steps: [S("Turn it into a times question", `${d * q} ÷ ${d} asks: ${d} × ? = ${d * q}.`), S("Use your times tables", `${d} × ${q} = ${d * q}.`, M(`${d * q} ÷ ${d} = ${q}`))],
    skillTag: "fnd.division",
  });
};

const fndPlace: Gen = (r) => {
  const digits = r.shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9]).slice(0, 4);
  const n = Number(digits.join(""));
  const idx = r.int(0, 3);
  const place = 3 - idx;
  const value = digits[idx] * Math.pow(10, place);
  return choiceQ(r, {
    prompt: `What is the value of the digit ${digits[idx]} in ${M(fmtNum(n))}?`,
    correct: fmtNum(value),
    wrongs: [digits[idx], digits[idx] * 10, digits[idx] * 100, digits[idx] * 1000].map((v) => fmtNum(v)),
    hints: ["Each place has a name: ones, tens, hundreds, thousands (from the right).", `The digit ${digits[idx]} is in the ${PLACE[place]} place.`, `${digits[idx]} ${PLACE[place]} = ?`],
    steps: [S("Find the digit's place", `From the right: ones, tens, hundreds, thousands. ${digits[idx]} is in the ${PLACE[place]} place.`), S("Its value", "", M(`${digits[idx]} × ${Math.pow(10, place)} = ${fmtNum(value)}`))],
    skillTag: "fnd.place",
  });
};

const fndFractionShape: Gen = (r) => {
  const parts = r.pick([2, 3, 4, 5, 6, 8]);
  const shaded = r.int(1, parts - 1);
  return choiceQ(r, {
    prompt: "What fraction of the bar is shaded?",
    visual: { type: "fractionbar", parts, shaded },
    correct: M(frac(shaded, parts)),
    wrongs: [M(frac(parts - shaded, parts)), M(frac(shaded, parts + 1)), M(frac(parts, shaded)), M(frac(shaded + 1, parts))],
    hints: ["Count ALL the equal parts first. That is the bottom number.", `There are ${parts} equal parts altogether.`, "Count the shaded parts. That is the top number."],
    steps: [S("Count all the equal parts", `${parts} parts. This is the denominator (bottom).`), S("Count the shaded parts", `${shaded} are shaded. This is the numerator (top).`), S("Write the fraction", "", M(frac(shaded, parts)))],
    skillTag: "fnd.fractionShape",
  });
};

const fndDecimalTenths: Gen = (r) => {
  if (r.chance(0.5)) {
    const t = r.int(2, 9);
    return numQ({
      prompt: `How many tenths are in ${M(fmtNum(t / 10))}?`,
      answer: t,
      hints: ["The first digit after the comma is the tenths digit.", `${fmtNum(t / 10)} has the digit ${t} straight after the comma.`, `So there are ${t} tenths.`],
      steps: [S("Look at the first digit after the comma", `It is ${t}.`), S("That many tenths", `${fmtNum(t / 10)} = ${t} tenths = ${frac(t, 10)}`)],
      skillTag: "fnd.tenths",
    });
  }
  const a = r.int(2, 9);
  const b = r.int(1, 9);
  const big = a / 10;
  const small = b / 100;
  return choiceQ(r, {
    prompt: `Which number is bigger?`,
    correct: fmtNum(big),
    wrongs: [fmtNum(small)],
    hints: ["Think about money: R0,50 or R0,05?", `${fmtNum(big)} = ${a} tenths and ${fmtNum(small)} = ${b} hundredths.`, "Tenths are bigger pieces than hundredths."],
    steps: [S("Write them with the same number of decimal places", "", M(`${fmtNum(big, 2)}  and  ${fmtNum(small, 2)}`)), S("Compare", `${Math.round(big * 100)} hundredths is more than ${b} hundredths, so ${fmtNum(big)} is bigger.`)],
    skillTag: "fnd.tenths",
  });
};

const fndNegative: Gen = (r) => {
  if (r.chance(0.5)) {
    const a = -r.int(1, 8);
    const b = r.int(1, 8);
    return choiceQ(r, {
      prompt: `At night the temperature is ${fmtNum(a)}°C. At midday it is ${b}°C. Which is COLDER?`,
      correct: `${fmtNum(a)}°C`,
      wrongs: [`${b}°C`],
      hints: ["Below zero means it is freezing. Numbers below zero are negative.", "A negative temperature is colder than a positive one.", `${fmtNum(a)}°C is below 0.`],
      steps: [S("Think of a thermometer", "Zero is the middle. Down is colder."), S("Compare", `${fmtNum(a)}°C is below zero. ${b}°C is above zero. So ${fmtNum(a)}°C is colder.`)],
      skillTag: "fnd.negative",
    });
  }
  const s = r.int(1, 5);
  const d = s + r.int(1, 4);
  return numQ({
    prompt: `On a number line, start at ${s} and move ${d} steps to the LEFT. Which number do you land on?`,
    answer: s - d,
    visual: { type: "numberline", min: -8, max: 8, marks: [s], caption: "Move left to go down." },
    hints: ["Moving left means the number gets smaller.", `First go ${s} steps to reach 0.`, `Then go ${d - s} more steps below zero.`],
    steps: [S("Go to zero", `${s} steps left from ${s} reaches 0.`), S("Keep going", `${d - s} more steps puts you below zero.`, M(`${s} ${"−"} ${d} = ${fmtNum(s - d)}`))],
    skillTag: "fnd.negative",
  });
};

export const genFoundation: Record<string, Gen> = {
  "fnd-times": fndTimes,
  "fnd-division": fndDivision,
  "fnd-place": fndPlace,
  "fnd-fraction-shape": fndFractionShape,
  "fnd-tenths": fndDecimalTenths,
  "fnd-negative": fndNegative,
};