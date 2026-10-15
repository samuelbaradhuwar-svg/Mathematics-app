import type { Topic } from "./curriculumTypes";

export const g8Fractions: Topic = {
  id: "common-fractions",
  name: "Common fractions",
  strand: "Numbers, Operations and Relationships",
  term: 1,
  order: 3,
  icon: "PieChart",
  summary: "Fractions: equivalent fractions, adding, subtracting, multiplying, dividing and changing between fractions, decimals and percentages.",
  whatYouLearn: [
    "Equivalent fractions, simplifying and comparing fractions",
    "Adding and subtracting fractions and mixed numbers",
    "Multiplying and dividing fractions",
    "Changing between fractions, decimals and percentages",
  ],
  priorKnowledge: ["Times tables and division", "Factors and multiples (HCF and LCM)", "What a fraction means (parts of a whole)"],
  prerequisites: ["whole-numbers"],
  videoQueries: ["Grade 8 mathematics common fractions CAPS South Africa", "Grade 8 maths adding subtracting fractions South Africa", "Grade 8 maths multiplying dividing fractions South Africa"],
  assessmentNote: "Tests usually include simplifying, comparing, the four operations with fractions and mixed numbers, and converting between fractions, decimals and percentages.",
  placement: { source: "secondary-sources", note: "Common fractions is a Term 1 topic in the DBE-linked Grade 8 navigation pack." },
  subtopics: [
    {
      id: "frac-equiv",
      name: "Equivalent fractions and comparing",
      objectives: ["I can make equivalent fractions.", "I can simplify a fraction.", "I can compare fractions by using a common denominator."],
      priorKnowledge: ["What a fraction means", "HCF and LCM"],
      prerequisites: ["wn-factors"],
      generator: "frac-equiv",
      realWorld: "Half a pizza and 4 out of 8 slices are the same amount.",
      terms: [
        { word: "Numerator", meaning: "The top number of a fraction. It counts the parts we have." },
        { word: "Denominator", meaning: "The bottom number of a fraction. It tells how many equal parts make a whole." },
        { word: "Equivalent fractions", meaning: "Different fractions that show the same amount." },
        { word: "Simplest form", meaning: "A fraction where the top and bottom have no common factor except 1." },
      ],
      rules: ["Multiply or divide the top AND bottom by the same number to get an equivalent fraction.", "To compare fractions, give them the same denominator.", "Never ADD the same number to the top and bottom."],
      explain: [
        { heading: "Same amount, different numbers", body: "Half of a pizza can be written as 1/2 or 2/4 or 4/8. They look different but they are the SAME amount. We call them **equivalent fractions**.", example: "${1/2} = {2/4} = {4/8}$", visual: { type: "fractionbar", parts: 4, shaded: 2, caption: "2 out of 4 is the same as 1 out of 2." } },
        { heading: "How to make an equivalent fraction", body: "Multiply the top AND the bottom by the same number. Whatever you do to the bottom, do to the top.", example: "${3/4} = {3 × 2/4 × 2} = {6/8}$" },
        { heading: "Simplifying", body: "To simplify, DIVIDE the top and bottom by a number that goes into both. Keep going until you cannot divide any more. The best number to use is the HCF.", example: "${12/18} = {12 ÷ 6/18 ÷ 6} = {2/3}$" },
        { heading: "Comparing fractions", body: "To see which fraction is bigger, give them the SAME denominator. Then the one with the bigger top number is bigger.", example: "${2/3}$ and ${3/4}$: ${8/12} < {9/12}$" },
      ],
      altExplain: [
        { heading: "Cutting a chocolate", body: "Take a chocolate bar with 4 blocks. 2 blocks is half. Now break each block in two: 8 blocks. 4 blocks is still half! The pieces got smaller but there are more of them. That is why we multiply top AND bottom by the same number." },
      ],
      workedExamples: [
        {
          title: "Simplify",
          problem: "Simplify ${18/24}$",
          steps: [
            { title: "Find the HCF", say: "The biggest number that divides into both 18 and 24 is 6.", math: "$HCF(18; 24) = 6$", ask: { prompt: "What is the biggest number that divides into 18 and 24?", answer: "6" } },
            { title: "Divide top and bottom", say: "18 ÷ 6 = 3 and 24 ÷ 6 = 4.", math: "${18/24} = {3/4}$" },
            { title: "Check", say: "3 and 4 have no common factor except 1. So it is in simplest form." },
          ],
          answer: "${3/4}$",
        },
      ],
      mistakes: [
        { tag: "frac.addNotMultiply", mistake: "Adding the same number to the top and bottom to make an equivalent fraction.", fix: "We must MULTIPLY (or divide) top and bottom by the same number." },
      ],
    },
    {
      id: "frac-addsub",
      name: "Adding and subtracting fractions",
      objectives: ["I can add and subtract fractions with the same denominator.", "I can add and subtract fractions with different denominators.", "I can add and subtract mixed numbers."],
      priorKnowledge: ["Equivalent fractions", "LCM"],
      prerequisites: ["frac-equiv"],
      generator: "frac-addsub",
      realWorld: "Joining 1/2 a cup of flour and 1/4 of a cup of flour in a recipe.",
      terms: [
        { word: "Lowest common denominator (LCD)", meaning: "The smallest number that both denominators divide into." },
        { word: "Mixed number", meaning: "A whole number and a fraction together, like 2 1/2." },
        { word: "Improper fraction", meaning: "A fraction where the top is bigger than the bottom, like 5/2." },
      ],
      rules: ["Same denominator: add or subtract the numerators. Keep the denominator.", "Different denominators: make them the same first.", "Always simplify your answer."],
      explain: [
        { heading: "Same-size pieces", body: "If the pieces are the same size (same denominator), just add or subtract the TOP numbers. The bottom number stays the same.", example: "${2/7} + {3/7} = {5/7}$" },
        { heading: "Different-size pieces", body: "If the denominators are different, the pieces are different sizes. We cannot add them yet. First change both fractions so they have the same denominator, the LCD.", example: "${1/2} + {1/3}$: LCD is 6" },
        { heading: "Making the same denominator", body: "Change each fraction to an equivalent fraction with the LCD. Now the pieces are the same size.", example: "${1/2} = {3/6}$     ${1/3} = {2/6}$     So  ${3/6} + {2/6} = {5/6}$" },
        { heading: "Mixed numbers", body: "Change each mixed number to an improper fraction: multiply the whole number by the denominator and add the numerator. Then add or subtract as before. Change the answer back to a mixed number.", example: "$1{1/2} = {3/2}$" },
      ],
      altExplain: [
        { heading: "Add apples, not apples and oranges", body: "You can only add things that are the SAME kind. 3 apples + 2 apples = 5 apples. But 1 half + 1 third cannot be added until they are the same kind. Changing them both to sixths makes them the same kind." },
      ],
      workedExamples: [
        {
          title: "Different denominators",
          problem: "Calculate ${3/4} + {1/6}$",
          steps: [
            { title: "Find the LCD", say: "The smallest number that both 4 and 6 divide into is 12.", math: "$LCD = 12$", ask: { prompt: "What is the LCM of 4 and 6?", answer: "12" } },
            { title: "Make equivalent fractions", say: "4 × 3 = 12 so multiply 3/4 top and bottom by 3. 6 × 2 = 12 so multiply 1/6 by 2.", math: "${9/12} + {2/12}$" },
            { title: "Add the tops", say: "9 + 2 = 11. The bottom stays 12.", math: "${11/12}$" },
            { title: "Simplify", say: "11 and 12 share no factor except 1, so we are done.", math: "${11/12}$" },
          ],
          answer: "${11/12}$",
        },
      ],
      mistakes: [
        { tag: "frac.addDenominators", mistake: "Adding the tops AND the bottoms (1/2 + 1/3 = 2/5).", fix: "Only the tops are added. First make the denominators the same, and the denominator stays the same." },
      ],
    },
    {
      id: "frac-muldiv",
      name: "Multiplying and dividing fractions",
      objectives: ["I can find a fraction of a number.", "I can multiply fractions.", "I can divide by a fraction."],
      priorKnowledge: ["Multiplication and division facts", "Simplifying fractions"],
      prerequisites: ["frac-equiv"],
      generator: "frac-muldiv",
      realWorld: "Finding 3/4 of 24 sweets, or how many 1/4-litre cups fit into 3 litres.",
      terms: [{ word: "Reciprocal", meaning: "A fraction flipped upside down. The reciprocal of 2/3 is 3/2." }],
      rules: ["'Of' means multiply.", "Multiply fractions: top × top, bottom × bottom.", "To divide by a fraction: Keep, Change (÷ to ×), Flip."],
      explain: [
        { heading: "A fraction of a number", body: "To find a fraction of a number, divide by the bottom number first. Then multiply by the top number.", example: "${3/4}$ of $24$:  $24 ÷ 4 = 6$,  $6 × 3 = 18$" },
        { heading: "Multiplying fractions", body: "Multiply the tops together. Multiply the bottoms together. Then simplify.", example: "${2/3} × {3/5} = {6/15} = {2/5}$" },
        { heading: "Dividing by a fraction", body: "Keep the first fraction. Change ÷ to ×. Flip the second fraction. Then multiply.", example: "${1/2} ÷ {1/4} = {1/2} × {4/1} = 2$" },
      ],
      altExplain: [
        { heading: "Why flipping works", body: "How many quarters fit into 1 whole? 4. How many into 2 wholes? 8. So dividing by 1/4 gives 4 times as many. That is why ÷ 1/4 is the same as × 4." },
      ],
      workedExamples: [
        {
          title: "Divide fractions",
          problem: "Calculate ${2/3} ÷ {4/9}$",
          steps: [
            { title: "Keep, Change, Flip", say: "Keep 2/3. Change ÷ to ×. Flip 4/9 to 9/4.", math: "${2/3} × {9/4}$" },
            { title: "Multiply", say: "Top: 2 × 9 = 18. Bottom: 3 × 4 = 12.", math: "${18/12}$" },
            { title: "Simplify", say: "Divide top and bottom by 6.", math: "${3/2} = 1{1/2}$" },
          ],
          answer: "$1{1/2}$",
        },
      ],
      mistakes: [
        { tag: "frac.forgotNumerator", mistake: "Dividing by the bottom number but forgetting to multiply by the top number.", fix: "Both steps are needed: ÷ bottom, then × top." },
        { tag: "frac.multiplyDenominator", mistake: "Keeping one denominator when multiplying fractions.", fix: "When MULTIPLYING we multiply the bottoms too." },
      ],
    },
    {
      id: "frac-forms",
      name: "Fractions, decimals and percentages",
      objectives: ["I can change a fraction to a decimal and a percentage.", "I can change a decimal or a percentage to a fraction.", "I can compare numbers written in different forms."],
      priorKnowledge: ["Equivalent fractions", "Place value of decimals"],
      prerequisites: ["frac-equiv"],
      generator: "frac-forms",
      realWorld: "A shop sign says 25% off. That is the same as 1/4 off, or 0,25 of the price.",
      terms: [
        { word: "Percentage", meaning: "A fraction with 100 as the denominator. 'Per cent' means 'out of 100'." },
        { word: "Decimal fraction", meaning: "A number written with a decimal comma, like 0,75." },
      ],
      rules: ["Per cent = out of 100.", "Fraction → decimal: make the denominator 100 (or divide top by bottom).", "Decimal → percentage: multiply by 100.", "Percentage → fraction: write over 100, then simplify."],
      explain: [
        { heading: "Three ways to say the same thing", body: "Three-quarters can be written as a fraction (3/4), a decimal (0,75) and a percentage (75%). They are all the same amount.", example: "${3/4} = 0,75 = 75\\%$" },
        { heading: "Fraction to percentage", body: "A percentage is out of 100. So make the denominator 100. Multiply top and bottom by the same number.", example: "${3/4} = {3 × 25/4 × 25} = {75/100} = 75\\%$" },
        { heading: "Percentage to decimal", body: "75% means 75 out of 100, which is 75 hundredths: 0,75. Divide the percentage by 100.", example: "$75\\% = 75 ÷ 100 = 0,75$" },
        { heading: "Decimal to fraction", body: "Say the decimal in words. 0,35 is thirty-five hundredths, so write 35/100. Then simplify.", example: "$0,35 = {35/100} = {7/20}$" },
      ],
      altExplain: [
        { heading: "A hundred squares", body: "Imagine a grid of 100 small squares. Colour 75 squares. That is 75 out of 100 = 75% = 0,75 = 3/4 of the grid." },
      ],
      workedExamples: [
        {
          title: "Fraction to percentage",
          problem: "Write ${7/20}$ as a percentage.",
          steps: [
            { title: "Make the denominator 100", say: "20 × 5 = 100. So multiply top and bottom by 5.", math: "${7 × 5/20 × 5} = {35/100}$", ask: { prompt: "What is 7 × 5?", answer: "35" } },
            { title: "Read as a percentage", say: "35 out of 100 is 35%.", math: "$35\\%$" },
          ],
          answer: "$35\\%$",
        },
      ],
      mistakes: [
        { tag: "frac.forms.decimalPlace", mistake: "Writing 3/4 as 0,34 (putting the numbers side by side).", fix: "Make the denominator 100 first: 3/4 = 75/100 = 0,75." },
      ],
    },
  ],
};