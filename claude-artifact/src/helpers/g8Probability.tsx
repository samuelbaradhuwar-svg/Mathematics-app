import type { Topic } from "./curriculumTypes";

export const g8Probability: Topic = {
  id: "probability",
  name: "Probability",
  strand: "Data Handling",
  term: 4,
  order: 20,
  icon: "Dices",
  summary: "How likely something is to happen: outcomes, probability as a fraction, and relative frequency.",
  whatYouLearn: ["Outcomes and sample spaces", "Calculating probability", "Relative frequency from experiments and expected results"],
  priorKnowledge: ["Fractions and simplifying", "Percentages", "Multiplication"],
  prerequisites: ["common-fractions", "percentages"],
  videoQueries: ["Grade 8 mathematics probability CAPS South Africa", "Grade 8 maths relative frequency theoretical probability South Africa"],
  assessmentNote: "Tests usually include listing outcomes, probability as fractions/decimals/percentages and relative frequency.",
  placement: { source: "secondary-sources", note: "Probability is taught in Term 4 with data handling in teacher planners." },
  subtopics: [
    {
      id: "prob-basic",
      name: "Outcomes and likelihood",
      objectives: ["I can describe how likely something is using words.", "I can list outcomes and count them."],
      priorKnowledge: ["Counting"],
      prerequisites: [],
      generator: "prob-basic",
      realWorld: "The weather forecast says there is a 'likely' chance of rain.",
      terms: [
        { word: "Outcome", meaning: "One possible result of an experiment." },
        { word: "Event", meaning: "One or more outcomes we are interested in." },
        { word: "Sample space", meaning: "The list of ALL possible outcomes." },
      ],
      rules: ["Impossible → unlikely → even chance → likely → certain.", "When two things happen, multiply the number of outcomes."],
      explain: [
        { heading: "How likely?", body: "We use words to say how likely something is: impossible, unlikely, even chance, likely, certain.", example: "Getting a 7 on a normal die: impossible.  The sun rising tomorrow: certain." },
        { heading: "Outcomes", body: "An outcome is one possible result. A coin has 2 outcomes (heads, tails). A die has 6 outcomes. Listing every possible outcome is called the sample space." },
        { heading: "More than one thing happening", body: "If you toss a coin AND roll a die, multiply the number of outcomes: 2 × 6 = 12 possible outcomes.", example: "$2 × 6 = 12$" },
      ],
      altExplain: [{ heading: "Make a list", body: "For two coin tosses, write them all out: HH, HT, TH, TT. That is 4. Writing a list makes sure you do not miss any outcomes." }],
      workedExamples: [
        {
          title: "Count outcomes",
          problem: "A coin is tossed 3 times. How many possible outcomes?",
          steps: [
            { title: "Each toss", say: "Each toss has 2 outcomes." },
            { title: "Multiply", say: "2 × 2 × 2 = 8.", math: "$8$", ask: { prompt: "What is 2 × 2 × 2?", answer: "8" } },
          ],
          answer: "$8$",
        },
      ],
      mistakes: [{ tag: "prob.basic.addNotMultiply", mistake: "Adding the outcomes (2 + 6 = 8) instead of multiplying.", fix: "For two events, MULTIPLY: 2 × 6 = 12." }],
    },
    {
      id: "prob-calc",
      name: "Calculating probability",
      objectives: ["I can write a probability as a fraction, decimal or percentage.", "I can find the probability of an event NOT happening."],
      priorKnowledge: ["Fractions", "Percentages"],
      prerequisites: ["prob-basic", "frac-forms"],
      generator: "prob-calc",
      realWorld: "The chance of picking your favourite sweet from a mixed bag.",
      terms: [
        { word: "Probability", meaning: "A number from 0 to 1 that tells how likely an event is." },
        { word: "Favourable outcomes", meaning: "The outcomes that make the event happen." },
      ],
      rules: ["P(event) = favourable outcomes ÷ total outcomes.", "P is between 0 (impossible) and 1 (certain).", "P(not A) = 1 − P(A)."],
      explain: [
        { heading: "The formula", body: "Probability = number of ways it can happen ÷ total number of equally likely outcomes. It is always a fraction between 0 and 1.", example: "P(even number on a die) = ${3/6} = {1/2}$" },
        { heading: "Different ways to write it", body: "A probability can be a fraction, a decimal or a percentage. 1/2 = 0,5 = 50%.", example: "${1/4} = 0,25 = 25\\%$" },
        { heading: "NOT happening", body: "The chances of everything add up to 1 (100%). So P(not A) = 1 − P(A).", example: "P(red) = 0,3 → P(not red) = 1 − 0,3 = 0,7" },
      ],
      altExplain: [{ heading: "Count the sweets", body: "A bag has 3 red and 7 blue sweets. 10 sweets altogether. The chance of red is 3 out of 10. The chance of NOT red is the other 7 out of 10." }],
      workedExamples: [
        {
          title: "Marbles",
          problem: "A bag has 3 red, 5 blue and 2 green marbles. What is P(blue)?",
          steps: [
            { title: "Total outcomes", say: "3 + 5 + 2 = 10.", math: "$10$", ask: { prompt: "What is 3 + 5 + 2?", answer: "10" } },
            { title: "Favourable outcomes", say: "5 are blue." },
            { title: "Fraction and simplify", say: "5 out of 10 = 1/2.", math: "${5/10} = {1/2}$" },
          ],
          answer: "${1/2}$",
        },
      ],
      mistakes: [{ tag: "prob.calc.partToPart", mistake: "Comparing blue to the other colours (5 : 5) instead of to the TOTAL.", fix: "The bottom number of a probability is the TOTAL number of outcomes." }],
    },
    {
      id: "prob-freq",
      name: "Relative frequency",
      objectives: ["I can work out relative frequency from an experiment.", "I know why more trials give a better estimate.", "I can predict how many times an event is expected to happen."],
      priorKnowledge: ["Probability as a fraction"],
      prerequisites: ["prob-calc"],
      generator: "prob-freq",
      realWorld: "A factory tests 100 bulbs and finds 3 are faulty: the relative frequency of faulty bulbs is 3/100.",
      terms: [
        { word: "Relative frequency", meaning: "How often something happened in an experiment ÷ the total number of trials." },
        { word: "Theoretical probability", meaning: "What we expect to happen, from working it out." },
        { word: "Trial", meaning: "One go at the experiment." },
      ],
      rules: ["Relative frequency = times it happened ÷ number of trials.", "Expected number = probability × number of trials.", "More trials → relative frequency closer to the theoretical probability."],
      explain: [
        { heading: "Doing the experiment", body: "Instead of working it out, we can try it. Toss a coin 50 times. If you get 28 heads, the relative frequency of heads is 28/50.", example: "${28/50} = {14/25}$" },
        { heading: "More trials, better estimate", body: "With only a few trials the results can be a bit random. The more times we repeat an experiment, the closer the relative frequency gets to the theoretical probability." },
        { heading: "How many do we expect?", body: "Multiply the probability by the number of trials to estimate how many times the event will happen. It is only an estimate, so real results may differ.", example: "P(6) = 1/6, roll 300 times:  ${1/6} × 300 = 50$ sixes expected" },
      ],
      altExplain: [{ heading: "A school experiment", body: "If everyone in a class of 30 tosses a coin 10 times, together they have done 300 tosses. Their combined result will be much closer to half heads than any one learner's 10 tosses." }],
      workedExamples: [
        {
          title: "Expected number",
          problem: "The probability of a spinner landing on blue is 1/4. If it is spun 200 times, how many times do we expect blue?",
          steps: [
            { title: "Multiply", say: "Probability × number of trials.", math: "${1/4} × 200$" },
            { title: "Calculate", say: "200 ÷ 4 = 50.", math: "$50$", ask: { prompt: "What is 200 ÷ 4?", answer: "50" } },
          ],
          answer: "About $50$ times",
        },
      ],
      mistakes: [{ tag: "prob.freq.exact", mistake: "Expecting results to be exactly the predicted number.", fix: "Expected results are estimates. Real results are usually close but not exactly equal." }],
    },
  ],
};