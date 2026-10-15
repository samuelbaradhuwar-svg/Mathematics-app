// Question generators: Measurement, Perimeter & area, Surface area & volume,
// Data handling and Probability.
import type { GeneratedQuestion } from "./curriculumTypes";
import { type Gen, S, M, wr, numQ, choiceQ, textQ, fracQ } from "./genKit";
import type { Rng } from "./makeRng";
import { fmtNum, frac, gcd, roundTo } from "./mathUtils";

const MINUS = "−";
const PI = 3.14;
const hhmm = (h: number, m: number): string => `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;

// ---------- Measurement ----------

const measConvert: Gen = (r, level) => {
  if (level === "beginner") {
    const units = [
      { from: "km", to: "m", f: 1000 },
      { from: "m", to: "cm", f: 100 },
      { from: "cm", to: "mm", f: 10 },
      { from: "m", to: "mm", f: 1000 },
    ];
    const u = r.pick(units);
    const bigToSmall = r.chance(0.5);
    const base = r.pick([2, 3, 4, 5, 6, 7, 8, 9, 12, 15]) + (r.chance(0.3) ? 0.5 : 0);
    const zeros = String(u.f).length - 1;
    if (bigToSmall) {
      const ans = roundTo(base * u.f, 4);
      return numQ({
        prompt: `Convert: ${M(`${fmtNum(base)} ${u.from} = ? ${u.to}`)}`,
        answer: ans,
        unit: u.to,
        hints: [`1 ${u.from} = ${fmtNum(u.f)} ${u.to}.`, `We are going from a BIGGER unit (${u.from}) to a SMALLER unit (${u.to}). There will be MORE of the smaller units, so multiply.`, `${fmtNum(base)} × ${fmtNum(u.f)}`],
        steps: [S("Know the link", `1 ${u.from} = ${fmtNum(u.f)} ${u.to}`), S("Bigger → smaller means multiply", "There are more small units than big units.", M(`${fmtNum(base)} × ${fmtNum(u.f)} = ${fmtNum(ans)}`)), S("Our answer", `${fmtNum(base)} ${u.from} = ${fmtNum(ans)} ${u.to}`)],
        skillTag: "meas.convert.length",
      });
    }
    const big = roundTo(base, 4);
    const small = roundTo(big * u.f, 4);
    return numQ({
      prompt: `Convert: ${M(`${fmtNum(small)} ${u.to} = ? ${u.from}`)}`,
      answer: big,
      unit: u.from,
      hints: [`1 ${u.from} = ${fmtNum(u.f)} ${u.to}.`, `We go from a SMALLER unit (${u.to}) to a BIGGER unit (${u.from}). There will be FEWER of the bigger units, so divide.`, `${fmtNum(small)} ÷ ${fmtNum(u.f)}`],
      steps: [S("Know the link", `1 ${u.from} = ${fmtNum(u.f)} ${u.to}`), S("Smaller → bigger means divide", `Move the comma ${zeros} place${zeros > 1 ? "s" : ""} to the left.`, M(`${fmtNum(small)} ÷ ${fmtNum(u.f)} = ${fmtNum(big)}`)), S("Our answer", `${fmtNum(small)} ${u.to} = ${fmtNum(big)} ${u.from}`)],
      skillTag: "meas.convert.length",
    });
  }
  if (level === "intermediate") {
    const set = r.pick([
      { from: "kg", to: "g", f: 1000, kind: "mass" },
      { from: "t", to: "kg", f: 1000, kind: "mass" },
      { from: "ℓ", to: "ml", f: 1000, kind: "capacity" },
      { from: "kℓ", to: "ℓ", f: 1000, kind: "capacity" },
    ]);
    const big = r.pick([2, 3, 4, 5, 6, 8, 9]) + r.pick([0, 0, 0.5, 0.25]);
    const small = roundTo(big * set.f, 4);
    if (r.chance(0.5)) {
      return numQ({
        prompt: `Convert: ${M(`${fmtNum(big)} ${set.from} = ? ${set.to}`)}`,
        answer: small,
        unit: set.to,
        hints: [`1 ${set.from} = 1 000 ${set.to}.`, "Bigger unit to smaller unit: multiply.", `${fmtNum(big)} × 1 000`],
        steps: [S("Know the link", `1 ${set.from} = 1 000 ${set.to}`), S("Multiply", "", M(`${fmtNum(big)} × 1 000 = ${fmtNum(small)}`))],
        skillTag: `meas.convert.${set.kind}`,
      });
    }
    return numQ({
      prompt: `Convert: ${M(`${fmtNum(small)} ${set.to} = ? ${set.from}`)}`,
      answer: big,
      unit: set.from,
      hints: [`1 ${set.from} = 1 000 ${set.to}.`, "Smaller unit to bigger unit: divide.", `${fmtNum(small)} ÷ 1 000`],
      steps: [S("Know the link", `1 ${set.from} = 1 000 ${set.to}`), S("Divide", "", M(`${fmtNum(small)} ÷ 1 000 = ${fmtNum(big)}`))],
      skillTag: `meas.convert.${set.kind}`,
    });
  }
  const v = r.pick(["area", "volume", "twoUnits"] as const);
  if (v === "area") {
    const d = r.pick([
      { from: "m²", to: "cm²", f: 10000 },
      { from: "cm²", to: "mm²", f: 100 },
    ]);
    const val = r.pick([2, 3, 5, 0.5, 1.5, 4]);
    return numQ({
      prompt: `Convert: ${M(`${fmtNum(val)} ${d.from} = ? ${d.to}`)}`,
      answer: roundTo(val * d.f, 4),
      unit: d.to,
      hints: [d.from === "m²" ? "1 m = 100 cm, so 1 m² is 100 cm × 100 cm." : "1 cm = 10 mm, so 1 cm² is 10 mm × 10 mm.", `1 ${d.from} = ${fmtNum(d.f)} ${d.to}.`, `${fmtNum(val)} × ${fmtNum(d.f)}`],
      steps: [S("Think about a square", d.from === "m²" ? "A square that is 1 m by 1 m is also 100 cm by 100 cm." : "A square that is 1 cm by 1 cm is also 10 mm by 10 mm.", M(`1 ${d.from} = ${d.from === "m²" ? "100 × 100" : "10 × 10"} ${d.to} = ${fmtNum(d.f)} ${d.to}`), "For area units we must multiply the length factor TWICE (once for each side)."), S("Multiply", "", M(`${fmtNum(val)} × ${fmtNum(d.f)} = ${fmtNum(roundTo(val * d.f, 4))}`))],
      wrong: [wr(roundTo(val * (d.from === "m²" ? 100 : 10), 4), "meas.areaFactor", "For AREA the conversion factor is squared (100 × 100 = 10 000 for m² to cm²). You used the length factor.")],
      skillTag: "meas.convert.area",
    });
  }
  if (v === "volume") {
    const val = r.pick([2, 3, 5, 0.5, 4]);
    return numQ({
      prompt: `Convert: ${M(`${fmtNum(val)} cm³ = ? mm³`)}`,
      answer: val * 1000,
      unit: "mm³",
      hints: ["1 cm = 10 mm. For volume we multiply the length factor THREE times.", "10 × 10 × 10 = 1 000", `${fmtNum(val)} × 1 000`],
      steps: [S("Think about a cube", "A cube that is 1 cm on each side is also 10 mm on each side.", M("1 cm³ = 10 × 10 × 10 mm³ = 1 000 mm³")), S("Multiply", "", M(`${fmtNum(val)} × 1 000 = ${fmtNum(val * 1000)}`))],
      skillTag: "meas.convert.volume",
    });
  }
  const km = r.int(1, 9);
  const m = r.pick([100, 250, 350, 500, 750]);
  return numQ({
    prompt: `Convert: ${M(`${km} km ${m} m = ? m`)}`,
    answer: km * 1000 + m,
    unit: "m",
    hints: ["Change the km part to metres first.", `${km} km = ${fmtNum(km * 1000)} m`, `Then add the ${m} m.`],
    steps: [S("Convert the km", "", M(`${km} km = ${km} × 1 000 = ${fmtNum(km * 1000)} m`)), S("Add the metres", "", M(`${fmtNum(km * 1000)} + ${m} = ${fmtNum(km * 1000 + m)}`))],
    skillTag: "meas.convert.mixed",
  });
};

const measTime: Gen = (r, level) => {
  if (level === "beginner") {
    if (r.chance(0.6)) {
      const h12 = r.int(1, 11);
      const m = r.pick([0, 5, 15, 30, 45]);
      return textQ({
        prompt: `Write ${M(`${h12}:${String(m).padStart(2, "0")} pm`)} in 24-hour time. Type it like 15:30.`,
        answer: hhmm(h12 + 12, m),
        accept: [`${h12 + 12}:${String(m).padStart(2, "0")}`, `${h12 + 12}h${String(m).padStart(2, "0")}`],
        placeholder: "e.g. 15:30",
        hints: ["24-hour time does not use am or pm. After midday the hours keep counting: 13, 14, 15...", "For pm times, add 12 to the hour.", `${h12} + 12 = ${h12 + 12}`],
        steps: [S("Is it am or pm?", "It is pm (afternoon or evening)."), S("Add 12 to the hour", `${h12} + 12 = ${h12 + 12}`), S("Keep the minutes", "", M(hhmm(h12 + 12, m)))],
        skillTag: "meas.time.24h",
      });
    }
    const h = r.int(13, 23);
    const m = r.pick([0, 15, 30, 45]);
    const ans = `${h - 12}:${String(m).padStart(2, "0")} pm`;
    return choiceQ(r, {
      prompt: `Which is ${M(hhmm(h, m))} in 12-hour time?`,
      correct: ans,
      wrongs: [`${h - 12}:${String(m).padStart(2, "0")} am`, `${h - 11}:${String(m).padStart(2, "0")} pm`, `${h - 10}:${String(m).padStart(2, "0")} pm`],
      hints: ["24-hour times of 13 and above are in the afternoon or evening (pm).", "Subtract 12 from the hour.", `${h} − 12 = ${h - 12}`],
      steps: [S("The hour is more than 12", "So it is pm."), S("Subtract 12", `${h} − 12 = ${h - 12}`), S("Our answer", ans)],
      skillTag: "meas.time.12h",
    });
  }
  if (level === "intermediate") {
    const h1 = r.int(6, 14);
    const m1 = r.pick([0, 15, 30, 45]);
    const dur = r.pick([55, 75, 95, 110, 135, 160, 185]);
    const total = h1 * 60 + m1 + dur;
    const h2 = Math.floor(total / 60);
    const m2 = total % 60;
    return numQ({
      prompt: `A film starts at ${hhmm(h1, m1)} and ends at ${hhmm(h2, m2)}. How long is the film in minutes?`,
      answer: dur,
      unit: "minutes",
      hints: ["Count on from the start time to the next full hour first.", `From ${hhmm(h1, m1)} to ${hhmm(h1 + 1, 0)} is ${60 - m1} minutes (if the minutes are 0, it is a full hour).`, "Then add the whole hours and the leftover minutes."],
      steps: [S("Hours and minutes apart", `From ${hhmm(h1, m1)} to ${hhmm(h2, m2)}.`), S("Work out the difference", `${Math.floor(dur / 60)} h ${dur % 60} min`, M(`${Math.floor(dur / 60)} × 60 + ${dur % 60} = ${dur}`)), S("Our answer", `${dur} minutes`)],
      skillTag: "meas.time.duration",
    });
  }
  const h1 = r.int(6, 15);
  const m1 = r.pick([5, 20, 35, 50]);
  const dh = r.int(1, 4);
  const dm = r.pick([15, 30, 45]);
  const total = h1 * 60 + m1 + dh * 60 + dm;
  const h2 = Math.floor(total / 60);
  const m2 = total % 60;
  return textQ({
    prompt: `A bus leaves at ${hhmm(h1, m1)} and the trip takes ${dh} hour${dh > 1 ? "s" : ""} and ${dm} minutes. At what time does it arrive? Type it like 17:35.`,
    answer: hhmm(h2, m2),
    accept: [`${h2}:${String(m2).padStart(2, "0")}`],
    placeholder: "e.g. 17:35",
    hints: ["Add the hours first, then the minutes.", `${hhmm(h1, m1)} + ${dh} hours = ${hhmm(h1 + dh, m1)}`, `Now add ${dm} minutes. If the minutes go past 60, carry 1 hour.`],
    steps: [S("Add the hours", "", M(`${hhmm(h1, m1)} + ${dh} h = ${hhmm(h1 + dh, m1)}`)), S("Add the minutes", `${m1} + ${dm} = ${m1 + dm}${m1 + dm >= 60 ? ", which is 1 hour and " + (m1 + dm - 60) + " minutes" : ""}`), S("Our answer", "", M(hhmm(h2, m2)))],
    skillTag: "meas.time.arrival",
  });
};

// ---------- Perimeter and area ----------

const paPerimeter: Gen = (r, level) => {
  if (level === "beginner") {
    const l = r.int(3, 10);
    const w = r.intNot(2, 8, [l]);
    return numQ({
      prompt: `A rectangle is ${l} cm long and ${w} cm wide. What is its perimeter?`,
      visual: { type: "gridrect", w: l, h: w, unit: "cm", caption: "Perimeter is the distance around the OUTSIDE." },
      answer: 2 * (l + w),
      unit: "cm",
      hints: ["Perimeter means the distance all the way around the shape.", "A rectangle has 2 long sides and 2 short sides.", `${l} + ${w} + ${l} + ${w}`],
      steps: [S("What is perimeter?", "The total length of all the sides added together."), S("Add all four sides", "", M(`${l} + ${w} + ${l} + ${w} = ${2 * (l + w)}`)), S("A shortcut", `Perimeter = 2 × (length + width) = 2 × ${l + w} = ${2 * (l + w)}`)],
      wrong: [wr(l * w, "pa.areaForPerimeter", "That is the AREA (length × width). Perimeter is the distance around, so we ADD the sides.")],
      skillTag: "pa.perimeter.rect",
    });
  }
  if (level === "intermediate") {
    if (r.chance(0.5)) {
      const s = r.int(4, 15);
      return numQ({
        prompt: `A square has a perimeter of ${4 * s} cm. How long is each side?`,
        answer: s,
        unit: "cm",
        hints: ["A square has 4 equal sides.", "Perimeter = 4 × side.", `${4 * s} ÷ 4`],
        steps: [S("Use the rule", "A square has 4 equal sides.", M(`4 × side = ${4 * s}`)), S("Divide", "", M(`side = ${4 * s} ÷ 4 = ${s}`))],
        skillTag: "pa.perimeter.square",
      });
    }
    const l = r.int(8, 15);
    const w = r.int(3, 7);
    return numQ({
      prompt: `A rectangle has a perimeter of ${2 * (l + w)} cm and a width of ${w} cm. How long is it?`,
      answer: l,
      unit: "cm",
      hints: ["Half of the perimeter is length + width.", `${2 * (l + w)} ÷ 2 = ${l + w}`, `length + ${w} = ${l + w}`],
      steps: [S("Halve the perimeter", "", M(`${2 * (l + w)} ÷ 2 = ${l + w}`)), S("Subtract the width", "", M(`${l + w} ${MINUS} ${w} = ${l}`)), S("Check", `2 × (${l} + ${w}) = ${2 * (l + w)} ✓`)],
      skillTag: "pa.perimeter.missing",
    });
  }
  const A = r.int(10, 16);
  const B = r.int(7, 10);
  const a = r.int(3, 5);
  const b = r.int(2, 4);
  return numQ({
    prompt: `An L-shaped garden fits inside a ${A} m by ${B} m rectangle. A ${a} m by ${b} m rectangle is cut out of one corner. What is the perimeter of the L-shape?`,
    answer: 2 * (A + B),
    unit: "m",
    hints: ["Draw the shape. When you cut a rectangle out of a CORNER, what happens to the outside edge?", "The cut-out sides slide along to make up the same distance as the original sides.", "The perimeter is the same as that of the big rectangle."],
    steps: [S("Draw the big rectangle", `It is ${A} m by ${B} m.`), S("Cut out the corner", `Removing the ${a} × ${b} corner makes the edge go IN and then OUT again. The extra length going in equals the length that was removed.`), S("So the perimeter is unchanged", "", M(`2 × (${A} + ${B}) = ${2 * (A + B)}`))],
    skillTag: "pa.perimeter.composite",
  });
};

const paArea: Gen = (r, level) => {
  if (level === "beginner") {
    const l = r.int(3, 9);
    const w = r.intNot(2, 7, [l]);
    return numQ({
      prompt: `What is the area of this rectangle? It is ${l} cm long and ${w} cm wide.`,
      visual: { type: "gridrect", w: l, h: w, unit: "cm", caption: `Count the squares: ${w} rows of ${l}.` },
      answer: l * w,
      unit: "cm²",
      hints: ["Area is the amount of flat space INSIDE the shape, measured in square units.", "Area of a rectangle = length × width.", `${l} × ${w}`],
      steps: [S("What is area?", "The number of 1 cm × 1 cm squares that cover the shape."), S("Multiply", `${w} rows with ${l} squares in each row.`, M(`${l} × ${w} = ${l * w}`)), S("Our answer", `The area is ${l * w} cm².`, undefined, "Area units are always squared (cm²).")],
      wrong: [wr(2 * (l + w), "pa.perimeterForArea", "That is the PERIMETER. Area is the space inside, so we MULTIPLY length × width.")],
      skillTag: "pa.area.rect",
    });
  }
  if (level === "intermediate") {
    const b = r.int(4, 14);
    const h = r.pick([4, 6, 8, 10, 12]);
    return numQ({
      prompt: `A triangle has a base of ${b} cm and a perpendicular height of ${h} cm. What is its area?`,
      answer: (b * h) / 2,
      unit: "cm²",
      hints: ["A triangle is HALF of a rectangle with the same base and height.", "Area = ½ × base × height.", `${b} × ${h} = ${b * h}. Now halve it.`],
      steps: [S("Use the formula", "A triangle is half a rectangle.", M(`Area = ½ × b × h`)), S("Substitute", "", M(`½ × ${b} × ${h} = ${b * h} ÷ 2`)), S("Our answer", "", M(`${(b * h) / 2} cm²`))],
      wrong: [wr(b * h, "pa.forgotHalf", "That is the area of the rectangle. A triangle is only HALF of it.")],
      skillTag: "pa.area.triangle",
    });
  }
  if (r.chance(0.5)) {
    const A = r.int(10, 16);
    const B = r.int(7, 10);
    const a = r.int(3, 5);
    const b = r.int(2, 4);
    return numQ({
      prompt: `An L-shape is made from a ${A} m by ${B} m rectangle with a ${a} m by ${b} m rectangle cut out of one corner. What is its area?`,
      answer: A * B - a * b,
      unit: "m²",
      hints: ["Find the area of the big rectangle first.", `${A} × ${B} = ${A * B}`, `Then take away the area of the corner that was cut out: ${a} × ${b}.`],
      steps: [S("Big rectangle", "", M(`${A} × ${B} = ${A * B}`)), S("Cut-out corner", "", M(`${a} × ${b} = ${a * b}`)), S("Subtract", "", M(`${A * B} ${MINUS} ${a * b} = ${A * B - a * b}`))],
      skillTag: "pa.area.composite",
    });
  }
  const w = r.int(4, 9);
  const l = r.int(10, 18);
  return numQ({
    prompt: `A rectangle has an area of ${l * w} cm² and a width of ${w} cm. What is its length?`,
    answer: l,
    unit: "cm",
    hints: ["Area = length × width. We know the area and the width.", `length × ${w} = ${l * w}`, "Divide the area by the width."],
    steps: [S("Write the formula", "", M(`length × ${w} = ${l * w}`)), S("Divide both sides by " + w, "", M(`length = ${l * w} ÷ ${w} = ${l}`)), S("Check", `${l} × ${w} = ${l * w} ✓`)],
    skillTag: "pa.area.missing",
  });
};

const paCircle: Gen = (r, level) => {
  if (level === "beginner") {
    const rad = r.int(2, 15);
    const askRadius = r.chance(0.5);
    return numQ({
      prompt: askRadius ? `A circle has a diameter of ${2 * rad} cm. What is its radius?` : `A circle has a radius of ${rad} cm. What is its diameter?`,
      visual: { type: "circle", r: rad, caption: "The diameter goes all the way across through the centre. The radius goes from the centre to the edge." },
      answer: askRadius ? rad : 2 * rad,
      unit: "cm",
      hints: ["The diameter is the distance ACROSS the circle, through the centre.", "The radius is HALF of the diameter. The diameter is TWICE the radius.", askRadius ? `${2 * rad} ÷ 2` : `${rad} × 2`],
      steps: [S("Remember the link", "diameter = 2 × radius"), S("Calculate", askRadius ? `Radius = diameter ÷ 2 = ${2 * rad} ÷ 2 = ${rad}` : `Diameter = 2 × radius = 2 × ${rad} = ${2 * rad}`)],
      skillTag: "pa.circle.parts",
    });
  }
  if (level === "intermediate") {
    const d = r.pick([5, 8, 10, 12, 14, 20, 25, 30]);
    return numQ({
      prompt: `The circumference of a circle is the distance around it. Use π ≈ 3,14 to find the circumference of a circle with a diameter of ${d} cm.`,
      answer: roundTo(PI * d, 2),
      unit: "cm",
      dp: 2,
      hints: ["Circumference = π × diameter.", "Use π ≈ 3,14.", `3,14 × ${d}`],
      steps: [S("Write the formula", "Circumference = π × diameter", M("C = π × d")), S("Substitute", "", M(`C = 3,14 × ${d}`)), S("Calculate", "", M(`C = ${fmtNum(roundTo(PI * d, 2), 2)} cm`))],
      skillTag: "pa.circle.circumference",
    });
  }
  const rad = r.pick([2, 3, 4, 5, 6, 7, 10]);
  return numQ({
    prompt: `Use π ≈ 3,14 to find the area of a circle with a radius of ${rad} cm.`,
    answer: roundTo(PI * rad * rad, 2),
    unit: "cm²",
    dp: 2,
    hints: ["Area = π × radius × radius (π × r²).", `r² means r × r = ${rad} × ${rad} = ${rad * rad}`, `Now multiply by 3,14: 3,14 × ${rad * rad}`],
    steps: [S("Write the formula", "", M("A = π × r²")), S("Square the radius FIRST", `r² = ${rad} × ${rad} = ${rad * rad}`, undefined, "The little 2 only applies to the radius, not to π."), S("Multiply by π", "", M(`A = 3,14 × ${rad * rad} = ${fmtNum(roundTo(PI * rad * rad, 2), 2)}`))],
    wrong: [wr(roundTo(PI * rad * 2, 2), "pa.circle.diameterMix", "That is the circumference formula. For AREA we use π × r × r.")],
    skillTag: "pa.circle.area",
  });
};

// ---------- Surface area and volume ----------

const svSurface: Gen = (r, level) => {
  if (level === "beginner") {
    const s = r.int(2, 9);
    return numQ({
      prompt: `A cube has sides of ${s} cm. What is its total surface area?`,
      visual: { type: "cuboid", l: s, w: s, h: s },
      answer: 6 * s * s,
      unit: "cm²",
      hints: ["A cube has 6 identical square faces.", `Area of ONE face = ${s} × ${s}`, "Multiply by 6."],
      steps: [S("Count the faces", "A cube has 6 faces, all squares of the same size."), S("Area of one face", "", M(`${s} × ${s} = ${s * s}`)), S("Multiply by 6", "", M(`6 × ${s * s} = ${6 * s * s}`))],
      skillTag: "sv.surface.cube",
    });
  }
  if (level === "intermediate") {
    const l = r.int(3, 10);
    const w = r.int(2, 8);
    const h = r.int(2, 8);
    return numQ({
      prompt: `A rectangular prism is ${l} cm long, ${w} cm wide and ${h} cm high. What is its total surface area?`,
      visual: { type: "cuboid", l, w, h },
      answer: 2 * (l * w + l * h + w * h),
      unit: "cm²",
      hints: ["A rectangular prism has 3 pairs of identical faces.", `Top and bottom: ${l} × ${w}. Front and back: ${l} × ${h}. Left and right: ${w} × ${h}.`, "Find each area, add them, then double."],
      steps: [S("Top and bottom", "", M(`${l} × ${w} = ${l * w}`)), S("Front and back", "", M(`${l} × ${h} = ${l * h}`)), S("Left and right", "", M(`${w} × ${h} = ${w * h}`)), S("Add and double", "There are 2 of each face.", M(`2 × (${l * w} + ${l * h} + ${w * h}) = ${2 * (l * w + l * h + w * h)}`))],
      skillTag: "sv.surface.prism",
    });
  }
  if (r.chance(0.5)) {
    const rad = r.pick([2, 3, 5, 7, 10]);
    const h = r.pick([4, 6, 8, 10]);
    const ans = roundTo(2 * PI * rad * rad + 2 * PI * rad * h, 2);
    return numQ({
      prompt: `Use π ≈ 3,14 to find the total surface area of a cylinder with a radius of ${rad} cm and a height of ${h} cm.`,
      answer: ans,
      unit: "cm²",
      dp: 2,
      hints: ["A cylinder has 2 circles (top and bottom) and 1 curved surface that unrolls into a rectangle.", `Circles: 2 × π × r². Curved part: 2 × π × r × h.`, `2 × 3,14 × ${rad * rad} and 2 × 3,14 × ${rad} × ${h}`],
      steps: [S("Two circles", "", M(`2 × 3,14 × ${rad}² = ${fmtNum(roundTo(2 * PI * rad * rad, 2), 2)}`)), S("Curved surface (a rectangle)", "Its length is the circumference and its width is the height.", M(`2 × 3,14 × ${rad} × ${h} = ${fmtNum(roundTo(2 * PI * rad * h, 2), 2)}`)), S("Add", "", M(`${fmtNum(roundTo(2 * PI * rad * rad, 2), 2)} + ${fmtNum(roundTo(2 * PI * rad * h, 2), 2)} = ${fmtNum(ans, 2)}`))],
      skillTag: "sv.surface.cylinder",
    });
  }
  const tri = r.pick([[3, 4, 5], [6, 8, 10], [5, 12, 13]] as const);
  const L = r.int(5, 12);
  const ans = tri[0] * tri[1] + (tri[0] + tri[1] + tri[2]) * L;
  return numQ({
    prompt: `A triangular prism has right-angled triangle ends with sides of ${tri.join(" cm, ")} cm (the 2 shorter sides are at right angles). The prism is ${L} cm long. What is its total surface area?`,
    answer: ans,
    unit: "cm²",
    hints: ["Two triangle ends plus three rectangles.", `Triangle area = ½ × ${tri[0]} × ${tri[1]}. The rectangles all have length ${L} and widths of ${tri.join(", ")}.`, `Rectangles together: (${tri.join(" + ")}) × ${L}`],
    steps: [S("Area of the two triangles", "", M(`2 × ½ × ${tri[0]} × ${tri[1]} = ${tri[0] * tri[1]}`)), S("Area of the three rectangles", `Together they form one big rectangle: (perimeter of triangle) × length.`, M(`(${tri.join(" + ")}) × ${L} = ${(tri[0] + tri[1] + tri[2]) * L}`)), S("Add", "", M(`${tri[0] * tri[1]} + ${(tri[0] + tri[1] + tri[2]) * L} = ${ans}`))],
    skillTag: "sv.surface.triprism",
  });
};

const svVolume: Gen = (r, level) => {
  if (level === "beginner") {
    const s = r.int(2, 9);
    return numQ({
      prompt: `What is the volume of a cube with sides of ${s} cm?`,
      visual: { type: "cuboid", l: s, w: s, h: s },
      answer: s * s * s,
      unit: "cm³",
      hints: ["Volume is the amount of space INSIDE a 3D object.", "Volume of a cube = side × side × side.", `${s} × ${s} × ${s}`],
      steps: [S("Use the formula", "A cube's length, width and height are all equal.", M(`V = s × s × s = s³`)), S("Calculate", "", M(`${s} × ${s} × ${s} = ${s * s * s}`)), S("Units", "Volume is in cubic units: cm³.")],
      wrong: [wr(6 * s * s, "sv.surfaceForVolume", "That is the SURFACE AREA. Volume is the space inside: side × side × side.")],
      skillTag: "sv.volume.cube",
    });
  }
  if (level === "intermediate") {
    const l = r.int(3, 12);
    const w = r.int(2, 8);
    const h = r.int(2, 8);
    return numQ({
      prompt: `What is the volume of a rectangular prism that is ${l} cm long, ${w} cm wide and ${h} cm high?`,
      visual: { type: "cuboid", l, w, h },
      answer: l * w * h,
      unit: "cm³",
      hints: ["Volume = length × width × height.", `Base area first: ${l} × ${w} = ${l * w}`, `Then multiply by the height: ${l * w} × ${h}`],
      steps: [S("Area of the base", "", M(`${l} × ${w} = ${l * w}`)), S("Multiply by the height", "Stack the layers.", M(`${l * w} × ${h} = ${l * w * h}`))],
      skillTag: "sv.volume.prism",
    });
  }
  if (r.chance(0.5)) {
    const b = r.pick([4, 6, 8, 10]);
    const hh = r.pick([3, 5, 6, 7]);
    const L = r.int(5, 12);
    return numQ({
      prompt: `A triangular prism has a triangle end with a base of ${b} cm and a perpendicular height of ${hh} cm. The prism is ${L} cm long. What is its volume?`,
      answer: (b * hh * L) / 2,
      unit: "cm³",
      hints: ["Volume of a prism = area of the end × length.", `Triangle area = ½ × ${b} × ${hh} = ${(b * hh) / 2}`, `Multiply by the length ${L}.`],
      steps: [S("Area of the triangle end", "", M(`½ × ${b} × ${hh} = ${(b * hh) / 2}`)), S("Multiply by the length", "", M(`${(b * hh) / 2} × ${L} = ${(b * hh * L) / 2}`))],
      skillTag: "sv.volume.triprism",
    });
  }
  const rad = r.pick([2, 3, 5, 10]);
  const h = r.pick([4, 5, 8, 10]);
  const ans = roundTo(PI * rad * rad * h, 2);
  return numQ({
    prompt: `Use π ≈ 3,14 to find the volume of a cylinder with a radius of ${rad} cm and a height of ${h} cm.`,
    answer: ans,
    unit: "cm³",
    dp: 2,
    hints: ["A cylinder is a prism with a circle as its end.", "Volume = area of the circle × height = π × r² × h.", `r² = ${rad * rad}. So 3,14 × ${rad * rad} × ${h}.`],
    steps: [S("Area of the circle end", "", M(`π × r² = 3,14 × ${rad * rad} = ${fmtNum(roundTo(PI * rad * rad, 2), 2)}`)), S("Multiply by the height", "", M(`${fmtNum(roundTo(PI * rad * rad, 2), 2)} × ${h} = ${fmtNum(ans, 2)}`))],
    skillTag: "sv.volume.cylinder",
  });
};

const svCapacity: Gen = (r, level) => {
  if (level === "beginner") {
    const l = r.pick([5, 10, 20]);
    const w = r.pick([5, 10]);
    const h = r.pick([5, 10]);
    return numQ({
      prompt: `A box is ${l} cm long, ${w} cm wide and ${h} cm high. How many millilitres of water can it hold? (Remember: 1 cm³ holds 1 ml.)`,
      answer: l * w * h,
      unit: "ml",
      hints: ["First find the volume in cm³.", `${l} × ${w} × ${h}`, "1 cm³ = 1 ml, so the number stays the same."],
      steps: [S("Volume", "", M(`${l} × ${w} × ${h} = ${l * w * h} cm³`)), S("Change to ml", "1 cm³ = 1 ml", M(`${l * w * h} ml`))],
      skillTag: "sv.capacity.cm3",
    });
  }
  if (level === "intermediate") {
    const ml = r.pick([2000, 3500, 5000, 750, 4200]);
    const toL = r.chance(0.5);
    return numQ({
      prompt: toL ? `Convert: ${M(`${fmtNum(ml)} ml = ? ℓ`)}` : `A tank holds ${fmtNum(roundTo(ml / 1000, 3))} ℓ. How many millilitres is that?`,
      answer: toL ? roundTo(ml / 1000, 3) : ml,
      unit: toL ? "ℓ" : "ml",
      hints: ["1 ℓ = 1 000 ml.", toL ? "Smaller unit to bigger unit: divide by 1 000." : "Bigger unit to smaller unit: multiply by 1 000.", toL ? `${fmtNum(ml)} ÷ 1 000` : `${fmtNum(roundTo(ml / 1000, 3))} × 1 000`],
      steps: [S("Know the link", "1 ℓ = 1 000 ml"), S(toL ? "Divide" : "Multiply", "", M(toL ? `${fmtNum(ml)} ÷ 1 000 = ${fmtNum(roundTo(ml / 1000, 3))}` : `${fmtNum(roundTo(ml / 1000, 3))} × 1 000 = ${fmtNum(ml)}`))],
      skillTag: "sv.capacity.convert",
    });
  }
  const l = r.pick([30, 40, 50, 60]);
  const w = r.pick([20, 30, 40]);
  const h = r.pick([20, 30, 40]);
  const vol = l * w * h;
  return numQ({
    prompt: `A fish tank is ${l} cm long, ${w} cm wide and ${h} cm high. How many litres of water can it hold when it is full? (1 000 cm³ = 1 ℓ)`,
    answer: vol / 1000,
    unit: "ℓ",
    hints: ["Find the volume in cm³ first.", `${l} × ${w} × ${h} = ${fmtNum(vol)} cm³`, "Divide by 1 000 to change cm³ to litres."],
    steps: [S("Volume", "", M(`${l} × ${w} × ${h} = ${fmtNum(vol)} cm³`)), S("Change to litres", "1 000 cm³ = 1 ℓ", M(`${fmtNum(vol)} ÷ 1 000 = ${fmtNum(vol / 1000)} ℓ`))],
    skillTag: "sv.capacity.tank",
  });
};

// ---------- Data handling ----------

const dhOrganise: Gen = (r, level) => {
  if (level === "beginner") {
    const data = Array.from({ length: 12 }, () => r.int(1, 5));
    const target = r.int(1, 5);
    const count = data.filter((x) => x === target).length;
    if (count === 0) return dhOrganise(r, level);
    return numQ({
      prompt: `Here are the number of pets in 12 homes:\n${M(data.join(";  "))}\nHow many homes have exactly ${target} pet${target > 1 ? "s" : ""}? (This is the frequency of ${target}.)`,
      answer: count,
      hints: ["Frequency means 'how many times'.", `Go through the list and tick every ${target}.`, "Count your ticks."],
      steps: [S("Go through the list", `Look for the number ${target}.`), S("Tick each one and count", `There are ${count} of them.`), S("Our answer", `The frequency of ${target} is ${count}.`)],
      skillTag: "dh.organise.count",
    });
  }
  if (level === "intermediate") {
    const cats = r.shuffle(["Red", "Blue", "Green", "Yellow"]);
    const freq = cats.map(() => r.int(3, 12));
    const total = freq.reduce((a, b) => a + b, 0);
    const i = r.int(0, 3);
    return numQ({
      prompt: `A class voted for a favourite colour:\n${cats.map((c, k) => `${c}: ${freq[k]}`).join(";  ")}\nHow many learners did NOT choose ${cats[i]}?`,
      answer: total - freq[i],
      hints: ["First find the total number of learners.", `${freq.join(" + ")} = ${total}`, `Subtract the ${cats[i]} votes (${freq[i]}).`],
      steps: [S("Find the total", "", M(`${freq.join(" + ")} = ${total}`)), S("Subtract the colour we don't want", "", M(`${total} ${MINUS} ${freq[i]} = ${total - freq[i]}`))],
      skillTag: "dh.organise.table",
    });
  }
  const data = Array.from({ length: 15 }, () => r.int(0, 39));
  const classes = ["0–9", "10–19", "20–29", "30–39"];
  const counts = [0, 0, 0, 0];
  data.forEach((d) => (counts[Math.floor(d / 10)] += 1));
  const max = Math.max(...counts);
  if (counts.filter((c) => c === max).length > 1) return dhOrganise(r, level);
  const best = counts.indexOf(max);
  return choiceQ(r, {
    prompt: `The marks of 15 learners are:\n${M(data.join(";  "))}\nWhich class interval has the MOST marks?`,
    correct: classes[best],
    wrongs: classes.filter((_, i) => i !== best),
    hints: ["Sort each mark into the class it belongs to: 0–9, 10–19, 20–29 or 30–39.", "Make a tally for each class.", `The tallies are ${counts.join(", ")} in order.`],
    steps: [S("Make a frequency table", "Put each mark into its class.", M(classes.map((c, i) => `${c}: ${counts[i]}`).join(";  "))), S("Find the biggest frequency", `${max} is the biggest, in the class ${classes[best]}.`)],
    skillTag: "dh.organise.grouped",
  });
};

const dhAverage: Gen = (r, level) => {
  if (level === "beginner") {
    const m = r.int(6, 15);
    for (let tries = 0; tries < 30; tries++) {
      const data = Array.from({ length: 4 }, () => r.int(Math.max(1, m - 4), m + 4));
      const last = 5 * m - data.reduce((a, b) => a + b, 0);
      if (last >= 1 && last <= 25) {
        const all = [...data, last];
        return numQ({
          prompt: `Find the MEAN (average) of these numbers:\n${M(all.join(";  "))}`,
          answer: m,
          hints: ["The mean is the total shared out equally.", `Add all 5 numbers: ${all.join(" + ")}`, "Divide the total by how many numbers there are (5)."],
          steps: [S("Add all the numbers", "", M(`${all.join(" + ")} = ${5 * m}`)), S("Count the numbers", "There are 5 numbers."), S("Divide the total by 5", "", M(`${5 * m} ÷ 5 = ${m}`))],
          skillTag: "dh.average.mean",
        });
      }
    }
  }
  if (level === "intermediate") {
    const kind = r.pick(["median", "mode", "range"] as const);
    if (kind === "mode") {
      const modeV = r.int(3, 12);
      const others = r.shuffle([1, 2, 4, 5, 6, 7, 8, 9, 10, 11, 13, 14].filter((x) => x !== modeV)).slice(0, 4);
      const data = r.shuffle([modeV, modeV, modeV, ...others]);
      return numQ({
        prompt: `Find the MODE of these numbers:\n${M(data.join(";  "))}`,
        answer: modeV,
        hints: ["The mode is the number that appears most often.", "Make a tally of how many times each number appears.", `One number appears 3 times.`],
        steps: [S("Count each number", "Tally how often each one appears."), S("Find the one that appears most", `${modeV} appears 3 times, more than any other number.`)],
        skillTag: "dh.average.mode",
      });
    }
    if (kind === "range") {
      const data = Array.from({ length: 6 }, () => r.int(2, 40));
      const mx = Math.max(...data);
      const mn = Math.min(...data);
      if (mx === mn) return dhAverage(r, level);
      return numQ({
        prompt: `Find the RANGE of these numbers:\n${M(data.join(";  "))}`,
        answer: mx - mn,
        hints: ["The range tells us how spread out the numbers are.", "Range = biggest number − smallest number.", `The biggest is ${mx}.`],
        steps: [S("Find the biggest and smallest", `Biggest = ${mx}, smallest = ${mn}.`), S("Subtract", "", M(`${mx} ${MINUS} ${mn} = ${mx - mn}`))],
        skillTag: "dh.average.range",
      });
    }
    const n = r.pick([5, 7, 6]);
    const data = Array.from({ length: n }, () => r.int(2, 30));
    const sorted = [...data].sort((a, b) => a - b);
    const med = n % 2 === 1 ? sorted[(n - 1) / 2] : (sorted[n / 2 - 1] + sorted[n / 2]) / 2;
    return numQ({
      prompt: `Find the MEDIAN of these numbers:\n${M(data.join(";  "))}`,
      answer: med,
      hints: ["The median is the middle number when the numbers are in ORDER.", `Put them in order from smallest to biggest: ${sorted.join("; ")}`, n % 2 === 1 ? "Pick the middle one." : "There are two middle numbers. Find the number halfway between them."],
      steps: [S("Put the numbers in order", "", M(sorted.join(";  "))), n % 2 === 1 ? S("Pick the middle number", `With ${n} numbers the middle one is number ${(n + 1) / 2}: ${med}.`) : S("Two middle numbers", `The middle two are ${sorted[n / 2 - 1]} and ${sorted[n / 2]}. The median is halfway between them.`, M(`(${sorted[n / 2 - 1]} + ${sorted[n / 2]}) ÷ 2 = ${fmtNum(med)}`))],
      skillTag: "dh.average.median",
    });
  }
  if (level === "advanced" && r.chance(0.5)) {
    const m = r.int(10, 18);
    const known = Array.from({ length: 4 }, () => r.int(m - 5, m + 5));
    const last = 5 * m - known.reduce((a, b) => a + b, 0);
    if (last > 0) {
      return numQ({
        prompt: `The mean of 5 numbers is ${m}. Four of the numbers are ${known.join(", ")}. What is the fifth number?`,
        answer: last,
        hints: ["Mean = total ÷ how many numbers. So total = mean × how many numbers.", `Total of all 5 = ${m} × 5 = ${5 * m}`, `Subtract the four known numbers from the total.`],
        steps: [S("Find the total of all 5", "", M(`${m} × 5 = ${5 * m}`)), S("Add the four known numbers", "", M(`${known.join(" + ")} = ${known.reduce((a, b) => a + b, 0)}`)), S("Subtract", "", M(`${5 * m} ${MINUS} ${known.reduce((a, b) => a + b, 0)} = ${last}`))],
        skillTag: "dh.average.missing",
      });
    }
  }
  const m1 = r.int(6, 12);
  const m2 = m1 + r.int(1, 3);
  return numQ({
    prompt: `The mean of 4 numbers is ${m1}. A fifth number is added and the mean of all 5 numbers becomes ${m2}. What is the fifth number?`,
    answer: m2 * 5 - m1 * 4,
    hints: ["Find the total of the first 4 numbers: mean × 4.", `Find the total of all 5 numbers: ${m2} × 5.`, "The difference is the new number."],
    steps: [S("Total of 4 numbers", "", M(`${m1} × 4 = ${m1 * 4}`)), S("Total of 5 numbers", "", M(`${m2} × 5 = ${m2 * 5}`)), S("The new number", "", M(`${m2 * 5} ${MINUS} ${m1 * 4} = ${m2 * 5 - m1 * 4}`))],
    skillTag: "dh.average.missing",
  });
};

const dhGraphs: Gen = (r, level) => {
  if (level === "beginner") {
    const labels = ["Mon", "Tue", "Wed", "Thu", "Fri"];
    const values = labels.map(() => r.int(2, 14));
    const mx = Math.max(...values);
    if (values.filter((v) => v === mx).length > 1) return dhGraphs(r, level);
    return choiceQ(r, {
      prompt: "The bar graph shows how many cups of tea were sold each day. On which day were the MOST cups sold?",
      visual: { type: "bars", labels, values, title: "Cups of tea sold" },
      correct: labels[values.indexOf(mx)],
      wrongs: labels.filter((_, i) => i !== values.indexOf(mx)).slice(0, 3),
      hints: ["Look for the tallest bar.", "The tallest bar shows the biggest number.", "Read the label under the tallest bar."],
      steps: [S("Find the tallest bar", `The tallest bar reaches ${mx}.`), S("Read its label", `It is under ${labels[values.indexOf(mx)]}.`)],
      skillTag: "dh.graphs.bar",
    });
  }
  if (level === "intermediate") {
    const total = r.pick([200, 400, 500, 100, 300]);
    const sets = r.pick([[40, 30, 20, 10], [50, 25, 15, 10], [35, 30, 25, 10], [45, 25, 20, 10]]);
    const labels = ["Football", "Netball", "Swimming", "Chess"];
    const i = r.int(0, 3);
    return numQ({
      prompt: `${total} learners were asked about their favourite sport. The pie chart shows the percentages. How many learners chose ${labels[i]}?`,
      visual: { type: "pie", labels: labels.map((l, k) => `${l} ${sets[k]}%`), values: sets, title: `${total} learners` },
      answer: (sets[i] * total) / 100,
      hints: [`${labels[i]} is ${sets[i]}% of the learners.`, `Find ${sets[i]}% of ${total}.`, `${sets[i]}/100 × ${total}`],
      steps: [S("Read the percentage", `${labels[i]} = ${sets[i]}%`), S("Find that percentage of the total", "", M(`${sets[i]}/100 × ${total} = ${(sets[i] * total) / 100}`))],
      skillTag: "dh.graphs.pie",
    });
  }
  const bank: GeneratedQuestion = ((): GeneratedQuestion => {
    const labels = ["Class A", "Class B", "Class C", "Class D"];
    const values = labels.map(() => r.int(18, 38));
    const total = values.reduce((a, b) => a + b, 0);
    return numQ({
      prompt: "The bar graph shows the number of learners in four classes. How many learners are there in ALL four classes together?",
      visual: { type: "bars", labels, values, title: "Learners per class" },
      answer: total,
      hints: ["Read the height of each bar first.", `${values.join(", ")}`, "Add the four numbers."],
      steps: [S("Read each bar", "", M(values.join(";  "))), S("Add them", "", M(`${values.join(" + ")} = ${total}`))],
      skillTag: "dh.graphs.total",
    });
  })();
  return bank;
};

// ---------- Probability ----------

const probBasic: Gen = (r, level) => {
  if (level === "beginner") {
    const items: [string, string][] = [
      ["The sun will rise tomorrow.", "certain"],
      ["A fair die will land on 7.", "impossible"],
      ["A fair coin will land on heads.", "even chance"],
      ["You roll a 6 on a fair die.", "unlikely"],
      ["A bag has 9 red sweets and 1 blue sweet. You pick a red one without looking.", "likely"],
      ["A cat will learn to fly like a bird.", "impossible"],
    ];
    const it = r.pick(items);
    return choiceQ(r, {
      prompt: `How likely is this? "${it[0]}"`,
      correct: it[1],
      wrongs: ["impossible", "unlikely", "even chance", "likely", "certain"],
      hints: ["Probability words go from 'impossible' (can never happen) to 'certain' (will always happen).", "Ask yourself: could this happen at all? How many ways could it happen out of all the ways?", `Think about how many outcomes make it happen compared to all outcomes.`],
      steps: [S("The scale", "Impossible → unlikely → even chance → likely → certain."), S("Think it through", it[0]), S("Our answer", `It is ${it[1]}.`)],
      skillTag: "prob.basic.words",
    });
  }
  if (level === "intermediate") {
    const k = r.pick([
      { q: "How many possible outcomes are there when you roll a standard die?", a: 6, why: "The faces show 1, 2, 3, 4, 5 and 6." },
      { q: "How many possible outcomes are there when you toss ONE coin?", a: 2, why: "Heads or tails." },
      { q: "How many possible outcomes are there when you toss a coin TWICE? (Think: HH, HT, TH, TT.)", a: 4, why: "HH, HT, TH, TT." },
      { q: "A spinner has 8 equal sections. How many possible outcomes are there?", a: 8, why: "Each section is one outcome." },
    ]);
    return numQ({
      prompt: k.q,
      answer: k.a,
      hints: ["An outcome is one possible result.", "List every possible result carefully, so you do not miss one.", k.why],
      steps: [S("List the outcomes", k.why), S("Count them", `There are ${k.a}.`)],
      skillTag: "prob.basic.outcomes",
    });
  }
  const k = r.pick([
    { q: "You toss a coin and roll a die. How many possible outcomes are there altogether?", a: 12, why: "2 coin outcomes × 6 die outcomes" },
    { q: "You toss a coin 3 times. How many possible outcomes are there altogether?", a: 8, why: "2 × 2 × 2" },
    { q: "You roll TWO dice. How many possible outcomes are there altogether?", a: 36, why: "6 × 6" },
    { q: "You spin a spinner with 4 equal sections and toss a coin. How many possible outcomes are there?", a: 8, why: "4 × 2" },
  ]);
  return numQ({
    prompt: k.q,
    answer: k.a,
    hints: ["When two things happen, MULTIPLY the number of outcomes of each.", `Number of outcomes of the first × number of outcomes of the second (× the third...).`, k.why],
    steps: [S("Count the outcomes for each event", "Write them separately."), S("Multiply", k.why, M(`${k.why} = ${k.a}`))],
    skillTag: "prob.basic.sample",
  });
};

const probCalc: Gen = (r, level) => {
  if (level === "beginner") {
    const ev = r.pick([
      { say: "a 3", count: 1 },
      { say: "an even number", count: 3 },
      { say: "a number greater than 4", count: 2 },
      { say: "a number less than 3", count: 2 },
      { say: "a prime number", count: 3 },
    ]);
    const [n, d] = [ev.count / gcd(ev.count, 6), 6 / gcd(ev.count, 6)];
    return fracQ({
      prompt: `You roll a fair die with faces 1 to 6. What is the probability of rolling ${ev.say}? Give your answer as a fraction in simplest form.`,
      n: ev.count,
      d: 6,
      hints: ["Probability = number of ways it can happen ÷ total number of outcomes.", `There are 6 equally likely outcomes. How many of them are ${ev.say}?`, `${ev.count} outcome${ev.count > 1 ? "s" : ""} out of 6.`],
      steps: [S("Total outcomes", "A die has 6 faces, all equally likely."), S("Favourable outcomes", `The outcomes that are ${ev.say}: ${ev.count}.`), S("Write the fraction", "", M(`P = ${frac(ev.count, 6)} = ${frac(n, d)}`)), S("Simplify", "Divide top and bottom by the same number if you can.")],
      skillTag: "prob.calc.die",
    });
  }
  const red = r.int(2, 8);
  const blue = r.int(3, 8);
  const green = r.int(2, 6);
  const total = red + blue + green;
  if (level === "intermediate") {
    const pick = r.pick([["red", red], ["blue", blue], ["green", green]] as const);
    return fracQ({
      prompt: `A bag has ${red} red, ${blue} blue and ${green} green marbles. You pick one without looking. What is the probability that it is ${pick[0]}? Give a fraction in simplest form.`,
      n: pick[1],
      d: total,
      hints: ["Probability = favourable outcomes ÷ total outcomes.", `Total marbles = ${red} + ${blue} + ${green} = ${total}`, `There are ${pick[1]} ${pick[0]} marbles.`],
      steps: [S("Total outcomes", "", M(`${red} + ${blue} + ${green} = ${total}`)), S("Favourable outcomes", `${pick[1]} marbles are ${pick[0]}.`), S("Probability", "", M(`P(${pick[0]}) = ${frac(pick[1], total)}`)), S("Simplify if possible", "")],
      skillTag: "prob.calc.bag",
    });
  }
  const tot = r.pick([10, 20, 25, 50]);
  const rd = r.int(2, tot - 3);
  return numQ({
    prompt: `A box has ${tot} counters. ${rd} of them are red. What is the probability of NOT picking a red counter? Give your answer as a percentage.`,
    answer: ((tot - rd) * 100) / tot,
    unit: "%",
    hints: ["'NOT red' means all the counters that are not red.", `${tot} − ${rd} = ${tot - rd} counters are not red.`, `Probability = ${tot - rd}/${tot}. Change to a percentage by making the denominator 100.`],
    steps: [S("Count the 'not red' counters", "", M(`${tot} ${MINUS} ${rd} = ${tot - rd}`)), S("Write the probability as a fraction", "", M(frac(tot - rd, tot))), S("Change to a percentage", "", M(`${frac(tot - rd, tot)} × 100 = ${((tot - rd) * 100) / tot}%`))],
    skillTag: "prob.calc.complement",
  });
};

const probFreq: Gen = (r, level) => {
  if (level === "beginner") {
    const trials = r.pick([10, 20, 25, 50, 100]);
    const freq = r.int(2, trials - 2);
    return fracQ({
      prompt: `A coin is tossed ${trials} times and lands on heads ${freq} times. What is the RELATIVE FREQUENCY of heads? Give a fraction in simplest form.`,
      n: freq,
      d: trials,
      hints: ["Relative frequency = number of times it happened ÷ total number of trials.", `It happened ${freq} times out of ${trials}.`, `${freq}/${trials}. Now simplify.`],
      steps: [S("Times it happened", `${freq} heads.`), S("Total trials", `${trials} tosses.`), S("Divide", "", M(`${frac(freq, trials)}`)), S("Simplify", "")],
      skillTag: "prob.freq.relative",
    });
  }
  if (level === "intermediate") {
    return choiceQ(r, {
      prompt: "A coin is tossed many times. What usually happens to the relative frequency of heads as the number of tosses gets larger?",
      correct: "It gets closer to the theoretical probability (½)",
      wrongs: ["It gets further from ½", "It becomes exactly 0", "It always equals exactly ½"],
      hints: ["Small experiments can be a bit random. What happens with lots of trials?", "More trials give a better picture of what is really happening.", "The result settles near the theoretical probability, but it does not have to be exactly equal."],
      steps: [S("Think about few trials", "With only a few tosses we might get 3 heads in a row."), S("Think about many trials", "With hundreds of tosses the heads and tails balance out more."), S("Our answer", "The relative frequency gets closer to the theoretical probability.")],
      skillTag: "prob.freq.concept",
    });
  }
  const type = r.pick([
    { p: "1/6", num: 1, den: 6, what: "rolling a 4 with a fair die", n: r.pick([60, 120, 300, 600]) },
    { p: "1/4", num: 1, den: 4, what: "a spinner landing on blue (1 of 4 equal sections)", n: r.pick([40, 100, 200, 400]) },
    { p: "1/2", num: 1, den: 2, what: "a coin landing on heads", n: r.pick([50, 100, 150]) },
    { p: "1/5", num: 1, den: 5, what: "picking a red card from a pack with 1 red in every 5 cards", n: r.pick([50, 100, 250]) },
  ]);
  return numQ({
    prompt: `The probability of ${type.what} is ${type.p}. If you try it ${type.n} times, about how many times do you EXPECT it to happen?`,
    answer: (type.n * type.num) / type.den,
    hints: ["Expected number = probability × number of trials.", `${type.p} of ${type.n}`, `${type.n} ÷ ${type.den}`],
    steps: [S("Write the calculation", "Expected number = probability × number of trials", M(`${frac(type.num, type.den)} × ${type.n}`)), S("Calculate", "", M(`${type.n} ÷ ${type.den} = ${(type.n * type.num) / type.den}`)), S("Remember", "This is only an estimate. Real results may be a bit different.")],
    skillTag: "prob.freq.expected",
  });
};

export const genMeasureData: Record<string, Gen> = {
  "meas-convert": measConvert,
  "meas-time": measTime,
  "pa-perimeter": paPerimeter,
  "pa-area": paArea,
  "pa-circle": paCircle,
  "sv-surface": svSurface,
  "sv-volume": svVolume,
  "sv-capacity": svCapacity,
  "dh-organise": dhOrganise,
  "dh-average": dhAverage,
  "dh-graphs": dhGraphs,
  "prob-basic": probBasic,
  "prob-calc": probCalc,
  "prob-freq": probFreq,
};

// Keep a reference so the shared types remain in use for tooling.
export type { Rng };
