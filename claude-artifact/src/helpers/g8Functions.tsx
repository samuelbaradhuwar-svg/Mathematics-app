import type { Topic } from "./curriculumTypes";

export const g8Functions: Topic = {
  id: "functions-relationships",
  name: "Functions and relationships",
  strand: "Patterns, Functions and Algebra",
  term: 2,
  order: 8,
  icon: "Workflow",
  summary: "Input-output machines, tables and formulae that link one number to another.",
  whatYouLearn: ["Input-output rules and flow diagrams", "Completing tables of values", "Finding the rule from a table", "Using and writing formulae"],
  priorKnowledge: ["Number patterns", "Substituting numbers into an expression"],
  prerequisites: ["numeric-patterns"],
  videoQueries: ["Grade 8 mathematics functions and relationships CAPS South Africa", "Grade 8 maths input output flow diagrams tables South Africa"],
  assessmentNote: "Tests usually include completing tables, finding rules and using formulae in real situations.",
  placement: { source: "secondary-sources", note: "Functions and relationships follows patterns in Term 2." },
  subtopics: [
    {
      id: "func-tables",
      name: "Input-output rules and tables",
      objectives: ["I can use an input-output rule to complete a table.", "I can work backwards from the output to the input.", "I can find the rule from a table."],
      priorKnowledge: ["Multiplication and addition", "Opposite operations"],
      prerequisites: [],
      generator: "func-tables",
      realWorld: "A vending machine: put in a coin (input) and get a snack (output) by following a rule.",
      terms: [
        { word: "Input", meaning: "The number you put in." },
        { word: "Output", meaning: "The number that comes out after following the rule." },
        { word: "Rule", meaning: "The steps that turn the input into the output." },
      ],
      rules: ["Follow the rule step by step.", "To work backwards, use the opposite operations in reverse order."],
      explain: [
        { heading: "Number machines", body: "Imagine a machine. You put a number in (input). The machine follows a rule. A new number comes out (output).", example: "Rule: × 2 then + 1.   Input 3 → 3 × 2 = 6 → 6 + 1 = 7 → Output 7" },
        { heading: "Working backwards", body: "If you know the output, you can find the input. Use the OPPOSITE operations in REVERSE order.", example: "Output 7.  Opposite of +1 is −1: 6.  Opposite of ×2 is ÷2: 3.  Input = 3" },
        { heading: "Finding the rule from a table", body: "Look at how the output changes when the input goes up by 1. That tells you the number to multiply by. Then test one row to see what to add or subtract.", example: "x: 1, 2, 3  →  y: 5, 7, 9.  y goes up by 2, so 2x. Test: 2 × 1 = 2 but y = 5, so add 3:  y = 2x + 3" },
      ],
      altExplain: [{ heading: "Getting dressed", body: "Putting on socks then shoes is a rule. To go backwards you take off shoes FIRST, then socks. That is why we reverse the order of the steps when we work backwards." }],
      workedExamples: [
        {
          title: "Work backwards",
          problem: "Rule: output = 4 × input + 3. The output is 31. What was the input?",
          steps: [
            { title: "Undo the + 3", say: "Subtract 3 from the output.", math: "$31 − 3 = 28$", ask: { prompt: "What is 31 − 3?", answer: "28" } },
            { title: "Undo the × 4", say: "Divide by 4.", math: "$28 ÷ 4 = 7$" },
            { title: "Check", say: "4 × 7 + 3 = 31 ✓" },
          ],
          answer: "$7$",
        },
      ],
      mistakes: [{ tag: "func.wrongOrder", mistake: "Undoing the steps in the same order instead of the reverse order.", fix: "The last step done is the FIRST step to undo." }],
    },
    {
      id: "func-formula",
      name: "Formulae and real-life rules",
      objectives: ["I can substitute into a formula.", "I can write a formula for a real-life situation.", "I can find x when I know y."],
      priorKnowledge: ["Input-output rules", "Order of operations"],
      prerequisites: ["func-tables"],
      generator: "func-formula",
      realWorld: "A taxi charges a starting fee plus an amount per kilometre.",
      terms: [
        { word: "Formula", meaning: "A rule written with letters, like C = 20 + 5k." },
        { word: "Variable", meaning: "A letter that stands for a number that can change." },
        { word: "Substitute", meaning: "Replace a letter with a number." },
      ],
      rules: ["Replace the letter with the number (use brackets for negatives).", "Follow BODMAS: multiply before you add."],
      explain: [
        { heading: "A formula is a rule with letters", body: "A taxi costs R20 to start plus R5 for every kilometre. We can write this as a formula: C = 20 + 5k. C is the cost and k is the number of kilometres.", example: "$C = 20 + 5k$" },
        { heading: "Substituting", body: "To use the formula, replace the letter with the number you are told. Then follow BODMAS: multiply first, then add.", example: "k = 6:  $C = 20 + 5 × 6 = 20 + 30 = 50$" },
        { heading: "Writing your own formula", body: "Ask: what part of the cost NEVER changes? What part changes with each unit? Put them together.", example: "Fee R15 to enter plus R8 per hour:  $C = 15 + 8h$" },
      ],
      altExplain: [{ heading: "Table first", body: "Make a small table for 1, 2 and 3 hours: R23, R31, R39. The cost goes up by 8 each time, so the formula has 8h. The starting cost is 15. So C = 15 + 8h." }],
      workedExamples: [
        {
          title: "Using a formula",
          problem: "Use $y = 3x − 2$ to find y when $x = 5$.",
          steps: [
            { title: "Substitute", say: "Replace x with 5.", math: "$y = 3 × 5 − 2$" },
            { title: "Multiply first", say: "3 × 5 = 15.", math: "$y = 15 − 2$", ask: { prompt: "What is 3 × 5?", answer: "15" } },
            { title: "Subtract", say: "15 − 2 = 13.", math: "$y = 13$" },
          ],
          answer: "$13$",
        },
      ],
      mistakes: [{ tag: "func.formula.addFirst", mistake: "Adding before multiplying (20 + 5 × 6 = 150).", fix: "Multiply FIRST (BODMAS): 5 × 6 = 30, then add 20." }],
    },
  ],
};