import React, { useState } from "react";
import { ChevronRight, Hand } from "lucide-react";
import { parseNum } from "../helpers/mathUtils";
import type { GeneratedWithId } from "../helpers/questionRegistry";
import { Button } from "./Button";
import { Input } from "./Input";
import { MathText } from "./MathText";
import { MathVisual } from "./MathVisual";
import { StepCard } from "./StepCard";
import styles from "./GuidedSolution.module.css";

const sameAsk = (given: string, expected: string): boolean => {
  const a = parseNum(given);
  const b = parseNum(expected);
  if (a !== null && b !== null) return Math.abs(a - b) < 1e-9;
  return given.trim().toLowerCase().replace(/\s+/g, "") === expected.trim().toLowerCase().replace(/\s+/g, "");
};

interface Props {
  question: GeneratedWithId;
  onDone: () => void;
}

// "Practise together": we solve a question one tiny step at a time. Where a step has a
// small question, Judah answers it before the step is revealed.
export const GuidedSolution: React.FC<Props> = ({ question: q, onDone }) => {
  const [shown, setShown] = useState(1); // steps visible
  const [ask, setAsk] = useState("");
  const [asked, setAsked] = useState<"idle" | "wrong" | "right">("idle");
  const [tries, setTries] = useState(0);

  const current = q.steps[shown - 1];
  const needsAsk = !!current?.ask && asked !== "right" && tries < 3;
  const last = shown >= q.steps.length;

  const check = () => {
    if (!current?.ask) return;
    if (sameAsk(ask, current.ask.answer)) {
      setAsked("right");
    } else {
      setAsked("wrong");
      setTries((t) => t + 1);
    }
  };

  const next = () => {
    setShown((s) => s + 1);
    setAsk("");
    setAsked("idle");
    setTries(0);
  };

  return (
    <div className={styles.wrap}>
      <div className={styles.problem}>
        <MathText text={q.prompt} className={styles.promptText} />
        {q.visual ? <MathVisual visual={q.visual} /> : null}
      </div>

      <div className={styles.steps}>
        {q.steps.slice(0, shown).map((s, i) => {
          const isCurrent = i === shown - 1;
          // hide the maths result of the current step while a small question is waiting
          const stepToShow = isCurrent && needsAsk ? { ...s, math: undefined, why: undefined } : s;
          return (
            <StepCard key={i} number={i + 1} step={stepToShow} state={isCurrent ? "current" : "done"}>
              {isCurrent && current?.ask ? (
                <div className={styles.ask}>
                  <p className={styles.askLabel}>
                    <Hand size={18} aria-hidden /> Your turn
                  </p>
                  <MathText text={current.ask.prompt} className={styles.askPrompt} />
                  {asked !== "right" && tries < 3 ? (
                    <div className={styles.askRow}>
                      <Input
                        value={ask}
                        onChange={(e) => {
                          setAsk(e.target.value);
                          if (asked === "wrong") setAsked("idle");
                        }}
                        onKeyDown={(e) => e.key === "Enter" && check()}
                        placeholder="Type your answer"
                        autoComplete="off"
                        className={styles.askInput}
                        aria-label="Your answer to the small question"
                      />
                      <Button onClick={check} size="lg" disabled={!ask.trim()}>
                        Check
                      </Button>
                    </div>
                  ) : null}
                  {asked === "wrong" && tries < 3 ? <p className={styles.wrong}>Not quite. Have another go. You can do it!</p> : null}
                  {asked === "right" ? <p className={styles.right}>Yes! That's right.</p> : null}
                  {tries >= 3 ? (
                    <p className={styles.wrong}>
                      That's okay. The answer is <strong>{current.ask.answer}</strong>. Let's carry on.
                    </p>
                  ) : null}
                </div>
              ) : null}
            </StepCard>
          );
        })}
      </div>

      {!needsAsk ? (
        <div className={styles.footer}>
          {last ? (
            <>
              <div className={styles.answer}>
                Answer: <MathText text={q.answerText} inline />
              </div>
              <Button size="lg" className={styles.big} onClick={onDone}>
                Now you try! <ChevronRight size={20} />
              </Button>
            </>
          ) : (
            <Button size="lg" className={styles.big} onClick={next}>
              Next step <ChevronRight size={20} />
            </Button>
          )}
        </div>
      ) : null}
    </div>
  );
};
