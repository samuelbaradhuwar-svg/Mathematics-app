// Question generators: Whole numbers and Integers.
import type { WorkedStep } from "./curriculumTypes";
import { type Gen, S, M, wr, numQ, choiceQ } from "./genKit";
import { br, fmtNum, gcd, lcm, primeFactors, isPrime } from "./mathUtils";

const PLACES = ["ones", "tens", "hundreds", "thousands", "ten thousands", "hundred thousands"];

const addSteps = (a: number, b: number): WorkedStep[] => {
  const da = String(a).split("").reverse().map(Number);
  const db = String(b).split("").reverse().map(Number);
  const n = Math.max(da.length, db.length);
  const steps: WorkedStep[] = [
    S(
      "Line up the numbers",
      "Write the numbers under each other so ones are under ones, tens under tens, and so on.",
      M(`${fmtNum(a)} + ${fmtNum(b)}`),
      "Each column is a different 'size' of number, so we only add matching columns."
    ),
  ];
  let carry = 0;
  for (let i = 0; i < n; i++) {
    const x = da[i] ?? 0;
    const y = db[i] ?? 0;
    const sum = x + y + carry;
    const digit = sum % 10;
    const newCarry = Math.floor(sum / 10);
    steps.push(
      S(
        `Add the ${PLACES[i]}`,
        `${x} + ${y}${carry ? ` + ${carry} (carried)` : ""} = ${sum}. ` +
          (newCarry
            ? `Write ${digit} and carry ${newCarry} to the ${PLACES[i + 1]}.`
            : `Write ${digit}.`),
        M(`${x} + ${y}${carry ? ` + ${carry}` : ""} = ${sum}`)
      )
    );
    carry = newCarry;
  }
  if (carry) {
    steps.push(S("The last carry", `Write the carried ${carry} at the front.`));
  }
  steps.push(S("Our answer", "Read the digits from left to right.", M(`${fmtNum(a)} + ${fmtNum(b)} = ${fmtNum(a + b)}`)));
  return steps;
};

const subSteps = (a: number, b: number): WorkedStep[] => {
  const digits = String(b).split("");
  const parts: number[] = [];
  digits.forEach((d, i) => {
    const v = Number(d) * Math.pow(10, digits.length - 1 - i);
    if (v > 0) parts.push(v);
  });
  const steps: WorkedStep[] = [
    S(
      "Break up the number we take away",
      `We take away ${fmtNum(b)} in small pieces: ${parts.map((p) => fmtNum(p)).join(" + ")}.`,
      M(`${fmtNum(b)} = ${parts.map((p) => fmtNum(p)).join(" + ")}`),
      "Taking away small pieces one at a time is easier than doing it all at once."
    ),
  ];
  let running = a;
  parts.forEach((p) => {
    const next = running - p;
    steps.push(
      S(
        `Take away ${fmtNum(p)}`,
        `${fmtNum(running)} − ${fmtNum(p)} = ${fmtNum(next)}`,
        M(`${fmtNum(running)} − ${fmtNum(p)} = ${fmtNum(next)}`)
      )
    );
    running = next;
  });
  steps.push(S("Our answer", `${fmtNum(a)} − ${fmtNum(b)} = ${fmtNum(a - b)}`, M(`${fmtNum(a)} − ${fmtNum(b)} = ${fmtNum(a - b)}`)));
  return steps;
};

const wnProperties: Gen = (r, level) => {
  if (level === "beginner") {
    const k = r.pick(["comm-add", "comm-mul", "assoc-add", "assoc-mul", "dist", "id-add", "id-mul"] as const);
    const a = r.int(2, 19);
    const b = r.int(2, 19);
    const c = r.int(2, 9);
    const table = {
      "comm-add": { e: `${a} + ${b} = ${b} + ${a}`, p: "Commutative property", why: "The numbers swapped places, but the answer stays the same." },
      "comm-mul": { e: `${a} × ${b} = ${b} × ${a}`, p: "Commutative property", why: "The numbers swapped places, but the answer stays the same." },
      "assoc-add": { e: `(${a} + ${b}) + ${c} = ${a} + (${b} + ${c})`, p: "Associative property", why: "The brackets moved to group different numbers, but the answer stays the same." },
      "assoc-mul": { e: `(${a} × ${b}) × ${c} = ${a} × (${b} × ${c})`, p: "Associative property", why: "The brackets moved to group different numbers, but the answer stays the same." },
      dist: { e: `${c} × (${a} + ${b}) = ${c} × ${a} + ${c} × ${b}`, p: "Distributive property", why: "The number outside the bracket multiplies each number inside the bracket." },
      "id-add": { e: `${a} + 0 = ${a}`, p: "Identity property", why: "Adding 0 changes nothing." },
      "id-mul": { e: `${a} × 1 = ${a}`, p: "Identity property", why: "Multiplying by 1 changes nothing." },
    }[k];
    const names = ["Commutative property", "Associative property", "Distributive property", "Identity property"];
    return choiceQ(r, {
      prompt: `Which property of numbers does this show?\n${M(table.e)}`,
      correct: table.p,
      wrongs: names,
      hints: [
        "Look at what is different between the left side and the right side.",
        "Numbers swapped places → commutative. Brackets moved → associative. A number outside a bracket multiplies everything inside → distributive. Adding 0 or multiplying by 1 → identity.",
        `In this one: ${table.why}`,
      ],
      steps: [
        S("Look at both sides", "Both sides give the same answer. We need to spot what changed.", M(table.e)),
        S("What changed?", table.why),
        S("Name the property", `This is the ${table.p.toLowerCase()}.`, undefined, "Knowing the names helps us use the properties to make calculations easier."),
      ],
      skillTag: "wn.properties.name",
    });
  }
  if (level === "intermediate") {
    const k = r.pick(["comm", "assoc", "dist", "idmul", "idadd"] as const);
    const a = r.int(3, 40);
    const b = r.int(3, 40);
    const c = r.int(2, 12);
    const defs = {
      comm: { p: `Fill in the missing number: ${M(`${a} + ${b} = ${b} + ?`)}`, ans: a, say: "Swap the order of the numbers you add. The answer stays the same.", full: `${a} + ${b} = ${b} + ${a}` },
      assoc: { p: `Fill in the missing number: ${M(`(${a} + ${b}) + ${c} = ${a} + (? + ${c})`)}`, ans: b, say: "The brackets move, but the numbers stay in the same order.", full: `(${a} + ${b}) + ${c} = ${a} + (${b} + ${c})` },
      dist: { p: `Fill in the missing number: ${M(`${c} × (${a} + ${b}) = ${c} × ${a} + ${c} × ?`)}`, ans: b, say: "The number outside the bracket multiplies EACH number inside.", full: `${c} × (${a} + ${b}) = ${c} × ${a} + ${c} × ${b}` },
      idmul: { p: `Fill in the missing number: ${M(`${a} × ? = ${a}`)}`, ans: 1, say: "Which number can we multiply by without changing anything? That is 1.", full: `${a} × 1 = ${a}` },
      idadd: { p: `Fill in the missing number: ${M(`${a} + ? = ${a}`)}`, ans: 0, say: "Which number can we add without changing anything? That is 0.", full: `${a} + 0 = ${a}` },
    }[k];
    return numQ({
      prompt: defs.p,
      answer: defs.ans,
      hints: ["Think about which property this is. What is allowed to change and what must stay the same?", defs.say, `The full line reads: ${defs.full}`],
      steps: [
        S("Name the property", defs.say),
        S("Fill in the gap", `The missing number is ${defs.ans}.`, M(defs.full), "We can check by calculating both sides: they must be equal."),
      ],
      skillTag: "wn.properties.fill",
    });
  }
  const v = r.pick([0, 1, 2] as const);
  if (v === 0) {
    const pair = r.pick([[25, 4], [20, 5], [50, 2], [125, 8]] as const);
    const y = r.int(3, 19);
    return numQ({
      prompt: `Use the properties of numbers to make this easier, then calculate:\n${M(`${pair[0]} × ${y} × ${pair[1]}`)}`,
      answer: pair[0] * y * pair[1],
      hints: [
        "Look for two numbers that multiply to make a round number like 100 or 1 000.",
        `${pair[0]} × ${pair[1]} = ${pair[0] * pair[1]}. Can you multiply those two first?`,
        `Rewrite as ${pair[0]} × ${pair[1]} × ${y}.`,
      ],
      steps: [
        S("Spot the friendly pair", `${pair[0]} and ${pair[1]} multiply to make ${pair[0] * pair[1]}, a nice round number.`),
        S("Change the order (commutative)", "We may multiply in any order.", M(`${pair[0]} × ${y} × ${pair[1]} = ${pair[0]} × ${pair[1]} × ${y}`)),
        S("Multiply the friendly pair first", `${pair[0]} × ${pair[1]} = ${pair[0] * pair[1]}`, M(`${pair[0] * pair[1]} × ${y}`)),
        S("Our answer", "", M(`${pair[0] * pair[1]} × ${y} = ${pair[0] * pair[1] * y}`)),
      ],
      skillTag: "wn.properties.smart",
    });
  }
  if (v === 1) {
    const a = r.int(3, 9);
    return numQ({
      prompt: `Use the distributive property to calculate:\n${M(`${a} × 98`)}`,
      answer: a * 98,
      hints: ["98 is close to 100. Can you write 98 as 100 − 2?", `${a} × 98 = ${a} × (100 − 2)`, `${a} × 100 − ${a} × 2`],
      steps: [
        S("Write 98 as 100 − 2", "100 is easy to multiply by.", M(`${a} × 98 = ${a} × (100 − 2)`)),
        S("Distribute", `Multiply ${a} by each number in the bracket.`, M(`${a} × 100 − ${a} × 2 = ${a * 100} − ${a * 2}`)),
        S("Subtract", "", M(`${a * 100} − ${a * 2} = ${a * 98}`)),
      ],
      skillTag: "wn.properties.smart",
    });
  }
  const a = r.int(3, 9);
  const b = r.pick([62, 37, 45, 58, 71]);
  const c = 100 - b;
  return numQ({
    prompt: `Use the distributive property to calculate:\n${M(`${a} × ${b} + ${a} × ${c}`)}`,
    answer: a * 100,
    hints: ["Both parts are multiplied by the same number. Can you take that number out?", `${a} × (${b} + ${c})`, `${b} + ${c} = 100`],
    steps: [
      S("Spot the common number", `Both parts are multiplied by ${a}.`),
      S("Take it out", "Work backwards through the distributive property.", M(`${a} × ${b} + ${a} × ${c} = ${a} × (${b} + ${c})`)),
      S("Add inside the bracket", "", M(`${b} + ${c} = 100`)),
      S("Multiply", "", M(`${a} × 100 = ${a * 100}`)),
    ],
    skillTag: "wn.properties.smart",
  });
};

const wnCalc: Gen = (r, level) => {
  if (level === "beginner") {
    if (r.chance(0.5)) {
      const a = r.int(120, 899);
      const b = r.int(120, 899);
      return numQ({
        prompt: `Calculate:\n${M(`${fmtNum(a)} + ${fmtNum(b)}`)}`,
        answer: a + b,
        hints: ["Add column by column, starting with the ones.", "If a column adds to 10 or more, carry the extra to the next column.", `Start with the ones: ${a % 10} + ${b % 10} = ${(a % 10) + (b % 10)}.`],
        steps: addSteps(a, b),
        wrong: [wr(Math.abs(a - b), "wn.wrongOperation", "It looks like you subtracted. This question asks us to ADD.")],
        skillTag: "wn.calc.add",
      });
    }
    const a = r.int(500, 980);
    const b = r.int(120, 499);
    return numQ({
      prompt: `Calculate:\n${M(`${fmtNum(a)} − ${fmtNum(b)}`)}`,
      answer: a - b,
      hints: ["Take the second number away from the first one.", "Break up the number you take away into hundreds, tens and ones.", `Start with ${fmtNum(a)} − ${Math.floor(b / 100) * 100}.`],
      steps: subSteps(a, b),
      wrong: [wr(a + b, "wn.wrongOperation", "It looks like you added. This question asks us to SUBTRACT.")],
      skillTag: "wn.calc.sub",
    });
  }
  if (level === "intermediate") {
    if (r.chance(0.55)) {
      const a = r.int(120, 480);
      const b = r.int(12, 48);
      const ones = b % 10;
      const tens = b - ones;
      return numQ({
        prompt: `Calculate:\n${M(`${a} × ${b}`)}`,
        answer: a * b,
        hints: ["Break the second number into tens and ones.", `${b} = ${tens} + ${ones}. Multiply ${a} by each part.`, `${a} × ${ones} = ${a * ones}`],
        steps: [
          S("Break up the second number", `${b} is ${tens} + ${ones}.`, M(`${a} × ${b} = ${a} × ${tens} + ${a} × ${ones}`)),
          S(`Multiply by the ones`, `${a} × ${ones} = ${a * ones}`, M(`${a} × ${ones} = ${a * ones}`)),
          S(`Multiply by the tens`, `${a} × ${tens} = ${a * tens}`, M(`${a} × ${tens} = ${a * tens}`)),
          S("Add the two answers", "", M(`${a * ones} + ${a * tens} = ${a * b}`)),
        ],
        wrong: [wr(a * ones, "wn.forgotTens", "That is only the ones part. We must also multiply by the tens and add.")],
        skillTag: "wn.calc.mul",
      });
    }
    const d = r.int(6, 24);
    const q = r.int(12, 48);
    const n = d * q;
    return numQ({
      prompt: `Calculate:\n${M(`${fmtNum(n)} ÷ ${d}`)}`,
      answer: q,
      hints: ["Division asks: how many groups of the second number fit into the first?", `Think: ${d} × ? = ${n}. Division and multiplication are opposites.`, `Try ${d} × ${q - 1} and ${d} × ${q + 1} and see which is closer.`],
      steps: [
        S("Turn it into a multiplication question", `${n} ÷ ${d} asks: ${d} × ? = ${n}.`),
        S("Build up in chunks", `${d} × 10 = ${d * 10}. Keep adding chunks of ${d} until you reach ${n}.`, M(`${d} × ${q} = ${n}`)),
        S("Our answer", "", M(`${n} ÷ ${d} = ${q}`)),
        S("Check", `Multiply back: ${d} × ${q} = ${n}. ✓`),
      ],
      skillTag: "wn.calc.div",
    });
  }
  if (r.chance(0.25)) {
    const boxes = r.int(12, 25);
    const per = r.int(12, 36);
    const extra = r.int(5, 20);
    return numQ({
      prompt: `A shop packs ${per} apples in each box. ${boxes} boxes are filled and ${extra} loose apples are left over. How many apples are there altogether?`,
      answer: boxes * per + extra,
      hints: ["Work out how many apples are in the full boxes first.", `${boxes} boxes × ${per} apples in each box.`, `Then add the ${extra} loose apples.`],
      steps: [
        S("Understand the question", `${boxes} full boxes with ${per} apples each, plus ${extra} loose apples.`),
        S("Apples in the boxes", `${boxes} × ${per} = ${boxes * per}`, M(`${boxes} × ${per} = ${boxes * per}`)),
        S("Add the loose apples", "", M(`${boxes * per} + ${extra} = ${boxes * per + extra}`)),
      ],
      skillTag: "wn.calc.problem",
    });
  }
  const p = r.int(0, 4);
  const a = r.int(5, 30);
  const b = r.int(2, 9);
  const c = r.int(2, 9);
  let text = "";
  let value = 0;
  let steps: WorkedStep[] = [];
  if (p === 0) {
    text = `${a} + ${b} × ${c}`;
    value = a + b * c;
    steps = [S("Multiplication comes before addition", `${b} × ${c} = ${b * c}`, M(`${a} + ${b * c}`)), S("Now add", "", M(`${a} + ${b * c} = ${value}`))];
  } else if (p === 1) {
    text = `(${a} + ${b}) × ${c}`;
    value = (a + b) * c;
    steps = [S("Brackets first", `${a} + ${b} = ${a + b}`, M(`${a + b} × ${c}`)), S("Now multiply", "", M(`${a + b} × ${c} = ${value}`))];
  } else if (p === 2) {
    const d = r.int(2, 6);
    const k = r.int(2, 9);
    const cc = d * k;
    const a2 = r.int(6, 12);
    text = `${a2} × ${b} − ${cc} ÷ ${d}`;
    value = a2 * b - k;
    steps = [
      S("Multiply and divide first (left to right)", `${a2} × ${b} = ${a2 * b} and ${cc} ÷ ${d} = ${k}`, M(`${a2 * b} − ${k}`)),
      S("Now subtract", "", M(`${a2 * b} − ${k} = ${value}`)),
    ];
  } else if (p === 3) {
    const big = b + c + r.int(1, 5);
    const d = r.int(2, 6);
    text = `${a} + (${big} − ${c}) × ${d}`;
    value = a + (big - c) * d;
    steps = [
      S("Brackets first", `${big} − ${c} = ${big - c}`, M(`${a} + ${big - c} × ${d}`)),
      S("Multiply next", `${big - c} × ${d} = ${(big - c) * d}`, M(`${a} + ${(big - c) * d}`)),
      S("Now add", "", M(`${a} + ${(big - c) * d} = ${value}`)),
    ];
  } else {
    const base = r.int(6, 9);
    const x = r.int(2, 5);
    const y = r.int(2, 5);
    text = `${base}^2 − ${x} × ${y}`;
    value = base * base - x * y;
    steps = [
      S("Powers first", `${base}^2 = ${base} × ${base} = ${base * base}`, M(`${base * base} − ${x} × ${y}`)),
      S("Multiply next", `${x} × ${y} = ${x * y}`, M(`${base * base} − ${x * y}`)),
      S("Now subtract", "", M(`${base * base} − ${x * y} = ${value}`)),
    ];
  }
  return numQ({
    prompt: `Use the order of operations (BODMAS) to calculate:\n${M(text)}`,
    answer: value,
    hints: [
      "BODMAS tells us the order: Brackets, Orders (powers), Division and Multiplication, then Addition and Subtraction.",
      "Find the part that must be done FIRST and work it out on its own.",
      `Do this first: ${steps[0].say}`,
    ],
    steps: [S("Remember BODMAS", "Brackets, Orders (powers), Division and Multiplication, then Addition and Subtraction.", M(text)), ...steps],
    skillTag: "wn.calc.bodmas",
  });
};

const fmtFactorisation = (n: number): string => {
  const pf = primeFactors(n);
  const groups: [number, number][] = [];
  pf.forEach((p) => {
    const g = groups.find((x) => x[0] === p);
    if (g) g[1]++;
    else groups.push([p, 1]);
  });
  return groups.map(([p, e]) => (e > 1 ? `${p}^${e}` : `${p}`)).join(" × ");
};

const wnFactors: Gen = (r, level) => {
  if (level === "beginner") {
    if (r.chance(0.5)) {
      const primes = [11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53];
      const p = r.pick(primes);
      const composites = [21, 27, 33, 39, 49, 51, 57, 63, 91, 87, 25, 35, 45, 55].filter((c) => !isPrime(c));
      const wrongs = r.shuffle(composites).slice(0, 3);
      return choiceQ(r, {
        prompt: "Which of these numbers is a prime number?",
        correct: String(p),
        wrongs: wrongs.map(String),
        hints: ["A prime number has exactly TWO factors: 1 and itself.", "Try dividing each number by 2, 3, 5 and 7. If one divides in exactly, it is NOT prime.", `Look at ${wrongs[0]}: does it divide by a number other than 1 and itself?`],
        steps: [
          S("What is a prime number?", "A prime number has exactly two factors: 1 and the number itself."),
          S("Test each number", "Try to divide each number by small numbers (2, 3, 5, 7).", M(wrongs.map((w) => `${w} = ${primeFactors(w).join(" × ")}`).join(";  "))),
          S("Our answer", `${p} cannot be divided by any number except 1 and ${p}, so it is prime.`),
        ],
        skillTag: "wn.factors.prime",
      });
    }
    const n = r.pick([12, 16, 18, 20, 24, 28, 30, 36]);
    const fs: number[] = [];
    for (let i = 1; i <= n; i++) if (n % i === 0) fs.push(i);
    return numQ({
      prompt: `How many factors does ${n} have?`,
      answer: fs.length,
      hints: ["A factor is a number that divides into ${n} exactly, with no remainder.".replace("${n}", String(n)), `Start at 1 and test: does 1 divide into ${n}? Does 2? Does 3?`, "Factors come in pairs. Find the pairs that multiply to give " + n + "."],
      steps: [
        S("What is a factor?", "A factor divides into the number exactly, with nothing left over."),
        S("Find the pairs", "Look for pairs of numbers that multiply to give " + n + ".", M(fs.filter((f) => f * f <= n).map((f) => `${f} × ${n / f}`).join(";  "))),
        S("List all the factors", "", M(fs.join("; "))),
        S("Count them", `There are ${fs.length} factors.`),
      ],
      skillTag: "wn.factors.list",
    });
  }
  if (level === "intermediate") {
    const n = r.pick([24, 30, 36, 40, 45, 48, 60, 72, 84, 90, 100, 120, 126, 150]);
    const correct = fmtFactorisation(n);
    const pf = primeFactors(n);
    const composites: number[] = [];
    for (let i = 4; i < n; i++) if (n % i === 0 && !isPrime(i)) composites.push(i);
    const cmp = r.pick(composites);
    const d1 = `${cmp} × ${n / cmp}`;
    const bumped = [...pf];
    bumped[0] = bumped[0] + 1;
    const d2 = bumped.join(" × ");
    const d3 = fmtFactorisation(n + pf[0]);
    return choiceQ(r, {
      prompt: `Which one shows ${n} written as a product of PRIME factors?`,
      correct: M(correct),
      wrongs: [M(d1), M(d2), M(d3)],
      hints: ["Prime factors are factors that are prime numbers. Every number in the answer must be prime.", "Rule out any choice that has a number which is not prime, then check which choice multiplies to make " + n + ".", `Use a factor tree: split ${n} into two factors, then keep splitting until all are prime.`],
      steps: [
        S("Start a factor tree", `Split ${n} into two factors.`, M(`${n} = ${cmp} × ${n / cmp}`)),
        S("Keep splitting until every branch is prime", "A prime number cannot be split any further.", M(`${n} = ${pf.join(" × ")}`)),
        S("Write with powers", "Repeated primes can be written with an exponent.", M(`${n} = ${correct}`)),
      ],
      notes: { [M(d1)]: { tag: "wn.notPrime", message: `${cmp} and ${n / cmp} multiply to ${n}, but they are not both prime. Keep splitting!` } },
      skillTag: "wn.factors.primefactors",
    });
  }
  const g = r.pick([2, 3, 4, 5, 6, 8, 9, 12]);
  const coprime: [number, number][] = [[2, 3], [3, 4], [3, 5], [2, 5], [4, 5], [5, 7], [3, 7], [2, 9], [4, 7], [5, 6]];
  const [x, y] = r.pick(coprime);
  const a = g * x;
  const b = g * y;
  const askHcf = r.chance(0.5);
  if (!askHcf && r.chance(0.35)) {
    const aa = r.pick([6, 8, 10, 12]);
    const bb = r.pick([9, 14, 15, 18, 20]);
    return numQ({
      prompt: `One light flashes every ${aa} seconds and another flashes every ${bb} seconds. They flash together now. After how many seconds will they flash together again?`,
      answer: lcm(aa, bb),
      unit: "seconds",
      hints: ["We need a number that both ${aa} and ${bb} divide into. That is a common multiple.".replace("${aa}", String(aa)).replace("${bb}", String(bb)), "We want the FIRST time, so find the lowest common multiple (LCM).", `List multiples of ${bb}: ${[1, 2, 3, 4, 5].map((k) => k * bb).join("; ")}...`],
      steps: [
        S("What are we looking for?", "The first time both lights flash together = the LCM of the two numbers."),
        S("Write the multiples", `Multiples of ${aa}: ${[1, 2, 3, 4, 5, 6, 7, 8].map((k) => k * aa).join("; ")}`),
        S("Write the multiples", `Multiples of ${bb}: ${[1, 2, 3, 4, 5, 6, 7, 8].map((k) => k * bb).join("; ")}`),
        S("Find the first one in both lists", `The first number in both lists is ${lcm(aa, bb)}.`, M(`LCM(${aa}; ${bb}) = ${lcm(aa, bb)}`)),
      ],
      skillTag: "wn.factors.lcm",
    });
  }
  const fa = fmtFactorisation(a);
  const fb = fmtFactorisation(b);
  const ans = askHcf ? gcd(a, b) : lcm(a, b);
  return numQ({
    prompt: `Find the ${askHcf ? "highest common factor (HCF)" : "lowest common multiple (LCM)"} of ${a} and ${b}.`,
    answer: ans,
    hints: [
      askHcf ? "The HCF is the BIGGEST number that divides into both numbers exactly." : "The LCM is the SMALLEST number that both numbers divide into.",
      "Write each number as a product of prime factors.",
      askHcf ? "Multiply the prime factors that appear in BOTH numbers." : "Multiply every prime factor that appears in either number, using the highest power of each.",
    ],
    steps: [
      S("Write each number as prime factors", "Use a factor tree for each number.", M(`${a} = ${fa}`)),
      S("Do the same for the other number", "", M(`${b} = ${fb}`)),
      askHcf
        ? S("HCF: take what they SHARE", "Pick the prime factors that appear in both lists (the smaller power of each).", M(`HCF = ${fmtFactorisation(ans)} = ${ans}`))
        : S("LCM: take EVERYTHING", "Pick every prime factor that appears in either list, using the bigger power of each.", M(`LCM = ${fmtFactorisation(ans)} = ${fmtNum(ans)}`)),
    ],
    skillTag: askHcf ? "wn.factors.hcf" : "wn.factors.lcm",
  });
};

// ---------- Integers ----------

const intOrder: Gen = (r, level) => {
  if (level === "beginner") {
    const a = r.int(1, 15);
    const b = r.intNot(1, 15, [a]);
    const useNeg = r.chance(0.7);
    const x = useNeg ? -a : a;
    const y = useNeg ? -b : -b;
    const bigger = Math.max(x, y);
    const lo = Math.min(x, y) - 2;
    return choiceQ(r, {
      prompt: `Which number is GREATER: ${M(fmtNum(x))} or ${M(fmtNum(y))}?`,
      correct: fmtNum(bigger),
      wrongs: [fmtNum(Math.min(x, y))],
      visual: { type: "numberline", min: Math.max(-20, lo), max: Math.min(20, Math.max(x, y) + 2), marks: [x, y], caption: "Numbers further to the right are greater." },
      hints: ["Picture a number line. Greater numbers are further to the RIGHT.", "Negative numbers get smaller as the number part gets bigger. −9 is further left than −2.", `Which of ${fmtNum(x)} and ${fmtNum(y)} is further to the right?`],
      steps: [
        S("Picture the number line", "Numbers increase as we move to the right.", undefined, "This is how we compare integers."),
        S("Place both numbers", `Mark ${fmtNum(x)} and ${fmtNum(y)}.`),
        S("Which is further right?", `${fmtNum(bigger)} is further right, so it is greater.`, M(`${fmtNum(bigger)} > ${fmtNum(Math.min(x, y))}`)),
      ],
      skillTag: "int.order.compare",
    });
  }
  if (level === "intermediate") {
    const nums = r.shuffle([-9, -6, -3, -1, 0, 2, 4, 7, 8, -8, 5, -5]).slice(0, 4);
    const asc = [...nums].sort((p, q) => p - q);
    const show = (arr: number[]) => M(arr.map((n) => fmtNum(n)).join("; "));
    const desc = [...asc].reverse();
    const byMag = [...nums].sort((p, q) => Math.abs(p) - Math.abs(q));
    const swapped = [...asc];
    [swapped[1], swapped[2]] = [swapped[2], swapped[1]];
    return choiceQ(r, {
      prompt: `Which list shows these numbers from SMALLEST to BIGGEST?\n${M(r.shuffle(nums).map((n) => fmtNum(n)).join("; "))}`,
      correct: show(asc),
      wrongs: [show(desc), show(byMag), show(swapped)],
      hints: ["Smallest is the number furthest to the LEFT on the number line.", "Negative numbers come first. The negative with the biggest number part is the smallest.", `The smallest number here is ${fmtNum(asc[0])}.`],
      steps: [
        S("Sort the negatives first", "Negative numbers are all smaller than 0 and positive numbers."),
        S("Order the negatives", "Among negatives, the one with the BIGGER number part is smaller (−9 is smaller than −2)."),
        S("Then 0, then the positives", "", show(asc)),
      ],
      notes: { [show(byMag)]: { tag: "int.ignoreSign", message: "That list ignores the minus signs. −9 is a small number even though 9 is big. Use the number line." } },
      skillTag: "int.order.list",
    });
  }
  const a = r.int(-12, -1);
  const b = r.int(1, 12);
  const v = r.pick(["opposite", "distance", "abs"] as const);
  if (v === "opposite") {
    const n = r.chance(0.5) ? a : b;
    return numQ({
      prompt: `What is the opposite (additive inverse) of ${M(fmtNum(n))}?`,
      answer: -n,
      hints: ["The opposite of a number is the same distance from 0 but on the other side.", "Opposites add up to 0.", `${fmtNum(n)} + ? = 0`],
      steps: [S("What does 'opposite' mean?", "It is the number the same distance from 0, on the other side of 0."), S("Our answer", `The opposite of ${fmtNum(n)} is ${fmtNum(-n)}.`, M(`${fmtNum(n)} + ${br(-n)} = 0`))],
      skillTag: "int.order.opposite",
    });
  }
  if (v === "abs") {
    const n = r.chance(0.5) ? a : b;
    return numQ({
      prompt: `What is the absolute value of ${M(fmtNum(n))}? (We write it ${M(`|${fmtNum(n)}|`)}.)`,
      answer: Math.abs(n),
      hints: ["Absolute value means 'how far from 0'. Distance is never negative.", "Count the steps from 0 to the number on the number line.", `${fmtNum(n)} is ${Math.abs(n)} steps from 0.`],
      steps: [S("What does absolute value mean?", "It is the distance from 0, so it is always 0 or positive."), S("Our answer", "", M(`|${fmtNum(n)}| = ${Math.abs(n)}`))],
      skillTag: "int.order.abs",
    });
  }
  return numQ({
    prompt: `How far apart are ${M(fmtNum(a))} and ${M(fmtNum(b))} on the number line?`,
    answer: b - a,
    visual: { type: "numberline", min: Math.min(a, 0) - 1, max: b + 1, marks: [a, b], caption: "Count the jumps from one number to the other." },
    hints: ["Count the steps between the two numbers on the number line.", `From ${fmtNum(a)} to 0 is ${Math.abs(a)} steps. From 0 to ${b} is ${b} steps.`, `${Math.abs(a)} + ${b}`],
    steps: [
      S("Go from the negative number to 0", `${fmtNum(a)} to 0 is ${Math.abs(a)} steps.`),
      S("Go from 0 to the positive number", `0 to ${b} is ${b} steps.`),
      S("Add the steps", "", M(`${Math.abs(a)} + ${b} = ${b - a}`)),
    ],
    skillTag: "int.order.distance",
  });
};

const intAddSub: Gen = (r, level) => {
  if (level === "beginner") {
    const c = r.int(0, 2);
    const a = r.int(1, 9);
    const b = r.intNot(1, 9, [a]);
    let x: number, y: number;
    if (c === 0) {
      x = -a; y = b;
    } else if (c === 1) {
      x = a; y = -b;
    } else {
      x = -a; y = -b;
    }
    const res = x + y;
    return numQ({
      prompt: `Calculate:\n${M(`${fmtNum(x)} + ${br(y)}`)}`,
      answer: res,
      visual: { type: "numberline", min: -20, max: 20, marks: [x, res], jumps: [{ from: x, to: res, label: y > 0 ? `+${y}` : `${fmtNum(y)}` }] },
      hints: ["Use a number line. Start at the first number.", y > 0 ? "Adding a positive number moves you to the RIGHT." : "Adding a negative number moves you to the LEFT.", `Start at ${fmtNum(x)} and make ${Math.abs(y)} jumps to the ${y > 0 ? "right" : "left"}.`],
      steps: [
        S("Find the start", `Start at ${fmtNum(x)} on the number line.`),
        S("Choose the direction", y > 0 ? `We add a positive number (${y}), so we move RIGHT.` : `We add a negative number (${fmtNum(y)}), so we move LEFT.`, undefined, "Positive means right, negative means left."),
        S("Jump", `Make ${Math.abs(y)} jumps ${y > 0 ? "right" : "left"}.`, M(`${fmtNum(x)} ${y > 0 ? "+" : "−"} ${Math.abs(y)} = ${fmtNum(res)}`)),
        S("Our answer", "", M(`${fmtNum(x)} + ${br(y)} = ${fmtNum(res)}`)),
      ],
      wrong: [wr(Math.abs(x) + Math.abs(y), "int.ignoreSigns", "That is what we get if we ignore the signs. The signs tell us which way to move on the number line.")],
      skillTag: "int.addsub.add",
    });
  }
  if (level === "intermediate") {
    const c = r.int(0, 3);
    const a = r.int(1, 12);
    const b = r.int(1, 12);
    let x: number, y: number;
    if (c === 0) { x = a; y = -b; }
    else if (c === 1) { x = -a; y = b; }
    else if (c === 2) { x = -a; y = -b; }
    else { x = Math.min(a, b); y = Math.max(a, b) + 1; }
    const res = x - y;
    const rewrite = y < 0 ? `${fmtNum(x)} + ${Math.abs(y)}` : `${fmtNum(x)} + ${br(-y)}`;
    return numQ({
      prompt: `Calculate:\n${M(`${fmtNum(x)} − ${br(y)}`)}`,
      answer: res,
      visual: { type: "numberline", min: -25, max: 25, marks: [x, res], jumps: [{ from: x, to: res, label: y < 0 ? `+${Math.abs(y)}` : `−${y}` }] },
      hints: ["Subtracting a number is the same as adding its opposite.", y < 0 ? "Subtracting a NEGATIVE is the same as adding a POSITIVE." : "Subtracting a positive is the same as adding a negative.", `Rewrite it as: ${rewrite}`],
      steps: [
        S("Change subtraction into addition", y < 0 ? "Two minus signs together (− −) turn into a plus." : "Subtracting a positive number means moving LEFT.", M(`${fmtNum(x)} − ${br(y)} = ${rewrite}`), "Subtracting is the same as adding the opposite."),
        S("Now use the number line", `Start at ${fmtNum(x)} and move ${res > x ? "right" : "left"} by ${Math.abs(res - x)}.`),
        S("Our answer", "", M(`${fmtNum(x)} − ${br(y)} = ${fmtNum(res)}`)),
      ],
      wrong: y < 0 ? [wr(x + y, "int.subNegative", "It looks like the double negative was treated as a single negative. Subtracting a negative is the same as ADDING the positive.")] : [],
      skillTag: "int.addsub.sub",
    });
  }
  if (r.chance(0.35)) {
    const start = r.int(-8, -2);
    const up = r.int(8, 18);
    const down = r.int(3, 12);
    const res = start + up - down;
    return numQ({
      prompt: `At sunrise the temperature is ${fmtNum(start)}°C. By midday it is ${up}°C warmer. By night it falls by ${down}°C. What is the temperature at night?`,
      answer: res,
      unit: "°C",
      hints: ["Warmer means add. Falls means subtract.", `Step 1: ${fmtNum(start)} + ${up}`, `Step 1 gives ${fmtNum(start + up)}. Now subtract ${down}.`],
      steps: [
        S("Midday temperature", `${fmtNum(start)} + ${up} = ${fmtNum(start + up)}`, M(`${fmtNum(start)} + ${up} = ${fmtNum(start + up)}`)),
        S("Night temperature", `${fmtNum(start + up)} − ${down} = ${fmtNum(res)}`, M(`${fmtNum(start + up)} − ${down} = ${fmtNum(res)}`)),
      ],
      skillTag: "int.addsub.problem",
    });
  }
  const x0 = r.int(-9, 9);
  const terms = [r.int(-9, 9) || 4, r.int(-9, 9) || -3, r.int(-9, 9) || 5];
  const ops = [r.pick(["+", "−"]), r.pick(["+", "−"]), r.pick(["+", "−"])];
  let run = x0;
  const steps: WorkedStep[] = [];
  let text = fmtNum(x0);
  terms.forEach((t, i) => {
    const op = ops[i];
    const nextVal = op === "+" ? run + t : run - t;
    text += ` ${op} ${br(t)}`;
    steps.push(
      S(
        `Step ${i + 1}`,
        `${fmtNum(run)} ${op} ${br(t)} = ${fmtNum(nextVal)}` + (op === "−" && t < 0 ? "  (subtracting a negative: add the positive)" : ""),
        M(`${fmtNum(run)} ${op} ${br(t)} = ${fmtNum(nextVal)}`)
      )
    );
    run = nextVal;
  });
  return numQ({
    prompt: `Calculate, working from left to right:\n${M(text)}`,
    answer: run,
    hints: ["Work from left to right, one pair at a time.", "Deal with each double sign (+ −, − −) before you calculate.", `The first step is ${steps[0].say}`],
    steps: [S("Work from left to right", "We do one small calculation at a time.", M(text)), ...steps],
    skillTag: "int.addsub.chain",
  });
};

const intMulDiv: Gen = (r, level) => {
  const rule = "Same signs give a POSITIVE answer. Different signs give a NEGATIVE answer.";
  if (level === "beginner") {
    const a = r.int(2, 9);
    const b = r.int(2, 9);
    const negFirst = r.chance(0.5);
    const x = negFirst ? -a : a;
    const y = negFirst ? b : -b;
    return numQ({
      prompt: `Calculate:\n${M(`${br(x)} × ${br(y)}`)}`,
      answer: x * y,
      hints: ["First multiply the numbers as if they had no signs.", "The signs are different (one positive, one negative). What sign does the answer get?", `${a} × ${b} = ${a * b}. Different signs → negative.`],
      steps: [
        S("Multiply the numbers without the signs", `${a} × ${b} = ${a * b}`),
        S("Decide the sign", "One number is negative and one is positive: different signs.", undefined, rule),
        S("Our answer", "", M(`${br(x)} × ${br(y)} = ${fmtNum(x * y)}`)),
      ],
      wrong: [wr(a * b, "int.signRule", "The numbers are right, but check the sign. Different signs give a negative answer.")],
      skillTag: "int.muldiv.mixed",
    });
  }
  if (level === "intermediate") {
    const a = r.int(2, 9);
    const b = r.int(2, 9);
    if (r.chance(0.5)) {
      return numQ({
        prompt: `Calculate:\n${M(`${br(-a)} × ${br(-b)}`)}`,
        answer: a * b,
        hints: ["Multiply the numbers, then decide on the sign.", "Both numbers are negative: the signs are the SAME.", `Same signs → positive. ${a} × ${b} = ?`],
        steps: [
          S("Multiply the numbers without the signs", `${a} × ${b} = ${a * b}`),
          S("Decide the sign", "Both numbers are negative, so the signs are the same.", undefined, rule),
          S("Our answer", "", M(`${br(-a)} × ${br(-b)} = ${a * b}`)),
        ],
        wrong: [wr(-a * b, "int.signRule", "Check the sign. A negative times a negative gives a POSITIVE answer.")],
        skillTag: "int.muldiv.neg",
      });
    }
    const q = r.int(2, 9);
    const d = r.int(2, 9);
    const n = q * d;
    const sn = r.pick([[-1, 1], [1, -1], [-1, -1]] as const);
    const num = sn[0] * n;
    const den = sn[1] * d;
    return numQ({
      prompt: `Calculate:\n${M(`${br(num)} ÷ ${br(den)}`)}`,
      answer: num / den,
      hints: ["Divide the numbers first, ignoring the signs.", "Division follows the same sign rule as multiplication.", `${n} ÷ ${d} = ${q}. Are the signs the same or different?`],
      steps: [
        S("Divide without the signs", `${n} ÷ ${d} = ${q}`),
        S("Decide the sign", sn[0] === sn[1] ? "The signs are the same → positive." : "The signs are different → negative.", undefined, rule),
        S("Our answer", "", M(`${br(num)} ÷ ${br(den)} = ${fmtNum(num / den)}`)),
      ],
      skillTag: "int.muldiv.div",
    });
  }
  const a = r.int(2, 6);
  const b = r.int(1, 5);
  const c = b + r.int(1, 4);
  const d = r.int(2, 5);
  const e = d * r.int(2, 5);
  const inside = b - c;
  const prod = -a * inside;
  const quot = -e / d;
  const res = prod + quot;
  return numQ({
    prompt: `Use BODMAS to calculate:\n${M(`${br(-a)} × (${b} − ${c}) + (${br(-e)}) ÷ ${d}`)}`,
    answer: res,
    hints: ["Brackets first. Then multiply and divide, then add.", `${b} − ${c} = ${fmtNum(inside)}`, `Next: ${br(-a)} × ${br(inside)} = ${fmtNum(prod)} and ${br(-e)} ÷ ${d} = ${fmtNum(quot)}`],
    steps: [
      S("Brackets first", `${b} − ${c} = ${fmtNum(inside)}`, M(`${br(-a)} × ${br(inside)} + (${br(-e)}) ÷ ${d}`)),
      S("Multiply", `${br(-a)} × ${br(inside)} = ${fmtNum(prod)} (same signs → positive)`, M(`${fmtNum(prod)} + (${br(-e)}) ÷ ${d}`)),
      S("Divide", `${br(-e)} ÷ ${d} = ${fmtNum(quot)} (different signs → negative)`, M(`${fmtNum(prod)} + ${br(quot)}`)),
      S("Add", "", M(`${fmtNum(prod)} + ${br(quot)} = ${fmtNum(res)}`)),
    ],
    skillTag: "int.muldiv.bodmas",
  });
};

export const genWholeNumbers: Record<string, Gen> = {
  "wn-properties": wnProperties,
  "wn-calc": wnCalc,
  "wn-factors": wnFactors,
  "int-order": intOrder,
  "int-addsub": intAddSub,
  "int-muldiv": intMulDiv,
};