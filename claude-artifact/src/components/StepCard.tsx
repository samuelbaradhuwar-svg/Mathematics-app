import React from "react";
import { CheckCircle2 } from "lucide-react";
import type { WorkedStep } from "../helpers/curriculumTypes";
import { MathText } from "./MathText";
import styles from "./StepCard.module.css";

interface Props {
  number: number;
  step: Pick<WorkedStep, "title" | "say"> & { math?: string; why?: string };
  state?: "current" | "done";
  children?: React.ReactNode;
}

// One tiny step of a solution, in its own visually separate card.
export const StepCard: React.FC<Props> = ({ number, step, state = "done", children }) => {
  // titles like "STEP 2: Look at the +5" already carry a number: don't print it twice
  const title = step.title.replace(/^STEP\s*\d+\s*:\s*/i, "");
  return (
    <div className={`${styles.card} ${state === "current" ? styles.current : ""}`}>
      <div className={styles.badge} aria-hidden>
        {state === "done" ? number : number}
      </div>
      <div className={styles.body}>
        <h3 className={styles.title}>{title}</h3>
        {step.say ? <MathText text={step.say} className={styles.say} /> : null}
        {step.math ? (
          <div className={styles.math}>
            <MathText text={step.math} />
          </div>
        ) : null}
        {step.why ? (
          <div className={styles.why}>
            <CheckCircle2 size={16} aria-hidden />
            <span>
              <strong>Why? </strong>
              <MathText text={step.why} inline />
            </span>
          </div>
        ) : null}
        {children}
      </div>
    </div>
  );
};