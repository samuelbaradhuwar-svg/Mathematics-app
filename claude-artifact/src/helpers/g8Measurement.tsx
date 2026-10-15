import type { Topic } from "./curriculumTypes";

export const g8Measurement: Topic = {
  id: "measurement",
  name: "Measurement",
  strand: "Measurement",
  term: 4,
  order: 17,
  icon: "Ruler",
  summary: "Converting between units of length, mass, capacity, area and volume, and working with time.",
  whatYouLearn: ["Converting between metric units (length, mass, capacity)", "Converting area and volume units", "Reading and calculating with time (12-hour and 24-hour)"],
  priorKnowledge: ["Multiplying and dividing by 10, 100 and 1 000", "Decimals"],
  prerequisites: ["decimal-fractions"],
  videoQueries: ["Grade 8 mathematics measurement conversions CAPS South Africa", "Grade 8 maths time 24 hour clock South Africa"],
  assessmentNote: "Tests usually include unit conversions and time calculations in word problems.",
  placement: { source: "author-knowledge", note: "Measurement is placed in Term 4 here because it supports area, surface area and volume; CAPS weaves measurement through several terms." },
  subtopics: [
    {
      id: "meas-convert",
      name: "Converting units",
      objectives: ["I can convert between mm, cm, m and km.", "I can convert between g, kg and tonnes, and between ml, ℓ and kℓ.", "I can convert area and volume units."],
      priorKnowledge: ["Multiplying and dividing by powers of 10"],
      prerequisites: ["dec-muldiv"],
      generator: "meas-convert",
      realWorld: "Buying 2,5 kg of flour when a recipe says grams.",
      terms: [
        { word: "Metric units", meaning: "Measurements based on 10, 100 and 1 000 (like metres and kilograms)." },
        { word: "Convert", meaning: "Change a measurement from one unit to another." },
      ],
      rules: ["1 km = 1 000 m, 1 m = 100 cm, 1 cm = 10 mm.", "1 t = 1 000 kg, 1 kg = 1 000 g.", "1 kℓ = 1 000 ℓ, 1 ℓ = 1 000 ml.", "Big unit → small unit: MULTIPLY. Small unit → big unit: DIVIDE.", "1 m² = 10 000 cm², 1 cm³ = 1 000 mm³, 1 cm³ = 1 ml."],
      explain: [
        { heading: "Big to small: multiply", body: "When you change to a SMALLER unit, you need MORE of them. So multiply. 2 m = 2 × 100 = 200 cm.", example: "$3,5 m = 3,5 × 100 = 350 cm$" },
        { heading: "Small to big: divide", body: "When you change to a BIGGER unit, you need FEWER of them. So divide. 4 500 g = 4 500 ÷ 1 000 = 4,5 kg.", example: "$4 500 g = 4,5 kg$" },
        { heading: "Area and volume are special", body: "For area, the length factor is used TWICE. 1 m = 100 cm, so 1 m² = 100 × 100 = 10 000 cm². For volume, it is used THREE times. 1 cm = 10 mm, so 1 cm³ = 10 × 10 × 10 = 1 000 mm³.", example: "$2 m^2 = 2 × 10 000 = 20 000 cm^2$" },
      ],
      altExplain: [{ heading: "A conversion ladder", body: "Draw a ladder: km, m, cm, mm. Going DOWN the ladder multiplies; going UP divides. Count how many rungs and use 10, 100 or 1 000 for each step." }],
      workedExamples: [
        {
          title: "Area conversion",
          problem: "Convert $3 m^2$ to cm².",
          steps: [
            { title: "Think about 1 m²", say: "1 m is 100 cm, so a square 1 m by 1 m is 100 cm by 100 cm.", math: "$1 m^2 = 100 × 100 = 10 000 cm^2$", ask: { prompt: "What is 100 × 100?", answer: "10000" } },
            { title: "Multiply", say: "3 × 10 000 = 30 000.", math: "$30 000 cm^2$" },
          ],
          answer: "$30 000 cm^2$",
        },
      ],
      mistakes: [{ tag: "meas.areaFactor", mistake: "Using 100 instead of 10 000 when changing m² to cm².", fix: "For area, the length factor is squared (100 × 100)." }],
    },
    {
      id: "meas-time",
      name: "Time",
      objectives: ["I can change between 12-hour and 24-hour time.", "I can work out how long something takes.", "I can find an arrival time."],
      priorKnowledge: ["Telling the time", "Adding and subtracting"],
      prerequisites: [],
      generator: "meas-time",
      realWorld: "Bus and train timetables in South Africa use 24-hour time.",
      terms: [
        { word: "24-hour time", meaning: "A way of writing time where the hours go from 00 to 23, with no am or pm." },
        { word: "Duration", meaning: "How long something takes." },
      ],
      rules: ["pm times: add 12 to the hour (except 12 pm).", "1 hour = 60 minutes.", "To find a duration, count on to the next hour first."],
      explain: [
        { heading: "24-hour time", body: "After midday the hours keep counting: 13, 14, 15... To change a pm time, add 12 to the hour. To change back, subtract 12.", example: "$3:45 pm = 15:45$     $20:10 = 8:10 pm$" },
        { heading: "How long does it take?", body: "Count on from the start time to the next full hour. Then add the whole hours. Then add the extra minutes.", example: "08:45 to 11:20:  15 min + 2 h + 20 min = 2 h 35 min = 155 min" },
        { heading: "Finding the arrival time", body: "Add the hours first. Then add the minutes. If the minutes pass 60, add 1 to the hours and subtract 60 from the minutes.", example: "14:50 + 3 h 45 min:  17:50 + 45 min = 18:35" },
      ],
      altExplain: [{ heading: "A number line for time", body: "Draw a line. Mark the start time. Jump to the next full hour, then jump whole hours, then jump the last minutes. Add up the jumps." }],
      workedExamples: [
        {
          title: "Arrival time",
          problem: "A bus leaves at 14:50 and the trip takes 3 hours 45 minutes. When does it arrive?",
          steps: [
            { title: "Add the hours", say: "14:50 + 3 hours = 17:50.", math: "$17:50$", ask: { prompt: "What is 14 + 3?", answer: "17" } },
            { title: "Add the minutes", say: "50 + 45 = 95 minutes, which is 1 hour 35 minutes.", math: "$17:50 + 45 min$" },
            { title: "Carry the hour", say: "17:50 + 10 min = 18:00, then 35 more minutes: 18:35.", math: "$18:35$" },
          ],
          answer: "$18:35$",
        },
      ],
      mistakes: [{ tag: "meas.time.base60", mistake: "Treating minutes like base 10 (50 + 45 = 95 minutes means 1:95).", fix: "There are only 60 minutes in an hour. Carry over when you pass 60." }],
    },
  ],
};