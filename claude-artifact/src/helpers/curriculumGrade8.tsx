// The South African Grade 8 CAPS Mathematics curriculum as DATA.
// UI components never hardcode curriculum: they read it through curriculumRegistry.
import type { GradeCurriculum } from "./curriculumTypes";
import { g8AlgebraEquations } from "./g8AlgebraEquations";
import { g8AlgebraExpressions } from "./g8AlgebraExpressions";
import { g8DataHandling } from "./g8DataHandling";
import { g8Decimals } from "./g8Decimals";
import { g8Exponents } from "./g8Exponents";
import { g8Fractions } from "./g8Fractions";
import { g8Functions } from "./g8Functions";
import { g8GeometryLines } from "./g8GeometryLines";
import { g8Graphs } from "./g8Graphs";
import { g8Integers } from "./g8Integers";
import { g8Measurement } from "./g8Measurement";
import { g8Objects3D } from "./g8Objects3D";
import { g8Patterns } from "./g8Patterns";
import { g8PerimeterArea } from "./g8PerimeterArea";
import { g8Percentages } from "./g8Percentages";
import { g8Probability } from "./g8Probability";
import { g8RatioRate } from "./g8RatioRate";
import { g8Shapes2D } from "./g8Shapes2D";
import { g8SurfaceVolume } from "./g8SurfaceVolume";
import { g8WholeNumbers } from "./g8WholeNumbers";

export const curriculumGrade8: GradeCurriculum = {
  grade: 8,
  subject: "Mathematics",
  country: "South Africa",
  framework: "CAPS",
  topics: [
    g8WholeNumbers,
    g8Integers,
    g8Fractions,
    g8Decimals,
    g8Percentages,
    g8Exponents,
    g8Patterns,
    g8Functions,
    g8AlgebraExpressions,
    g8AlgebraEquations,
    g8RatioRate,
    g8Graphs,
    g8GeometryLines,
    g8Shapes2D,
    g8DataHandling,
    g8Objects3D,
    g8Measurement,
    g8PerimeterArea,
    g8SurfaceVolume,
    g8Probability,
  ].sort((a, b) => a.order - b.order),
};