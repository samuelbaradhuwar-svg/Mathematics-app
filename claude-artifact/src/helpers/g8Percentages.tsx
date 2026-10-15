import type { Topic } from "./curriculumTypes";

export const g8Percentages: Topic = {
  id: "percentages",
  name: "Percentages",
  strand: "Numbers, Operations and Relationships",
  term: 1,
  order: 5,
  icon: "Percent",
  summary: "Finding a percentage of an amount, percentage increase and decrease (discount and VAT), and expressing one amount as a percentage of another.",
  whatYouLearn: ["Calculating a percentage of an amount", "Discount, VAT (15%) and percentage increase", "Writing one quantity as a percentage of another", "Profit and loss as a percentage"],
  priorKnowledge: ["Fractions and decimals", "Multiplying and dividing decimals", "Changing between fractions, decimals and percentages"],
  prerequisites: ["common-fractions", "decimal-fractions"],
  videoQueries: ["Grade 8 mathematics percentages CAPS South Africa", "Grade 8 maths VAT discount percentage increase South Africa"],
  assessmentNote: "Tests usually include percentage of an amount, discount and VAT problems, and expressing as a percentage.",
  placement: { source: "secondary-sources", note: "Percentages is placed in Term 1 alongside fractions and decimals in teacher planners. Financial applications (discount, VAT, profit) are grouped here for learning, although CAPS lists some of them as financial maths. Check against your school's plan." },
  subtopics: [
    {
      id: "pct-of",
      name: "Percentage of an amount",
      objectives: ["I can find a percentage of an amount.", "I can find the whole when I know a percentage of it."],
      priorKnowledge: ["Percentage as a fraction out of 100"],
      prerequisites: ["frac-forms"],
      generator: "pct-of",
      realWorld: "Finding 15% of a restaurant bill for a tip.",
      terms: [{ word: "Per cent (%)", meaning: "Out of 100." }],
      rules: ["Find 1% by dividing by 100, then multiply by the percentage.", "50% = half, 25% = a quarter, 10% = a tenth."],
      explain: [
        { heading: "Easy percentages", body: "Some percentages are friendly fractions: 50% is half, 25% is a quarter, 10% is a tenth. Use these first.", example: "$25\\%$ of $80 = 80 ÷ 4 = 20$" },
        { heading: "Any percentage: find 1% first", body: "Divide the amount by 100 to get 1%. Then multiply by the percentage you want.", example: "$15\\%$ of $200$:  1% = 2,  so 15% = 2 × 15 = 30" },
        { heading: "Finding the whole", body: "If you know a percentage of a number, find 1% by dividing, then multiply by 100 to get the whole.", example: "20% of a number is 30.  1% = 30 ÷ 20 = 1,5.  100% = 150." },
      ],
      altExplain: [{ heading: "Build it from 10%", body: "10% is easy (divide by 10). 5% is half of 10%. So 15% = 10% + 5%. For R200: 10% = 20, 5% = 10, so 15% = 30." }],
      workedExamples: [
        {
          title: "35% of 240",
          problem: "Calculate 35% of 240.",
          steps: [
            { title: "Find 1%", say: "Divide by 100.", math: "$240 ÷ 100 = 2,4$", ask: { prompt: "What is 240 ÷ 100?", answer: "2.4" } },
            { title: "Multiply by 35", say: "35% is 35 lots of 1%.", math: "$2,4 × 35 = 84$" },
          ],
          answer: "$84$",
        },
      ],
      mistakes: [{ tag: "pct.dividedWrong", mistake: "Dividing by the percentage instead of finding a fraction out of 100.", fix: "35% means 35 out of 100: find 1% by dividing by 100, then multiply by 35." }],
    },
    {
      id: "pct-change",
      name: "Discount, VAT and percentage increase",
      objectives: ["I can calculate a discount and the sale price.", "I can add VAT (15%) to a price.", "I can find the price before VAT."],
      priorKnowledge: ["Finding a percentage of an amount"],
      prerequisites: ["pct-of"],
      generator: "pct-change",
      realWorld: "Shops in South Africa add 15% VAT to the price of most items.",
      terms: [
        { word: "Discount", meaning: "An amount taken off the price." },
        { word: "VAT", meaning: "Value-added tax. In South Africa it is 15% added to most prices." },
        { word: "Increase", meaning: "When an amount becomes bigger." },
      ],
      rules: ["Sale price = original price − discount.", "Price including VAT = price + 15% of the price.", "Price including VAT is 115% of the price before VAT."],
      explain: [
        { heading: "Discount", body: "A discount is taken OFF the price. First find the discount amount (the percentage of the price). Then subtract it.", example: "R200 with 10% off: discount = R20, new price = $200 − 20 = 180$" },
        { heading: "VAT", body: "VAT is added ON TOP of the price. Find 15% of the price, then add it.", example: "R100 + 15% VAT: VAT = R15, total = $100 + 15 = 115$" },
        { heading: "Going backwards", body: "If the price includes VAT, it is 115% of the original. Divide by 115 to find 1%, then multiply by 100 to get the original price.", example: "R230 incl. VAT:  $230 ÷ 115 = 2$,  $2 × 100 = 200$" },
      ],
      altExplain: [{ heading: "Multiplier shortcut", body: "Adding 15% means you now have 115% of the price, which is 1,15 × the price. Taking 10% off means you pay 90%, which is 0,9 × the price." }],
      workedExamples: [
        {
          title: "Price before VAT",
          problem: "A phone costs R460 including 15% VAT. What was the price before VAT?",
          steps: [
            { title: "Understand 115%", say: "The price with VAT is 115% of the original price." },
            { title: "Find 1%", say: "Divide R460 by 115.", math: "$460 ÷ 115 = 4$", ask: { prompt: "What is 460 ÷ 115?", answer: "4" } },
            { title: "Find 100%", say: "Multiply by 100.", math: "$4 × 100 = 400$" },
          ],
          answer: "$R400$",
        },
      ],
      mistakes: [{ tag: "pct.subtractVat", mistake: "Taking 15% off the VAT-inclusive price to get the original.", fix: "The 15% was worked out on the SMALLER original price. Divide by 115 and multiply by 100." }],
    },
    {
      id: "pct-express",
      name: "One amount as a percentage of another",
      objectives: ["I can write one amount as a percentage of another.", "I can calculate percentage profit."],
      priorKnowledge: ["Fractions to percentages"],
      prerequisites: ["frac-forms"],
      generator: "pct-express",
      realWorld: "A test mark of 34 out of 40 is 85%.",
      terms: [
        { word: "Profit", meaning: "Money made: selling price − cost price." },
        { word: "Loss", meaning: "Money lost: cost price − selling price." },
      ],
      rules: ["Percentage = part ÷ whole × 100.", "Percentage profit = profit ÷ cost price × 100."],
      explain: [
        { heading: "Part out of whole", body: "Write the amounts as a fraction: part over whole. Then change it to a percentage by multiplying by 100.", example: "${34/40}$ → $34 ÷ 40 = 0,85$ → $85\\%$" },
        { heading: "Profit as a percentage", body: "First find the profit (selling price − cost price). Compare the profit to the COST price, not the selling price.", example: "Bought R80, sold R100. Profit R20. $20 ÷ 80 = 0,25 = 25\\%$" },
      ],
      altExplain: [{ heading: "Make the whole 100", body: "If the whole is 20, multiply by 5 to make it 100. 12 out of 20 becomes 60 out of 100 = 60%." }],
      workedExamples: [
        {
          title: "Mark as a percentage",
          problem: "Judah scored 18 out of 24. Write this as a percentage.",
          steps: [
            { title: "Write as a fraction", say: "part ÷ whole", math: "$18 ÷ 24$" },
            { title: "Divide", say: "18 ÷ 24 = 0,75.", math: "$0,75$", ask: { prompt: "What is 18 ÷ 24?", answer: "0.75" } },
            { title: "Times 100", say: "0,75 × 100 = 75.", math: "$75\\%$" },
          ],
          answer: "$75\\%$",
        },
      ],
      mistakes: [{ tag: "pct.wrongBase", mistake: "Using the selling price instead of the cost price for profit percentage.", fix: "Percentage profit compares profit with what was PAID (cost price)." }],
    },
  ],
};