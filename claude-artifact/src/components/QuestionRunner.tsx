import React, { useMemo, useRef, useState } from "react";
import { CheckCircle2, ChevronRight, Eye, HeartHandshake, Lightbulb } from "lucide-react";
import { checkAnswer } from "../helpers/checkAnswer";
import { LEVEL_LABEL } from "../helpers/curriculumTypes";
import type { GeneratedWithId } from "../helpers/questionRegistry";
import { useRecordPractice } from "../helpers/useLearnerData";
import type { OutputType as RecordResult } from "../endpoints/practice/record_POST.schema";
import { Button } from "./Button";
import { Input } from "./Input";
import { MathText } from "./MathText";
import { MathVisual } from "./MathVisual";
import { Spinner } from "./Spinner";
import { StepCard } from "./StepCard";
import { TutorHelp } from "./TutorHelp";
import styles from "./QuestionRunner.module.css";

export interface RunnerResult {
  outcome: "clean" | "assisted" | "incorrect";
  record: RecordResult | null;
  question: GeneratedWithId;
}

interface Props {
  question: GeneratedWithId;
  source: "practice" | "lesson";
  subtopicId?: string;
  position?: { index: number; total: number };
  onDone: (r: RunnerResult) => void;
  nextLabel?: string;
}

type Feedback = { kind: "info" | "almost" | "wrong" | "right"; text: string; method?: string };

const wrongMessage = (wrongCount: number): string =>
  wrongCount === 1
    ? "Not quite yet, and that's completely okay! Take another look and try again. You can also tap a hint."
    : wrongCount === 2
      ? "Good effort. Trying again is how we learn. A hint might help you now."
      : "This one is tricky. You can try again, or I can show you how it is solved so you can see the steps.";

const rightMessage = (wrongCount: number, hints: number): string =>
  wrongCount === 0 && hints === 0
    ? "Yes! That's right, and you worked it out all by yourself."
    : wrongCount === 0
      ? "That's right! Using a hint is part of learning."
      : "That's right! You didn't give up, and that's what really counts.";

export const QuestionRunner: React.FC<Props> = ({ question: q, source, subtopicId, position, onDone, nextLabel }) => {
  const [answer, setAnswer] = useState("");
  const [hints, setHints] = useState(0);
  const [wrongs, setWrongs] = useState(0);
  const [firstWrong, setFirstWrong] = useState<string | undefined>();
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [phase, setPhase] = useState<"answering" | "correct" | "revealed">("answering");
  const [result, setResult] = useState<RecordResult | null>(null);
  const record = useRecordPractice();
  const inputRef = useRef<HTMLInputElement>(null);

  const finish = (revealed: boolean, given: string) => {
    setPhase(revealed ? "revealed" : "correct");
    record.mutate(
      {
        questionId: q.id,
        givenAnswer: given,
        firstWrongAnswer: firstWrong,
        hintsUsed: hints,
        tries: Math.max(1, revealed ? wrongs : wrongs + 1),
        revealed,
        source,
      },
      { onSuccess: (r) => setResult(r) }
    );
  };

  const submit = () => {
    if (phase !== "answering") return;
    const res = checkAnswer(q, answer);
    if (res.status === "empty") {
      setFeedback({ kind: "info", text: "Type your answer first. Or tap a hint if you'd like some help." });
      return;
    }
    if (res.status === "unreadable") {
      setFeedback({ kind: "info", text: res.note ?? "I couldn't read that. Please check how you wrote it." });
      return;
    }
    if (res.status === "almost") {
      setFeedback({ kind: "almost", text: res.note ?? "Nearly! Check how you wrote it." });
      return;
    }
    if (res.status === "correct") {
      setFeedback({ kind: "right", text: rightMessage(wrongs, hints) });
      finish(false, answer);
      return;
    }
    const w = wrongs + 1;
    setWrongs(w);
    if (!firstWrong) setFirstWrong(answer);
    setFeedback({ kind: "wrong", text: wrongMessage(w), method: res.methodNote });
    if (q.kind !== "choice") inputRef.current?.select();
  };

  const reveal = () => {
    setFeedback(null);
    finish(true, answer);
  };

  const finished = phase !== "answering";
  const hintsShown = q.hints.slice(0, hints);
  const showReveal = wrongs >= 2 || hints >= q.hints.length;
  const showTutorHelp = wrongs >= 1 || hints >= 1;
  const outcomeNow = useMemo(() => (phase === "revealed" ? "incorrect" : hints === 0 && wrongs === 0 ? "clean" : "assisted"), [phase, hints, wrongs]);

  return (
    <div className={styles.runner}>
      <div className={styles.topRow}>
        {position ? (
          <span className={styles.counter}>
            Question {position.index} of {position.total}
          </span>
        ) : (
          <span />
        )}
        <span className={styles.level}>{LEVEL_LABEL[q.level]}</span>
      </div>

      <div className={styles.prompt}>
        <MathText text={q.prompt} className={styles.promptText} />
        {q.visual ? <MathVisual visual={q.visual} /> : null}
      </div>

      {!finished ? (
        <>
          {q.kind === "choice" && q.choices ? (
            <div className={styles.choices} role="radiogroup" aria-label="Choose an answer">
              {q.choices.map((c) => (
                <button
                  key={c}
                  type="button"
                  role="radio"
                  aria-checked={answer === c}
                  className={`${styles.choice} ${answer === c ? styles.chosen : ""}`}
                  onClick={() => {
                    setAnswer(c);
                    setFeedback(null);
                  }}
                >
                  <span className={styles.radio} aria-hidden />
                  <MathText text={c} inline />
                </button>
              ))}
            </div>
          ) : (
            <div className={styles.answerRow}>
              <Input
                ref={inputRef}
                value={answer}
                onChange={(e) => {
                  setAnswer(e.target.value);
                  if (feedback?.kind === "info") setFeedback(null);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") submit();
                }}
                inputMode={q.kind === "numeric" ? "text" : "text"}
                autoCapitalize="off"
                autoCorrect="off"
                autoComplete="off"
                spellCheck={false}
                placeholder={q.placeholder ?? "Type your answer"}
                aria-label="Your answer"
                className={styles.input}
              />
              {q.unit ? <span className={styles.unit}>{q.unit}</span> : null}
            </div>
          )}

          {feedback ? (
            <div className={`${styles.feedback} ${styles[feedback.kind]}`} role="status">
              <p className={styles.fbText}>{feedback.text}</p>
              {feedback.method ? (
                <p className={styles.method}>
                  <HeartHandshake size={16} aria-hidden /> <strong>About your method: </strong>
                  {feedback.method}
                </p>
              ) : null}
            </div>
          ) : null}

          {hintsShown.length ? (
            <ol className={styles.hints}>
              {hintsShown.map((h, i) => (
                <li key={i}>
                  <span className={styles.hintNum}>Hint {i + 1}</span>
                  <MathText text={h} inline />
                </li>
              ))}
            </ol>
          ) : null}

          <div className={styles.actions}>
            <Button size="lg" className={styles.check} onClick={submit} disabled={q.kind === "choice" && !answer}>
              Check my answer
            </Button>
            <div className={styles.secondary}>
              <Button variant="outline" size="md" onClick={() => setHints((h) => Math.min(q.hints.length, h + 1))} disabled={hints >= q.hints.length}>
                <Lightbulb size={18} /> {hints === 0 ? "Give me a hint" : hints >= q.hints.length ? "No more hints" : "Another hint"}
              </Button>
              {showReveal ? (
                <Button variant="ghost" size="md" onClick={reveal}>
                  <Eye size={18} /> Show me how
                </Button>
              ) : null}
            </div>
          </div>

          {showTutorHelp ? <TutorHelp mode="explain-differently" subtopicId={subtopicId} question={q.prompt} studentAnswer={answer || undefined} hintsShown={hintsShown} label="Explain it a different way" /> : null}
        </>
      ) : (
        <div className={styles.done}>
          <div className={`${styles.feedback} ${phase === "correct" ? styles.right : styles.revealedBox}`} role="status">
            <p className={styles.fbText}>
              {phase === "correct" ? (
                <>
                  <CheckCircle2 size={22} className={styles.checkIcon} aria-hidden /> {feedback?.text}
                </>
              ) : (
                "That's okay. Let's look at how this one is solved, one small step at a time. Then you can try a new one."
              )}
            </p>
            <p className={styles.answerLine}>
              Answer: <MathText text={q.answerText} inline />
            </p>
          </div>

          {phase === "revealed" || q.steps.length ? (
            <details className={styles.steps} open={phase === "revealed"}>
              <summary>{phase === "revealed" ? "The worked solution" : "See how it works"}</summary>
              <div className={styles.stepList}>
                {q.steps.map((s, i) => (
                  <StepCard key={i} number={i + 1} step={s} />
                ))}
              </div>
            </details>
          ) : null}

          {result?.events.map((e, i) => (
            <div key={i} className={styles.event}>
              {e.type === "level-mastered" ? `Brilliant! You've mastered the ${LEVEL_LABEL[e.level]} level of this skill.` : null}
              {e.type === "understood" ? "Amazing! You now understand this skill. It's confirmed over more than one day." : null}
              {e.type === "needs-help" ? "This skill needs a little more teaching. That's fine, we'll go back over it together." : null}
              {e.type === "stepped-back" ? `Let's practise a step easier for a while (${LEVEL_LABEL[e.to]}). We'll build back up.` : null}
            </div>
          ))}

          <Button size="lg" className={styles.next} onClick={() => onDone({ outcome: outcomeNow, record: result, question: q })} disabled={record.isPending}>
            {record.isPending ? <Spinner size="sm" /> : null}
            {nextLabel ?? (phase === "revealed" ? "Try a new one" : "Next question")} <ChevronRight size={20} />
          </Button>
        </div>
      )}
    </div>
  );
};
