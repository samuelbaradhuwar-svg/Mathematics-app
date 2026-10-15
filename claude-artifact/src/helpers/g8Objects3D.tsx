import type { Topic } from "./curriculumTypes";

export const g8Objects3D: Topic = {
  id: "objects-3d",
  name: "3D objects",
  strand: "Space and Shape (Geometry)",
  term: 4,
  order: 16,
  icon: "Box",
  summary: "Solid shapes: their names, faces, edges, vertices and nets.",
  whatYouLearn: ["Names and properties of prisms, pyramids, cylinders, cones and spheres", "Counting faces, edges and vertices", "Nets of 3D objects"],
  priorKnowledge: ["2D shapes (squares, triangles, rectangles, circles)"],
  prerequisites: ["shapes-2d"],
  videoQueries: ["Grade 8 mathematics geometry of 3D objects CAPS South Africa", "Grade 8 maths nets of 3D objects faces edges vertices South Africa"],
  assessmentNote: "Tests usually include naming solids, counting faces/edges/vertices and matching nets to solids.",
  placement: { source: "secondary-sources", note: "3D objects are taught with surface area and volume in the later terms (Term 3-4). Euler's rule is included as an extension; check that it is part of your school's plan." },
  subtopics: [
    {
      id: "g3d-names",
      name: "Faces, edges, vertices and names",
      objectives: ["I can name common 3D objects.", "I can count faces, edges and vertices.", "I can use the faces of a prism to find its base."],
      priorKnowledge: ["2D shapes"],
      prerequisites: [],
      generator: "g3d-names",
      realWorld: "Boxes, tins, balls, tents and ice-cream cones are all 3D objects.",
      terms: [
        { word: "Face", meaning: "A flat surface of a 3D object." },
        { word: "Edge", meaning: "A line where two faces meet." },
        { word: "Vertex (vertices)", meaning: "A corner where edges meet." },
        { word: "Prism", meaning: "A solid with two identical parallel ends and rectangle sides." },
        { word: "Pyramid", meaning: "A solid with a base and triangular faces that meet at one point (apex)." },
      ],
      rules: ["A prism is named after its base: a triangular prism has triangle ends.", "A pyramid is named after its base: a square pyramid has a square base.", "Euler's rule: faces + vertices − edges = 2."],
      explain: [
        { heading: "Faces, edges, vertices", body: "A **face** is a flat surface. An **edge** is where two faces meet. A **vertex** is a corner. A cube has 6 faces, 12 edges and 8 vertices.", visual: { type: "cuboid", l: 3, w: 3, h: 3 } },
        { heading: "Prisms", body: "A prism has two identical ends joined by rectangles. Its name comes from the shape of the end: a triangular prism, a pentagonal prism... A cube and a rectangular prism have rectangles for ALL their faces." },
        { heading: "Pyramids, cylinders, cones, spheres", body: "A pyramid has a base and triangle faces that meet at a point. A cylinder has two circles and a curved side. A cone has one circle and a curved side that ends in a point. A sphere is perfectly round with no flat faces." },
      ],
      altExplain: [{ heading: "Count with a real object", body: "Find a cereal box. Put a sticker on each face as you count it: 6. Put a sticker on each corner: 8. Run your finger along each edge: 12. Checking with a real object is the best way to count." }],
      workedExamples: [
        {
          title: "How many sides does the base have?",
          problem: "A prism has 8 faces altogether. How many sides does its base have?",
          steps: [
            { title: "A prism has 2 end faces", say: "Take these away from the total.", math: "$8 − 2 = 6$", ask: { prompt: "What is 8 − 2?", answer: "6" } },
            { title: "The rest are rectangles", say: "There is one rectangle for each side of the base, so the base has 6 sides: it is a hexagon." },
          ],
          answer: "$6$ sides (a hexagonal prism)",
        },
      ],
      mistakes: [{ tag: "g3d.count", mistake: "Forgetting the hidden faces, edges and corners at the back or bottom.", fix: "Use a real object or tick each one off as you count." }],
    },
    {
      id: "g3d-nets",
      name: "Nets of 3D objects",
      objectives: ["I know what a net is.", "I can say which 2D shapes make up a net."],
      priorKnowledge: ["Faces of 3D objects"],
      prerequisites: ["g3d-names"],
      generator: "g3d-nets",
      realWorld: "A cardboard box is made from a flat net that is folded and glued.",
      terms: [{ word: "Net", meaning: "A flat 2D pattern that can be folded to make a 3D object." }],
      rules: ["A net has one 2D shape for each face of the 3D object.", "Shapes in a net are joined along edges."],
      explain: [
        { heading: "Unfolding a box", body: "Imagine cutting open a cereal box along some edges and flattening it. The flat shape you get is a **net**.", visual: { type: "gridrect", w: 4, h: 3, caption: "A net is a flat pattern that folds into a solid." } },
        { heading: "What is in a net?", body: "A net has one flat shape for each face. A cube: 6 squares. A rectangular prism: 6 rectangles. A triangular prism: 2 triangles and 3 rectangles. A square pyramid: 1 square and 4 triangles. A cylinder: 2 circles and 1 rectangle." },
        { heading: "The rectangle of a cylinder", body: "The curved side of a cylinder unrolls into a rectangle. One side of the rectangle is the height of the cylinder. The other side is the circumference of the circle." },
      ],
      altExplain: [{ heading: "Make one", body: "Cut open an empty cereal box or a toothpaste box carefully along the edges and lay it flat. You can then see exactly which shapes make up its net." }],
      workedExamples: [
        {
          title: "Net of a triangular prism",
          problem: "Which shapes are in the net of a triangular prism?",
          steps: [
            { title: "The ends", say: "Two triangles." },
            { title: "The sides", say: "One rectangle for each side of the triangle: three rectangles." },
          ],
          answer: "2 triangles and 3 rectangles",
        },
      ],
      mistakes: [{ tag: "g3d.nets", mistake: "Mixing up the shapes of the ends and the sides.", fix: "The ends have the shape of the prism's name; the sides are rectangles." }],
    },
  ],
};