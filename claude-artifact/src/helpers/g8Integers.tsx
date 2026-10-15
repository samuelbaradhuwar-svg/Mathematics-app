import type { Topic } from "./curriculumTypes";

export const g8Integers: Topic = {
  id: "integers",
  name: "Integers",
  strand: "Numbers, Operations and Relationships",
  term: 1,
  order: 2,
  icon: "PlusMinus",
  summary: "Positive and negative whole numbers: ordering them, adding, subtracting, multiplying and dividing.",
  whatYouLearn: [
    "What integers are and how to order them on a number line",
    "Adding and subtracting integers",
    "Multiplying and dividing integers using the sign rules",
    "Calculations with several operations and brackets",
  ],
  priorKnowledge: ["Whole number calculations", "A number line"],
  prerequisites: ["whole-numbers"],
  videoQueries: ["Grade 8 mathematics integers CAPS South Africa", "Grade 8 maths adding and subtracting integers number line South Africa", "Grade 8 maths multiplying dividing integers South Africa"],
  assessmentNote: "Tests usually include ordering integers, add/subtract with double signs, multiply/divide with sign rules and BODMAS with integers.",
  placement: { source: "secondary-sources", note: "Integers is a Term 1 topic in the DBE-linked Grade 8 navigation pack." },
  subtopics: [
    {
      id: "int-order",
      name: "What are integers? Ordering them",
      objectives: ["I can explain what an integer is.", "I can put integers in order on a number line.", "I can find the opposite and absolute value of an integer."],
      priorKnowledge: ["A number line for whole numbers"],
      prerequisites: [],
      generator: "int-order",
      realWorld: "Temperatures below zero, going into debt, and floors underground in a parking garage.",
      terms: [
        { word: "Integer", meaning: "A whole number that can be positive, negative or zero (...−3, −2, −1, 0, 1, 2, 3...)." },
        { word: "Opposite", meaning: "The number the same distance from 0 on the other side. The opposite of 5 is −5." },
        { word: "Absolute value", meaning: "How far a number is from 0. It is never negative. |−7| = 7." },
      ],
      rules: ["Numbers on the right of the number line are bigger.", "Of two negative numbers, the one closer to 0 is bigger: −2 > −9.", "A number and its opposite add up to 0."],
      explain: [
        { heading: "Numbers below zero", body: "Sometimes numbers go BELOW zero. A freezing day might be −3°C. We call positive and negative whole numbers, and zero, **integers**.", example: "$... −3; −2; −1; 0; 1; 2; 3; ...$", visual: { type: "numberline", min: -6, max: 6, marks: [-3, 0, 4] } },
        { heading: "Bigger and smaller", body: "On the number line, numbers get BIGGER as you move RIGHT and SMALLER as you move LEFT. So −2 is bigger than −9, because −2 is further to the right.", example: "$−9 < −2 < 0 < 5$" },
        { heading: "Opposites and distance from zero", body: "Every integer has an opposite on the other side of zero. The opposite of 4 is −4. The absolute value of a number is just its distance from 0, so it is never negative.", example: "$|−7| = 7$   $|7| = 7$" },
      ],
      altExplain: [
        { heading: "A lift in a building", body: "Think of a lift. Ground floor is 0. Floors above are positive: 1, 2, 3. Basement floors are negative: −1, −2, −3. Floor −1 is higher than floor −3. So −1 > −3." },
      ],
      workedExamples: [
        {
          title: "Put in order",
          problem: "Write from smallest to biggest: $4; −6; 0; −2$",
          steps: [
            { title: "Negatives are smallest", say: "−6 and −2 are negative so they come first.", math: "$−6; −2; ...$" },
            { title: "Order the negatives", say: "−6 is further left than −2, so −6 is smaller.", math: "$−6 < −2$" },
            { title: "Then zero, then the positives", say: "0 comes next, then 4.", math: "$−6; −2; 0; 4$" },
          ],
          answer: "$−6; −2; 0; 4$",
        },
      ],
      mistakes: [
        { tag: "int.ignoreSign", mistake: "Thinking −9 is bigger than −2 because 9 is bigger than 2.", fix: "Use the number line. −9 is further LEFT, so it is smaller." },
      ],
    },
    {
      id: "int-addsub",
      name: "Adding and subtracting integers",
      objectives: ["I can add integers using a number line.", "I can subtract integers by changing to adding the opposite.", "I can work out a chain of integer additions and subtractions."],
      priorKnowledge: ["Ordering integers"],
      prerequisites: ["int-order"],
      generator: "int-addsub",
      realWorld: "Temperature changes, a bank balance going up and down, scoring points and losing points in a game.",
      terms: [
        { word: "Double sign", meaning: "Two signs next to each other, like + − or − −. We simplify them before calculating." },
      ],
      rules: ["Adding a positive: move RIGHT.", "Adding a negative: move LEFT.", "Subtracting a number is the same as adding its opposite.", "− (−5) becomes + 5."],
      explain: [
        { heading: "Adding on the number line", body: "Start at the first number. To add a POSITIVE number, move to the RIGHT. To add a NEGATIVE number, move to the LEFT.", example: "$−2 + 5 = 3$    $3 + (−5) = −2$", visual: { type: "numberline", min: -6, max: 6, marks: [-2, 3], jumps: [{ from: -2, to: 3, label: "+5" }] } },
        { heading: "Subtracting means adding the opposite", body: "Subtracting a number is the same as adding its opposite. So 5 − 3 is the same as 5 + (−3). Use this idea to simplify.", example: "$5 − 3 = 5 + (−3) = 2$" },
        { heading: "Subtracting a negative", body: "Two minus signs next to each other make a plus. Subtracting a negative is the same as ADDING the positive.", example: "$4 − (−3) = 4 + 3 = 7$" },
      ],
      altExplain: [
        { heading: "Money story", body: "Think of money. A positive number is money you HAVE. A negative number is a DEBT (money you owe). If you have R4 and someone TAKES AWAY a debt of R3, you are better off by R3. So 4 − (−3) = 7." },
        { heading: "Walking along a line", body: "Face right for positive. A minus sign says 'turn around'. A plus-minus pair tells you where to walk: minus a negative means turn around TWICE, so you face right again and walk forward." },
      ],
      workedExamples: [
        {
          title: "Subtracting a negative",
          problem: "Calculate $−3 − (−8)$",
          steps: [
            { title: "Spot the double sign", say: "There is a minus followed by a negative sign.", math: "$−3 − (−8)$" },
            { title: "Change it to adding", say: "Subtracting a negative is the same as adding a positive.", math: "$−3 + 8$", why: "Two minuses make a plus." },
            { title: "Number line", say: "Start at −3 and move 8 to the right.", math: "$−3 + 8 = 5$", ask: { prompt: "What is −3 + 8?", answer: "5" } },
          ],
          answer: "$5$",
        },
      ],
      mistakes: [
        { tag: "int.ignoreSigns", mistake: "Ignoring the signs and just adding the numbers.", fix: "The signs tell you which way to move on the number line." },
        { tag: "int.subNegative", mistake: "Treating '− (−3)' as '− 3'.", fix: "Subtracting a negative means adding the positive: − (−3) = + 3." },
      ],
    },
    {
      id: "int-muldiv",
      name: "Multiplying and dividing integers",
      objectives: ["I can multiply and divide integers using the sign rules.", "I can work out expressions with brackets and mixed operations."],
      priorKnowledge: ["Times tables", "Adding and subtracting integers"],
      prerequisites: ["int-addsub"],
      generator: "int-muldiv",
      realWorld: "Losing R5 a day for 3 days is 3 × (−5) = −15.",
      terms: [{ word: "Sign rule", meaning: "The rule that tells us if the answer is positive or negative." }],
      rules: ["Same signs → positive answer.", "Different signs → negative answer.", "Multiply or divide the numbers first, then decide the sign."],
      explain: [
        { heading: "Multiply the numbers first", body: "Ignore the signs for a moment. Multiply or divide the numbers like normal. Then decide whether the answer is positive or negative.", example: "$3 × 4 = 12$ (numbers only)" },
        { heading: "Different signs: negative answer", body: "If ONE number is negative and one is positive, the answer is NEGATIVE.", example: "$(−3) × 4 = −12$    $12 ÷ (−4) = −3$" },
        { heading: "Same signs: positive answer", body: "If BOTH numbers are negative, or both are positive, the answer is POSITIVE.", example: "$(−3) × (−4) = 12$    $(−12) ÷ (−4) = 3$" },
      ],
      altExplain: [
        { heading: "Pattern that proves it", body: "Look at this pattern: 3 × (−2) = −6, 2 × (−2) = −4, 1 × (−2) = −2, 0 × (−2) = 0. The answers go UP by 2 each time. So the next must be (−1) × (−2) = +2. A negative times a negative is a positive!", example: "$3×(−2)=−6;  2×(−2)=−4;  1×(−2)=−2;  0×(−2)=0;  (−1)×(−2)=2$" },
      ],
      workedExamples: [
        {
          title: "Mixed calculation",
          problem: "Calculate $(−2) × (4 − 7) + (−12) ÷ 4$",
          steps: [
            { title: "Brackets first", say: "4 − 7 = −3.", math: "$(−2) × (−3) + (−12) ÷ 4$", ask: { prompt: "What is 4 − 7?", answer: "-3" } },
            { title: "Multiply", say: "Same signs, so the answer is positive: 2 × 3 = 6.", math: "$6 + (−12) ÷ 4$" },
            { title: "Divide", say: "Different signs, so the answer is negative: 12 ÷ 4 = 3, so −3.", math: "$6 + (−3)$" },
            { title: "Add", say: "6 + (−3) = 3.", math: "$3$" },
          ],
          answer: "$3$",
        },
      ],
      mistakes: [
        { tag: "int.signRule", mistake: "Getting the sign wrong (for example (−3) × (−4) = −12).", fix: "Say it aloud: same signs → positive. Different signs → negative." },
      ],
    },
  ],
};