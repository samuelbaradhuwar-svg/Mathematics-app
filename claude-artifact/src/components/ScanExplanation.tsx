import React, { useState } from "react";
import { Link } from "react-router-dom";
import { BadgeCheck, ChevronRight, Eye, Lightbulb, MessageCircleHeart, ScanLine, ShieldAlert } from "lucide-react";
import type { ScanExplanationDto } from "../helpers/scanTypes";
import { useScanPractice } from "../helpers/useScanData";
import type { OutputType as PracticeResult } from "../endpoints/scan/practice_POST.schema";
import { Button } from "./Button";
import { Card } from "./Card";
import { Input } from "./Input";
import { MathText } from "./MathText";
import { MathVisual } from "./MathVisual";
import { Spinner } from "./Spinner";
import { StepCard } from "./StepCard";
import styles from "./ScanExplanation.module.css";

const VerificationBanner: React.FC<{ v: ScanExplanationDto["verification"] }> = ({ v }) => {
  const good = v.status === "calculator-checked" || v.status === "double-checked";
  return (
    <div className={`${styles.verify} ${good ? styles.verifyGood : styles.verifyWarn}`} role="status">
      {good ? <BadgeCheck size={22} aria-hidden /> : <ShieldAlert size={22} aria-hidden />}
      <span>{v.note}</span>
    </div>
  );
};

const PracticeBox: React.FC<{ e: ScanExplanationDto; onAnother: () => void }> = ({ e, onAnother }) => {
  const p = e.practice;
  const mutation = useScanPractice();
  const [answer, setAnswer] = useState("");
  const [hints, setHints] = useState(0);
  const [tries, setTries] = useState(0);
  const [result, setResult] = useState<PracticeResult | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  if (!p) return null;
  const finished = result?.solution !== undefined;

  const submit = (revealed: boolean) => {
    if (!revealed && !answer.trim()) {
      setMsg("Type your answer first. Or tap a hint if you need help.");
      return;
    }
    setMsg(null);
    mutation.mutate(
      { scanId: e.scanId, givenAnswer: answer, hintsUsed: hints, tries: Math.max(1, revealed ? tries : tries + 1), revealed },
      {
        onSuccess: (r) => {
          setResult(r);
          if (r.status === "incorrect") {
            setTries((t) => t + 1);
            setMsg("Not quite yet, and that's okay. Look at the steps above, try a hint, and have another go.");
          } else if (r.status === "unreadable" || r.status === "almost") {
            setMsg(r.note ?? "Please check how you wrote it.");
          } else setMsg(null);
        },
        onError: (err) => setMsg(err instanceof Error ? err.message : "Something went wrong."),
      }
    );
  };

  return (
    <Card className={styles.section}>
      <h2 className={styles.h2}>Your turn!</h2>
      <p className={styles.muted}>Try a similar question yourself. {p.source === "curriculum" ? "(This one comes from your Grade 8 lessons.)" : ""}</p>
      <div className={styles.practiceQ}>
        <MathText text={p.question} />
        {p.visual ? <MathVisual visual={p.visual} /> : null}
      </div>

      {!finished ? (
        <>
          {p.kind === "choice" && p.choices ? (
            <div className={styles.choices}>
              {p.choices.map((c) => (
                <button key={c} type="button" className={`${styles.choice} ${answer === c ? styles.chosen : ""}`} onClick={() => setAnswer(c)}>
                  <MathText text={c} inline />
                </button>
              ))}
            </div>
          ) : (
            <Input value={answer} onChange={(ev) => setAnswer(ev.target.value)} onKeyDown={(ev) => ev.key === "Enter" && submit(false)} placeholder="Type your answer" className={styles.input} autoComplete="off" aria-label="Your answer" />
          )}
          {msg ? <p className={styles.msg}>{msg}</p> : null}
          {p.hints.slice(0, hints).map((h, i) => (
            <div key={i} className={styles.hint}>
              <strong>Hint {i + 1}:</strong> <MathText text={h} inline />
            </div>
          ))}
          <div className={styles.btnRow}>
            <Button size="lg" onClick={() => submit(false)} disabled={mutation.isPending}>
              {mutation.isPending ? <Spinner size="sm" /> : "Check my answer"}
            </Button>
            <Button variant="outline" size="lg" onClick={() => setHints((h) => Math.min(p.hints.length, h + 1))} disabled={hints >= p.hints.length}>
              <Lightbulb size={18} /> {hints === 0 ? "Hint" : "Another hint"}
            </Button>
            {tries >= 2 || hints >= p.hints.length ? (
              <Button variant="ghost" size="lg" onClick={() => submit(true)}>
                <Eye size={18} /> Show me how
              </Button>
            ) : null}
          </div>
        </>
      ) : (
        <div className={styles.solved}>
          <div className={`${styles.verify} ${result?.outcome === "incorrect" ? styles.verifyWarn : styles.verifyGood}`}>
            {result?.outcome === "incorrect" ? "That's okay. Here is how it's solved, step by step." : result?.outcome === "clean" ? "Yes! You got it all by yourself." : "That's right! Using hints is part of learning."}
          </div>
          <p className={styles.answerLine}>
            Answer: <MathText text={result?.solution?.answerText} inline />
          </p>
          <div className={styles.stepList}>
            {result?.solution?.steps.map((s, i) => (
              <StepCard key={i} number={i + 1} step={s} />
            ))}
          </div>
          <Button size="lg" onClick={onAnother}>
            <ScanLine size={20} /> Scan another question
          </Button>
        </div>
      )}
    </Card>
  );
};

export const ScanExplanation: React.FC<{ explanation: ScanExplanationDto; onAnother: () => void }> = ({ explanation: e, onAnother }) => {
  const [shown, setShown] = useState(1);
  const allShown = shown >= e.steps.length;

  return (
    <div className={styles.wrap}>
      <VerificationBanner v={e.verification} />

      <Card tone="soft" className={styles.section}>
        <p className={styles.eyebrow}>{e.topicName}</p>
        <div className={styles.question}>
          <MathText text={e.question} />
        </div>
      </Card>

      <Card className={styles.section}>
        <h2 className={styles.h2}>What is it asking?</h2>
        <MathText text={e.asking} />
      </Card>

      {e.concepts.length ? (
        <Card className={styles.section}>
          <h2 className={styles.h2}>Ideas you need</h2>
          <div className={styles.concepts}>
            {e.concepts.map((c) => (
              <div key={c.name} className={styles.concept}>
                <strong>{c.name}</strong>
                <MathText text={c.explanation} />
              </div>
            ))}
          </div>
        </Card>
      ) : null}

      <div className={styles.section}>
        <h2 className={styles.h2}>Step by step</h2>
        <div className={styles.stepList}>
          {e.steps.slice(0, shown).map((s, i) => (
            <StepCard key={i} number={i + 1} step={s} state={i === shown - 1 && !allShown ? "current" : "done"} />
          ))}
        </div>
        {!allShown ? (
          <div className={styles.btnRow}>
            <Button size="lg" className={styles.grow} onClick={() => setShown((n) => n + 1)}>
              Show the next step <ChevronRight size={20} />
            </Button>
            <Button variant="ghost" size="lg" onClick={() => setShown(e.steps.length)}>
              Show all steps
            </Button>
          </div>
        ) : null}
      </div>

      {allShown ? (
        <>
          <Card tone="success" className={styles.section}>
            <p className={styles.eyebrow}>Our answer</p>
            <div className={styles.final}>
              <MathText text={e.finalAnswer} />
            </div>
            {e.check ? <MathText text={e.check} /> : null}
          </Card>

          {e.alternative ? (
            <details className={styles.details}>
              <summary>Another way to do it</summary>
              <MathText text={e.alternative} />
            </details>
          ) : null}

          <details className={styles.details}>
            <summary>A similar example, worked out</summary>
            <div className={styles.question}>
              <MathText text={e.similar.problem} />
            </div>
            <div className={styles.stepList}>
              {e.similar.steps.map((s, i) => (
                <StepCard key={i} number={i + 1} step={s} />
              ))}
            </div>
            <p className={styles.answerLine}>
              Answer: <MathText text={e.similar.answer} inline />
            </p>
          </details>

          <PracticeBox e={e} onAnother={onAnother} />

          {e.encouragement ? <p className={styles.encourage}>{e.encouragement}</p> : null}

          <div className={styles.footerBtns}>
            <Button asChild variant="outline" size="lg">
              <Link to={e.subtopicId ? `/tutor?subtopic=${e.subtopicId}` : "/tutor"}>
                <MessageCircleHeart size={18} /> Still confused? Ask my tutor
              </Link>
            </Button>
            {e.subtopicId ? (
              <Button asChild variant="outline" size="lg">
                <Link to={`/learn/${e.subtopicId}`}>Open the lesson on this</Link>
              </Button>
            ) : null}
          </div>
        </>
      ) : null}
    </div>
  );
};
