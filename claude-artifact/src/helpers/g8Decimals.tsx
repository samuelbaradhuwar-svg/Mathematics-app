import type { Topic } from "./curriculumTypes";

export const g8Decimals: Topic = {
  id: "decimal-fractions",
  name: "Decimal fractions",
  strand: "Numbers, Operations and Relationships",
  term: 1,
  order: 4,
  icon: "Dot",
  summary: "Numbers with a decimal comma: place value, rounding, ordering, and the four operations.",
  whatYouLearn: ["Place value of decimals and rounding", "Ordering and comparing decimals", "Adding and subtracting decimals, including money", "Multiplying and dividing decimals, including by 10, 100 and 1 000"],
  priorKnowledge: ["Place value of whole numbers", "Whole number calculations", "Fractions with denominators 10 and 100"],
  prerequisites: ["whole-numbers"],
  videoQueries: ["Grade 8 mathematics decimal fractions CAPS South Africa", "Grade 8 maths multiplying dividing decimals South Africa"],
  assessmentNote: "Tests usually include rounding, ordering decimals, calculations with decimals and money problems.",
  placement: { source: "secondary-sources", note: "Decimal fractions is a Term 1 topic in the DBE-linked Grade 8 navigation pack." },
  subtopics: [
    {
      id: "dec-place",
      name: "Place value, rounding and ordering",
      objectives: ["I can say the value of each digit in a decimal.", "I can round a decimal to 1 or 2 decimal places.", "I can put decimals in order."],
      priorKnowledge: ["Place value of whole numbers"],
      prerequisites: [],
      generator: "dec-place",
      realWorld: "Prices (R12,95), race times and measurements all use decimals.",
      terms: [
        { word: "Decimal comma", meaning: "The comma that separates whole numbers from parts of a whole. In South Africa we write 3,5." },
        { word: "Tenths, hundredths, thousandths", meaning: "The 1st, 2nd and 3rd places after the decimal comma." },
        { word: "Round", meaning: "Change a number to a simpler one that is close to it." },
      ],
      rules: ["Each place to the right is 10 times smaller.", "Rounding: look at the NEXT digit. 5 or more → round up. 4 or less → stay the same.", "To compare decimals, write them with the same number of decimal places."],
      explain: [
        { heading: "Places after the comma", body: "The first place after the comma is tenths. The second is hundredths. The third is thousandths. Each place is 10 times smaller than the one before it.", example: "$4,372$:  4 ones,  3 tenths,  7 hundredths,  2 thousandths" },
        { heading: "Rounding", body: "To round, find the digit you are rounding to. Look at the NEXT digit. If it is 5 or more, round up. If it is 4 or less, leave the digit as it is.", example: "$3,4761$ to 2 decimal places: the next digit is 6, so round up → $3,48$" },
        { heading: "Ordering decimals", body: "A longer decimal is NOT always bigger. Add zeros so all the numbers have the same number of decimal places, then compare them like whole numbers.", example: "$0,5 = 0,500$   $0,45 = 0,450$   so   $0,5 > 0,45$" },
      ],
      altExplain: [
        { heading: "Money helps", body: "Think of R0,50 and R0,45. Fifty cents is more than forty-five cents. So 0,5 is more than 0,45, even though 45 looks bigger than 5. Writing 0,5 as 0,50 makes it clear." },
      ],
      workedExamples: [
        {
          title: "Round to 1 decimal place",
          problem: "Round $5,372$ to 1 decimal place.",
          steps: [
            { title: "Find the rounding place", say: "1 decimal place is the tenths digit: 3.", math: "$5,3|72$" },
            { title: "Look at the next digit", say: "The next digit is 7.", ask: { prompt: "What is the digit after the 3?", answer: "7" } },
            { title: "Decide", say: "7 is 5 or more, so we round the 3 UP to 4.", math: "$5,4$" },
          ],
          answer: "$5,4$",
        },
      ],
      mistakes: [
        { tag: "dec.longerIsBigger", mistake: "Thinking 0,45 is bigger than 0,5 because 45 is bigger than 5.", fix: "Write 0,5 as 0,50. Then compare 50 and 45." },
        { tag: "dec.roundDown", mistake: "Looking at the digit itself instead of the NEXT digit.", fix: "The next digit decides whether we round up or stay the same." },
      ],
    },
    {
      id: "dec-addsub",
      name: "Adding and subtracting decimals",
      objectives: ["I can add and subtract decimals by lining up the commas.", "I can solve money problems with decimals."],
      priorKnowledge: ["Adding and subtracting whole numbers", "Place value of decimals"],
      prerequisites: ["dec-place"],
      generator: "dec-addsub",
      realWorld: "Working out the total at a shop and how much change you get.",
      terms: [{ word: "Change", meaning: "The money you get back: the amount you paid minus the cost." }],
      rules: ["Line up the decimal commas under each other.", "Fill empty places with zeros.", "Put the comma in the answer straight under the other commas."],
      explain: [
        { heading: "Line up the commas", body: "Write the numbers under each other so the decimal commas are in one straight line. Then add or subtract from the right, just like whole numbers.", example: "$12,5 + 3,75$:  line up →  $12,50 + 3,75 = 16,25$" },
        { heading: "Fill empty places with zeros", body: "If one number has fewer decimal places, add zeros to make them the same. Adding a zero at the end does not change the value.", example: "$5 − 2,37$ →  $5,00 − 2,37 = 2,63$" },
        { heading: "Money problems", body: "In money, always have 2 decimal places (cents). Change = amount paid − total cost.", example: "Total R38,50. Paid R50. Change: $50,00 − 38,50 = 11,50$" },
      ],
      altExplain: [{ heading: "Think in cents", body: "R2,37 is 237 cents. Work with whole numbers of cents: 500 − 237 = 263 cents. That is R2,63." }],
      workedExamples: [
        {
          title: "Subtract with decimals",
          problem: "Calculate $8 − 3,45$",
          steps: [
            { title: "Add zeros", say: "8 is the same as 8,00.", math: "$8,00 − 3,45$" },
            { title: "Subtract like whole numbers", say: "800 − 345 = 455.", math: "$800 − 345 = 455$", ask: { prompt: "What is 800 − 345?", answer: "455" } },
            { title: "Put the comma back", say: "Two decimal places.", math: "$4,55$" },
          ],
          answer: "$4,55$",
        },
      ],
      mistakes: [{ tag: "dec.align", mistake: "Lining up the right-hand digits instead of the commas.", fix: "Always line up the DECIMAL COMMAS." }],
    },
    {
      id: "dec-muldiv",
      name: "Multiplying and dividing decimals",
      objectives: ["I can multiply and divide by 10, 100 and 1 000.", "I can multiply and divide a decimal by a whole number.", "I can multiply two decimals."],
      priorKnowledge: ["Multiplying and dividing whole numbers"],
      prerequisites: ["dec-place"],
      generator: "dec-muldiv",
      realWorld: "Finding the cost of 6 items at R2,40 each.",
      terms: [{ word: "Decimal place", meaning: "A digit after the decimal comma." }],
      rules: ["× 10, 100, 1 000: move the comma RIGHT.", "÷ 10, 100, 1 000: move the comma LEFT.", "Multiplying decimals: ignore the commas, multiply, then count the decimal places."],
      explain: [
        { heading: "Multiplying and dividing by 10, 100, 1 000", body: "Count the zeros. To multiply, move the comma that many places to the RIGHT. To divide, move it that many places to the LEFT.", example: "$3,4 × 100 = 340$     $3,4 ÷ 10 = 0,34$" },
        { heading: "Decimal × whole number", body: "Ignore the comma and multiply like whole numbers. Then put the comma back so the answer has the same number of decimal places as the question.", example: "$2,4 × 6$:  $24 × 6 = 144$ → $14,4$" },
        { heading: "Decimal × decimal", body: "Ignore both commas and multiply. Then count the decimal places in BOTH numbers together. Give the answer that many decimal places.", example: "$0,3 × 0,4$:  $3 × 4 = 12$,  2 decimal places → $0,12$" },
        { heading: "Dividing by a decimal", body: "Make the number you divide BY a whole number. Multiply both numbers by 10 or 100. The answer stays the same.", example: "$6 ÷ 0,2 = 60 ÷ 2 = 30$" },
      ],
      altExplain: [{ heading: "Think in fractions", body: "0,3 × 0,4 means three tenths of four tenths. 3/10 × 4/10 = 12/100 = 0,12. The answer has 2 decimal places because tenths × tenths = hundredths." }],
      workedExamples: [
        {
          title: "Multiply decimals",
          problem: "Calculate $0,6 × 0,5$",
          steps: [
            { title: "Ignore the commas", say: "Multiply 6 × 5.", math: "$6 × 5 = 30$", ask: { prompt: "What is 6 × 5?", answer: "30" } },
            { title: "Count the decimal places", say: "0,6 has 1 and 0,5 has 1. That is 2 altogether." },
            { title: "Place the comma", say: "30 with 2 decimal places is 0,30.", math: "$0,6 × 0,5 = 0,3$" },
          ],
          answer: "$0,3$",
        },
      ],
      mistakes: [{ tag: "dec.placeComma", mistake: "Putting the comma in the wrong place after multiplying.", fix: "Count the decimal places in the question. The answer needs that many." }],
    },
  ],
};