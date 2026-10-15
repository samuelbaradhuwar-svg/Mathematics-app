// Question generators: Graphs (Cartesian plane), Geometry of straight lines,
// 2D shapes and 3D objects.
import type { GeneratedQuestion } from "./curriculumTypes";
import { type Gen, S, M, wr, numQ, choiceQ } from "./genKit";
import type { Rng } from "./makeRng";
import { fmtNum } from "./mathUtils";

const MINUS = "−";
const pt = (x: number, y: number): string => `(${fmtNum(x)}; ${fmtNum(y)})`;

interface BankItem {
  q: string;
  a: string;
  w: string[];
  hint: string;
  why: string;
}

const bankQ = (r: Rng, items: BankItem[], skillTag: string): GeneratedQuestion => {
  const it = r.pick(items);
  return choiceQ(r, {
    prompt: it.q,
    correct: it.a,
    wrongs: it.w,
    hints: ["Read the question slowly. What is it really asking?", it.hint, `It is NOT "${it.w[0]}".`],
    steps: [S("Think about what the question is asking", it.hint), S("Our answer", it.why)],
    skillTag,
  });
};

// ---------- Graphs ----------

const grPlane: Gen = (r, level) => {
  if (level === "beginner") {
    const x = r.int(1, 6);
    const y = r.intNot(1, 6, [x]);
    return choiceQ(r, {
      prompt: "What are the coordinates of point A?",
      visual: { type: "coordplane", points: [{ x, y, label: "A" }], range: 6, caption: "Go ALONG first (x), then UP (y)." },
      correct: pt(x, y),
      wrongs: [pt(y, x), pt(x, y + 1), pt(x + 1, y)],
      hints: ["Coordinates are written (x; y). Always go along the x-axis first, then up the y-axis.", "Drop a line straight down from A to the x-axis. Which number do you reach?", `Now go across to the y-axis. The coordinates are (${x}; ?).`],
      steps: [
        S("Read the x-coordinate", `Go straight down from A to the x-axis (the horizontal line). We reach ${x}.`),
        S("Read the y-coordinate", `Go straight across from A to the y-axis (the vertical line). We reach ${y}.`),
        S("Write the pair", "x always comes first.", M(`A = ${pt(x, y)}`), "Remember: 'along the corridor, then up the stairs'."),
      ],
      notes: { [pt(y, x)]: { tag: "gr.swapXY", message: "The x and y numbers are swapped. x (along) comes first, y (up) comes second." } },
      skillTag: "gr.plane.read",
    });
  }
  if (level === "intermediate") {
    const x = r.pick([-5, -4, -3, -2, 2, 3, 4, 5]);
    const y = r.pick([-5, -4, -3, -2, 2, 3, 4, 5]);
    const quad = x > 0 && y > 0 ? "first" : x < 0 && y > 0 ? "second" : x < 0 && y < 0 ? "third" : "fourth";
    return choiceQ(r, {
      prompt: `In which quadrant does the point ${M(pt(x, y))} lie?`,
      correct: `The ${quad} quadrant`,
      wrongs: ["first", "second", "third", "fourth"].filter((q) => q !== quad).map((q) => `The ${q} quadrant`),
      visual: { type: "coordplane", points: [{ x, y }], range: 6, caption: "Quadrants are numbered anti-clockwise, starting at the top right." },
      hints: ["The axes cut the plane into 4 quadrants, numbered anti-clockwise starting at the top right.", `Is x ${x > 0 ? "positive (right of the y-axis)" : "negative (left of the y-axis)"}? Is y ${y > 0 ? "positive (above the x-axis)" : "negative (below the x-axis)"}?`, `x is ${x > 0 ? "positive" : "negative"} and y is ${y > 0 ? "positive" : "negative"}.`],
      steps: [
        S("Look at the sign of x", x > 0 ? "x is positive: the point is to the RIGHT." : "x is negative: the point is to the LEFT."),
        S("Look at the sign of y", y > 0 ? "y is positive: the point is ABOVE." : "y is negative: the point is BELOW."),
        S("Find the quadrant", `Right/above = first. Left/above = second. Left/below = third. Right/below = fourth. So it is the ${quad} quadrant.`),
      ],
      skillTag: "gr.plane.quadrant",
    });
  }
  const x1 = r.int(-4, 1);
  const x2 = x1 + r.int(2, 5);
  const y1 = r.int(-4, 1);
  const y2 = y1 + r.int(2, 4);
  return choiceQ(r, {
    prompt: "A, B and C are three corners of a rectangle with sides parallel to the axes. What are the coordinates of the fourth corner D?",
    visual: { type: "coordplane", points: [{ x: x1, y: y1, label: "A" }, { x: x2, y: y1, label: "B" }, { x: x2, y: y2, label: "C" }], range: 6 },
    correct: pt(x1, y2),
    wrongs: [pt(x2, x1), pt(y2, x1), pt(x1 + 1, y2 + 1), pt(x1, y1)].filter((p) => p !== pt(x1, y2)),
    hints: ["In a rectangle with sides parallel to the axes, opposite corners share an x or a y value.", `A is ${pt(x1, y1)} and C is ${pt(x2, y2)}. D is above A, so it has the same x as A.`, `D is in line with C horizontally, so it has the same y as C (${fmtNum(y2)}).`],
    steps: [
      S("Look at the x-values", `A and D are on the same vertical side, so D has the same x as A: ${fmtNum(x1)}.`),
      S("Look at the y-values", `C and D are on the same horizontal side, so D has the same y as C: ${fmtNum(y2)}.`),
      S("Write D", "", M(`D = ${pt(x1, y2)}`)),
    ],
    skillTag: "gr.plane.rectangle",
  });
};

const grLinear: Gen = (r, level) => {
  if (level === "beginner") {
    const a = r.int(1, 4);
    const b = r.int(0, 5);
    const xs = [0, 1, 2, 3];
    const ask = r.int(1, 3);
    const ys = xs.map((x) => a * x + b);
    return numQ({
      prompt: `Here is a table of values for ${M(`y = ${a === 1 ? "" : a}x${b ? ` + ${b}` : ""}`)}.\n${M("x:  " + xs.join(";  "))}\n${M("y:  " + ys.map((y, i) => (i === ask ? "?" : y)).join(";  "))}\nFind the missing y-value.`,
      answer: ys[ask],
      hints: ["Replace x with the number from the table.", `For x = ${xs[ask]}: y = ${a} × ${xs[ask]}${b ? ` + ${b}` : ""}`, `${a} × ${xs[ask]} = ${a * xs[ask]}`],
      steps: [
        S("Pick the x-value", `We need y when x = ${xs[ask]}.`),
        S("Substitute", "", M(`y = ${a} × ${xs[ask]}${b ? ` + ${b}` : ""} = ${a * xs[ask]}${b ? ` + ${b}` : ""}`)),
        S("Our answer", "", M(`y = ${ys[ask]}`)),
      ],
      skillTag: "gr.linear.table",
    });
  }
  if (level === "intermediate") {
    const a = r.int(1, 4);
    const b = r.int(-3, 4);
    const x = r.int(1, 5);
    const y = a * x + b;
    return choiceQ(r, {
      prompt: `Which point lies on the line ${M(`y = ${a === 1 ? "" : a}x ${b < 0 ? MINUS : "+"} ${Math.abs(b)}`)}?`,
      correct: pt(x, y),
      wrongs: [pt(x, y + 1), pt(y, x), pt(x + 1, y - 1)],
      hints: ["A point is on the line if its x and y values make the equation TRUE.", "Substitute the x-value of each point into the equation and see if you get the y-value.", `Test ${pt(x, y)}: ${a} × ${x} ${b < 0 ? "−" : "+"} ${Math.abs(b)} = ?`],
      steps: [
        S("Test a point", "Put x into the equation and see if the answer equals y.", M(`x = ${x}: y = ${a} × ${x} ${b < 0 ? MINUS : "+"} ${Math.abs(b)} = ${y}`)),
        S("Compare", `The point ${pt(x, y)} has y = ${y}, so it is ON the line.`),
        S("The other points", "For the others, the equation gives a different y-value, so they are NOT on the line."),
      ],
      skillTag: "gr.linear.onLine",
    });
  }
  const m = r.pick([1, 2, -1]);
  const c = r.int(-2, 3);
  const x = r.int(2, 4);
  return numQ({
    prompt: `The graph shows a straight line. Read the graph: what is the value of y when x = ${x}?`,
    visual: { type: "coordplane", points: [], line: { m, c }, range: 8, caption: "Find x on the horizontal axis, go up/down to the line, then across." },
    answer: m * x + c,
    hints: ["Find x on the horizontal axis.", `Move straight up or down from x = ${x} until you reach the line.`, "Now read across to the y-axis."],
    steps: [
      S("Find x on the x-axis", `Locate x = ${x}.`),
      S("Go to the line", "Move up or down until you touch the line."),
      S("Read y", `Go across to the y-axis: y = ${fmtNum(m * x + c)}.`, M(`y = ${fmtNum(m * x + c)}`)),
    ],
    skillTag: "gr.linear.read",
  });
};

const grInterpret: Gen = (r, level) => {
  if (level === "beginner") {
    const labels = ["Soccer", "Netball", "Rugby", "Chess"];
    const values = labels.map(() => r.int(3, 18));
    const i = r.int(0, 3);
    return numQ({
      prompt: `The bar graph shows the favourite sport of learners in a class. How many learners chose ${labels[i]}?`,
      visual: { type: "bars", labels, values, title: "Favourite sport", caption: "Read the height of the bar on the vertical axis." },
      answer: values[i],
      hints: ["Find the bar for " + labels[i] + ".", "Look at the top of the bar.", "Read across to the number on the vertical axis."],
      steps: [S("Find the bar", `Find the bar labelled ${labels[i]}.`), S("Read the height", `The top of the bar is at ${values[i]}.`), S("Our answer", `${values[i]} learners chose ${labels[i]}.`)],
      skillTag: "gr.interpret.bars",
    });
  }
  if (level === "intermediate") {
    return bankQ(
      r,
      [
        { q: "A distance-time graph shows a HORIZONTAL (flat) line segment. What does this tell us?", a: "The person is standing still", w: ["The person is speeding up", "The person is walking home", "The person is going faster and faster"], hint: "On a distance-time graph, the line goes up when distance increases. What does a flat line say about distance?", why: "The distance is not changing while time passes, so the person is standing still." },
        { q: "On a distance-time graph, a STEEPER line going up means…", a: "A faster speed", w: ["A slower speed", "Standing still", "Returning to the start"], hint: "A steeper line covers more distance in the same time.", why: "More distance in the same time means a faster speed." },
        { q: "A graph shows the temperature during a day. The line goes DOWN between 18:00 and 22:00. What happened?", a: "The temperature dropped", w: ["The temperature rose", "The temperature stayed the same", "The graph is broken"], hint: "Going down on the vertical axis means the value decreases.", why: "The line goes down so the temperature dropped." },
        { q: "A graph shows the height of water in a bath over time. The line rises, then goes flat. What does the flat part mean?", a: "The bath stopped filling", w: ["The bath is emptying", "The bath is filling faster", "The tap was turned on harder"], hint: "Flat means the height is not changing.", why: "A flat line means no change in water height, so the water stopped running in." },
      ],
      "gr.interpret.story"
    );
  }
  if (r.chance(0.5)) {
    const labels = ["Mon", "Tue", "Wed", "Thu", "Fri"];
    const values = labels.map(() => r.int(4, 20));
    const i = r.int(0, 4);
    const j = r.intNot(0, 4, [i]);
    return numQ({
      prompt: `The bar graph shows how many books were borrowed from the library each day. How many MORE books were borrowed on ${labels[i]} than on ${labels[j]}? (If fewer, give a negative number.)`,
      visual: { type: "bars", labels, values, title: "Books borrowed" },
      answer: values[i] - values[j],
      hints: ["Read the two bars separately first.", `${labels[i]} is ${values[i]} and ${labels[j]} is ${values[j]}.`, "Subtract the smaller from the bigger."],
      steps: [S("Read both bars", `${labels[i]}: ${values[i]}, ${labels[j]}: ${values[j]}`), S("Subtract", "", M(`${values[i]} ${MINUS} ${values[j]} = ${fmtNum(values[i] - values[j])}`))],
      skillTag: "gr.interpret.compare",
    });
  }
  return bankQ(
    r,
    [
      { q: "Which type of graph is BEST to show how a plant's height changes over 10 weeks?", a: "A line (broken-line) graph", w: ["A pie chart", "A bar graph", "A pictogram"], hint: "We want to see a change over time.", why: "Line graphs are best for showing change over time." },
      { q: "Which type of graph is BEST to show parts of a whole, like how a pizza is shared?", a: "A pie chart", w: ["A line graph", "A scatter plot", "A histogram"], hint: "We are comparing slices of one whole.", why: "A pie chart shows each part as a slice of the whole." },
      { q: "Which type of graph is BEST to compare the number of learners in five different classes?", a: "A bar graph", w: ["A line graph", "A pie chart", "A flow chart"], hint: "We compare separate groups side by side.", why: "Bar graphs compare separate categories." },
      { q: "Which graph shows how many learners scored in mark ranges (0–9, 10–19, 20–29...)?", a: "A histogram", w: ["A pie chart", "A line graph", "A pictogram"], hint: "Mark ranges are grouped data (classes).", why: "A histogram shows grouped (class interval) data." },
    ],
    "gr.interpret.choose"
  );
};

// ---------- Geometry of straight lines ----------

const gslAngles: Gen = (r, level) => {
  if (level === "beginner") {
    const type = r.pick(["acute", "right", "obtuse", "straight", "reflex"] as const);
    const deg = { acute: r.int(10, 85), right: 90, obtuse: r.int(95, 175), straight: 180, reflex: r.int(185, 355) }[type];
    return choiceQ(r, {
      prompt: `An angle measures ${deg}°. What type of angle is it?`,
      correct: type,
      wrongs: ["acute", "right", "obtuse", "straight", "reflex"],
      hints: ["Compare the angle to 90° and 180°.", "Acute: less than 90°. Right: exactly 90°. Obtuse: between 90° and 180°. Straight: exactly 180°. Reflex: more than 180°.", `Is ${deg}° more or less than 90°? More or less than 180°?`],
      steps: [
        S("Compare with 90°", deg < 90 ? `${deg}° is less than 90°.` : deg === 90 ? "It is exactly 90°." : `${deg}° is more than 90°.`),
        S("Compare with 180°", deg < 180 ? `${deg}° is less than 180°.` : deg === 180 ? "It is exactly 180°." : `${deg}° is more than 180°.`),
        S("Name it", `It is a${type === "acute" || type === "obtuse" ? "n" : ""} ${type} angle.`.replace("a acute", "an acute").replace("a obtuse", "an obtuse")),
      ],
      skillTag: "gsl.angles.classify",
    });
  }
  if (level === "intermediate") {
    const comp = r.chance(0.5);
    const a = comp ? r.int(10, 80) : r.int(20, 160);
    const target = comp ? 90 : 180;
    return numQ({
      prompt: comp ? `Two angles are COMPLEMENTARY (they add up to 90°). One angle is ${a}°. What is the other angle?` : `Two angles are SUPPLEMENTARY (they add up to 180°). One angle is ${a}°. What is the other angle?`,
      answer: target - a,
      unit: "°",
      hints: [comp ? "Complementary angles add up to 90°." : "Supplementary angles add up to 180°.", `Subtract ${a}° from ${target}°.`, `${target} − ${a} = ?`],
      steps: [S("Remember the rule", comp ? "Complementary angles add up to 90°." : "Supplementary angles add up to 180°."), S("Subtract", "", M(`${target} ${MINUS} ${a} = ${target - a}`)), S("Our answer", `The other angle is ${target - a}°.`)],
      skillTag: comp ? "gsl.angles.complementary" : "gsl.angles.supplementary",
    });
  }
  if (r.chance(0.5)) {
    const h = r.pick([1, 2, 4, 5, 7, 8, 10, 11]);
    const raw = h * 30;
    const ans = Math.min(raw, 360 - raw);
    return numQ({
      prompt: `What is the smaller angle between the hour hand and the minute hand of a clock at ${h}:00?`,
      answer: ans,
      unit: "°",
      hints: ["A full circle is 360°. A clock has 12 hours.", "360° ÷ 12 = 30° for each hour mark.", `At ${h}:00 the minute hand is at 12. Count ${h} hour marks.`],
      steps: [S("Angle for one hour", "A full turn is 360° and there are 12 hours.", M("360 ÷ 12 = 30")), S("Count the hours between the hands", `At ${h}:00 the hands are ${h} hours apart.`, M(`${h} × 30 = ${raw}`)), S("Choose the smaller angle", raw > 180 ? `${raw}° is more than 180°, so the smaller angle is 360° − ${raw}° = ${ans}°.` : `${raw}° is less than 180°, so that is the smaller angle.`)],
      skillTag: "gsl.angles.clock",
    });
  }
  const a = r.int(200, 330);
  return numQ({
    prompt: `A reflex angle measures ${a}°. What is the size of the angle that completes the full turn (360°)?`,
    answer: 360 - a,
    unit: "°",
    hints: ["A full turn is 360°.", `Subtract ${a}° from 360°.`, `360 − ${a} = ?`],
    steps: [S("Remember a full turn", "A full turn is 360°."), S("Subtract", "", M(`360 ${MINUS} ${a} = ${360 - a}`))],
    skillTag: "gsl.angles.revolution",
  });
};

const gslLines: Gen = (r, level) => {
  if (level === "beginner") {
    const a = r.int(25, 155);
    return numQ({
      prompt: "Two angles lie on a straight line. One angle is " + a + "°. Find the other angle, marked b.",
      visual: { type: "angleline", a, caption: `Angles on a straight line add up to 180°.` },
      answer: 180 - a,
      unit: "°",
      hints: ["Angles on a straight line add up to 180°.", `${a}° + b = 180°`, `b = 180° − ${a}°`],
      steps: [S("Remember the rule", "Angles on a straight line add up to 180°."), S("Write an equation", "", M(`${a} + b = 180`)), S("Solve for b", "Subtract " + a + " from both sides.", M(`b = 180 ${MINUS} ${a} = ${180 - a}`)), S("Check", `${a} + ${180 - a} = 180 ✓`)],
      wrong: [wr(90 - a > 0 ? 90 - a : 360 - a, "gsl.wrongTotal", "Angles on a STRAIGHT LINE add up to 180° (not 90° or 360°).")],
      skillTag: "gsl.lines.straight",
    });
  }
  if (level === "intermediate") {
    if (r.chance(0.5)) {
      const a = r.int(60, 130);
      const b = r.int(50, 100);
      const c = r.int(40, 360 - a - b - 20);
      const d = 360 - a - b - c;
      return numQ({
        prompt: `Four angles meet at a point. Three of them are ${a}°, ${b}° and ${c}°. What is the fourth angle?`,
        answer: d,
        unit: "°",
        hints: ["Angles around a point add up to 360°.", `Add the three angles you know: ${a} + ${b} + ${c}.`, `Subtract that from 360°.`],
        steps: [S("Remember the rule", "Angles around a point add up to 360°."), S("Add the known angles", "", M(`${a} + ${b} + ${c} = ${a + b + c}`)), S("Subtract from 360", "", M(`360 ${MINUS} ${a + b + c} = ${d}`))],
        skillTag: "gsl.lines.point",
      });
    }
    const a = r.int(30, 150);
    return numQ({
      prompt: `Two straight lines cross. One angle is ${a}°. What is the angle directly OPPOSITE it (the vertically opposite angle)?`,
      answer: a,
      unit: "°",
      hints: ["Vertically opposite angles are the angles across from each other when two lines cross.", "They are always EQUAL.", `The opposite angle is the same size as ${a}°.`],
      steps: [S("Remember the rule", "Vertically opposite angles are equal."), S("Our answer", `The opposite angle is also ${a}°.`)],
      wrong: [wr(180 - a, "gsl.oppositeVsAdjacent", `${180 - a}° is the angle NEXT to it on the straight line (adjacent). The angle directly across (opposite) is equal.`)],
      skillTag: "gsl.lines.vertical",
    });
  }
  const x = r.int(10, 30);
  const p = r.int(1, 3);
  const q = r.int(5, 20);
  const rr = r.int(1, 3);
  const s = 180 - (p + rr) * x - q;
  if (s <= 0) return gslLines(r, level);
  return numQ({
    prompt: `Two angles on a straight line are ${M(`(${p === 1 ? "" : p}x + ${q})°`)} and ${M(`(${rr === 1 ? "" : rr}x + ${s})°`)}. Find x.`,
    answer: x,
    hints: ["Angles on a straight line add up to 180°. Write an equation.", `(${p}x + ${q}) + (${rr}x + ${s}) = 180`, `Collect like terms: ${p + rr}x + ${q + s} = 180`],
    steps: [
      S("Write the equation", "Angles on a straight line add up to 180°.", M(`${p === 1 ? "" : p}x + ${q} + ${rr === 1 ? "" : rr}x + ${s} = 180`)),
      S("Collect like terms", "", M(`${p + rr}x + ${q + s} = 180`)),
      S("Subtract " + (q + s) + " from both sides", "", M(`${p + rr}x = ${180 - q - s}`)),
      S("Divide both sides by " + (p + rr), "", M(`x = ${x}`)),
      S("Check", `The angles are ${p * x + q}° and ${rr * x + s}°. ${p * x + q} + ${rr * x + s} = 180 ✓`),
    ],
    skillTag: "gsl.lines.algebra",
  });
};

const gslParallel: Gen = (r, level) => {
  if (level === "beginner") {
    return bankQ(
      r,
      [
        { q: "Two parallel lines are cut by a transversal. Angles in an 'F' shape (same position at each crossing) are called…", a: "corresponding angles", w: ["alternate angles", "co-interior angles", "vertically opposite angles"], hint: "The F shape matches angles in the same position at the two crossings.", why: "Corresponding angles are in the same position, forming an F shape. They are equal." },
        { q: "Angles in a 'Z' shape between two parallel lines are called…", a: "alternate angles", w: ["corresponding angles", "co-interior angles", "supplementary angles"], hint: "The Z shape joins angles on opposite sides of the transversal, between the lines.", why: "Alternate angles form a Z shape. They are equal." },
        { q: "Angles in a 'C' (or 'U') shape between two parallel lines are called…", a: "co-interior angles", w: ["alternate angles", "corresponding angles", "vertically opposite angles"], hint: "The C shape joins angles on the SAME side of the transversal, between the lines.", why: "Co-interior angles form a C shape. They add up to 180°." },
        { q: "Two parallel lines are cut by a transversal. Which pair of angles add up to 180°?", a: "co-interior angles", w: ["alternate angles", "corresponding angles", "vertically opposite angles"], hint: "Only one of these pairs is NOT equal; they add up to 180° instead.", why: "Co-interior angles are supplementary (add to 180°)." },
      ],
      "gsl.parallel.names"
    );
  }
  if (level === "intermediate") {
    const a = r.int(40, 140);
    const rel = r.pick(["corresponding", "alternate", "co-interior"] as const);
    const ans = rel === "co-interior" ? 180 - a : a;
    return numQ({
      prompt: `AB ∥ CD and a transversal crosses both lines. Angle 1 = ${a}°. Angle 2 is ${rel === "co-interior" ? "CO-INTERIOR" : rel.toUpperCase()} to angle 1. How big is angle 2?`,
      visual: { type: "parallel", angle: a, caption: "The two horizontal lines are parallel." },
      answer: ans,
      unit: "°",
      hints: [rel === "co-interior" ? "Co-interior angles add up to 180°." : `${rel === "alternate" ? "Alternate" : "Corresponding"} angles are equal when the lines are parallel.`, rel === "co-interior" ? `Angle 2 = 180° − ${a}°` : `Angle 2 is the same size as angle 1.`, rel === "co-interior" ? `180 − ${a} = ?` : `Angle 2 is ${a}°.`],
      steps: [S("Name the relationship", `The angles are ${rel}.`), S("Use the rule", rel === "co-interior" ? "Co-interior angles add up to 180° (parallel lines)." : `${rel === "alternate" ? "Alternate" : "Corresponding"} angles are equal (parallel lines).`, rel === "co-interior" ? M(`180 ${MINUS} ${a} = ${ans}`) : M(`angle 2 = ${a}°`)), S("Our answer", `Angle 2 = ${ans}°`)],
      skillTag: "gsl.parallel.find",
    });
  }
  const rel = r.pick(["alternate", "co-interior", "corresponding"] as const);
  const x = r.int(10, 30);
  const p = r.int(2, 5);
  const q = r.int(5, 20);
  if (rel === "co-interior") {
    const rr = r.int(1, 3);
    const s = 180 - (p + rr) * x - q;
    if (s <= 0) return gslParallel(r, level);
    return numQ({
      prompt: `AB ∥ CD. Two co-interior angles are ${M(`(${p}x + ${q})°`)} and ${M(`(${rr === 1 ? "" : rr}x + ${s})°`)}. Find x.`,
      answer: x,
      hints: ["Co-interior angles add up to 180° when lines are parallel.", `(${p}x + ${q}) + (${rr}x + ${s}) = 180`, `Collect like terms: ${p + rr}x + ${q + s} = 180`],
      steps: [S("Write the equation", "Co-interior angles add up to 180°.", M(`${p}x + ${q} + ${rr === 1 ? "" : rr}x + ${s} = 180`)), S("Collect like terms", "", M(`${p + rr}x + ${q + s} = 180`)), S("Solve", `${p + rr}x = ${180 - q - s}, so x = ${x}.`)],
      skillTag: "gsl.parallel.algebra",
    });
  }
  const rr = r.int(1, p - 1);
  const s = (p - rr) * x + q;
  return numQ({
    prompt: `AB ∥ CD. Two ${rel} angles are ${M(`(${p}x + ${q})°`)} and ${M(`(${rr === 1 ? "" : rr}x + ${s})°`)}. Find x.`,
    answer: x,
    hints: [`${rel === "alternate" ? "Alternate" : "Corresponding"} angles are equal when lines are parallel. Write an equation.`, `${p}x + ${q} = ${rr}x + ${s}`, "Get the x-terms on one side."],
    steps: [S("Write the equation", "The two angles are equal.", M(`${p}x + ${q} = ${rr === 1 ? "" : rr}x + ${s}`)), S("Subtract the smaller x-term from both sides", "", M(`${p - rr === 1 ? "" : p - rr}x + ${q} = ${s}`)), S("Subtract " + q, "", M(`${p - rr === 1 ? "" : p - rr}x = ${s - q}`)), S("Divide", "", M(`x = ${x}`))],
    skillTag: "gsl.parallel.algebra",
  });
};

// ---------- 2D shapes ----------

const g2dTriangles: Gen = (r, level) => {
  if (level === "beginner") {
    const type = r.pick(["equilateral", "isosceles", "scalene"] as const);
    let sides: number[];
    if (type === "equilateral") {
      const s = r.int(3, 9);
      sides = [s, s, s];
    } else if (type === "isosceles") {
      const s = r.int(4, 9);
      sides = [s, s, r.intNot(2, s + s - 1, [s])];
    } else {
      const o = r.int(0, 2);
      sides = [4 + o, 5 + o, 7 + o];
    }
    return choiceQ(r, {
      prompt: `A triangle has sides of ${sides.join(" cm, ")} cm. What type of triangle is it?`,
      correct: type,
      wrongs: ["equilateral", "isosceles", "scalene"],
      hints: ["Count how many sides are equal.", "Equilateral: all 3 sides equal. Isosceles: exactly 2 sides equal. Scalene: no sides equal.", `The sides are ${sides.join(", ")}.`],
      steps: [S("Compare the sides", `The sides are ${sides.join(" cm, ")} cm.`), S("Count equal sides", type === "equilateral" ? "All three are equal." : type === "isosceles" ? "Exactly two are equal." : "None are equal."), S("Name it", `It is ${type}.`)],
      skillTag: "g2d.tri.classify",
    });
  }
  if (level === "intermediate") {
    const a = r.int(30, 90);
    const b = r.int(30, 100);
    const c = 180 - a - b;
    if (c <= 5) return g2dTriangles(r, level);
    return numQ({
      prompt: `Two angles of a triangle are ${a}° and ${b}°. What is the third angle?`,
      visual: { type: "triangle", angles: [`${a}°`, `${b}°`, "?"] },
      answer: c,
      unit: "°",
      hints: ["The angles of a triangle always add up to 180°.", `Add the two angles you know: ${a} + ${b}.`, `Subtract the total from 180°.`],
      steps: [S("Remember the rule", "The angles in a triangle add up to 180°."), S("Add the known angles", "", M(`${a} + ${b} = ${a + b}`)), S("Subtract from 180", "", M(`180 ${MINUS} ${a + b} = ${c}`)), S("Check", `${a} + ${b} + ${c} = 180 ✓`)],
      wrong: [wr(360 - a - b, "g2d.wrongTotal", "Angles of a TRIANGLE add up to 180°. 360° is for a quadrilateral.")],
      skillTag: "g2d.tri.angle",
    });
  }
  if (r.chance(0.5)) {
    const apex = r.pick([20, 30, 40, 50, 80, 100, 120]);
    const base = (180 - apex) / 2;
    return numQ({
      prompt: `An isosceles triangle has an angle of ${apex}° between its two equal sides. How big is each of the other two angles?`,
      visual: { type: "triangle", angles: [`${apex}°`, "?", "?"] },
      answer: base,
      unit: "°",
      hints: ["In an isosceles triangle the two angles opposite the equal sides (the base angles) are equal.", "The three angles add up to 180°.", `The two base angles share ${180 - apex}° equally.`],
      steps: [S("Angles add up to 180°", "", M(`${apex} + base + base = 180`)), S("Subtract the apex angle", "", M(`2 × base = 180 ${MINUS} ${apex} = ${180 - apex}`)), S("Share equally", "", M(`base = ${180 - apex} ÷ 2 = ${base}`))],
      skillTag: "g2d.tri.isosceles",
    });
  }
  const b = r.int(35, 80);
  return numQ({
    prompt: `An isosceles triangle has two equal base angles of ${b}° each. What is the third angle (at the top)?`,
    answer: 180 - 2 * b,
    unit: "°",
    hints: ["The three angles add up to 180°.", `The two base angles are ${b}° + ${b}°.`, "Subtract the base angles from 180°."],
    steps: [S("Add the two base angles", "", M(`${b} + ${b} = ${2 * b}`)), S("Subtract from 180", "", M(`180 ${MINUS} ${2 * b} = ${180 - 2 * b}`))],
    skillTag: "g2d.tri.isosceles",
  });
};

const g2dQuads: Gen = (r, level) => {
  if (level === "beginner") {
    return bankQ(
      r,
      [
        { q: "Which quadrilateral has FOUR equal sides and FOUR right angles?", a: "Square", w: ["Rectangle", "Rhombus", "Kite"], hint: "Think about which shape needs both equal sides and 90° angles.", why: "A square has four equal sides and four right angles." },
        { q: "Which quadrilateral has opposite sides equal and parallel, and four right angles, but NOT all sides equal?", a: "Rectangle", w: ["Square", "Kite", "Trapezium"], hint: "Right angles, but the length and width are different.", why: "A rectangle has four right angles and opposite sides equal." },
        { q: "Which quadrilateral has all four sides equal but its angles are NOT all 90°?", a: "Rhombus", w: ["Square", "Rectangle", "Trapezium"], hint: "It looks like a square that has been pushed over.", why: "A rhombus has four equal sides, opposite angles equal, but no need for right angles." },
        { q: "Which quadrilateral has only ONE pair of parallel sides?", a: "Trapezium", w: ["Parallelogram", "Rhombus", "Rectangle"], hint: "The others all have TWO pairs of parallel sides.", why: "A trapezium has exactly one pair of parallel sides." },
        { q: "Which quadrilateral has two pairs of adjacent (neighbouring) sides equal, and diagonals that cross at right angles?", a: "Kite", w: ["Parallelogram", "Rectangle", "Trapezium"], hint: "It looks like a kite you fly.", why: "A kite has two pairs of equal adjacent sides and perpendicular diagonals." },
        { q: "Which quadrilateral has opposite sides parallel and equal, and opposite angles equal, but angles that are NOT necessarily 90°?", a: "Parallelogram", w: ["Kite", "Trapezium", "Square"], hint: "Two pairs of parallel sides but it can lean over.", why: "A parallelogram has opposite sides parallel and equal." },
      ],
      "g2d.quad.name"
    );
  }
  if (level === "intermediate") {
    const a = r.int(60, 110);
    const b = r.int(70, 110);
    const c = r.int(60, 100);
    const d = 360 - a - b - c;
    return numQ({
      prompt: `Three angles of a quadrilateral are ${a}°, ${b}° and ${c}°. What is the fourth angle?`,
      answer: d,
      unit: "°",
      hints: ["The angles in a quadrilateral add up to 360°.", `Add the three you know: ${a} + ${b} + ${c} = ${a + b + c}.`, "Subtract from 360°."],
      steps: [S("Remember the rule", "The angles in a quadrilateral add up to 360°."), S("Add the known angles", "", M(`${a} + ${b} + ${c} = ${a + b + c}`)), S("Subtract from 360", "", M(`360 ${MINUS} ${a + b + c} = ${d}`))],
      skillTag: "g2d.quad.angle",
    });
  }
  if (r.chance(0.5)) {
    const a = r.int(50, 130);
    const adj = r.chance(0.5);
    return numQ({
      prompt: adj ? `One angle of a parallelogram is ${a}°. What is the size of an ADJACENT (neighbouring) angle?` : `One angle of a parallelogram is ${a}°. What is the size of the OPPOSITE angle?`,
      answer: adj ? 180 - a : a,
      unit: "°",
      hints: [adj ? "Neighbouring angles in a parallelogram are co-interior angles between parallel lines." : "Opposite angles in a parallelogram are equal.", adj ? "They add up to 180°." : "The opposite angle is the same size.", adj ? `180 − ${a} = ?` : `It is ${a}°.`],
      steps: [S("Remember the property", adj ? "Adjacent angles of a parallelogram add up to 180°." : "Opposite angles of a parallelogram are equal."), S("Our answer", adj ? `180° − ${a}° = ${180 - a}°` : `${a}°`)],
      skillTag: "g2d.quad.parallelogram",
    });
  }
  const shape = r.pick([["rectangle", 2], ["square", 4], ["rhombus", 2], ["kite", 1], ["isosceles triangle", 1], ["equilateral triangle", 3]] as const);
  return numQ({
    prompt: `How many lines of symmetry does a ${shape[0]} have?`,
    answer: shape[1],
    hints: ["A line of symmetry cuts a shape into two halves that are mirror images.", "Imagine folding the shape along the line: both halves must match exactly.", `Draw a ${shape[0]} and try folding it in different directions (across, up-and-down and corner to corner). Count the folds that work.`],
    steps: [S("What is a line of symmetry?", "A line where the two halves are mirror images."), S("Count the lines", `A ${shape[0]} has ${shape[1]} line${shape[1] > 1 ? "s" : ""} of symmetry.`)],
    skillTag: "g2d.quad.symmetry",
  });
};

const g2dCongruent: Gen = (r, level) => {
  if (level === "beginner") {
    return bankQ(
      r,
      [
        { q: "Two shapes are CONGRUENT if they have…", a: "exactly the same shape AND the same size", w: ["the same shape but a different size", "the same size but a different shape", "the same colour"], hint: "Congruent shapes could be placed exactly on top of each other.", why: "Congruent shapes match exactly in shape and size." },
        { q: "Two shapes are SIMILAR if they have…", a: "the same shape (equal angles) but they may be different in size", w: ["exactly the same size", "different angles", "the same area"], hint: "A small photo and its big enlargement are similar.", why: "Similar shapes have equal angles and sides in the same proportion." },
        { q: "A photograph is enlarged on a photocopier. The original and the enlargement are…", a: "similar but not congruent", w: ["congruent", "neither similar nor congruent", "congruent and similar"], hint: "Is the size the same? Is the shape the same?", why: "The shape is the same but the size changed, so they are similar, not congruent." },
        { q: "Which of these changes does NOT give a congruent image?", a: "An enlargement by a factor of 2", w: ["A reflection", "A rotation", "A translation (slide)"], hint: "Which one changes the size?", why: "An enlargement changes the size, so the image is not congruent." },
      ],
      "g2d.cong.concept"
    );
  }
  if (level === "intermediate") {
    const pairs: [string, string][] = [["AB", "DE"], ["BC", "EF"], ["AC", "DF"]];
    const [p1, p2] = r.pick(pairs);
    const len = r.int(3, 15);
    return numQ({
      prompt: `Triangle ABC is congruent to triangle DEF (corresponding vertices in order: A↔D, B↔E, C↔F). ${p1} = ${len} cm. How long is ${p2}?`,
      answer: len,
      unit: "cm",
      hints: ["Congruent shapes are identical, so matching sides are equal.", `${p1} corresponds to ${p2}. (A↔D, B↔E, C↔F)`, "Matching sides have the same length."],
      steps: [S("Match the vertices", "A↔D, B↔E, C↔F."), S("Match the sides", `${p1} matches ${p2}.`), S("Our answer", `${p2} = ${len} cm.`)],
      skillTag: "g2d.cong.sides",
    });
  }
  const k = r.int(2, 4);
  const sides = r.pick([[3, 4, 5], [6, 8, 10], [5, 12, 13]] as const);
  const per = sides[0] + sides[1] + sides[2];
  return numQ({
    prompt: `A triangle has sides of ${sides.join(" cm, ")} cm. It is enlarged by a scale factor of ${k} to make a SIMILAR triangle. What is the perimeter of the new triangle?`,
    answer: per * k,
    unit: "cm",
    hints: ["Each side is multiplied by the scale factor.", `New sides: ${sides.map((s) => s * k).join(", ")} cm.`, "Perimeter is the sum of all three sides."],
    steps: [S("Multiply each side by " + k, "", M(sides.map((s) => `${s} × ${k} = ${s * k}`).join(";  "))), S("Add the new sides", "", M(`${sides.map((s) => s * k).join(" + ")} = ${per * k}`)), S("A shortcut", `The perimeter also gets multiplied by ${k}: ${per} × ${k} = ${per * k}.`)],
    skillTag: "g2d.cong.similar",
  });
};

const g2dConstruct: Gen = (r, level) => {
  if (level === "beginner") {
    return bankQ(
      r,
      [
        { q: "Which instrument do we use to draw a circle?", a: "A compass", w: ["A protractor", "A set square", "A ruler only"], hint: "It has a point and a pencil.", why: "A compass has a sharp point and a pencil to draw circles and arcs." },
        { q: "Which instrument do we use to measure and draw angles?", a: "A protractor", w: ["A compass", "A ruler", "A calculator"], hint: "It is usually a half-circle with degrees marked.", why: "A protractor measures angles in degrees." },
        { q: "What does it mean to BISECT an angle?", a: "Cut it into two equal angles", w: ["Make it bigger", "Make it a right angle", "Double the angle"], hint: "'Bi' means two, 'sect' means cut.", why: "Bisect = cut exactly in half, so both angles are equal." },
      ],
      "g2d.con.tools"
    );
  }
  if (level === "intermediate") {
    return bankQ(
      r,
      [
        { q: "When we construct the perpendicular bisector of a line segment with a compass, the compass opening must be…", a: "more than half the length of the segment", w: ["less than half the length of the segment", "exactly 1 cm", "it does not matter"], hint: "The two arcs must cross each other.", why: "If the opening is less than half, the arcs will not meet." },
        { q: "A perpendicular bisector cuts a line segment into two equal parts and meets it at what angle?", a: "90°", w: ["45°", "60°", "180°"], hint: "Perpendicular means 'at right angles'.", why: "Perpendicular means at 90°." },
        { q: "To construct a triangle when you know all three side lengths, you draw one side first and then use a compass to…", a: "draw arcs from each end with the other two side lengths", w: ["measure the angles with a ruler", "guess where the third corner is", "draw a circle around the whole triangle"], hint: "Each arc shows all the points the right distance away.", why: "Where the two arcs cross is the third vertex." },
      ],
      "g2d.con.steps"
    );
  }
  const sets = [
    { s: [2, 3, 6], ok: false },
    { s: [3, 4, 5], ok: true },
    { s: [4, 6, 9], ok: true },
    { s: [1, 2, 4], ok: false },
    { s: [5, 5, 5], ok: true },
    { s: [3, 3, 7], ok: false },
  ];
  const bad = r.pick(sets.filter((x) => !x.ok));
  const goods = r.shuffle(sets.filter((x) => x.ok)).slice(0, 3);
  const show = (s: number[]) => `${s.join(" cm, ")} cm`;
  return choiceQ(r, {
    prompt: "Which set of side lengths can NOT be used to construct a triangle?",
    correct: show(bad.s),
    wrongs: goods.map((g) => show(g.s)),
    hints: ["The two shorter sides must be able to 'reach' each other.", "Add the two SHORTER sides. The total must be MORE than the longest side.", `For ${show(bad.s)}: ${bad.s[0]} + ${bad.s[1]} = ${bad.s[0] + bad.s[1]}. Is that more than ${bad.s[2]}?`],
    steps: [S("The triangle rule", "The sum of the two shorter sides must be bigger than the longest side."), S("Test each set", "", M(`${bad.s[0]} + ${bad.s[1]} = ${bad.s[0] + bad.s[1]}, which is NOT more than ${bad.s[2]}`)), S("Our answer", `${show(bad.s)} cannot make a triangle: the arcs would never meet.`)],
    skillTag: "g2d.con.inequality",
  });
};

// ---------- 3D objects ----------

const SOLIDS: Record<string, { f: number; e: number; v: number }> = {
  cube: { f: 6, e: 12, v: 8 },
  "rectangular prism": { f: 6, e: 12, v: 8 },
  "triangular prism": { f: 5, e: 9, v: 6 },
  "square pyramid": { f: 5, e: 8, v: 5 },
  "triangular pyramid": { f: 4, e: 6, v: 4 },
  "pentagonal prism": { f: 7, e: 15, v: 10 },
  "hexagonal prism": { f: 8, e: 18, v: 12 },
  "pentagonal pyramid": { f: 6, e: 10, v: 6 },
};

const g3dNames: Gen = (r, level) => {
  if (level === "beginner") {
    return bankQ(
      r,
      [
        { q: "Which 3D object has 6 faces that are all squares?", a: "Cube", w: ["Square pyramid", "Triangular prism", "Cylinder"], hint: "Think of a dice.", why: "A cube has 6 identical square faces." },
        { q: "Which 3D object has a circular base, a curved surface and one point (apex) at the top?", a: "Cone", w: ["Cylinder", "Sphere", "Square pyramid"], hint: "Think of an ice-cream cone.", why: "A cone has a circular base and a pointed top." },
        { q: "Which 3D object has two circular flat faces and one curved surface?", a: "Cylinder", w: ["Cone", "Sphere", "Cube"], hint: "Think of a tin of beans.", why: "A cylinder has two circular ends and a curved side." },
        { q: "Which 3D object has no flat faces at all and is perfectly round?", a: "Sphere", w: ["Cylinder", "Cone", "Cube"], hint: "Think of a soccer ball.", why: "A sphere has only one curved surface." },
        { q: "Which 3D object has a square base and four triangular faces that meet at one point?", a: "Square pyramid", w: ["Cube", "Triangular prism", "Cone"], hint: "Think of the pyramids of Egypt.", why: "A square pyramid has a square base and 4 triangular faces." },
        { q: "Which 3D object has two triangular faces and three rectangular faces?", a: "Triangular prism", w: ["Square pyramid", "Cube", "Cylinder"], hint: "Think of a tent or a Toblerone box.", why: "A triangular prism has 2 triangle ends and 3 rectangle sides." },
      ],
      "g3d.names"
    );
  }
  if (level === "intermediate") {
    const name = r.pick(Object.keys(SOLIDS));
    const prop = r.pick(["f", "e", "v"] as const);
    const word = { f: "faces", e: "edges", v: "vertices (corners)" }[prop];
    const s = SOLIDS[name];
    return numQ({
      prompt: `How many ${word} does a ${name} have?`,
      answer: s[prop],
      hints: ["A face is a flat surface. An edge is where two faces meet. A vertex is a corner.", "Picture the solid (or a model of it) and count carefully, one by one.", `Check with Euler's rule: faces + vertices − edges = 2.`],
      steps: [S("Remember the words", "Faces are flat surfaces, edges are lines where faces meet, and vertices are corners."), S("Count", `A ${name} has ${s.f} faces, ${s.e} edges and ${s.v} vertices.`), S("Check", `${s.f} + ${s.v} − ${s.e} = 2 ✓`)],
      skillTag: "g3d.count",
    });
  }
  if (r.chance(0.5)) {
    const n = r.int(3, 8);
    const faces = n + 2;
    return numQ({
      prompt: `A prism has ${faces} faces altogether. How many sides does its base have?`,
      answer: n,
      hints: ["A prism has 2 end faces (the bases) and one rectangle face for each side of the base.", `${faces} faces − 2 end faces = ?`, "The rectangles tell us how many sides the base has."],
      steps: [S("Take away the two bases", "", M(`${faces} ${MINUS} 2 = ${n}`)), S("Each remaining face is a rectangle", `One rectangle for each side of the base, so the base has ${n} sides.`)],
      skillTag: "g3d.prismFaces",
    });
  }
  const f = r.int(5, 12);
  const v = r.int(6, 14);
  return numQ({
    prompt: `A solid has ${f} faces and ${v} vertices. Use Euler's rule (faces + vertices − edges = 2) to find the number of edges.`,
    answer: f + v - 2,
    hints: ["Put the numbers into the rule: faces + vertices − edges = 2.", `${f} + ${v} − edges = 2`, "Add the faces and vertices, then take away 2."],
    steps: [S("Write the rule", "", M(`F + V ${MINUS} E = 2`)), S("Substitute", "", M(`${f} + ${v} ${MINUS} E = 2`)), S("Solve", `${f + v} − E = 2, so E = ${f + v} − 2 = ${f + v - 2}.`)],
    skillTag: "g3d.euler",
  });
};

const g3dNets: Gen = (r, level) => {
  const bank: Record<string, BankItem[]> = {
    beginner: [
      { q: "What do we call a flat pattern that can be folded to make a 3D object?", a: "A net", w: ["A graph", "A grid", "A frame"], hint: "It's like a 'cut-out' pattern.", why: "A net is a flat 2D pattern that folds into a 3D object." },
      { q: "How many squares are in a net of a cube?", a: "6", w: ["4", "5", "8"], hint: "A cube has 6 faces.", why: "A cube has 6 faces, so its net has 6 squares." },
      { q: "A net of a rectangular prism (like a cereal box) is made of how many rectangles?", a: "6", w: ["4", "5", "3"], hint: "It has 6 faces.", why: "A rectangular prism has 6 rectangular faces." },
    ],
    intermediate: [
      { q: "Which faces are in a net of a triangular prism?", a: "2 triangles and 3 rectangles", w: ["3 triangles and 2 rectangles", "4 triangles and 1 square", "5 rectangles"], hint: "Picture the prism: two triangle ends and three rectangle sides.", why: "A triangular prism has 2 triangular ends and 3 rectangular sides." },
      { q: "Which faces are in a net of a square pyramid?", a: "1 square and 4 triangles", w: ["4 squares and 1 triangle", "2 squares and 3 triangles", "5 triangles"], hint: "It has a square base and triangle sides.", why: "A square pyramid has a square base and 4 triangular faces." },
      { q: "Which shapes make up a net of a cylinder?", a: "2 circles and 1 rectangle", w: ["1 circle and 2 rectangles", "3 circles", "2 squares and 1 circle"], hint: "The curved side unrolls into a flat shape.", why: "The curved side unrolls into a rectangle, plus a circle for each end." },
    ],
    advanced: [
      { q: "The curved surface of a cylinder unrolls into a rectangle. One side of this rectangle is as long as…", a: "the circumference of the circle", w: ["the radius of the circle", "the area of the circle", "the diameter of the circle"], hint: "The rectangle wraps once around the circle.", why: "It wraps around the circle once, so that side equals the circumference." },
      { q: "A net of a pentagonal prism has how many faces?", a: "7", w: ["5", "6", "10"], hint: "2 pentagon ends plus one rectangle for each side of the pentagon.", why: "2 + 5 = 7 faces." },
      { q: "A net of a triangular pyramid (tetrahedron) is made of…", a: "4 triangles", w: ["3 triangles and 1 square", "4 squares", "6 triangles"], hint: "A triangular pyramid has a triangle base and triangle sides.", why: "All 4 faces are triangles." },
    ],
  };
  return bankQ(r, bank[level], "g3d.nets");
};

export const genGeometry: Record<string, Gen> = {
  "gr-plane": grPlane,
  "gr-linear": grLinear,
  "gr-interpret": grInterpret,
  "gsl-angles": gslAngles,
  "gsl-lines": gslLines,
  "gsl-parallel": gslParallel,
  "g2d-triangles": g2dTriangles,
  "g2d-quads": g2dQuads,
  "g2d-congruent": g2dCongruent,
  "g2d-construct": g2dConstruct,
  "g3d-names": g3dNames,
  "g3d-nets": g3dNets,
};
