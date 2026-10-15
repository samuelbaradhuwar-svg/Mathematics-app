import type { Topic } from "./curriculumTypes";

export const g8Patterns: Topic = {
  id: "numeric-patterns",
  name: "Numeric patterns",
  strand: "Patterns, Functions and Algebra",
  term: 2,
  order: 7,
  icon: "Sparkles",
  summary: "Finding the rule in a number pattern and using it to find any term.",
  whatYouLearn: ["Spotting the rule in a number pattern", "Continuing and completing patterns", "Writing a rule for the nth term"],
  priorKnowledge: ["Addition, subtraction, multiplication and division", "Substituting a number into an expression"],
  prerequisites: ["whole-numbers"],
  videoQueries: ["Grade 8 mathematics numeric patterns CAPS South Africa", "Grade 8 maths number patterns nth term South Africa"],
  assessmentNote: "Tests usually include continuing patterns, finding rules and using a rule such as Tₙ = 3n + 2.",
  placement: { source: "secondary-sources", note: "Numeric and geometric patterns follow exponents in the CAPS workbook tracker (Term 2)." },
  subtopics: [
    {
      id: "pat-sequences",
      name: "Spotting and continuing patterns",
      objectives: ["I can find the rule that joins one number to the next.", "I can continue a pattern and find missing terms."],
      priorKnowledge: ["Adding, subtracting, multiplying"],
      prerequisites: [],
      generator: "pat-sequences",
      realWorld: "Seats in a stadium, steps on a staircase and savings that grow by the same amount each month.",
      terms: [
        { word: "Sequence / pattern", meaning: "A list of numbers that follows a rule." },
        { word: "Term", meaning: "One number in the pattern." },
        { word: "Constant difference", meaning: "The same amount is added (or subtracted) each time." },
      ],
      rules: ["Find the difference between neighbouring terms.", "If the difference is always the same, the rule is add (or subtract) that number.", "If the numbers are multiplied by the same amount each time, the pattern is geometric."],
      explain: [
        { heading: "Look at the gaps", body: "To find the rule, look at how much the numbers change from one to the next. Subtract each number from the one after it.", example: "$3;  7;  11;  15;  ...$  the gaps are all 4" },
        { heading: "Continue the pattern", body: "Once you know the rule, use it on the last number to find the next one.", example: "$15 + 4 = 19$" },
        { heading: "Patterns that multiply", body: "Sometimes the gaps are NOT the same. Check if each number is multiplied by the same amount.", example: "$2;  6;  18;  54$  (× 3 each time)" },
      ],
      altExplain: [{ heading: "A staircase", body: "Each step of the staircase is the same height. If each step goes up by 4 cm: 4, 8, 12, 16... You always add the same amount to go to the next step." }],
      workedExamples: [
        {
          title: "Find the 10th term",
          problem: "The pattern is $5;  8;  11;  14;  ...$ What is the 10th term?",
          steps: [
            { title: "Find the rule", say: "8 − 5 = 3. We add 3 each time.", math: "$+3$", ask: { prompt: "What is 8 − 5?", answer: "3" } },
            { title: "How many times do we add?", say: "To reach the 10th term from the 1st we add 3 nine times.", math: "$5 + 9 × 3$" },
            { title: "Calculate", say: "9 × 3 = 27 and 5 + 27 = 32.", math: "$32$" },
          ],
          answer: "$32$",
        },
      ],
      mistakes: [{ tag: "pat.offByOne", mistake: "Adding the rule 10 times to find the 10th term.", fix: "The first term is already there. For the 10th term we add the difference 9 times." }],
    },
    {
      id: "pat-rules",
      name: "Rules for the nth term",
      objectives: ["I can describe a pattern in words.", "I can use a rule like Tₙ = 3n + 1 to find any term.", "I can find the rule of a pattern."],
      priorKnowledge: ["Finding the rule of a pattern", "Substituting"],
      prerequisites: ["pat-sequences"],
      generator: "pat-rules",
      realWorld: "A rule helps you find the 100th term without writing out 99 others.",
      terms: [
        { word: "nth term (Tₙ)", meaning: "The term in position n. n is the position number: 1st, 2nd, 3rd..." },
        { word: "General rule", meaning: "A formula that gives any term of the pattern from its position." },
      ],
      rules: ["The number in front of n is the constant difference.", "To find the rule: difference × n, then adjust to match the first term."],
      explain: [
        { heading: "Position and term", body: "Every number in a pattern has a position (1st, 2nd, 3rd...). We call the position n. A rule like Tₙ = 3n + 1 tells us how to get the term from its position.", example: "$T_n = 3n + 1$" },
        { heading: "Using a rule", body: "To find the 5th term, replace n with 5. Multiply first, then add.", example: "$T_5 = 3 × 5 + 1 = 16$" },
        { heading: "Finding a rule", body: "Step 1: find the constant difference. That is the number in front of n. Step 2: test the first term to see what you must add or subtract.", example: "$5;  8;  11;  14$:  difference 3, so $3n$.  $3 × 1 = 3$ but term 1 is 5, so add 2:  $T_n = 3n + 2$" },
      ],
      altExplain: [{ heading: "Table of values", body: "Make a table: n = 1, 2, 3, 4 and the terms below. The terms go up by 3 each time, so the rule contains 3n. Compare 3n (3, 6, 9, 12) with the terms (5, 8, 11, 14): each term is 2 more. So Tₙ = 3n + 2." }],
      workedExamples: [
        {
          title: "Find the rule",
          problem: "Find the rule for $4;  7;  10;  13;  ...$",
          steps: [
            { title: "Constant difference", say: "7 − 4 = 3.", math: "$3n$", ask: { prompt: "What is 7 − 4?", answer: "3" } },
            { title: "Test term 1", say: "3 × 1 = 3 but the first term is 4. We must add 1.", math: "$4 − 3 = 1$" },
            { title: "Write the rule", say: "", math: "$T_n = 3n + 1$" },
            { title: "Check term 2", say: "3 × 2 + 1 = 7 ✓" },
          ],
          answer: "$T_n = 3n + 1$",
        },
      ],
      mistakes: [{ tag: "pat.rules.forgotAdjust", mistake: "Stopping at 3n without checking the first term.", fix: "Always test the first term to see what to add or subtract." }],
    },
  ],
};