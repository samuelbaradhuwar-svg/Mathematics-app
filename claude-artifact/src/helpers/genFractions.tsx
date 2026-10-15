// Question generators: Common fractions and Decimal fractions.
import type { WorkedStep } from "./curriculumTypes";
import { type Gen, S, M, wr, numQ, choiceQ, fracQ } from "./genKit";
import { fmtNum, frac, gcd, lcm, mixed, roundTo } from "./mathUtils";

const simp = (n: number, d: number): [number, number] => {
  const g = gcd(n, d) || 1;
  return [n / g, d / g];
};

const LCD_PAIRS: [number, number][] = [
  [2, 3], [2, 4], [3, 6], [4, 8], [2, 5], [3, 4], [4, 6], [5, 10], [3, 5], [2, 6], [4, 12], [6, 8],
];

// ---------- Common fractions ----------

const fracEquiv: Gen = (r, level) => {
  if (level === "beginner") {
    const d = r.int(2, 9);
    const n = r.int(1, d - 1);
    const k = r.int(2, 6);
    return numQ({
      prompt: `Find the missing number so the fractions are equivalent:\n${M(`${frac(n, d)} = {?/${d * k}}`)}`,
      answer: n * k,
      visual: { type: "fractionbar", parts: d, shaded: n, caption: `${n} out of ${d} parts are shaded.` },
      hints: ["Equivalent fractions are the same amount written with different numbers.", `Look at the bottom numbers. What did we multiply ${d} by to get ${d * k}?`, `${d} × ${k} = ${d * k}, so multiply the top number by ${k} too.`],
      steps: [
        S("Compare the bottom numbers", `The denominator changed from ${d} to ${d * k}.`, undefined, "To keep the same amount, whatever we do to the bottom we must also do to the top."),
        S("Find the multiplier", `${d} × ${k} = ${d * k}`, M(`${d} × ${k} = ${d * k}`), undefined, { prompt: `What do we multiply ${d} by to get ${d * k}?`, answer: String(k) }),
        S("Do the same to the top", `${n} × ${k} = ${n * k}`, M(`${frac(n, d)} = {${n} × ${k}/${d} × ${k}} = ${frac(n * k, d * k)}`)),
        S("Our answer", `The missing number is ${n * k}.`),
      ],
      wrong: [wr(n + (d * k - d), "frac.addNotMultiply", "It looks like the same number was ADDED to the top and bottom. For equivalent fractions we MULTIPLY (or divide) top and bottom by the same number.")],
      skillTag: "frac.equiv.missing",
    });
  }
  if (level === "intermediate") {
    const base = r.pick([[1, 2], [1, 3], [2, 3], [3, 4], [2, 5], [3, 5], [4, 5], [5, 6], [3, 8], [5, 8], [7, 10], [5, 12], [7, 9], [2, 7]] as const);
    const g = r.int(2, 8);
    const n = base[0] * g;
    const d = base[1] * g;
    return fracQ({
      prompt: `Write ${M(frac(n, d))} in its simplest form.`,
      n: base[0],
      d: base[1],
      hints: ["Simplest form means we cannot divide the top and bottom by the same number any more.", "Find the biggest number that divides into BOTH the top and the bottom (the HCF).", `Both ${n} and ${d} divide by ${g}.`],
      steps: [
        S("Find a number that divides both", `Look for the highest common factor (HCF) of ${n} and ${d}.`, M(`HCF(${n}; ${d}) = ${g}`), "Dividing top and bottom by the same number keeps the fraction equal."),
        S("Divide the top and the bottom", `${n} ÷ ${g} = ${base[0]} and ${d} ÷ ${g} = ${base[1]}`, M(`${frac(n, d)} = {${n} ÷ ${g}/${d} ÷ ${g}} = ${frac(base[0], base[1])}`)),
        S("Check it is simplest", `The only number that divides both ${base[0]} and ${base[1]} is 1. ✓`),
      ],
      skillTag: "frac.equiv.simplify",
    });
  }
  const pool = [[1, 2], [2, 3], [3, 4], [5, 6], [3, 8], [5, 8], [7, 12], [5, 12], [2, 5], [3, 10], [7, 10], [1, 4], [1, 3], [4, 5], [3, 5]];
  const picks = r.shuffle(pool).slice(0, 3);
  const vals = picks.map(([n, d]) => n / d);
  if (new Set(vals.map((v) => roundTo(v, 8))).size < 3) return fracEquiv(r, level);
  const L = picks.reduce((acc, [, d]) => lcm(acc, d), 1);
  const scaled = picks.map(([n, d]) => (n * L) / d);
  const maxIdx = scaled.indexOf(Math.max(...scaled));
  const show = (p: number[]) => M(frac(p[0], p[1]));
  return choiceQ(r, {
    prompt: `Which of these fractions is the GREATEST?`,
    correct: show(picks[maxIdx]),
    wrongs: picks.filter((_, i) => i !== maxIdx).map(show),
    hints: ["To compare fractions, give them all the SAME denominator.", `A denominator that all of ${picks.map((p) => p[1]).join(", ")} divide into is ${L}.`, `Change each fraction into ${L}ths and compare the top numbers.`],
    steps: [
      S("Find a common denominator", `The lowest common denominator of ${picks.map((p) => p[1]).join("; ")} is ${L}.`, M(`LCD = ${L}`)),
      S("Change each fraction", "Multiply top and bottom by the same number.", M(picks.map(([n, d], i) => `${frac(n, d)} = ${frac(scaled[i], L)}`).join(";  "))),
      S("Compare the top numbers", `The biggest top number is ${scaled[maxIdx]}.`, M(`${frac(scaled[maxIdx], L)} = ${frac(picks[maxIdx][0], picks[maxIdx][1])}`)),
    ],
    skillTag: "frac.equiv.compare",
  });
};

const fracAddSub: Gen = (r, level) => {
  if (level === "beginner") {
    const d = r.int(3, 12);
    const a = r.int(1, d - 1);
    const b = r.int(1, d - 1);
    const add = r.chance(0.6);
    let n1 = a;
    let n2 = b;
    if (!add && n1 <= n2) [n1, n2] = [n2, n1];
    if (!add && n1 === n2) n1 = Math.min(d - 1, n1 + 1);
    if (!add && n1 === n2) n2 = n1 - 1 || 1;
    const rn = add ? n1 + n2 : n1 - n2;
    return fracQ({
      prompt: `Calculate. Give your answer in simplest form.\n${M(`${frac(n1, d)} ${add ? "+" : "−"} ${frac(n2, d)}`)}`,
      n: rn,
      d,
      mixedForm: true,
      hints: ["The denominators are the same, so the pieces are the same size.", "Just " + (add ? "add" : "subtract") + " the top numbers. The bottom number stays the same.", `${n1} ${add ? "+" : "−"} ${n2} = ${rn}, so we get ${rn}/${d}. Can it be simplified?`],
      steps: [
        S("Look at the denominators", `Both are ${d}, so the pieces are the same size.`),
        S(add ? "Add the numerators" : "Subtract the numerators", `${n1} ${add ? "+" : "−"} ${n2} = ${rn}`, M(`${frac(n1, d)} ${add ? "+" : "−"} ${frac(n2, d)} = ${frac(rn, d)}`), "We are counting how many pieces of the same size. The size of the piece (the denominator) does not change."),
        S("Simplify", gcd(rn, d) > 1 || rn > d ? "Simplify or change to a mixed number if possible." : "It is already in simplest form.", M(`${frac(rn, d)} = ${mixed(...simp(rn, d))}`)),
      ],
      wrong: [wr(`${rn}/${d + d}`, "frac.addDenominators", "The denominators should NOT be added. The pieces stay the same size, so keep the denominator.")],
      skillTag: "frac.addsub.same",
    });
  }
  if (level === "intermediate") {
    let [d1, d2] = r.pick(LCD_PAIRS);
    let n1 = r.int(1, d1 - 1);
    let n2 = r.int(1, d2 - 1);
    let add = r.chance(0.55);
    if (!add && n1 * d2 === n2 * d1) add = true;
    if (!add && n1 * d2 < n2 * d1) {
      [n1, n2] = [n2, n1];
      [d1, d2] = [d2, d1];
    }
    const L = lcm(d1, d2);
    const N1 = (n1 * L) / d1;
    const N2 = (n2 * L) / d2;
    const rn = add ? N1 + N2 : N1 - N2;
    const [sn, sd] = simp(rn, L);
    return fracQ({
      prompt: `Calculate. Give your answer in simplest form.\n${M(`${frac(n1, d1)} ${add ? "+" : "−"} ${frac(n2, d2)}`)}`,
      n: rn,
      d: L,
      mixedForm: true,
      hints: ["The denominators are different, so the pieces are different sizes. Make them the same first.", `Find a number that both ${d1} and ${d2} divide into. This is the lowest common denominator (LCD).`, `The LCD is ${L}. Change ${frac(n1, d1)} into ${L}ths.`],
      steps: [
        S("Check the denominators", `${d1} and ${d2} are different, so we cannot ${add ? "add" : "subtract"} yet.`, undefined, "We can only add or subtract pieces that are the same size."),
        S("Find the lowest common denominator", `The smallest number that both ${d1} and ${d2} divide into is ${L}.`, M(`LCD = ${L}`), undefined, { prompt: `What is the LCD of ${d1} and ${d2}?`, answer: String(L) }),
        S("Make equivalent fractions", `Multiply top and bottom of each fraction so the denominator is ${L}.`, M(`${frac(n1, d1)} = ${frac(N1, L)}   and   ${frac(n2, d2)} = ${frac(N2, L)}`)),
        S(add ? "Add the numerators" : "Subtract the numerators", `${N1} ${add ? "+" : "−"} ${N2} = ${rn}`, M(`${frac(N1, L)} ${add ? "+" : "−"} ${frac(N2, L)} = ${frac(rn, L)}`)),
        S("Simplify", sd === L ? "It is already in simplest form." : `Divide top and bottom by ${gcd(rn, L)}.`, M(`${frac(rn, L)} = ${mixed(sn, sd)}`)),
      ],
      wrong: [wr(`${n1 + n2}/${d1 + d2}`, "frac.addDenominators", "It looks like the tops were added AND the bottoms were added. First make the denominators the same, then only add the tops.")],
      skillTag: "frac.addsub.different",
    });
  }
  let [d1, d2] = r.pick(LCD_PAIRS);
  let w1 = r.int(1, 4);
  let w2 = r.int(1, 3);
  let n1 = r.int(1, d1 - 1);
  let n2 = r.int(1, d2 - 1);
  let add = r.chance(0.5);
  const v1 = () => w1 * d1 + n1;
  const v2 = () => w2 * d2 + n2;
  if (!add && v1() * d2 <= v2() * d1) {
    [w1, w2] = [w2, w1];
    [n1, n2] = [n2, n1];
    [d1, d2] = [d2, d1];
  }
  if (!add && v1() * d2 === v2() * d1) add = true;
  const I1 = v1();
  const I2 = v2();
  const L = lcm(d1, d2);
  const A = (I1 * L) / d1;
  const B = (I2 * L) / d2;
  const rn = add ? A + B : A - B;
  const [sn, sd] = simp(rn, L);
  const steps: WorkedStep[] = [
    S("Change to improper fractions", "Multiply the whole number by the denominator and add the numerator.", M(`${w1}${frac(n1, d1)} = ${frac(I1, d1)}   and   ${w2}${frac(n2, d2)} = ${frac(I2, d2)}`)),
    S("Find the LCD", `The smallest number both ${d1} and ${d2} divide into is ${L}.`, M(`LCD = ${L}`)),
    S("Make equivalent fractions", "", M(`${frac(I1, d1)} = ${frac(A, L)}   and   ${frac(I2, d2)} = ${frac(B, L)}`)),
    S(add ? "Add" : "Subtract", "Only the numerators change.", M(`${frac(A, L)} ${add ? "+" : "−"} ${frac(B, L)} = ${frac(rn, L)}`)),
    S("Simplify and change back to a mixed number", "", M(`${frac(rn, L)} = ${mixed(sn, sd)}`)),
  ];
  return fracQ({
    prompt: `Calculate. Give your answer as a mixed number in simplest form.\n${M(`${w1}${frac(n1, d1)} ${add ? "+" : "−"} ${w2}${frac(n2, d2)}`)}`,
    n: rn,
    d: L,
    mixedForm: true,
    hints: ["Change both mixed numbers into improper fractions first.", `A mixed number like ${w1}${"{"}${n1}/${d1}${"}"}: ${w1} × ${d1} + ${n1} = ${I1}, so it is ${I1}/${d1}.`, `Now find the LCD of ${d1} and ${d2}, which is ${L}.`],
    steps,
    skillTag: "frac.addsub.mixed",
  });
};

const fracMulDiv: Gen = (r, level) => {
  if (level === "beginner") {
    const d = r.int(2, 8);
    const n = r.int(1, d - 1);
    const k = r.int(2, 9);
    const W = d * k;
    return numQ({
      prompt: `Calculate:\n${M(`${frac(n, d)} of ${W}`)}`,
      answer: n * k,
      visual: { type: "fractionbar", parts: d, shaded: n, caption: `${W} split into ${d} equal groups. Take ${n} of them.` },
      hints: ["'Of' means multiply. First share the number into equal groups.", `The bottom number (${d}) tells us how many equal groups. ${W} ÷ ${d} = ?`, `One group is ${k}. The top number (${n}) tells us how many groups to take.`],
      steps: [
        S("Divide by the denominator", `The denominator ${d} tells us to split ${W} into ${d} equal groups.`, M(`${W} ÷ ${d} = ${k}`), undefined, { prompt: `${W} ÷ ${d} = ?`, answer: String(k) }),
        S("Multiply by the numerator", `The numerator ${n} tells us to take ${n} of those groups.`, M(`${k} × ${n} = ${n * k}`)),
        S("Our answer", "", M(`${frac(n, d)} of ${W} = ${n * k}`)),
      ],
      wrong: [wr(k, "frac.forgotNumerator", `${k} is ONE group. The top number is ${n}, so we need ${n} groups.`)],
      skillTag: "frac.muldiv.of",
    });
  }
  if (level === "intermediate") {
    const d1 = r.pick([2, 3, 4, 5, 6, 8]);
    const d2 = r.pick([3, 4, 5, 7, 8, 9]);
    const n1 = r.int(1, d1 - 1);
    const n2 = r.int(1, d2 - 1);
    const rn = n1 * n2;
    const rd = d1 * d2;
    const [sn, sd] = simp(rn, rd);
    return fracQ({
      prompt: `Calculate. Give your answer in simplest form.\n${M(`${frac(n1, d1)} × ${frac(n2, d2)}`)}`,
      n: rn,
      d: rd,
      hints: ["To multiply fractions, multiply the tops together and the bottoms together.", `Top: ${n1} × ${n2}. Bottom: ${d1} × ${d2}.`, `You get ${rn}/${rd}. Can you simplify it?`],
      steps: [
        S("Multiply the numerators", `${n1} × ${n2} = ${rn}`),
        S("Multiply the denominators", `${d1} × ${d2} = ${rd}`, M(`${frac(n1, d1)} × ${frac(n2, d2)} = ${frac(rn, rd)}`)),
        S("Simplify", sd === rd ? "It is already in simplest form." : `Divide top and bottom by ${gcd(rn, rd)}.`, M(`${frac(rn, rd)} = ${frac(sn, sd)}`)),
      ],
      wrong: [wr(`${n1 * n2}/${d1}`, "frac.multiplyDenominator", "Remember to multiply the bottom numbers too — you do NOT keep one denominator when multiplying.")],
      skillTag: "frac.muldiv.mul",
    });
  }
  if (r.chance(0.3)) {
    const w = r.int(2, 6);
    const d = r.pick([2, 3, 4, 5]);
    return numQ({
      prompt: `How many pieces of size ${M(frac(1, d))} fit into ${w}?\n${M(`${w} ÷ ${frac(1, d)}`)}`,
      answer: w * d,
      hints: [`How many ${frac(1, d)}s fit into 1 whole?`.replace(/\{|\}/g, ""), `Each whole has ${d} pieces of size 1/${d}.`, `${w} wholes × ${d} pieces each.`],
      steps: [
        S("Think about ONE whole", `One whole has ${d} pieces of size 1/${d}.`),
        S("Multiply by the number of wholes", "", M(`${w} × ${d} = ${w * d}`)),
        S("Link to the rule", "Dividing by a fraction is the same as multiplying by its flip.", M(`${w} ÷ ${frac(1, d)} = ${w} × ${frac(d, 1)} = ${w * d}`)),
      ],
      skillTag: "frac.muldiv.div",
    });
  }
  const d1 = r.pick([2, 3, 4, 5, 6]);
  const d2 = r.pick([2, 3, 4, 5, 7]);
  const n1 = r.int(1, d1);
  const n2 = r.int(1, d2 - 1 || 1);
  const rn = n1 * d2;
  const rd = d1 * n2;
  const [sn, sd] = simp(rn, rd);
  return fracQ({
    prompt: `Calculate. Give your answer in simplest form.\n${M(`${frac(n1, d1)} ÷ ${frac(n2, d2)}`)}`,
    n: rn,
    d: rd,
    mixedForm: true,
    hints: ["To divide by a fraction: KEEP the first fraction, CHANGE ÷ to ×, FLIP the second fraction.", `Flip ${n2}/${d2} to get ${d2}/${n2}.`, `Now multiply: ${n1}/${d1} × ${d2}/${n2}.`],
    steps: [
      S("Keep, Change, Flip", "Keep the first fraction. Change ÷ to ×. Flip the second fraction upside down.", M(`${frac(n1, d1)} ÷ ${frac(n2, d2)} = ${frac(n1, d1)} × ${frac(d2, n2)}`), "Dividing by a fraction asks 'how many of these fit?'. Flipping and multiplying gives the same answer."),
      S("Multiply across", "", M(`${frac(n1, d1)} × ${frac(d2, n2)} = ${frac(rn, rd)}`)),
      S("Simplify", "", M(`${frac(rn, rd)} = ${mixed(sn, sd)}`)),
    ],
    skillTag: "frac.muldiv.div",
  });
};

const fracForms: Gen = (r, level) => {
  const dens = [2, 4, 5, 10, 20, 25, 50];
  if (level === "beginner") {
    const d = r.pick(dens);
    const n = r.int(1, d - 1);
    const k = 100 / d;
    const dec = (n * k) / 100;
    return numQ({
      prompt: `Write ${M(frac(n, d))} as a decimal.`,
      answer: dec,
      hints: ["A decimal fraction has a denominator of 10, 100 or 1 000. Can you change the denominator to 100?", `${d} × ${k} = 100. Multiply the top by ${k} too.`, `You get ${n * k}/100. How do we write hundredths as a decimal?`],
      steps: [
        S("Make the denominator 100", `${d} × ${k} = 100, so multiply the top by ${k} too.`, M(`${frac(n, d)} = ${frac(n * k, 100)}`)),
        S("Write hundredths as a decimal", `${n * k} hundredths is ${fmtNum(dec)}.`, M(`${frac(n * k, 100)} = ${fmtNum(dec)}`), "Hundredths are the second place after the decimal comma."),
      ],
      skillTag: "frac.forms.todecimal",
    });
  }
  if (level === "intermediate") {
    if (r.chance(0.5)) {
      const d = r.pick(dens);
      const n = r.int(1, d - 1);
      const k = 100 / d;
      return numQ({
        prompt: `Write ${M(frac(n, d))} as a percentage.`,
        answer: n * k,
        unit: "%",
        hints: ["Percent means 'out of 100'.", `Change the denominator to 100: ${d} × ${k} = 100.`, `Multiply the top by ${k} as well.`],
        steps: [
          S("Remember what % means", "Per cent means 'out of 100'."),
          S("Make the denominator 100", `${d} × ${k} = 100`, M(`${frac(n, d)} = ${frac(n * k, 100)}`)),
          S("Our answer", `${n * k} out of 100 is ${n * k}%.`, M(`${n * k}%`)),
        ],
        skillTag: "frac.forms.topercent",
      });
    }
    const pct = r.pick([5, 10, 15, 20, 25, 30, 35, 40, 45, 60, 65, 75, 80, 85]);
    const [sn, sd] = simp(pct, 100);
    return fracQ({
      prompt: `Write ${M(`${pct}%`)} as a fraction in simplest form.`,
      n: pct,
      d: 100,
      hints: ["Percent means 'out of 100'. Start by writing it over 100.", `${pct}% = ${pct}/100`, `Now simplify by dividing top and bottom by their HCF (${gcd(pct, 100)}).`],
      steps: [
        S("Write over 100", `${pct}% means ${pct} out of 100.`, M(`${pct}% = ${frac(pct, 100)}`)),
        S("Simplify", `Divide top and bottom by ${gcd(pct, 100)}.`, M(`${frac(pct, 100)} = ${frac(sn, sd)}`)),
      ],
      skillTag: "frac.forms.frompercent",
    });
  }
  if (r.chance(0.5)) {
    const hundredths = r.pick([5, 15, 25, 35, 45, 55, 65, 75, 85, 12, 24, 36, 48, 8, 16]);
    const dec = hundredths / 100;
    const [sn, sd] = simp(hundredths, 100);
    return fracQ({
      prompt: `Write ${M(fmtNum(dec))} as a fraction in simplest form.`,
      n: hundredths,
      d: 100,
      hints: ["Say the decimal in words. 0,35 is 'thirty-five hundredths'.", `${fmtNum(dec)} = ${hundredths}/100`, `Simplify by dividing top and bottom by ${gcd(hundredths, 100)}.`],
      steps: [
        S("Read the decimal as a fraction", `${fmtNum(dec)} has 2 decimal places, so the denominator is 100.`, M(`${fmtNum(dec)} = ${frac(hundredths, 100)}`)),
        S("Simplify", `Divide top and bottom by ${gcd(hundredths, 100)}.`, M(`${frac(hundredths, 100)} = ${frac(sn, sd)}`)),
      ],
      skillTag: "frac.forms.fromdecimal",
    });
  }
  const ks = r.shuffle([6, 7, 9, 11, 12, 13, 14, 15, 16, 17]).slice(0, 3);
  const forms = r.shuffle(["frac", "dec", "pct"] as const);
  const show = (k: number, f: "frac" | "dec" | "pct") => {
    if (f === "frac") {
      const [n, d] = simp(k, 20);
      return M(frac(n, d));
    }
    if (f === "dec") return M(fmtNum(k / 20));
    return M(`${fmtNum((k * 100) / 20)}%`);
  };
  const shown = ks.map((k, i) => show(k, forms[i]));
  const best = ks.indexOf(Math.max(...ks));
  return choiceQ(r, {
    prompt: "Which of these is the GREATEST?",
    correct: shown[best],
    wrongs: shown.filter((_, i) => i !== best),
    hints: ["Change all three numbers into the same form first (for example, all decimals).", "Fraction → decimal: divide the top by the bottom. Percentage → decimal: divide by 100.", `The values are ${ks.map((k) => fmtNum(k / 20)).join("; ")} as decimals.`],
    steps: [
      S("Change them all to decimals", "Then they are easy to compare.", M(ks.map((k, i) => `${shown[i].replace(/\$/g, "")} = ${fmtNum(k / 20)}`).join(";  "))),
      S("Compare the decimals", `The greatest is ${fmtNum(ks[best] / 20)}.`),
      S("Our answer", "", shown[best]),
    ],
    skillTag: "frac.forms.compare",
  });
};

// ---------- Decimal fractions ----------

const DEC_PLACE_NAMES: Record<string, string> = { "-1": "tenths", "-2": "hundredths", "-3": "thousandths", "0": "ones", "1": "tens", "2": "hundreds" };

const decPlace: Gen = (r, level) => {
  if (level === "beginner") {
    const digits = r.shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9]).slice(0, 4);
    const intDigits = digits.slice(0, 1);
    const decDigits = digits.slice(1);
    const num = Number(`${intDigits[0]}.${decDigits.join("")}`);
    const idx = r.int(0, 2);
    const digit = decDigits[idx];
    const place = -(idx + 1);
    const value = digit * Math.pow(10, place);
    const placeName = DEC_PLACE_NAMES[String(place)];
    const wrongs = [digit, digit * 0.1, digit * 0.01, digit * 0.001, digit * 10].map((v) => fmtNum(roundTo(v, 6)));
    return choiceQ(r, {
      prompt: `What is the VALUE of the digit ${digit} in ${M(fmtNum(num))}?`,
      correct: fmtNum(roundTo(value, 6)),
      wrongs,
      hints: ["Each place after the decimal comma gets 10 times smaller: tenths, hundredths, thousandths.", `Find the digit ${digit}. How many places after the comma is it?`, `It is in the ${placeName} place.`],
      steps: [
        S("Name the places after the comma", "First place: tenths. Second place: hundredths. Third place: thousandths.", M(`${fmtNum(num)}`)),
        S("Find the digit", `The digit ${digit} is in the ${placeName} place.`),
        S("Its value", `${digit} ${placeName} = ${fmtNum(roundTo(value, 6))}`, M(`${digit} × ${fmtNum(Math.pow(10, place))} = ${fmtNum(roundTo(value, 6))}`)),
      ],
      skillTag: "dec.place.value",
    });
  }
  if (level === "intermediate") {
    const dp = r.pick([1, 2]);
    const whole = r.int(1, 49);
    const decimals = r.int(1000, 9999);
    const num = Number(`${whole}.${decimals}`);
    const keep = String(decimals).slice(0, dp);
    const next = Number(String(decimals)[dp]);
    const base = Number(`${whole}.${keep}`);
    const up = next >= 5;
    const ans = roundTo(up ? base + Math.pow(10, -dp) : base, dp);
    return numQ({
      prompt: `Round ${M(fmtNum(num))} to ${dp} decimal place${dp > 1 ? "s" : ""}.`,
      answer: ans,
      dp,
      hints: [`Find the digit in the ${dp === 1 ? "first" : "second"} decimal place. This is the digit we keep (or change).`, "Look at the NEXT digit to the right. If it is 5 or more, round UP. If it is 4 or less, keep the digit the same.", `The next digit is ${next}, so we round ${up ? "UP" : "DOWN (keep it the same)"}.`],
      steps: [
        S("Find the rounding place", `We want ${dp} decimal place${dp > 1 ? "s" : ""}: ${fmtNum(base)}`),
        S("Look at the next digit", `The digit after that is ${next}.`),
        S("Decide: up or down?", up ? "5 or more → round UP." : "4 or less → keep the digit the same.", undefined, "A digit of 5 or more means we are at least halfway to the next number."),
        S("Our answer", "", M(`${fmtNum(num)} ≈ ${fmtNum(ans, dp)}`)),
      ],
      skillTag: "dec.place.round",
    });
  }
  const pool = r.shuffle([0.5, 0.45, 0.405, 0.54, 0.4, 0.504, 0.055, 0.5, 0.35, 0.305, 0.53]).filter((v, i, a) => a.indexOf(v) === i).slice(0, 4);
  const asc = [...pool].sort((x, y) => x - y);
  const longestFirst = [...pool].sort((x, y) => String(x).length - String(y).length || x - y);
  const show = (arr: number[]) => M(arr.map((n) => fmtNum(n)).join("; "));
  const desc = [...asc].reverse();
  const swapped = [...asc];
  [swapped[0], swapped[1]] = [swapped[1], swapped[0]];
  return choiceQ(r, {
    prompt: `Which list is in order from SMALLEST to BIGGEST?\n${M(pool.map((n) => fmtNum(n)).join("; "))}`,
    correct: show(asc),
    wrongs: [show(desc), show(longestFirst), show(swapped)],
    hints: ["Write all the numbers with the same number of decimal places by adding zeros. 0,5 = 0,500.", "Then compare them like whole numbers: 500, 450, 405...", `Written with 3 decimals: ${pool.map((n) => fmtNum(n, 3)).join("; ")}`],
    steps: [
      S("Give every number 3 decimal places", "Adding zeros at the end does not change the value.", M(pool.map((n) => fmtNum(n, 3)).join(";  "))),
      S("Compare them like whole numbers", "Ignore the comma for a moment and compare 500, 450, 405...", M(asc.map((n) => fmtNum(n, 3)).join(" < "))),
      S("Our answer", "", show(asc)),
    ],
    notes: { [show(longestFirst)]: { tag: "dec.longerIsBigger", message: "A decimal with more digits is not always bigger. 0,5 is bigger than 0,45 because 5 tenths is more than 4 tenths." } },
    skillTag: "dec.place.order",
  });
};

const decAddSub: Gen = (r, level) => {
  if (level === "beginner") {
    const a = r.int(11, 99) / 10;
    const b = r.int(11, 99) / 10;
    const res = roundTo(a + b, 1);
    return numQ({
      prompt: `Calculate:\n${M(`${fmtNum(a, 1)} + ${fmtNum(b, 1)}`)}`,
      answer: res,
      hints: ["Line up the decimal commas under each other.", "Add the tenths first, then the ones.", `${Math.round((a * 10) % 10)} tenths + ${Math.round((b * 10) % 10)} tenths = ${Math.round((a * 10) % 10) + Math.round((b * 10) % 10)} tenths.`],
      steps: [
        S("Line up the commas", "Put the decimal commas straight under each other.", M(`${fmtNum(a, 1)}\n+ ${fmtNum(b, 1)}`)),
        S("Add like a whole number", `Ignore the comma: ${Math.round(a * 10)} + ${Math.round(b * 10)} = ${Math.round(a * 10) + Math.round(b * 10)}.`),
        S("Put the comma back", "The answer has 1 decimal place, just like the question.", M(`${fmtNum(a, 1)} + ${fmtNum(b, 1)} = ${fmtNum(res, 1)}`)),
      ],
      skillTag: "dec.addsub.add",
    });
  }
  if (level === "intermediate") {
    const w = r.int(3, 20);
    const x = r.int(11, 99) / 100;
    const res = roundTo(w - x, 2);
    return numQ({
      prompt: `Calculate:\n${M(`${w} − ${fmtNum(x, 2)}`)}`,
      answer: res,
      hints: ["Write the whole number with the same number of decimal places: " + w + " = " + fmtNum(w, 2) + ".", "Line up the commas and subtract like whole numbers.", `${Math.round(w * 100)} − ${Math.round(x * 100)} = ${Math.round(w * 100) - Math.round(x * 100)}`],
      steps: [
        S("Add zeros so both numbers have 2 decimal places", `${w} is the same as ${fmtNum(w, 2)}.`, M(`${fmtNum(w, 2)} − ${fmtNum(x, 2)}`)),
        S("Subtract like whole numbers", `${Math.round(w * 100)} − ${Math.round(x * 100)} = ${Math.round(w * 100) - Math.round(x * 100)}`),
        S("Put the comma back", "Two decimal places.", M(`${fmtNum(w, 2)} − ${fmtNum(x, 2)} = ${fmtNum(res, 2)}`)),
      ],
      skillTag: "dec.addsub.sub",
    });
  }
  const items = [r.int(1500, 4500) / 100, r.int(800, 2500) / 100, r.int(200, 900) / 100];
  const total = roundTo(items[0] + items[1] + items[2], 2);
  const pay = Math.ceil(total / 50) * 50 + (r.chance(0.5) ? 0 : 50);
  const change = roundTo(pay - total, 2);
  return numQ({
    prompt: `Thandi buys items costing R${fmtNum(items[0], 2)}, R${fmtNum(items[1], 2)} and R${fmtNum(items[2], 2)}. She pays with R${pay}. How much change does she get?`,
    answer: change,
    unit: "rand",
    dp: 2,
    hints: ["First find the TOTAL cost of the three items.", `Add: ${fmtNum(items[0], 2)} + ${fmtNum(items[1], 2)} + ${fmtNum(items[2], 2)}`, `The total is R${fmtNum(total, 2)}. Change = amount paid − total.`],
    steps: [
      S("Find the total cost", "Add the three prices. Keep the commas lined up.", M(`${fmtNum(items[0], 2)} + ${fmtNum(items[1], 2)} + ${fmtNum(items[2], 2)} = ${fmtNum(total, 2)}`)),
      S("Work out the change", `Change = amount paid − total cost.`, M(`${pay} − ${fmtNum(total, 2)} = ${fmtNum(change, 2)}`)),
      S("Our answer", `Thandi gets R${fmtNum(change, 2)} change.`),
    ],
    skillTag: "dec.addsub.money",
  });
};

const decMulDiv: Gen = (r, level) => {
  if (level === "beginner") {
    const mul = r.chance(0.5);
    const k = r.pick([10, 100, 1000]);
    const base = r.pick([3.4, 0.56, 12.7, 4.05, 0.7, 8.9, 2.35]);
    const res = roundTo(mul ? base * k : base / k, 8);
    const zeros = String(k).length - 1;
    return numQ({
      prompt: `Calculate:\n${M(`${fmtNum(base)} ${mul ? "×" : "÷"} ${fmtNum(k)}`)}`,
      answer: res,
      hints: [`${fmtNum(k)} has ${zeros} zero${zeros > 1 ? "s" : ""}. That tells us how many places the comma jumps.`, mul ? "Multiplying makes the number bigger, so the comma moves to the RIGHT." : "Dividing makes the number smaller, so the comma moves to the LEFT.", `Move the comma ${zeros} place${zeros > 1 ? "s" : ""} to the ${mul ? "right" : "left"}. Add zeros if you need to.`],
      steps: [
        S("Count the zeros", `${fmtNum(k)} has ${zeros} zero${zeros > 1 ? "s" : ""}.`),
        S("Move the comma", mul ? `Multiplying: move the comma ${zeros} place${zeros > 1 ? "s" : ""} to the RIGHT.` : `Dividing: move the comma ${zeros} place${zeros > 1 ? "s" : ""} to the LEFT.`, undefined, mul ? "Each digit becomes 10 times bigger for every place it moves left in value." : "Each digit becomes 10 times smaller for every place the comma moves left."),
        S("Our answer", "", M(`${fmtNum(base)} ${mul ? "×" : "÷"} ${fmtNum(k)} = ${fmtNum(res)}`)),
      ],
      skillTag: "dec.muldiv.tens",
    });
  }
  if (level === "intermediate") {
    if (r.chance(0.5)) {
      const x = r.int(11, 99) / 10;
      const w = r.int(3, 9);
      const res = roundTo(x * w, 1);
      return numQ({
        prompt: `Calculate:\n${M(`${fmtNum(x, 1)} × ${w}`)}`,
        answer: res,
        hints: ["Ignore the comma and multiply as whole numbers.", `${Math.round(x * 10)} × ${w} = ?`, "Then put the comma back so the answer has the same number of decimal places as the question (1)."],
        steps: [
          S("Ignore the comma", `${fmtNum(x, 1)} becomes ${Math.round(x * 10)}.`),
          S("Multiply", `${Math.round(x * 10)} × ${w} = ${Math.round(x * 10) * w}`),
          S("Put the comma back", "The question had 1 decimal place, so the answer has 1 decimal place.", M(`${fmtNum(x, 1)} × ${w} = ${fmtNum(res, 1)}`)),
        ],
        skillTag: "dec.muldiv.mulwhole",
      });
    }
    const w = r.int(2, 9);
    const q = r.int(11, 99) / 10;
    const n = roundTo(q * w, 1);
    return numQ({
      prompt: `Calculate:\n${M(`${fmtNum(n, 1)} ÷ ${w}`)}`,
      answer: q,
      hints: ["Divide as if there were no comma, but put the comma in the answer straight above the comma in the question.", `${Math.round(n * 10)} ÷ ${w} = ?`, `Check: ${w} × ${fmtNum(q)} should give ${fmtNum(n)}.`],
      steps: [
        S("Ignore the comma for a moment", `${fmtNum(n, 1)} becomes ${Math.round(n * 10)}.`),
        S("Divide", `${Math.round(n * 10)} ÷ ${w} = ${Math.round(q * 10)}`),
        S("Put the comma back", "The answer has 1 decimal place.", M(`${fmtNum(n, 1)} ÷ ${w} = ${fmtNum(q, 1)}`)),
        S("Check", `${w} × ${fmtNum(q, 1)} = ${fmtNum(n, 1)} ✓`),
      ],
      skillTag: "dec.muldiv.divwhole",
    });
  }
  if (r.chance(0.5)) {
    const a = r.int(2, 9) / 10;
    const b = r.int(2, 9) / 10;
    const res = roundTo(a * b, 2);
    return numQ({
      prompt: `Calculate:\n${M(`${fmtNum(a, 1)} × ${fmtNum(b, 1)}`)}`,
      answer: res,
      hints: ["Ignore both commas and multiply as whole numbers.", `${Math.round(a * 10)} × ${Math.round(b * 10)} = ${Math.round(a * 10) * Math.round(b * 10)}`, "Count the decimal places in the question (1 + 1 = 2). The answer needs that many."],
      steps: [
        S("Ignore the commas", `${fmtNum(a, 1)} → ${Math.round(a * 10)} and ${fmtNum(b, 1)} → ${Math.round(b * 10)}`),
        S("Multiply", `${Math.round(a * 10)} × ${Math.round(b * 10)} = ${Math.round(a * 10) * Math.round(b * 10)}`),
        S("Count decimal places", "One in each number: 1 + 1 = 2 decimal places in the answer."),
        S("Our answer", "", M(`${fmtNum(a, 1)} × ${fmtNum(b, 1)} = ${fmtNum(res, 2)}`)),
      ],
      wrong: [wr(roundTo(a * b * 10, 1), "dec.placeComma", "Check where the comma goes. Count the decimal places in BOTH numbers: 1 + 1 = 2.")],
      skillTag: "dec.muldiv.mulDec",
    });
  }
  const div = r.pick([0.2, 0.5, 0.4, 0.25 * 4 / 4, 0.1]);
  const q = r.int(4, 30);
  const n = roundTo(q * div, 2);
  const mult = div < 1 && roundTo(div * 10, 6) === Math.round(div * 10) ? 10 : 100;
  return numQ({
    prompt: `Calculate:\n${M(`${fmtNum(n)} ÷ ${fmtNum(div)}`)}`,
    answer: q,
    hints: ["Make the number you divide BY a whole number by multiplying both numbers by 10 (or 100).", `Multiply both numbers by ${mult}.`, `${fmtNum(roundTo(n * mult, 4))} ÷ ${fmtNum(roundTo(div * mult, 4))}`],
    steps: [
      S("Make the divisor a whole number", `Multiply both numbers by ${mult}. The answer stays the same.`, M(`${fmtNum(n)} ÷ ${fmtNum(div)} = ${fmtNum(roundTo(n * mult, 4))} ÷ ${fmtNum(roundTo(div * mult, 4))}`), "Multiplying both numbers by the same amount keeps the division the same."),
      S("Divide", "", M(`${fmtNum(roundTo(n * mult, 4))} ÷ ${fmtNum(roundTo(div * mult, 4))} = ${q}`)),
    ],
    skillTag: "dec.muldiv.divDec",
  });
};

export const genFractions: Record<string, Gen> = {
  "frac-equiv": fracEquiv,
  "frac-addsub": fracAddSub,
  "frac-muldiv": fracMulDiv,
  "frac-forms": fracForms,
  "dec-place": decPlace,
  "dec-addsub": decAddSub,
  "dec-muldiv": decMulDiv,
};
