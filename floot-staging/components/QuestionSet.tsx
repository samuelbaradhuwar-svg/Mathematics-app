import React, { useState } from "react";
import type { Level } from "../helpers/curriculumTypes";
import { generateQuestion, randomSeed } from "../helpers/questionRegistry";
import { QuestionRunner, type RunnerResult } from "./QuestionRunner";
import styles from "./QuestionSet.module.css";

interface Props {
  generator: string;
  level: Level;
  count: number;
  source: "practice" | "lesson";
  subtopicId?: string;
  onFinish: (results: RunnerResult[]) => void;
}

// A short run of N fresh questions (used in lessons: "You try" and "Check").
export const QuestionSet: React.FC<Props> = ({ generator, level, count, source, subtopicId, onFinish }) => {
  const [seeds] = useState(() => Array.from({ length: count }, () => randomSeed()));
  const [index, setIndex] = useState(0);
  const [results, setResults] = useState<RunnerResult[]>([]);
  const question = generateQuestion(generator, level, seeds[index]);

  return (
    <div>
      <div className={styles.dots} aria-hidden>
        {seeds.map((_, i) => (
          <span key={i} className={`${styles.dot} ${i < index ? styles.done : i === index ? styles.now : ""}`} />
        ))}
      </div>
      <QuestionRunner
        key={seeds[index]}
        question={question}
        source={source}
        subtopicId={subtopicId}
        position={{ index: index + 1, total: count }}
        nextLabel={index === count - 1 ? "Finish" : undefined}
        onDone={(r) => {
          const all = [...results, r];
          setResults(all);
          if (index === count - 1) onFinish(all);
          else setIndex(index + 1);
        }}
      />
    </div>
  );
};
