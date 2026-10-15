// Question generators: Numeric patterns, Functions and relationships,
// Algebraic expressions and Algebraic equations.
import type { WorkedStep } from "./curriculumTypes";
import { type Gen, S, M, wr, numQ, choiceQ, exprQ } from "./genKit";
import { fmtNum } from "./mathUtils";

const MINUS = "−";
const coefStr = (a: number, v: string): string => (a === 1 ? v : a === -1 ? `${MINUS}${v}` : `${fmtNum(a)}${v}`);
const addConst = (b: number): string => (b === 0 ? "" : b > 0 ? ` + ${b}` : ` ${MINUS} ${Math.abs(b)}`);
// "3x + 5", "−2x + 7", "x − 4"
const lin = (a: number, b: number, v = "x"): string => `${coefStr(a, v)}${addConst(b)}`;
const ascii = (s: string): string => s.replace(/−/g, "-");
const VARS = ["x", "x", "x", "y", "n", "m"];

// ---------- Numeric patterns ----------

const patSequences: Gen = (r, level) => {
  if (level === "beginner") {
    const a = r.int(1, 20);
    const d = r.int(2, 9);
    const t = [a, a + d, a + 2 * d, a + 3 * d];
    return numQ({
      prompt: `What is the next number in this pattern?\n${M(t.join("; ") + "; ?")}`,
      answer: a + 4 * d,
      hints: ["Look at how much the numbers go up each time.", `${t[1]} − ${t[0]} = ${d}. Is it the same each time?`, `Add ${d} to the last number, ${t[3]}.`],
      steps: [
        S("Find the difference between neighbours", `${t[1]} − ${t[0]} = ${d}, ${t[2]} − ${t[1]} = ${d}, ${t[3]} − ${t[2]} = ${d}.`, undefined, "If the gap is always the same, the pattern adds the same number each time."),
        S("State the rule", `The rule is: add ${d} each time.`),
        S("Find the next term", `${t[3]} + ${d} = ${a + 4 * d}`, M(`${t.join("; ")}; ${a + 4 * d}`)),
      ],
      skillTag: "pat.seq.arith",
    });
  }
  if (level === "intermediate") {
    if (r.chance(0.5)) {
      const d = r.int(3, 8);
      const a = r.int(30, 60);
      const t = [a, a - d, a - 2 * d, a - 3 * d];
      return numQ({
        prompt: `What is the next number in this pattern?\n${M(t.join("; ") + "; ?")}`,
        answer: a - 4 * d,
        hints: ["Are the numbers going up or down?", `${t[0]} → ${t[1]}: the number went DOWN by ${d}.`, `Subtract ${d} from ${t[3]}.`],
        steps: [
          S("Is it going up or down?", "The numbers get smaller, so we subtract."),
          S("Find the difference", `${t[0]} − ${t[1]} = ${d}`),
          S("Find the next term", `${t[3]} − ${d} = ${a - 4 * d}`),
        ],
        skillTag: "pat.seq.decreasing",
      });
    }
    const f = r.pick([2, 3, 4]);
    const a = r.int(1, 5);
    const t = [a, a * f, a * f * f, a * f * f * f];
    return numQ({
      prompt: `What is the next number in this pattern?\n${M(t.join("; ") + "; ?")}`,
      answer: a * Math.pow(f, 4),
      hints: ["Check the difference first. Is it always the same?", `${t[1] - t[0]}, ${t[2] - t[1]}, ${t[3] - t[2]}: the differences are NOT the same. Try dividing instead.`, `${t[1]} ÷ ${t[0]} = ${f}. It multiplies by ${f} each time.`],
      steps: [
        S("Try the difference", `${t[1]} − ${t[0]} = ${t[1] - t[0]} but ${t[2]} − ${t[1]} = ${t[2] - t[1]}. The gaps are different.`),
        S("Try multiplying", `${t[1]} ÷ ${t[0]} = ${f}, ${t[2]} ÷ ${t[1]} = ${f}, ${t[3]} ÷ ${t[2]} = ${f}.`, undefined, "A constant multiplier means this is a geometric pattern."),
        S("Find the next term", `${t[3]} × ${f} = ${a * Math.pow(f, 4)}`),
      ],
      skillTag: "pat.seq.geometric",
    });
  }
  const a = r.int(2, 15);
  const d = r.int(3, 9);
  if (r.chance(0.5)) {
    const t = [a, a + d, null, a + 3 * d, a + 4 * d];
    return numQ({
      prompt: `Find the missing number in the pattern:\n${M(t.map((x) => (x === null ? "?" : x)).join("; "))}`,
      answer: a + 2 * d,
      hints: ["Find the rule from the numbers you can see.", `${t[1]} − ${t[0]} = ${d}`, `The missing number is ${t[1]} + ${d}.`],
      steps: [
        S("Find the rule", `${a + d} − ${a} = ${d}. The rule is add ${d}.`),
        S("Fill the gap", `${a + d} + ${d} = ${a + 2 * d}`),
        S("Check with the next number", `${a + 2 * d} + ${d} = ${a + 3 * d} ✓`),
      ],
      skillTag: "pat.seq.missing",
    });
  }
  const k = r.int(8, 12);
  const terms = Array.from({ length: k }, (_, i) => a + i * d);
  return numQ({
    prompt: `A pattern starts ${M([a, a + d, a + 2 * d].join("; ") + "; ...")} What is the ${k}th number in the pattern?`,
    answer: terms[k - 1],
    hints: [`Find the rule first. The numbers go up by ${d} each time.`, `To get the ${k}th number you add ${d} a total of ${k - 1} times to ${a}.`, `${a} + ${k - 1} × ${d}`],
    steps: [
      S("Find the rule", `Add ${d} each time.`),
      S("How many times do we add?", `The 1st number is ${a}. To get the ${k}th number we add ${d} exactly ${k - 1} times.`),
      S("Calculate", "", M(`${a} + ${k - 1} × ${d} = ${a} + ${(k - 1) * d} = ${terms[k - 1]}`)),
    ],
    wrong: [wr(a + k * d, "pat.offByOne", `The first number is already there, so we only add ${d} ${k - 1} times, not ${k} times.`)],
    skillTag: "pat.seq.nth",
  });
};

const patRules: Gen = (r, level) => {
  if (level === "beginner") {
    const a = r.int(1, 12);
    const d = r.int(2, 9);
    const t = [a, a + d, a + 2 * d, a + 3 * d];
    const rule = (st: number, step: number) => `Start at ${st}. Add ${step} each time.`;
    return choiceQ(r, {
      prompt: `Which rule describes this pattern?\n${M(t.join("; ") + "; ...")}`,
      correct: rule(a, d),
      wrongs: [rule(a, d + 1), rule(a + 1, d), `Start at ${a}. Multiply by ${d} each time.`],
      hints: ["Find how the numbers change from one to the next.", `${t[1]} − ${t[0]} = ?`, `The first number is ${a}. The difference is ${d}.`],
      steps: [S("Find the starting number", `The first number is ${a}.`), S("Find the difference", `${t[1]} − ${t[0]} = ${d}`), S("Write the rule", rule(a, d))],
      skillTag: "pat.rules.describe",
    });
  }
  if (level === "intermediate") {
    const p = r.int(2, 6);
    const q = r.int(-3, 8);
    const k = r.int(6, 12);
    const v = p * k + q;
    return numQ({
      prompt: `The rule for a pattern is ${M(`T_n = ${lin(p, q, "n")}`)}, where n is the position of the term. What is the ${k}th term?`,
      answer: v,
      hints: ["The letter n stands for the position. The 10th term means n = 10.", `Replace n with ${k}.`, `${p} × ${k}${addConst(q)}`],
      steps: [
        S("What does n mean?", `n is the position of the term. We want the ${k}th term, so n = ${k}.`),
        S("Substitute", `Replace n with ${k}.`, M(`T_${k} = ${p} × ${k}${addConst(q)}`)),
        S("Calculate", "Multiply first, then add or subtract.", M(`${p * k}${addConst(q)} = ${v}`)),
      ],
      skillTag: "pat.rules.substitute",
    });
  }
  const d = r.int(2, 7);
  const c = r.int(-4, 6);
  const first = d + c;
  const t = [d * 1 + c, d * 2 + c, d * 3 + c, d * 4 + c];
  return exprQ({
    prompt: `Find the rule for the nth term of this pattern. Write it as an expression in n (for example 3n + 2).\n${M(t.join("; ") + "; ...")}`,
    answer: ascii(lin(d, c, "n")),
    answerText: M(`T_n = ${lin(d, c, "n")}`),
    placeholder: "e.g. 3n + 2",
    hints: ["Find the constant difference. It tells you the number in front of n.", `The difference is ${d}, so the rule starts with ${d}n.`, `Check the 1st term: ${d} × 1 = ${d}. We need ${first}. What must we add or subtract?`],
    steps: [
      S("Find the difference", `${t[1]} − ${t[0]} = ${d}`, undefined, "The difference is the number multiplied by n in the rule."),
      S("Start the rule", `So the rule begins with ${d}n.`, M(`T_n = ${d}n + ...`)),
      S("Test the 1st term", `${d}n gives ${d} when n = 1. The real first term is ${first}.`, M(`${first} − ${d} = ${c}`)),
      S("Complete the rule", "", M(`T_n = ${lin(d, c, "n")}`)),
      S("Check", `n = 2: ${d} × 2${addConst(c)} = ${d * 2 + c} ✓`),
    ],
    skillTag: "pat.rules.findrule",
  });
};

// ---------- Functions and relationships ----------

const funcTables: Gen = (r, level) => {
  if (level === "beginner") {
    const k = r.int(2, 6);
    const c = r.int(1, 9);
    const x = r.int(2, 9);
    return numQ({
      prompt: `A rule says: multiply the input by ${k}, then add ${c}.\nInput: ${x}  →  Output: ?`,
      answer: k * x + c,
      hints: ["An input-output rule is like a machine. Put a number in, follow the steps, and a number comes out.", `Step 1: ${x} × ${k}`, `Step 2: add ${c} to the answer of step 1.`],
      steps: [
        S("Put the input into the machine", `The input is ${x}.`),
        S("Multiply by " + k, `${x} × ${k} = ${x * k}`),
        S("Add " + c, `${x * k} + ${c} = ${x * k + c}`),
        S("Our answer", `The output is ${k * x + c}.`),
      ],
      skillTag: "func.table.output",
    });
  }
  if (level === "intermediate") {
    const k = r.int(2, 5);
    const c = r.int(1, 8);
    const x = r.int(3, 12);
    const y = k * x + c;
    return numQ({
      prompt: `The rule is: output = ${k} × input + ${c}.\nThe output is ${y}. What was the input?`,
      answer: x,
      hints: ["Work BACKWARDS through the machine using opposite operations.", `The last step was + ${c}. The opposite is − ${c}.`, `${y} − ${c} = ${y - c}. Now undo × ${k}.`],
      steps: [
        S("Start from the output", `The output is ${y}.`),
        S("Undo the last step", `The last step was + ${c}, so subtract ${c}.`, M(`${y} − ${c} = ${y - c}`), "Opposite operations take us back to the input."),
        S("Undo the first step", `The first step was × ${k}, so divide by ${k}.`, M(`${y - c} ÷ ${k} = ${x}`)),
        S("Check", `${x} × ${k} + ${c} = ${y} ✓`),
      ],
      skillTag: "func.table.input",
    });
  }
  const k = r.int(2, 5);
  const c = r.int(-3, 6);
  const xs = [1, 2, 3, 4];
  const ys = xs.map((x) => k * x + c);
  const rule = (a: number, b: number) => M(`y = ${lin(a, b, "x")}`);
  return choiceQ(r, {
    prompt: `Which rule matches this table?\n${M("x:  " + xs.join(";  "))}\n${M("y:  " + ys.map((y) => fmtNum(y)).join(";  "))}`,
    correct: rule(k, c),
    wrongs: [rule(k + 1, c), rule(k, c + 1), rule(k - 1 || k + 2, c - 1)],
    hints: ["Look at how much y goes up each time x goes up by 1.", `y goes up by ${k} each time, so the rule contains ${k}x.`, `Test x = 1: ${k} × 1 gives ${k}, but y = ${ys[0]}. What must be added?`],
    steps: [
      S("Find how y changes", `y goes up by ${k} every time x goes up by 1.`),
      S("Use that as the multiplier", `So the rule starts with ${k}x.`),
      S("Test the first row", `${k} × 1 = ${k}, but y = ${fmtNum(ys[0])}.`, M(`${fmtNum(ys[0])} − ${k} = ${fmtNum(c)}`)),
      S("The rule", "", rule(k, c)),
    ],
    skillTag: "func.table.rule",
  });
};

const funcFormula: Gen = (r, level) => {
  if (level === "beginner") {
    const a = r.int(2, 6);
    const b = r.int(-5, 9);
    const x = r.int(2, 9);
    return numQ({
      prompt: `Use the formula ${M(`y = ${lin(a, b, "x")}`)} to find y when x = ${x}.`,
      answer: a * x + b,
      hints: ["Substitute means 'replace the letter with the number'.", `Replace x with ${x}: y = ${a} × ${x}${addConst(b)}`, `Multiply first: ${a} × ${x} = ${a * x}`],
      steps: [
        S("Substitute", `Replace x with ${x}.`, M(`y = ${a} × ${x}${addConst(b)}`)),
        S("Multiply first", `${a} × ${x} = ${a * x}`, M(`y = ${a * x}${addConst(b)}`)),
        S("Add or subtract", "", M(`y = ${a * x + b}`)),
      ],
      skillTag: "func.formula.sub",
    });
  }
  if (level === "intermediate") {
    const base = r.pick([20, 30, 50]);
    const rate = r.pick([5, 8, 10, 12]);
    const km = r.int(3, 12);
    return numQ({
      prompt: `A taxi charges R${base} plus R${rate} for every kilometre. The formula is ${M(`C = ${base} + ${rate}k`)} where k is the number of kilometres. What is the cost for ${km} km?`,
      answer: base + rate * km,
      unit: "rand",
      hints: ["Replace k with the number of kilometres.", `C = ${base} + ${rate} × ${km}`, `Multiply first: ${rate} × ${km} = ${rate * km}`],
      steps: [
        S("Substitute k", `k = ${km}`, M(`C = ${base} + ${rate} × ${km}`)),
        S("Multiply first", `${rate} × ${km} = ${rate * km}`, M(`C = ${base} + ${rate * km}`)),
        S("Add", "", M(`C = ${base + rate * km}`)),
      ],
      skillTag: "func.formula.context",
    });
  }
  if (r.chance(0.5)) {
    const a = r.int(2, 5);
    const b = r.int(1, 9);
    const x = r.int(2, 10);
    const y = a * x + b;
    return numQ({
      prompt: `The formula is ${M(`y = ${lin(a, b, "x")}`)}. If y = ${y}, what is x?`,
      answer: x,
      hints: ["We know y, and we need x. Replace y with the number.", `${y} = ${a}x + ${b}. Now solve for x using opposite operations.`, `Subtract ${b} from both sides, then divide by ${a}.`],
      steps: [
        S("Substitute y", "", M(`${y} = ${a}x + ${b}`)),
        S("Subtract " + b + " from both sides", "", M(`${y - b} = ${a}x`)),
        S("Divide both sides by " + a, "", M(`x = ${x}`)),
        S("Check", `${a} × ${x} + ${b} = ${y} ✓`),
      ],
      skillTag: "func.formula.solve",
    });
  }
  const fee = r.pick([10, 15, 25, 40]);
  const rate = r.pick([4, 6, 8, 12]);
  return exprQ({
    prompt: `A parking garage charges R${fee} to enter plus R${rate} for every hour. Write a formula for the cost C (in rand) if you park for h hours. Type it like C = ... or just the expression in h.`,
    answer: `${fee}+${rate}h`,
    accept: [`C=${fee}+${rate}h`],
    answerText: M(`C = ${fee} + ${rate}h`),
    placeholder: "e.g. 10 + 3h",
    hints: ["Split the cost into a part that never changes and a part that depends on the hours.", `The fixed part is R${fee}. The part that depends on hours is ${rate} × h.`, "Add the two parts together."],
    steps: [
      S("The fixed cost", `You always pay R${fee} to enter.`),
      S("The changing cost", `Each hour costs R${rate}, so h hours cost ${rate}h.`),
      S("Put them together", "", M(`C = ${fee} + ${rate}h`)),
    ],
    skillTag: "func.formula.write",
  });
};

// ---------- Algebraic expressions ----------

const algLanguage: Gen = (r, level) => {
  if (level === "beginner") {
    const v = r.pick(["x", "y", "n"]);
    const a = r.int(2, 9);
    const b = r.int(2, 9);
    if (r.chance(0.5)) {
      return numQ({
        prompt: `In the term ${M(`${a}${v}`)}, what is the coefficient? (The coefficient is the number multiplied by the letter.)`,
        answer: a,
        hints: ["A term is one part of an expression. 7y is a single term.", "The coefficient is the number in front of the letter.", `${a}${v} means ${a} × ${v}.`],
        steps: [S("Look at the term", `${a}${v} means ${a} × ${v}.`), S("Find the number in front", `The number multiplied by ${v} is ${a}.`), S("Our answer", `The coefficient is ${a}.`)],
        skillTag: "alg.lang.coefficient",
      });
    }
    return numQ({
      prompt: `How many TERMS are in this expression?\n${M(`${a}${v} + ${b} − ${v}`)}`,
      answer: 3,
      hints: ["Terms are separated by + and − signs.", "Count the parts between the signs.", `The parts are ${a}${v}, ${b} and ${v}.`],
      steps: [S("Terms are separated by + or −", "", M(`${a}${v}  |  + ${b}  |  − ${v}`)), S("Count them", "There are 3 parts, so 3 terms.")],
      skillTag: "alg.lang.terms",
    });
  }
  if (level === "intermediate") {
    const n = r.int(2, 9);
    const options = [
      { say: `${n} more than a number n`, ex: `n + ${n}`, w: [`${n}n`, `n ${MINUS} ${n}`, `${n} ${MINUS} n`] },
      { say: `${n} less than a number n`, ex: `n ${MINUS} ${n}`, w: [`${n} ${MINUS} n`, `n + ${n}`, `${n}n`] },
      { say: `${n} times a number n`, ex: `${n}n`, w: [`n + ${n}`, `n ${MINUS} ${n}`, `n^${n}`] },
      { say: `a number n divided by ${n}`, ex: `{n/${n}}`, w: [`${n}n`, `{${n}/n}`, `n ${MINUS} ${n}`] },
      { say: `double a number n, then add ${n}`, ex: `2n + ${n}`, w: [`2(n + ${n})`, `n + 2${n}`, `2 + ${n}n`] },
    ];
    const o = r.pick(options);
    return choiceQ(r, {
      prompt: `Which expression means "${o.say}"?`,
      correct: M(o.ex),
      wrongs: o.w.map((w) => M(w)),
      hints: ["Replace each word with a maths symbol: 'more than' → +, 'less than' → −, 'times' → ×, 'divided by' → ÷.", "Be careful with 'less than': 5 less than n is n − 5 (not 5 − n).", `The number is n, and the amount is ${n}.`],
      steps: [
        S("Spot the key words", `"${o.say}"`),
        S("Translate", "Turn each word into a symbol.", M(o.ex)),
      ],
      skillTag: "alg.lang.translate",
    });
  }
  const x = r.pick(["x", "n", "a"]);
  const w = r.int(2, 6);
  const k = r.int(1, 6);
  return exprQ({
    prompt: `A rectangle has a length of ${M(`${x} + ${k}`)} cm and a width of ${w} cm. Write an expression for its PERIMETER. Simplify it.`,
    answer: `${2 * w + 2 * k + 0}+${2}${x}`,
    answerText: M(`${2}${x} + ${2 * k + 2 * w}`),
    placeholder: "e.g. 2x + 10",
    hints: ["Perimeter is the distance all the way round: length + width + length + width.", `(${x} + ${k}) + ${w} + (${x} + ${k}) + ${w}`, "Collect the like terms: add the letters together and the numbers together."],
    steps: [
      S("Write the perimeter", "Add all four sides.", M(`(${x} + ${k}) + ${w} + (${x} + ${k}) + ${w}`)),
      S("Collect like terms", `The letters: ${x} + ${x} = 2${x}. The numbers: ${k} + ${w} + ${k} + ${w} = ${2 * k + 2 * w}.`),
      S("Our answer", "", M(`2${x} + ${2 * k + 2 * w}`)),
    ],
    skillTag: "alg.lang.perimeter",
  });
};

const algLike: Gen = (r, level) => {
  const v = r.pick(["x", "a", "y"]);
  if (level === "beginner") {
    const a = r.int(2, 9);
    const b = r.int(2, 9);
    const sub = r.chance(0.4) && a > b;
    const res = sub ? a - b : a + b;
    return exprQ({
      prompt: `Simplify:\n${M(`${a}${v} ${sub ? MINUS : "+"} ${b}${v}`)}`,
      answer: `${res}${v}`,
      hints: ["Like terms have the SAME letter. We can add or subtract them.", `Think of ${v} as an object. ${a} objects ${sub ? "take away" : "plus"} ${b} objects.`, `${a} ${sub ? "−" : "+"} ${b} = ${res}`],
      steps: [
        S("Check they are like terms", `Both terms have the letter ${v}, so they are like terms.`, undefined, "Only like terms can be combined, just like 3 apples + 2 apples = 5 apples."),
        S("Add or subtract the coefficients", `${a} ${sub ? "−" : "+"} ${b} = ${res}`),
        S("Keep the letter", "", M(`${a}${v} ${sub ? MINUS : "+"} ${b}${v} = ${res}${v}`)),
      ],
      wrong: [wr(`${res}${v}^2`, "alg.like.squares", `When we add like terms the letter stays the same (${res}${v}). We do not multiply the letters.`)],
      skillTag: "alg.like.basic",
    });
  }
  if (level === "intermediate") {
    const a = r.int(2, 8);
    const b = r.int(1, 9);
    const c = r.int(1, 7);
    const d = r.int(1, 8);
    const resX = a + c;
    const resC = b - d;
    return exprQ({
      prompt: `Simplify:\n${M(`${a}${v} + ${b} + ${c}${v} ${MINUS} ${d}`)}`,
      answer: `${resX}${v}${resC >= 0 ? "+" : ""}${resC}`,
      answerText: M(`${resX}${v}${resC === 0 ? "" : resC > 0 ? ` + ${resC}` : ` ${MINUS} ${Math.abs(resC)}`}`),
      hints: ["Group the terms with the same letter, and the plain numbers, together.", `Letters: ${a}${v} + ${c}${v}. Numbers: ${b} ${MINUS} ${d}.`, `${a} + ${c} = ${resX} and ${b} ${MINUS} ${d} = ${resC}`],
      steps: [
        S("Spot the like terms", `${a}${v} and ${c}${v} are like terms. ${b} and ${MINUS}${d} are like terms (plain numbers).`),
        S("Combine the letter terms", `${a}${v} + ${c}${v} = ${resX}${v}`),
        S("Combine the numbers", `${b} ${MINUS} ${d} = ${resC}`),
        S("Put it together", "", M(`${resX}${v}${resC === 0 ? "" : resC > 0 ? ` + ${resC}` : ` ${MINUS} ${Math.abs(resC)}`}`)),
      ],
      skillTag: "alg.like.mixed",
    });
  }
  const a = r.int(3, 9);
  const b = r.int(2, 8);
  const c = r.int(1, a - 1);
  const d = r.int(1, 7);
  const e = r.int(1, 9);
  const rx = a - c;
  const rb = b + d;
  return exprQ({
    prompt: `Simplify:\n${M(`${a}x + ${b}y ${MINUS} ${c}x + ${d}y ${MINUS} ${e}`)}`,
    answer: `${rx === 1 ? "" : rx}x+${rb}y-${e}`,
    answerText: M(`${rx === 1 ? "" : rx}x + ${rb}y ${MINUS} ${e}`),
    hints: ["There are three kinds of terms here: x-terms, y-terms and plain numbers.", `x-terms: ${a}x ${MINUS} ${c}x. y-terms: ${b}y + ${d}y.`, `Plain number: ${MINUS}${e}.`],
    steps: [
      S("Sort the terms", `x-terms: ${a}x and ${MINUS}${c}x.  y-terms: ${b}y and ${d}y.  Number: ${MINUS}${e}.`),
      S("Combine the x-terms", `${a}x ${MINUS} ${c}x = ${rx === 1 ? "" : rx}x`),
      S("Combine the y-terms", `${b}y + ${d}y = ${rb}y`),
      S("Put it together", "", M(`${rx === 1 ? "" : rx}x + ${rb}y ${MINUS} ${e}`)),
    ],
    skillTag: "alg.like.twovars",
  });
};

const algSub: Gen = (r, level) => {
  if (level === "beginner") {
    const a = r.int(2, 7);
    const b = r.int(1, 9);
    const x = r.int(2, 8);
    return numQ({
      prompt: `If x = ${x}, calculate:\n${M(`${a}x + ${b}`)}`,
      answer: a * x + b,
      hints: ["Substitute means replace the letter with the number.", `${a}x means ${a} × x, so it becomes ${a} × ${x}.`, `${a} × ${x} = ${a * x}. Now add ${b}.`],
      steps: [
        S("Replace x with the number", `${a}x means ${a} × x.`, M(`${a} × ${x} + ${b}`)),
        S("Multiply first", `${a} × ${x} = ${a * x}`),
        S("Then add", "", M(`${a * x} + ${b} = ${a * x + b}`)),
      ],
      skillTag: "alg.sub.basic",
    });
  }
  if (level === "intermediate") {
    const a = r.int(2, 6);
    const b = r.int(1, 9);
    const x = -r.int(1, 6);
    if (r.chance(0.5)) {
      return numQ({
        prompt: `If x = ${fmtNum(x)}, calculate:\n${M(`${a}x + ${b}`)}`,
        answer: a * x + b,
        hints: ["Put the negative number in a bracket when you substitute.", `${a}(${fmtNum(x)}) + ${b}`, `${a} × ${fmtNum(x)} = ${fmtNum(a * x)} (positive × negative = negative).`],
        steps: [
          S("Substitute with brackets", "A bracket keeps the negative sign safe.", M(`${a}(${fmtNum(x)}) + ${b}`)),
          S("Multiply", `${a} × ${fmtNum(x)} = ${fmtNum(a * x)}`, M(`${fmtNum(a * x)} + ${b}`)),
          S("Add", "", M(`${fmtNum(a * x)} + ${b} = ${fmtNum(a * x + b)}`)),
        ],
        skillTag: "alg.sub.negative",
      });
    }
    const x2 = r.int(-5, 5) || 3;
    return numQ({
      prompt: `If x = ${fmtNum(x2)}, calculate:\n${M(`x^2 + ${a}x`)}`,
      answer: x2 * x2 + a * x2,
      hints: ["x^2 means x × x. Substitute with brackets.", `(${fmtNum(x2)})^2 = ${fmtNum(x2)} × ${fmtNum(x2)}`, `A negative times a negative is positive.`],
      steps: [
        S("Substitute with brackets", "", M(`(${fmtNum(x2)})^2 + ${a}(${fmtNum(x2)})`)),
        S("Powers first", `(${fmtNum(x2)}) × (${fmtNum(x2)}) = ${x2 * x2}`),
        S("Multiply next", `${a} × ${fmtNum(x2)} = ${fmtNum(a * x2)}`),
        S("Add", "", M(`${x2 * x2} + ${a * x2 < 0 ? "(" + fmtNum(a * x2) + ")" : a * x2} = ${fmtNum(x2 * x2 + a * x2)}`)),
      ],
      skillTag: "alg.sub.square",
    });
  }
  const a = r.int(-4, 5) || 2;
  const b = r.int(-4, 4) || -3;
  const res = 2 * a * a - b + a * b;
  return numQ({
    prompt: `If a = ${fmtNum(a)} and b = ${fmtNum(b)}, calculate:\n${M(`2a^2 ${MINUS} b + ab`)}`,
    answer: res,
    hints: ["Substitute both letters using brackets.", `2(${fmtNum(a)})^2 ${MINUS} (${fmtNum(b)}) + (${fmtNum(a)})(${fmtNum(b)})`, `Powers first: (${fmtNum(a)})^2 = ${a * a}.`],
    steps: [
      S("Substitute with brackets", "", M(`2(${fmtNum(a)})^2 ${MINUS} (${fmtNum(b)}) + (${fmtNum(a)})(${fmtNum(b)})`)),
      S("Powers first", `(${fmtNum(a)})^2 = ${a * a}, so 2 × ${a * a} = ${2 * a * a}`),
      S("Subtracting a negative?", `${MINUS}(${fmtNum(b)}) = ${fmtNum(-b)}`, undefined, "Subtracting a negative number is the same as adding a positive number."),
      S("Multiply the last term", `(${fmtNum(a)})(${fmtNum(b)}) = ${fmtNum(a * b)}`),
      S("Add everything", "", M(`${2 * a * a} + ${br0(-b)} + ${br0(a * b)} = ${fmtNum(res)}`)),
    ],
    skillTag: "alg.sub.twovars",
  });
};
const br0 = (n: number): string => (n < 0 ? `(${fmtNum(n)})` : String(n));

const algExpand: Gen = (r, level) => {
  const v = r.pick(["x", "y", "a"]);
  if (level === "beginner") {
    if (r.chance(0.5)) {
      const a = r.int(2, 7);
      const b = r.int(2, 7);
      return exprQ({
        prompt: `Simplify:\n${M(`${a} × ${b}${v}`)}`,
        answer: `${a * b}${v}`,
        hints: ["Multiply the numbers together. The letter just stays.", `${a} × ${b} = ${a * b}`, `The answer is ${a * b} with the letter ${v}.`],
        steps: [S("Multiply the numbers", `${a} × ${b} = ${a * b}`), S("Keep the letter", "", M(`${a} × ${b}${v} = ${a * b}${v}`))],
        skillTag: "alg.expand.monomial",
      });
    }
    const a = r.int(2, 6);
    const b = r.int(2, 6);
    return exprQ({
      prompt: `Simplify:\n${M(`${a}${v} × ${b}${v}`)}`,
      answer: `${a * b}${v}^2`,
      answerText: M(`${a * b}${v}^2`),
      placeholder: `e.g. 6${v}^2`,
      hints: ["Multiply the numbers. Then multiply the letters: x × x = x².", `${a} × ${b} = ${a * b}`, `${v} × ${v} = ${v}^2`],
      steps: [
        S("Multiply the numbers", `${a} × ${b} = ${a * b}`),
        S("Multiply the letters", `${v} × ${v} = ${v}^2`, undefined, `${v}^2 is just a short way to write ${v} × ${v}.`),
        S("Put together", "", M(`${a}${v} × ${b}${v} = ${a * b}${v}^2`)),
      ],
      skillTag: "alg.expand.monomial2",
    });
  }
  if (level === "intermediate") {
    const a = r.int(2, 7);
    const b = r.int(1, 9);
    return exprQ({
      prompt: `Expand (remove the brackets):\n${M(`${a}(${v} + ${b})`)}`,
      answer: `${a}${v}+${a * b}`,
      answerText: M(`${a}${v} + ${a * b}`),
      hints: ["The number outside the bracket multiplies EVERY term inside.", `${a} × ${v} and ${a} × ${b}`, `${a} × ${b} = ${a * b}`],
      steps: [
        S("Multiply the first term", `${a} × ${v} = ${a}${v}`, undefined, "The distributive property: the number outside multiplies each term inside."),
        S("Multiply the second term", `${a} × ${b} = ${a * b}`),
        S("Put together", "", M(`${a}(${v} + ${b}) = ${a}${v} + ${a * b}`)),
      ],
      wrong: [wr(`${a}${v}+${b}`, "alg.expand.forgotSecond", `The ${a} must multiply BOTH terms in the bracket, not just the first one.`)],
      skillTag: "alg.expand.bracket",
    });
  }
  const a = r.int(2, 6);
  const b = r.int(2, 6);
  const c = r.int(1, 8);
  const sign = r.chance(0.5) ? -1 : 1;
  const A = sign * a;
  const second = -A * c;
  if (r.chance(0.5)) {
    return exprQ({
      prompt: `Expand:\n${M(`${sign < 0 ? MINUS : ""}${a}(${b}${v} ${MINUS} ${c})`)}`,
      answer: `${A * b}${v}${second >= 0 ? "+" : ""}${second}`,
      answerText: M(`${fmtNum(A * b)}${v}${second > 0 ? ` + ${second}` : ` ${MINUS} ${Math.abs(second)}`}`),
      hints: ["Multiply each term inside the bracket by the number outside. Watch the signs!", `${fmtNum(A)} × ${b}${v} = ${fmtNum(A * b)}${v}`, `${fmtNum(A)} × (${MINUS}${c}) = ${fmtNum(second)}`],
      steps: [
        S("First term", `${fmtNum(A)} × ${b}${v} = ${fmtNum(A * b)}${v}`),
        S("Second term", `${fmtNum(A)} × (${MINUS}${c}) = ${fmtNum(second)}`, undefined, sign < 0 ? "Negative × negative = positive." : "Positive × negative = negative."),
        S("Put together", "", M(`${fmtNum(A * b)}${v}${second > 0 ? ` + ${second}` : ` ${MINUS} ${Math.abs(second)}`}`)),
      ],
      skillTag: "alg.expand.negative",
    });
  }
  const n = r.int(2, 7);
  return exprQ({
    prompt: `Expand:\n${M(`${v}(${v} + ${n})`)}`,
    answer: `${v}^2+${n}${v}`,
    answerText: M(`${v}^2 + ${n}${v}`),
    placeholder: `e.g. ${v}^2 + 3${v}`,
    hints: [`${v} multiplies each term inside the bracket.`, `${v} × ${v} = ${v}^2`, `${v} × ${n} = ${n}${v}`],
    steps: [
      S("First term", `${v} × ${v} = ${v}^2`),
      S("Second term", `${v} × ${n} = ${n}${v}`),
      S("Put together", "", M(`${v}(${v} + ${n}) = ${v}^2 + ${n}${v}`)),
    ],
    skillTag: "alg.expand.xbracket",
  });
};

// ---------- Algebraic equations ----------

const pad = (n: number): string => (n < 0 ? `(${fmtNum(n)})` : fmtNum(n));

// Detailed steps for  a·v + b = c  (the style Judah's parent asked for)
const twoStepSteps = (a: number, b: number, c: number, x: number, v: string): WorkedStep[] => {
  const eq = lin(a, b, v);
  const c2 = c - b;
  const bAdded = b > 0;
  return [
    S("STEP 1: Understand what we are looking at", `We have an equation. The letter ${v} stands for a number we don't know yet. Our job is to find out what that number is.`, M(`${eq} = ${c}`), "An equation is like a balanced scale: both sides are equal."),
    S(
      `STEP 2: Look at the ${bAdded ? "+" : MINUS}${Math.abs(b)}`,
      `We want ${v} by itself. At the moment, ${Math.abs(b)} is being ${bAdded ? "added to" : "subtracted from"} ${coefStr(a, v)}. To remove it, we do the OPPOSITE operation. The opposite of ${bAdded ? "adding" : "subtracting"} ${Math.abs(b)} is ${bAdded ? "subtracting" : "adding"} ${Math.abs(b)}. So we ${bAdded ? "subtract" : "add"} ${Math.abs(b)} ${bAdded ? "from" : "to"} BOTH sides.`,
      M(`${eq} ${bAdded ? MINUS : "+"} ${Math.abs(b)} = ${c} ${bAdded ? MINUS : "+"} ${Math.abs(b)}`),
      "Whatever we do to one side we must do to the other side, to keep the scale balanced.",
      { prompt: `What is ${c} ${bAdded ? "−" : "+"} ${Math.abs(b)}?`, answer: String(c2) }
    ),
    S("STEP 3: Simplify", `The ${bAdded ? "+" : MINUS}${Math.abs(b)} and ${bAdded ? MINUS : "+"}${Math.abs(b)} cancel each other out. We are left with:`, M(`${coefStr(a, v)} = ${fmtNum(c2)}`)),
    S(
      `STEP 4: Get ${v} by itself`,
      a === 1 ? `${v} is already by itself.` : `${coefStr(a, v)} means ${fmtNum(a)} multiplied by ${v}. The opposite of multiplying by ${fmtNum(a)} is dividing by ${fmtNum(a)}. Divide BOTH sides by ${fmtNum(a)}.`,
      a === 1 ? undefined : M(`${coefStr(a, v)} ÷ ${pad(a)} = ${fmtNum(c2)} ÷ ${pad(a)}`),
      undefined,
      a === 1 ? undefined : { prompt: `What is ${fmtNum(c2)} ÷ ${pad(a)}?`, answer: String(x) }
    ),
    S("STEP 5: Our answer", "", M(`${v} = ${fmtNum(x)}`)),
    S("STEP 6: Let's check", `Put ${fmtNum(x)} back into the ORIGINAL equation.`, M(`${a === 1 ? "" : `${pad(a)}`}(${fmtNum(x)})${addConst(b)} = ${fmtNum(a * x)}${addConst(b)} = ${fmtNum(c)}`), `${fmtNum(c)} = ${fmtNum(c)}, so we got it right!`),
  ];
};

const eqOneStep: Gen = (r, level) => {
  const v = r.pick(VARS);
  if (level === "beginner") {
    const x = r.int(2, 15);
    const k = r.int(2, 12);
    const plus = r.chance(0.5);
    const c = plus ? x + k : x - k;
    if (!plus && c < 1) return eqOneStep(r, level);
    return numQ({
      prompt: `Solve for ${v}:\n${M(`${v} ${plus ? "+" : MINUS} ${k} = ${c}`)}`,
      answer: x,
      visual: { type: "balance", left: `${v} ${plus ? "+" : "−"} ${k}`, right: String(c), caption: "Keep the scale balanced: do the same thing to both sides." },
      hints: ["We want the letter on its own. What is being done to it?", plus ? `${k} is being ADDED. The opposite of adding is subtracting.` : `${k} is being SUBTRACTED. The opposite of subtracting is adding.`, `${plus ? "Subtract" : "Add"} ${k} on BOTH sides.`],
      steps: [
        S("STEP 1: Understand what we are looking at", `The letter ${v} is a number we don't know yet. We must find it.`, M(`${v} ${plus ? "+" : MINUS} ${k} = ${c}`)),
        S(`STEP 2: Look at the ${plus ? "+" : MINUS}${k}`, `${k} is being ${plus ? "added to" : "subtracted from"} ${v}. The opposite of ${plus ? "adding" : "subtracting"} ${k} is ${plus ? "subtracting" : "adding"} ${k}. We do it to BOTH sides.`, M(`${v} ${plus ? "+" : MINUS} ${k} ${plus ? MINUS : "+"} ${k} = ${c} ${plus ? MINUS : "+"} ${k}`), "Both sides must stay equal.", { prompt: `What is ${c} ${plus ? "−" : "+"} ${k}?`, answer: String(x) }),
        S("STEP 3: Our answer", `The ${plus ? "+" : MINUS}${k} and ${plus ? MINUS : "+"}${k} cancel on the left.`, M(`${v} = ${x}`)),
        S("STEP 4: Let's check", `Put ${x} back into the original equation.`, M(`${x} ${plus ? "+" : MINUS} ${k} = ${c}`), `${c} = ${c} ✓ We got it right!`),
      ],
      wrong: [wr(plus ? c + k : c - k, "eq.wrongInverse", `It looks like the SAME operation was used instead of the OPPOSITE. Since ${k} is being ${plus ? "added" : "subtracted"}, we ${plus ? "subtract" : "add"} to undo it.`)],
      skillTag: "eq.one.addsub",
    });
  }
  if (level === "intermediate") {
    const x = r.int(2, 12);
    const k = r.int(2, 9);
    if (r.chance(0.5)) {
      return numQ({
        prompt: `Solve for ${v}:\n${M(`${k}${v} = ${k * x}`)}`,
        answer: x,
        visual: { type: "balance", left: `${k}${v}`, right: String(k * x) },
        hints: [`${k}${v} means ${k} × ${v}. What is the opposite of multiplying?`, `The opposite of × ${k} is ÷ ${k}.`, `Divide BOTH sides by ${k}.`],
        steps: [
          S("STEP 1: Understand", `${k}${v} means ${k} × ${v}.`, M(`${k}${v} = ${k * x}`)),
          S("STEP 2: Do the opposite", `The opposite of multiplying by ${k} is dividing by ${k}. Divide BOTH sides by ${k}.`, M(`${k}${v} ÷ ${k} = ${k * x} ÷ ${k}`), undefined, { prompt: `What is ${k * x} ÷ ${k}?`, answer: String(x) }),
          S("STEP 3: Our answer", "", M(`${v} = ${x}`)),
          S("STEP 4: Let's check", "", M(`${k} × ${x} = ${k * x}`), "Both sides are equal ✓"),
        ],
        wrong: [wr(k * x - k, "eq.wrongInverse", `Subtracting ${k} does not undo multiplying by ${k}. The opposite of multiplying is DIVIDING.`)],
        skillTag: "eq.one.mul",
      });
    }
    return numQ({
      prompt: `Solve for ${v}:\n${M(`{${v}/${k}} = ${x}`)}`,
      answer: x * k,
      hints: [`{${v}/${k}} means ${v} ÷ ${k}. What is the opposite of dividing?`.replace(/\{|\}/g, ""), `The opposite of ÷ ${k} is × ${k}.`, `Multiply BOTH sides by ${k}.`],
      steps: [
        S("STEP 1: Understand", `${v} ÷ ${k} = ${x}`, M(`{${v}/${k}} = ${x}`)),
        S("STEP 2: Do the opposite", `The opposite of dividing by ${k} is multiplying by ${k}. Multiply BOTH sides by ${k}.`, M(`{${v}/${k}} × ${k} = ${x} × ${k}`), undefined, { prompt: `What is ${x} × ${k}?`, answer: String(x * k) }),
        S("STEP 3: Our answer", "", M(`${v} = ${x * k}`)),
        S("STEP 4: Let's check", "", M(`${x * k} ÷ ${k} = ${x}`), "Both sides are equal ✓"),
      ],
      skillTag: "eq.one.div",
    });
  }
  const x = r.int(-12, 12) || 5;
  const v2 = r.pick(["m", "x", "y"]);
  if (r.chance(0.5)) {
    const k = r.int(2, 6);
    return numQ({
      prompt: `Solve for ${v2}:\n${M(`${MINUS}${k}${v2} = ${fmtNum(-k * x)}`)}`,
      answer: x,
      hints: [`${MINUS}${k}${v2} means ${fmtNum(-k)} × ${v2}. Divide both sides by ${fmtNum(-k)}.`, `Watch the signs: ${fmtNum(-k * x)} ÷ ${fmtNum(-k)}`, "Same signs → positive answer. Different signs → negative answer."],
      steps: [
        S("STEP 1: Understand", `${MINUS}${k}${v2} means ${fmtNum(-k)} × ${v2}.`, M(`${MINUS}${k}${v2} = ${fmtNum(-k * x)}`)),
        S("STEP 2: Do the opposite", `Divide BOTH sides by ${fmtNum(-k)}.`, M(`{${MINUS}${k}${v2}/${MINUS}${k}} = {${fmtNum(-k * x)}/${MINUS}${k}}`), "A negative divided by a negative is positive.", { prompt: `What is ${fmtNum(-k * x)} ÷ (${fmtNum(-k)})?`, answer: String(x) }),
        S("STEP 3: Our answer", "", M(`${v2} = ${fmtNum(x)}`)),
        S("STEP 4: Let's check", "", M(`${fmtNum(-k)} × (${fmtNum(x)}) = ${fmtNum(-k * x)}`), "Both sides are equal ✓"),
      ],
      skillTag: "eq.one.negative",
    });
  }
  const k = r.int(2, 12);
  const c = x + k;
  return numQ({
    prompt: `Solve for ${v2}:\n${M(`${v2} + ${k} = ${fmtNum(c)}`)}`,
    answer: x,
    hints: [`Subtract ${k} from BOTH sides.`, `${fmtNum(c)} ${MINUS} ${k} = ?`, c < k ? "Careful: you may land on a negative number." : "Check by putting your answer back in."],
    steps: [
      S("STEP 1: Understand", "", M(`${v2} + ${k} = ${fmtNum(c)}`)),
      S("STEP 2: Do the opposite", `Subtract ${k} from BOTH sides.`, M(`${v2} + ${k} ${MINUS} ${k} = ${fmtNum(c)} ${MINUS} ${k}`), undefined, { prompt: `What is ${fmtNum(c)} − ${k}?`, answer: String(x) }),
      S("STEP 3: Our answer", "", M(`${v2} = ${fmtNum(x)}`)),
      S("STEP 4: Let's check", "", M(`${fmtNum(x)} + ${k} = ${fmtNum(c)}`), "Both sides are equal ✓"),
    ],
    skillTag: "eq.one.negativeAnswer",
  });
};

const eqTwoStep: Gen = (r, level) => {
  const v = r.pick(["x", "x", "x", "y", "n"]);
  if (level === "beginner") {
    const a = r.int(2, 9);
    const b = r.int(1, 12);
    const x = r.int(1, 12);
    const c = a * x + b;
    return numQ({
      prompt: `Solve for ${v}:\n${M(`${lin(a, b, v)} = ${c}`)}`,
      answer: x,
      visual: { type: "balance", left: lin(a, b, v).replace(/−/g, "−"), right: String(c), caption: "Undo the +, then undo the ×." },
      hints: ["Two things are happening to the letter. We undo them one at a time, in REVERSE order.", `First undo the + ${b} by subtracting ${b} from both sides.`, `That gives ${a}${v} = ${c - b}. Now divide both sides by ${a}.`],
      steps: twoStepSteps(a, b, c, x, v),
      wrong: [wr(c - b, "eq.stoppedEarly", `${c - b} is the answer to STEP 3 (${a}${v} = ${c - b}). We still need to divide both sides by ${a} to get ${v} on its own.`), wr(Math.round((c / a) * 100) / 100 - b, "eq.wrongOrder", `It looks like we divided before dealing with the +${b}. Undo the ${b} first, THEN divide.`)],
      skillTag: "eq.two.basic",
    });
  }
  if (level === "intermediate") {
    const t = r.pick(["minus", "neg", "div"] as const);
    if (t === "minus") {
      const a = r.int(2, 8);
      const b = -r.int(1, 12);
      const x = r.int(2, 12);
      const c = a * x + b;
      return numQ({
        prompt: `Solve for ${v}:\n${M(`${lin(a, b, v)} = ${c}`)}`,
        answer: x,
        visual: { type: "balance", left: lin(a, b, v), right: String(c) },
        hints: ["The number is being SUBTRACTED, so the opposite is ADDING.", `Add ${Math.abs(b)} to BOTH sides first.`, `${c} + ${Math.abs(b)} = ${c - b}. Now divide by ${a}.`],
        steps: twoStepSteps(a, b, c, x, v),
        wrong: [wr(c - b, "eq.stoppedEarly", `${c - b} is only halfway: ${a}${v} = ${c - b}. Now divide both sides by ${a}.`)],
        skillTag: "eq.two.minus",
      });
    }
    if (t === "neg") {
      const a = -r.int(2, 6);
      const b = r.int(2, 12);
      const x = r.int(-5, 8);
      const c = a * x + b;
      return numQ({
        prompt: `Solve for ${v}:\n${M(`${lin(a, b, v)} = ${fmtNum(c)}`)}`,
        answer: x,
        hints: ["Undo the + first (subtract from both sides).", `That leaves ${coefStr(a, v)} = ${fmtNum(c - b)}.`, `Divide both sides by ${fmtNum(a)}. Watch the signs!`],
        steps: twoStepSteps(a, b, c, x, v),
        skillTag: "eq.two.negative",
      });
    }
    const d = r.int(2, 6);
    const x = r.int(2, 9) * d;
    const b = r.int(1, 9);
    const c = x / d + b;
    return numQ({
      prompt: `Solve for ${v}:\n${M(`{${v}/${d}} + ${b} = ${c}`)}`,
      answer: x,
      hints: [`First deal with the + ${b}: subtract ${b} from both sides.`, `That gives {${v}/${d}} = ${c - b}`.replace(/\{|\}/g, ""), `Then multiply both sides by ${d}.`],
      steps: [
        S("STEP 1: Understand", `${v} ÷ ${d}, then add ${b}, gives ${c}.`, M(`{${v}/${d}} + ${b} = ${c}`)),
        S("STEP 2: Undo the + " + b, `Subtract ${b} from BOTH sides.`, M(`{${v}/${d}} = ${c} ${MINUS} ${b} = ${c - b}`), undefined, { prompt: `What is ${c} − ${b}?`, answer: String(c - b) }),
        S("STEP 3: Undo the ÷ " + d, `The opposite of dividing by ${d} is multiplying by ${d}. Multiply BOTH sides by ${d}.`, M(`${v} = ${c - b} × ${d} = ${x}`)),
        S("STEP 4: Let's check", "", M(`{${x}/${d}} + ${b} = ${x / d} + ${b} = ${c}`), "Both sides are equal ✓"),
      ],
      skillTag: "eq.two.division",
    });
  }
  const t = r.pick(["bracket", "bothsides"] as const);
  if (t === "bracket") {
    const a = r.int(2, 6);
    const b = r.int(1, 9);
    const x = r.int(1, 10);
    const c = a * (x + b);
    return numQ({
      prompt: `Solve for ${v}:\n${M(`${a}(${v} + ${b}) = ${c}`)}`,
      answer: x,
      hints: [`The whole bracket is multiplied by ${a}. Undo that first by dividing both sides by ${a}.`, `${c} ÷ ${a} = ${c / a}, so ${v} + ${b} = ${c / a}.`, `Now subtract ${b} from both sides.`],
      steps: [
        S("STEP 1: Understand", `${a} multiplies everything inside the bracket.`, M(`${a}(${v} + ${b}) = ${c}`)),
        S("STEP 2: Divide both sides by " + a, `The opposite of multiplying by ${a} is dividing by ${a}.`, M(`${v} + ${b} = ${c} ÷ ${a} = ${c / a}`), undefined, { prompt: `What is ${c} ÷ ${a}?`, answer: String(c / a) }),
        S("STEP 3: Subtract " + b + " from both sides", "", M(`${v} = ${c / a} ${MINUS} ${b} = ${x}`)),
        S("STEP 4: Let's check", "", M(`${a}(${x} + ${b}) = ${a} × ${x + b} = ${c}`), "Both sides are equal ✓"),
      ],
      skillTag: "eq.two.bracket",
    });
  }
  const x = r.int(1, 9);
  const c1 = r.int(1, 4);
  const a = c1 + r.int(1, 4);
  const b = r.int(1, 8);
  const d = a * x + b - c1 * x;
  return numQ({
    prompt: `Solve for ${v}:\n${M(`${a}${v} + ${b} = ${c1 === 1 ? "" : c1}${v} + ${d}`)}`,
    answer: x,
    hints: ["The letter is on BOTH sides. Collect the letters on one side first.", `Subtract ${c1 === 1 ? "" : c1}${v} from both sides.`, `Then you have ${a - c1 === 1 ? "" : a - c1}${v} + ${b} = ${d}. Continue as a normal two-step equation.`],
    steps: [
      S("STEP 1: Understand", "The letter appears on both sides. We collect the letters on one side.", M(`${a}${v} + ${b} = ${c1 === 1 ? "" : c1}${v} + ${d}`)),
      S("STEP 2: Subtract " + (c1 === 1 ? "" : c1) + v + " from both sides", "", M(`${a - c1 === 1 ? "" : a - c1}${v} + ${b} = ${d}`)),
      S("STEP 3: Subtract " + b + " from both sides", "", M(`${a - c1 === 1 ? "" : a - c1}${v} = ${d - b}`)),
      S("STEP 4: Divide both sides by " + (a - c1), "", M(`${v} = ${x}`)),
      S("STEP 5: Let's check", "", M(`${a}(${x}) + ${b} = ${a * x + b}  and  ${c1}(${x}) + ${d} = ${c1 * x + d}`), "Both sides are equal ✓"),
    ],
    skillTag: "eq.two.bothsides",
  });
};

const eqWords: Gen = (r, level) => {
  if (level === "beginner") {
    const x = r.int(3, 15);
    const k = r.int(2, 9);
    const plus = r.chance(0.6);
    const c = plus ? x + k : x - k;
    if (c < 1) return eqWords(r, level);
    return numQ({
      prompt: `I think of a number. I ${plus ? "add" : "subtract"} ${k} and I get ${c}. What is my number?`,
      answer: x,
      hints: ["Use a letter for the number you don't know, like n.", `Write it as an equation: n ${plus ? "+" : "−"} ${k} = ${c}`, `Undo the ${plus ? "adding" : "subtracting"} by ${plus ? "subtracting" : "adding"} ${k}.`],
      steps: [
        S("Choose a letter", "Let n be my number."),
        S("Write the equation", `"I ${plus ? "add" : "subtract"} ${k} and get ${c}"`, M(`n ${plus ? "+" : MINUS} ${k} = ${c}`)),
        S("Solve", `Do the opposite on both sides.`, M(`n = ${c} ${plus ? MINUS : "+"} ${k} = ${x}`)),
        S("Check", "", M(`${x} ${plus ? "+" : MINUS} ${k} = ${c}`), "✓"),
      ],
      skillTag: "eq.words.simple",
    });
  }
  if (level === "intermediate") {
    const price = r.int(4, 15);
    const extra = r.int(3, 20);
    const n = r.int(2, 6);
    const total = n * price + extra;
    return numQ({
      prompt: `${n} notebooks and a pen that costs R${extra} cost R${total} altogether. What is the price of ONE notebook?`,
      answer: price,
      unit: "rand",
      hints: ["Let the price of one notebook be n. Write an equation for the total cost.", `${n}n + ${extra} = ${total}`, `Subtract ${extra} from both sides, then divide by ${n}.`],
      steps: [
        S("Choose a letter", "Let n be the price of one notebook (in rand)."),
        S("Write the equation", `${n} notebooks cost ${n}n. Add the pen.`, M(`${n}n + ${extra} = ${total}`)),
        S("Subtract " + extra + " from both sides", "", M(`${n}n = ${total - extra}`)),
        S("Divide both sides by " + n, "", M(`n = ${price}`)),
        S("Check", `${n} × ${price} + ${extra} = ${total} ✓`),
      ],
      skillTag: "eq.words.shopping",
    });
  }
  if (r.chance(0.5)) {
    const w = r.int(3, 12);
    const l = w + r.int(2, 10);
    const P = 2 * (l + w);
    return numQ({
      prompt: `A rectangle has a perimeter of ${P} cm and a width of ${w} cm. What is its length?`,
      answer: l,
      unit: "cm",
      hints: ["Perimeter = 2 × (length + width). Use l for the length.", `2(l + ${w}) = ${P}`, `Divide both sides by 2 first.`],
      steps: [
        S("Write the equation", "Perimeter of a rectangle = 2 × (length + width).", M(`2(l + ${w}) = ${P}`)),
        S("Divide both sides by 2", "", M(`l + ${w} = ${P / 2}`)),
        S("Subtract " + w + " from both sides", "", M(`l = ${P / 2} ${MINUS} ${w} = ${l}`)),
        S("Check", `2 × (${l} + ${w}) = 2 × ${l + w} = ${P} ✓`),
      ],
      skillTag: "eq.words.perimeter",
    });
  }
  const tAge = r.int(5, 12);
  const sAge = 2 * tAge + r.int(1, 5);
  const diff = sAge - 2 * tAge;
  return numQ({
    prompt: `Sipho is ${diff} year${diff > 1 ? "s" : ""} older than TWICE Thandi's age. Sipho is ${sAge}. How old is Thandi?`,
    answer: tAge,
    unit: "years",
    hints: ["Let Thandi's age be t. 'Twice Thandi's age' is 2t.", `Sipho's age = 2t + ${diff}`, `So 2t + ${diff} = ${sAge}`],
    steps: [
      S("Choose a letter", "Let t be Thandi's age."),
      S("Write the equation", `Sipho = twice Thandi's age plus ${diff}.`, M(`2t + ${diff} = ${sAge}`)),
      S("Subtract " + diff + " from both sides", "", M(`2t = ${sAge - diff}`)),
      S("Divide both sides by 2", "", M(`t = ${tAge}`)),
      S("Check", `2 × ${tAge} + ${diff} = ${sAge} ✓`),
    ],
    skillTag: "eq.words.ages",
  });
};

export const genAlgebra: Record<string, Gen> = {
  "pat-sequences": patSequences,
  "pat-rules": patRules,
  "func-tables": funcTables,
  "func-formula": funcFormula,
  "alg-language": algLanguage,
  "alg-like": algLike,
  "alg-sub": algSub,
  "alg-expand": algExpand,
  "eq-onestep": eqOneStep,
  "eq-twostep": eqTwoStep,
  "eq-words": eqWords,
};
