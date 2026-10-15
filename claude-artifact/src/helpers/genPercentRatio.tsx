// Question generators: Percentages, Ratio and rate, Exponents.
import { type Gen, S, M, wr, numQ, choiceQ, textQ } from "./genKit";
import { fmtMoney, fmtNum, gcd, roundTo } from "./mathUtils";

// ---------- Percentages ----------

const pctOf: Gen = (r, level) => {
  if (level === "beginner") {
    const p = r.pick([50, 25, 10, 20, 75]);
    const base = p === 25 || p === 75 ? r.pick([40, 80, 120, 200, 60]) : r.pick([20, 40, 60, 80, 100, 150, 200, 300]);
    const ans = (p * base) / 100;
    const note: Record<number, string> = {
      50: "50% is the same as one half (÷ 2).",
      25: "25% is the same as one quarter (÷ 4).",
      10: "10% is the same as one tenth (÷ 10).",
      20: "20% is two lots of 10%.",
      75: "75% is three quarters (÷ 4, then × 3).",
    };
    return numQ({
      prompt: `Calculate ${M(`${p}%`)} of ${base}.`,
      answer: ans,
      hints: ["Percent means 'out of 100'. Some percentages are easy fractions.", note[p], `${p}% of ${base} = ${p}/100 × ${base}`],
      steps: [
        S("What does the percentage mean?", `${p}% means ${p} out of every 100.`, M(`${p}% = ${p}/100`)),
        S("Use an easy fraction", note[p]),
        S("Calculate", "", M(`${p}% of ${base} = ${ans}`)),
      ],
      skillTag: "pct.of.easy",
    });
  }
  if (level === "intermediate") {
    const p = r.pick([15, 30, 35, 45, 12, 60, 8, 90]);
    const base = r.pick([20, 40, 60, 80, 100, 120, 200, 240, 300, 500]);
    const ans = roundTo((p * base) / 100, 4);
    const onePct = base / 100;
    const asMoney = r.chance(0.5);
    return numQ({
      prompt: asMoney ? `Calculate ${M(`${p}%`)} of ${fmtMoney(base)}.` : `Calculate ${M(`${p}%`)} of ${base}.`,
      answer: ans,
      unit: asMoney ? "rand" : undefined,
      hints: ["Find 1% first: divide the amount by 100.", `1% of ${base} = ${fmtNum(onePct)}`, `Now multiply by ${p}.`],
      steps: [
        S("Find 1%", `Divide by 100.`, M(`${base} ÷ 100 = ${fmtNum(onePct)}`)),
        S(`Multiply by ${p}`, `${p}% is ${p} lots of 1%.`, M(`${fmtNum(onePct)} × ${p} = ${fmtNum(ans)}`)),
        S("Our answer", "", M(`${p}% of ${base} = ${fmtNum(ans)}`)),
      ],
      skillTag: "pct.of.general",
    });
  }
  const p = r.pick([20, 25, 40, 50, 10, 30]);
  const whole = r.pick([60, 80, 120, 150, 200, 250, 400]);
  const part = (p * whole) / 100;
  return numQ({
    prompt: `${p}% of a number is ${part}. What is the number?`,
    answer: whole,
    hints: ["If " + p + "% is " + part + ", can you find what 1% is?", `1% = ${part} ÷ ${p}`, "Then multiply by 100 to get 100%, the whole number."],
    steps: [
      S("Find 1%", `${p}% is ${part}, so divide by ${p} to find 1%.`, M(`${part} ÷ ${p} = ${fmtNum(part / p)}`)),
      S("Find 100%", "100% is the whole number: multiply 1% by 100.", M(`${fmtNum(part / p)} × 100 = ${whole}`)),
      S("Check", `${p}% of ${whole} = ${part} ✓`),
    ],
    skillTag: "pct.of.reverse",
  });
};

const pctChange: Gen = (r, level) => {
  if (level === "beginner") {
    const price = r.pick([100, 120, 150, 200, 240, 300, 400, 500]);
    const d = r.pick([10, 20, 25, 50]);
    const disc = (price * d) / 100;
    return numQ({
      prompt: `A jacket costs ${fmtMoney(price)}. It is on sale with a ${d}% discount. What is the sale price?`,
      answer: price - disc,
      unit: "rand",
      hints: ["A discount is an amount taken OFF the price.", `First find ${d}% of ${fmtMoney(price)}.`, `The discount is ${fmtMoney(disc)}. Now subtract it from the price.`],
      steps: [
        S("Find the discount amount", `${d}% of ${fmtMoney(price)}`, M(`${d}/100 × ${price} = ${fmtNum(disc)}`)),
        S("Subtract the discount", "The sale price is the old price MINUS the discount.", M(`${price} − ${fmtNum(disc)} = ${fmtNum(price - disc)}`)),
        S("Our answer", `The sale price is ${fmtMoney(price - disc)}.`),
      ],
      wrong: [wr(disc, "pct.discountOnly", "That is the amount of the discount. The question asks for the SALE PRICE, so subtract it from the original price.")],
      skillTag: "pct.change.discount",
    });
  }
  if (level === "intermediate") {
    const price = r.pick([20, 40, 60, 80, 100, 200, 300, 500]);
    if (r.chance(0.6)) {
      const vat = (price * 15) / 100;
      return numQ({
        prompt: `A book costs ${fmtMoney(price)} before VAT. VAT in South Africa is 15%. What is the price including VAT?`,
        answer: price + vat,
        unit: "rand",
        hints: ["VAT (value-added tax) is an extra amount added to the price.", `Find 15% of ${fmtMoney(price)}.`, `VAT = ${fmtMoney(vat)}. Now ADD it to the price.`],
        steps: [
          S("Find the VAT", `15% of ${fmtMoney(price)}`, M(`15/100 × ${price} = ${fmtNum(vat)}`)),
          S("Add the VAT to the price", "", M(`${price} + ${fmtNum(vat)} = ${fmtNum(price + vat)}`)),
          S("Our answer", `The price including VAT is ${fmtMoney(price + vat)}.`),
        ],
        skillTag: "pct.change.vat",
      });
    }
    const p = r.pick([10, 20, 25, 50]);
    const inc = (price * p) / 100;
    return numQ({
      prompt: `A bus ticket costs ${fmtMoney(price)}. The price goes up by ${p}%. What is the new price?`,
      answer: price + inc,
      unit: "rand",
      hints: ["An increase means the price gets bigger.", `Find ${p}% of ${fmtMoney(price)} first.`, `The increase is ${fmtMoney(inc)}. Add it on.`],
      steps: [
        S("Find the increase", `${p}% of ${fmtMoney(price)}`, M(`${p}/100 × ${price} = ${fmtNum(inc)}`)),
        S("Add it to the old price", "", M(`${price} + ${fmtNum(inc)} = ${fmtNum(price + inc)}`)),
      ],
      skillTag: "pct.change.increase",
    });
  }
  const excl = r.pick([40, 60, 80, 100, 160, 200, 300, 500]);
  const incl = (excl * 115) / 100;
  return numQ({
    prompt: `A phone costs ${fmtMoney(incl)} including 15% VAT. What is the price BEFORE VAT?`,
    answer: excl,
    unit: "rand",
    hints: ["The price including VAT is 115% of the original price (100% + 15%).", `If 115% is ${fmtMoney(incl)}, find 1% first: divide by 115.`, `1% = ${fmtNum(incl / 115)}. Multiply by 100 for the price before VAT.`],
    steps: [
      S("Understand 115%", "The original price is 100%. VAT adds 15%, so the price with VAT is 115% of the original."),
      S("Find 1%", "", M(`${incl} ÷ 115 = ${fmtNum(incl / 115)}`)),
      S("Find 100%", "", M(`${fmtNum(incl / 115)} × 100 = ${excl}`)),
      S("Check", `15% of ${fmtMoney(excl)} is ${fmtMoney((excl * 15) / 100)}, and ${excl} + ${fmtNum((excl * 15) / 100)} = ${incl} ✓`),
    ],
    wrong: [wr(roundTo(incl * 0.85, 2), "pct.subtractVat", "Taking 15% off the VAT-inclusive price does not give the original price. The 15% was calculated on the smaller, original amount.")],
    skillTag: "pct.change.reverse",
  });
};

const pctExpress: Gen = (r, level) => {
  if (level === "beginner") {
    const whole = r.pick([10, 20, 25, 50, 4, 5]);
    const part = r.int(1, whole - 1);
    const pct = (part * 100) / whole;
    return numQ({
      prompt: `Judah got ${part} out of ${whole} in a quiz. What percentage is this?`,
      answer: pct,
      unit: "%",
      hints: ["Write it as a fraction first: part over whole.", `${part}/${whole}. Now make the denominator 100.`, `${whole} × ${100 / whole} = 100. Do the same to the top.`],
      steps: [
        S("Write as a fraction", "part ÷ whole", M(`${part}/${whole}`)),
        S("Make the denominator 100", `${whole} × ${100 / whole} = 100, so multiply the top by ${100 / whole} too.`, M(`${part} × ${100 / whole} = ${pct}`)),
        S("Our answer", `${pct} out of 100 is ${pct}%.`),
      ],
      skillTag: "pct.express.easy",
    });
  }
  if (level === "intermediate") {
    const whole = r.pick([8, 40, 50, 200, 25, 80]);
    const part = r.int(2, whole - 1);
    const pct = roundTo((part * 100) / whole, 2);
    return numQ({
      prompt: `A learner scores ${part} out of ${whole} in a test. What is the mark as a percentage?`,
      answer: pct,
      unit: "%",
      hints: ["Divide the mark by the total, then multiply by 100.", `${part} ÷ ${whole} = ${fmtNum(roundTo(part / whole, 4))}`, "Multiply that by 100 to get a percentage."],
      steps: [
        S("Write as a fraction", "", M(`${part}/${whole}`)),
        S("Divide", `${part} ÷ ${whole} = ${fmtNum(roundTo(part / whole, 4))}`),
        S("Multiply by 100", "A percentage is a fraction out of 100.", M(`${fmtNum(roundTo(part / whole, 4))} × 100 = ${fmtNum(pct)}`)),
        S("Our answer", "", M(`${fmtNum(pct)}%`)),
      ],
      skillTag: "pct.express.general",
    });
  }
  const cost = r.pick([20, 40, 50, 80, 100, 200, 250, 400]);
  const p = r.pick([10, 20, 25, 50]);
  const sell = (cost * (100 + p)) / 100;
  const profit = sell - cost;
  return numQ({
    prompt: `A shop buys a bag for ${fmtMoney(cost)} and sells it for ${fmtMoney(sell)}. What is the profit as a percentage of the cost price?`,
    answer: p,
    unit: "%",
    hints: ["Profit = selling price − cost price.", `Profit = ${fmtMoney(sell)} − ${fmtMoney(cost)} = ${fmtMoney(profit)}`, "Percentage profit = (profit ÷ cost price) × 100."],
    steps: [
      S("Find the profit", "Selling price − cost price", M(`${sell} − ${cost} = ${profit}`)),
      S("Compare to the COST price", "Percentage profit is based on what the shop paid.", M(`${profit}/${cost} × 100`)),
      S("Calculate", "", M(`${fmtNum(profit / cost)} × 100 = ${p}%`)),
    ],
    wrong: [wr(roundTo((profit / sell) * 100, 2), "pct.wrongBase", "Percentage profit compares the profit to the COST price (what the shop paid), not the selling price.")],
    skillTag: "pct.express.profit",
  });
};

// ---------- Ratio and rate ----------

const ratioSimplify: Gen = (r, level) => {
  if (level === "beginner") {
    const base = r.pick([[1, 2], [2, 3], [3, 4], [1, 3], [2, 5], [3, 5], [1, 4]] as const);
    const k = r.int(2, 9);
    const a = base[0] * k;
    const b = base[1] * k;
    return textQ({
      prompt: `Simplify the ratio ${M(`${a} : ${b}`)}. Type it like 2:3.`,
      answer: `${base[0]}:${base[1]}`,
      accept: [`${base[0]} : ${base[1]}`],
      placeholder: "e.g. 2:3",
      answerText: M(`${base[0]} : ${base[1]}`),
      hints: ["A ratio compares two amounts. To simplify it, divide BOTH numbers by the same number.", `What number divides into both ${a} and ${b}?`, `Both divide by ${k}.`],
      steps: [
        S("Find a number that divides both", `${a} and ${b} both divide by ${k}.`, M(`HCF(${a}; ${b}) = ${k}`)),
        S("Divide both parts", `${a} ÷ ${k} = ${base[0]} and ${b} ÷ ${k} = ${base[1]}`, M(`${a} : ${b} = ${base[0]} : ${base[1]}`), "Dividing both parts by the same number keeps the ratio the same."),
      ],
      skillTag: "ratio.simplify.basic",
    });
  }
  if (level === "intermediate") {
    const base = r.pick([[2, 3], [3, 5], [4, 7], [1, 6], [5, 8]] as const);
    const k = r.int(2, 5);
    const asked = r.chance(0.5);
    const missing = asked ? base[1] * k : base[0] * k;
    return numQ({
      prompt: asked
        ? `Find the missing number: ${M(`${base[0]} : ${base[1]} = ${base[0] * k} : ?`)}`
        : `Find the missing number: ${M(`${base[0]} : ${base[1]} = ? : ${base[1] * k}`)}`,
      answer: missing,
      hints: ["Equivalent ratios are made by multiplying both parts by the same number.", asked ? `What did ${base[0]} get multiplied by to become ${base[0] * k}?` : `What did ${base[1]} get multiplied by to become ${base[1] * k}?`, `The multiplier is ${k}. Multiply the other part by ${k} too.`],
      steps: [
        S("Find the multiplier", asked ? `${base[0]} × ${k} = ${base[0] * k}` : `${base[1]} × ${k} = ${base[1] * k}`),
        S("Use it on the other part", asked ? `${base[1]} × ${k} = ${base[1] * k}` : `${base[0]} × ${k} = ${base[0] * k}`),
        S("Our answer", `The missing number is ${missing}.`),
      ],
      skillTag: "ratio.simplify.equivalent",
    });
  }
  const m = r.pick([[150, 3, 50], [200, 4, 50], [60, 2, 30], [90, 3, 30]] as const);
  const cm = m[0];
  const metres = m[1];
  const a = cm;
  const b = metres * 100;
  const [sa, sb] = [a / gcd(a, b), b / gcd(a, b)];
  return textQ({
    prompt: `Write the ratio ${M(`${cm} cm : ${metres} m`)} in simplest form (no units). Type it like 1:2.`,
    answer: `${sa}:${sb}`,
    accept: [`${sa} : ${sb}`],
    placeholder: "e.g. 1:2",
    answerText: M(`${sa} : ${sb}`),
    hints: ["To compare amounts in a ratio, they must be in the SAME units.", `Change ${metres} m to centimetres: 1 m = 100 cm.`, `Now the ratio is ${a} : ${b}. Simplify it.`],
    steps: [
      S("Make the units the same", `${metres} m = ${b} cm`, M(`${cm} cm : ${b} cm`), "We can only compare things measured in the same units."),
      S("Remove the units", "", M(`${a} : ${b}`)),
      S("Simplify", `Divide both by ${gcd(a, b)}.`, M(`${a} : ${b} = ${sa} : ${sb}`)),
    ],
    skillTag: "ratio.simplify.units",
  });
};

const ratioShare: Gen = (r, level) => {
  const names = r.shuffle(["Thabo", "Lerato", "Judah", "Naledi", "Sipho", "Ayesha"]);
  if (level === "beginner") {
    const a = r.int(1, 3);
    const b = r.intNot(1, 4, [a]);
    const unit = r.int(5, 40);
    const total = (a + b) * unit;
    const askFirst = r.chance(0.5);
    return numQ({
      prompt: `${names[0]} and ${names[1]} share R${total} in the ratio ${M(`${a} : ${b}`)}. How much does ${askFirst ? names[0] : names[1]} get?`,
      answer: askFirst ? a * unit : b * unit,
      unit: "rand",
      hints: ["Add the parts of the ratio to find how many equal shares there are.", `${a} + ${b} = ${a + b} shares. One share = R${total} ÷ ${a + b}.`, `One share is R${unit}. ${askFirst ? names[0] : names[1]} gets ${askFirst ? a : b} share${(askFirst ? a : b) > 1 ? "s" : ""}.`],
      steps: [
        S("Add the parts", `${a} + ${b} = ${a + b} equal shares altogether.`),
        S("Find the value of ONE share", `R${total} ÷ ${a + b} = R${unit}`, M(`${total} ÷ ${a + b} = ${unit}`), "All shares are the same size, so we divide the total equally."),
        S("Multiply by the person's number of shares", `${askFirst ? names[0] : names[1]} gets ${askFirst ? a : b} share${(askFirst ? a : b) > 1 ? "s" : ""}.`, M(`${askFirst ? a : b} × ${unit} = ${(askFirst ? a : b) * unit}`)),
      ],
      wrong: [wr(total / 2, "ratio.shareEqually", "The money is not shared equally. It is shared in the ratio, so the shares are different sizes.")],
      skillTag: "ratio.share.two",
    });
  }
  if (level === "intermediate") {
    const a = r.int(2, 5);
    const b = r.intNot(2, 7, [a]);
    const unit = r.int(4, 25);
    const total = (a + b) * unit;
    return numQ({
      prompt: `A bag of ${total} sweets is shared between ${names[0]} and ${names[1]} in the ratio ${M(`${a} : ${b}`)}. How many MORE sweets does the bigger share have than the smaller share?`,
      answer: Math.abs(a - b) * unit,
      hints: ["Find the value of one share first.", `Total shares = ${a} + ${b} = ${a + b}. One share = ${total} ÷ ${a + b}.`, `The two shares are ${a * unit} and ${b * unit}. Subtract them.`],
      steps: [
        S("Add the parts", `${a} + ${b} = ${a + b} shares.`),
        S("One share", `${total} ÷ ${a + b} = ${unit}`),
        S("Both amounts", `${a} × ${unit} = ${a * unit} and ${b} × ${unit} = ${b * unit}`),
        S("The difference", "", M(`${Math.max(a, b) * unit} − ${Math.min(a, b) * unit} = ${Math.abs(a - b) * unit}`)),
      ],
      skillTag: "ratio.share.difference",
    });
  }
  const a = r.int(2, 4);
  const b = r.int(3, 5);
  const c = r.int(1, 3);
  const unit = r.int(5, 20);
  const total = (a + b + c) * unit;
  return numQ({
    prompt: `${names[0]}, ${names[1]} and ${names[2]} share R${total} in the ratio ${M(`${a} : ${b} : ${c}`)}. How much does ${names[1]} get?`,
    answer: b * unit,
    unit: "rand",
    hints: ["Add ALL three parts to find the number of shares.", `${a} + ${b} + ${c} = ${a + b + c} shares. One share = ${total} ÷ ${a + b + c}.`, `One share = R${unit}. ${names[1]} has ${b} shares.`],
    steps: [
      S("Add all the parts", `${a} + ${b} + ${c} = ${a + b + c} shares.`),
      S("Value of one share", `${total} ÷ ${a + b + c} = ${unit}`),
      S(`${names[1]}'s share`, `${b} shares × R${unit}`, M(`${b} × ${unit} = ${b * unit}`)),
    ],
    skillTag: "ratio.share.three",
  });
};

const ratePropotion: Gen = (r, level) => {
  if (level === "beginner") {
    const n = r.pick([3, 4, 5, 6, 8]);
    const unit = r.int(4, 25);
    const total = n * unit;
    return numQ({
      prompt: `${n} loaves of bread cost R${total}. What is the price of ONE loaf?`,
      answer: unit,
      unit: "rand",
      hints: ["A unit rate tells us the amount for ONE item.", "Divide the total price by the number of items.", `R${total} ÷ ${n}`],
      steps: [
        S("What do we want?", "The price for 1 loaf. This is called a unit rate."),
        S("Divide", `Total price ÷ number of loaves`, M(`${total} ÷ ${n} = ${unit}`), "Sharing the total equally gives the amount for one."),
        S("Our answer", `One loaf costs R${unit}.`),
      ],
      skillTag: "rate.unit",
    });
  }
  if (level === "intermediate") {
    const speed = r.pick([40, 50, 60, 80, 90, 100]);
    const t = r.pick([2, 3, 4, 5]);
    const dist = speed * t;
    if (r.chance(0.5)) {
      return numQ({
        prompt: `A car travels ${dist} km in ${t} hours at a steady speed. What is its speed in km per hour?`,
        answer: speed,
        unit: "km/h",
        hints: ["Speed is the distance travelled in ONE hour.", "Speed = distance ÷ time.", `${dist} ÷ ${t}`],
        steps: [
          S("Remember the formula", "Speed = distance ÷ time", M(`speed = ${dist} ÷ ${t}`)),
          S("Calculate", "", M(`${dist} ÷ ${t} = ${speed}`)),
          S("Our answer", `The speed is ${speed} km/h.`),
        ],
        skillTag: "rate.speed",
      });
    }
    return numQ({
      prompt: `A bus travels at ${speed} km/h. How far does it travel in ${t} hours?`,
      answer: dist,
      unit: "km",
      hints: ["In ONE hour the bus travels " + speed + " km.", "Distance = speed × time.", `${speed} × ${t}`],
      steps: [
        S("Remember the formula", "Distance = speed × time", M(`distance = ${speed} × ${t}`)),
        S("Calculate", "", M(`${speed} × ${t} = ${dist}`)),
      ],
      skillTag: "rate.distance",
    });
  }
  const kg = r.pick([2, 3, 4, 5]);
  const per = r.int(8, 30);
  const kg2 = r.pick([6, 8, 10, 12]);
  const cost = kg * per;
  return numQ({
    prompt: `${kg} kg of apples cost R${cost}. How much do ${kg2} kg of apples cost? (The price per kg stays the same.)`,
    answer: kg2 * per,
    unit: "rand",
    hints: ["Find the cost of 1 kg first (the unit rate).", `R${cost} ÷ ${kg} = R${per} per kg.`, `Now multiply by ${kg2}.`],
    steps: [
      S("Find the cost of 1 kg", `R${cost} ÷ ${kg}`, M(`${cost} ÷ ${kg} = ${per}`), "This is direct proportion: more kilograms means a proportionally higher price."),
      S("Multiply for the new amount", `${kg2} kg × R${per}`, M(`${kg2} × ${per} = ${kg2 * per}`)),
    ],
    skillTag: "rate.proportion",
  });
};

// ---------- Exponents ----------

const expMeaning: Gen = (r, level) => {
  if (level === "beginner") {
    const base = r.int(2, 9);
    const n = r.int(2, 5);
    const expanded = Array(n).fill(base).join(" × ");
    return choiceQ(r, {
      prompt: `Which one is the same as ${M(expanded)}?`,
      correct: M(`${base}^${n}`),
      wrongs: [M(`${base} × ${n}`), M(`${n}^${base}`), M(`${base}^${n + 1}`)],
      hints: ["A power is a short way to write repeated multiplication.", "The BASE is the number that gets multiplied. The EXPONENT tells us how many times it is written.", `${base} is written ${n} times.`],
      steps: [
        S("Count how many times the number is multiplied", `${base} appears ${n} times.`, M(expanded)),
        S("Write it as a power", `The base is ${base} and the exponent is ${n}.`, M(`${base}^${n}`), "The exponent counts how many copies of the base we multiply."),
      ],
      notes: { [M(`${base} × ${n}`)]: { tag: "exp.multiplyNotRepeat", message: `${base} × ${n} means ${base} added ${n} times. A power means ${base} MULTIPLIED by itself ${n} times.` } },
      skillTag: "exp.meaning.write",
    });
  }
  if (level === "intermediate") {
    const base = r.int(2, 6);
    const n = r.int(2, base > 4 ? 3 : 4);
    const val = Math.pow(base, n);
    const exp = Array(n).fill(base).join(" × ");
    return numQ({
      prompt: `Calculate:\n${M(`${base}^${n}`)}`,
      answer: val,
      hints: ["Write out the multiplication first.", `${base}^${n} = ${exp}`, `Multiply two at a time: ${base} × ${base} = ${base * base}.`],
      steps: [
        S("Write as repeated multiplication", `The exponent ${n} tells us to write ${base} ${n} times.`, M(`${base}^${n} = ${exp}`)),
        S("Multiply step by step", "Two numbers at a time.", M(Array.from({ length: n - 1 }, (_, i) => `${Math.pow(base, i + 1)} × ${base} = ${Math.pow(base, i + 2)}`).join(";  "))),
        S("Our answer", "", M(`${base}^${n} = ${val}`)),
      ],
      wrong: [wr(base * n, "exp.multiplyNotRepeat", `${base} × ${n} = ${base * n} is not the same. ${base}^${n} means ${base} multiplied by itself ${n} times.`)],
      skillTag: "exp.meaning.evaluate",
    });
  }
  if (r.chance(0.5)) {
    const a = r.pick([2, 3]);
    const b = r.pick([4, 5]);
    const x = Math.pow(a, b);
    const y = Math.pow(b, a);
    return numQ({
      prompt: `How much bigger is ${M(`${a}^${b}`)} than ${M(`${b}^${a}`)}? (If ${M(`${b}^${a}`)} is bigger, give a negative answer.)`,
      answer: x - y,
      hints: ["Work out each power on its own first.", `${a}^${b} = ${Array(b).fill(a).join(" × ")}`, `${b}^${a} = ${Array(a).fill(b).join(" × ")}`],
      steps: [
        S("First power", "", M(`${a}^${b} = ${x}`)),
        S("Second power", "", M(`${b}^${a} = ${y}`)),
        S("Subtract", "", M(`${x} − ${y} = ${fmtNum(x - y)}`)),
      ],
      skillTag: "exp.meaning.compare",
    });
  }
  const k = r.int(2, 5);
  return numQ({
    prompt: `Calculate:\n${M(`10^${k}`)}`,
    answer: Math.pow(10, k),
    hints: ["Powers of 10 are easy: the exponent tells us how many zeros follow the 1.", `10^${k} = 1 followed by ${k} zeros.`, "Write 1 and then add the zeros."],
    steps: [
      S("Write as repeated multiplication", "", M(`10^${k} = ${Array(k).fill(10).join(" × ")}`)),
      S("See the pattern", `Each × 10 adds one zero. ${k} tens give ${k} zeros.`),
      S("Our answer", "", M(`10^${k} = ${fmtNum(Math.pow(10, k))}`)),
    ],
    skillTag: "exp.meaning.tens",
  });
};

const expRoots: Gen = (r, level) => {
  if (level === "beginner") {
    if (r.chance(0.5)) {
      const n = r.int(2, 12);
      return numQ({
        prompt: `Calculate:\n${M(`${n}^2`)}`,
        answer: n * n,
        hints: ["Squaring a number means multiplying it by itself.", `${n}^2 = ${n} × ${n}`, "Use your times tables."],
        steps: [S("Square means × itself", "", M(`${n}^2 = ${n} × ${n}`)), S("Calculate", "", M(`${n} × ${n} = ${n * n}`))],
        skillTag: "exp.roots.square",
      });
    }
    const n = r.int(2, 12);
    return numQ({
      prompt: `Calculate:\n${M(`√${n * n}`)}`,
      answer: n,
      hints: ["A square root asks: which number multiplied by itself gives this number?", `? × ? = ${n * n}`, `Try ${n - 1} × ${n - 1} and ${n} × ${n}.`],
      steps: [
        S("What does √ ask?", `√${n * n} means: which number times itself equals ${n * n}?`),
        S("Find it", `${n} × ${n} = ${n * n}`, M(`${n} × ${n} = ${n * n}`)),
        S("Our answer", "", M(`√${n * n} = ${n}`)),
      ],
      skillTag: "exp.roots.squareroot",
    });
  }
  if (level === "intermediate") {
    const n = r.int(2, 10);
    if (r.chance(0.5)) {
      return numQ({
        prompt: `Calculate:\n${M(`${n}^3`)}`,
        answer: n * n * n,
        hints: ["Cubing a number means using it THREE times in a multiplication.", `${n}^3 = ${n} × ${n} × ${n}`, `${n} × ${n} = ${n * n}. Now multiply by ${n} again.`],
        steps: [S("Cube means × itself three times", "", M(`${n}^3 = ${n} × ${n} × ${n}`)), S("Multiply two at a time", "", M(`${n} × ${n} = ${n * n};  ${n * n} × ${n} = ${n * n * n}`))],
        skillTag: "exp.roots.cube",
      });
    }
    return numQ({
      prompt: `Calculate:\n${M(`∛${n * n * n}`)}`,
      answer: n,
      hints: ["A cube root asks: which number, used THREE times in a multiplication, gives this number?", `? × ? × ? = ${n * n * n}`, `Try ${n}.`],
      steps: [
        S("What does ∛ ask?", `∛${n * n * n} means: which number × itself × itself equals ${n * n * n}?`),
        S("Find it", `${n} × ${n} × ${n} = ${n * n * n}`),
        S("Our answer", "", M(`∛${n * n * n} = ${n}`)),
      ],
      skillTag: "exp.roots.cuberoot",
    });
  }
  if (r.chance(0.5)) {
    const a = r.int(3, 9);
    const b = r.int(2, 5);
    const c = r.int(2, 4);
    const res = a * a + b * b * b - c * c;
    return numQ({
      prompt: `Calculate:\n${M(`${a}^2 + ${b}^3 − ${c}^2`)}`,
      answer: res,
      hints: ["Work out each power first.", `${a}^2 = ${a * a}; ${b}^3 = ${b * b * b}; ${c}^2 = ${c * c}`, "Then add and subtract from left to right."],
      steps: [
        S("Powers first", "", M(`${a}^2 = ${a * a};  ${b}^3 = ${b * b * b};  ${c}^2 = ${c * c}`)),
        S("Add", "", M(`${a * a} + ${b * b * b} = ${a * a + b * b * b}`)),
        S("Subtract", "", M(`${a * a + b * b * b} − ${c * c} = ${res}`)),
      ],
      skillTag: "exp.roots.mixed",
    });
  }
  const lo = r.int(4, 9);
  const target = lo * lo + r.int(1, 2 * lo);
  const roots = [lo, lo + 1];
  return choiceQ(r, {
    prompt: `Between which two whole numbers does ${M(`√${target}`)} lie?`,
    correct: `${roots[0]} and ${roots[1]}`,
    wrongs: [`${roots[0] - 1} and ${roots[0]}`, `${roots[1]} and ${roots[1] + 1}`, `${roots[0] + 3} and ${roots[1] + 3}`],
    hints: ["Find the perfect squares on either side of the number.", `${lo}^2 = ${lo * lo} and ${lo + 1}^2 = ${(lo + 1) * (lo + 1)}`, `${target} is between ${lo * lo} and ${(lo + 1) * (lo + 1)}.`],
    steps: [
      S("List perfect squares near the number", "", M(`${lo}^2 = ${lo * lo};  ${lo + 1}^2 = ${(lo + 1) * (lo + 1)}`)),
      S("Place the number between them", `${lo * lo} < ${target} < ${(lo + 1) * (lo + 1)}`),
      S("Take the roots", "", M(`${lo} < √${target} < ${lo + 1}`)),
    ],
    skillTag: "exp.roots.estimate",
  });
};

const expLaws: Gen = (r, level) => {
  const base = r.int(2, 9);
  if (level === "beginner") {
    const m = r.int(2, 6);
    const n = r.int(2, 6);
    return numQ({
      prompt: `Find the missing exponent:\n${M(`${base}^${m} × ${base}^${n} = ${base}^?`)}`,
      answer: m + n,
      hints: ["Write each power out in full and count how many times the base is multiplied.", `${base}^${m} has ${m} copies and ${base}^${n} has ${n} copies.`, `Altogether that is ${m} + ${n} copies.`],
      steps: [
        S("Write out in full", `${base}^${m} × ${base}^${n} means ${m} copies and then ${n} more copies of ${base}.`),
        S("Count all the copies", `${m} + ${n} = ${m + n} copies of ${base}.`),
        S("The rule", "When we MULTIPLY powers with the same base, we ADD the exponents.", M(`${base}^${m} × ${base}^${n} = ${base}^${m + n}`)),
      ],
      wrong: [wr(m * n, "exp.laws.multiplyExponents", "When multiplying powers with the same base, we ADD the exponents (not multiply them).")],
      skillTag: "exp.laws.product",
    });
  }
  if (level === "intermediate") {
    const v = r.pick(["quot", "pow"] as const);
    if (v === "quot") {
      const n = r.int(2, 5);
      const m = n + r.int(1, 6);
      return numQ({
        prompt: `Find the missing exponent:\n${M(`${base}^${m} ÷ ${base}^${n} = ${base}^?`)}`,
        answer: m - n,
        hints: ["Dividing cancels copies of the base from the top and the bottom.", `${m} copies on top, ${n} copies on the bottom.`, `${m} − ${n} copies are left.`],
        steps: [
          S("Think about cancelling", `On top there are ${m} copies of ${base}; on the bottom ${n} copies. Matching copies cancel.`),
          S("Count what is left", `${m} − ${n} = ${m - n}`),
          S("The rule", "When we DIVIDE powers with the same base, we SUBTRACT the exponents.", M(`${base}^${m} ÷ ${base}^${n} = ${base}^${m - n}`)),
        ],
        skillTag: "exp.laws.quotient",
      });
    }
    const m = r.int(2, 5);
    const n = r.int(2, 4);
    return numQ({
      prompt: `Find the missing exponent:\n${M(`(${base}^${m})^${n} = ${base}^?`)}`,
      answer: m * n,
      hints: [`(${base}^${m})^${n} means ${base}^${m} is written ${n} times and multiplied.`, `Each ${base}^${m} has ${m} copies.`, `${n} groups of ${m} copies.`],
      steps: [
        S("Write out in full", `(${base}^${m})^${n} = ${Array(n).fill(`${base}^${m}`).join(" × ")}`),
        S("Count the copies", `${n} groups of ${m} = ${m * n} copies.`),
        S("The rule", "A power of a power: MULTIPLY the exponents.", M(`(${base}^${m})^${n} = ${base}^${m * n}`)),
      ],
      skillTag: "exp.laws.powerofpower",
    });
  }
  const m = r.int(3, 6);
  const n = r.int(2, 5);
  const p = r.int(2, 4);
  if (r.chance(0.3)) {
    return numQ({
      prompt: `Calculate:\n${M(`${base}^0`)}`,
      answer: 1,
      hints: ["Use the rule for dividing powers: any number divided by itself is 1.", `${base}^3 ÷ ${base}^3 = ${base}^(3−3) = ${base}^0`, `But ${base}^3 ÷ ${base}^3 is also ${base * base * base} ÷ ${base * base * base}.`],
      steps: [
        S("Divide a power by itself", `Anything (except 0) divided by itself is 1.`, M(`${base}^3 ÷ ${base}^3 = 1`)),
        S("Use the subtract rule", "", M(`${base}^3 ÷ ${base}^3 = ${base}^(3 − 3) = ${base}^0`)),
        S("Put them together", `Both are the same thing, so ${base}^0 must be 1.`, M(`${base}^0 = 1`)),
      ],
      skillTag: "exp.laws.zero",
    });
  }
  return numQ({
    prompt: `Find the missing exponent:\n${M(`(${base}^${m} × ${base}^${n}) ÷ ${base}^${p} = ${base}^?`)}`,
    answer: m + n - p,
    hints: ["Do the bracket first: multiplying powers adds the exponents.", `${m} + ${n} = ${m + n}, so the bracket is ${base}^${m + n}.`, `Then divide: subtract ${p}.`],
    steps: [
      S("Bracket first (multiply: add exponents)", `${m} + ${n} = ${m + n}`, M(`${base}^${m} × ${base}^${n} = ${base}^${m + n}`)),
      S("Then divide (subtract exponents)", `${m + n} − ${p} = ${m + n - p}`, M(`${base}^${m + n} ÷ ${base}^${p} = ${base}^${m + n - p}`)),
    ],
    skillTag: "exp.laws.mixed",
  });
};

export const genPercentRatio: Record<string, Gen> = {
  "pct-of": pctOf,
  "pct-change": pctChange,
  "pct-express": pctExpress,
  "ratio-simplify": ratioSimplify,
  "ratio-share": ratioShare,
  "rate-prop": ratePropotion,
  "exp-meaning": expMeaning,
  "exp-roots": expRoots,
  "exp-laws": expLaws,
};
