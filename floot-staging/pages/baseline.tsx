import React, { useEffect, useState } from "react";
import { Helmet } from "react-helmet";
import { Link } from "react-router-dom";
import { ArrowRight, Coffee, HelpCircle, Sparkles } from "lucide-react";
import { useAnswerBaseline, useBaselineState, useStartBaseline } from "../helpers/useBaselineData";
import { useLearnerMe } from "../helpers/useLearnerData";
import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { Input } from "../components/Input";
import { MathText } from "../components/MathText";
import { MathVisual } from "../components/MathVisual";
import { Skeleton } from "../components/Skeleton";
import { Spinner } from "../components/Spinner";
import styles from "./baseline.module.css";

const RESULT_LABEL = { strong: "Strong", developing: "Getting there", "needs-foundation": "Let's build this up" } as const;

const BaselinePage: React.FC = () => {
  const me = useLearnerMe();
  const state = useBaselineState();
  const start = useStartBaseline();
  const answer = useAnswerBaseline();
  const [value, setValue] = useState("");
  const [breakSeen, setBreakSeen] = useState(-1);
  const [error, setError] = useState<string | null>(null);
  const s = state.data?.state;
  const qid = s?.current?.question.id;

  useEffect(() => {
    setValue("");
    setError(null);
  }, [qid]);

  const submit = (given: string | null) => {
    if (!s?.current) return;
    setError(null);
    answer.mutate(
      { questionId: s.current.question.id, answer: given },
      { onError: (e) => setError(e instanceof Error ? e.message : "Something went wrong. Please try again.") }
    );
  };

  const name = me.data?.learner?.name ?? "there";
  const onBreak = !!s && s.status === "in_progress" && s.breakSuggested && breakSeen !== s.answered;

  return (
    <div className={styles.page}>
      <Helmet>
        <title>My Check-up · My Maths Tutor</title>
      </Helmet>

      {state.isLoading || !s ? (
        <Skeleton style={{ height: 260 }} />
      ) : s.status === "none" ? (
        <Card tone="primary" className={styles.intro}>
          <Sparkles size={34} aria-hidden />
          <h1 className={styles.title}>Hi {name}! Let's see what you already know.</h1>
          <ul className={styles.points}>
            <li>This is a friendly check-up, not a test. There are no marks.</li>
            <li>The questions start easy. If something is hard, tap <strong>"I'm not sure yet"</strong>. That is a good answer!</li>
            <li>You can take a break any time and carry on later.</li>
            <li>It takes about 15 to 20 minutes. Afterwards I make a plan just for you.</li>
          </ul>
          <Button size="lg" className={styles.cta} onClick={() => start.mutate({})} disabled={start.isPending}>
            {start.isPending ? <Spinner size="sm" /> : <>Let's start <ArrowRight size={20} /></>}
          </Button>
        </Card>
      ) : s.status === "completed" && s.plan ? (
        <div className={styles.stack}>
          <Card tone="primary" className={styles.intro}>
            <Sparkles size={34} aria-hidden />
            <h1 className={styles.title}>Well done, {name}! Your plan is ready.</h1>
            <p className={styles.lead}>{s.plan.message}</p>
            <Button asChild size="lg" className={styles.cta}>
              <Link to="/">
                Go to my home page <ArrowRight size={20} />
              </Link>
            </Button>
          </Card>
          {s.plan.strengths.length ? (
            <Card tone="success" className={styles.stack}>
              <h2 className={styles.h2}>What you're good at</h2>
              <ul className={styles.list}>
                {s.plan.strengths.map((x) => (
                  <li key={x}>{x}</li>
                ))}
              </ul>
            </Card>
          ) : null}
          <Card className={styles.stack}>
            <h2 className={styles.h2}>Topic by topic</h2>
            <ul className={styles.outcomes}>
              {s.plan.outcomes.map((o) => (
                <li key={o.areaId} className={`${styles.outcome} ${styles[o.result === "needs-foundation" ? "help" : o.result]}`}>
                  <strong>{o.label}</strong>
                  <span className={styles.tag}>{RESULT_LABEL[o.result]}</span>
                  <span className={styles.note}>{o.note}</span>
                </li>
              ))}
            </ul>
          </Card>
          <Button variant="ghost" onClick={() => start.mutate({ restart: true })} disabled={start.isPending}>
            Do the check-up again
          </Button>
        </div>
      ) : onBreak ? (
        <Card tone="warm" className={styles.intro}>
          <Coffee size={34} aria-hidden />
          <h1 className={styles.title}>Nice work! Time for a little break?</h1>
          <p className={styles.lead}>You've answered {s.answered} questions. Have some water or stretch your legs. Your place is saved, so you can come back whenever you like.</p>
          <Button size="lg" className={styles.cta} onClick={() => setBreakSeen(s.answered)}>
            I'm ready, carry on <ArrowRight size={20} />
          </Button>
          <Button asChild variant="ghost">
            <Link to="/">Finish later</Link>
          </Button>
        </Card>
      ) : s.current ? (
        <div className={styles.stack}>
          <div className={styles.progress}>
            <span>
              Question {s.answered + 1} <span className={styles.muted}>of about {s.estimatedTotal}</span>
            </span>
            <span className={styles.area}>{s.current.areaLabel}</span>
          </div>
          <div className={styles.bar} aria-hidden>
            <div className={styles.barFill} style={{ width: `${Math.min(100, Math.round((s.answered / Math.max(1, s.estimatedTotal)) * 100))}%` }} />
          </div>

          <Card className={styles.q}>
            <MathText text={s.current.question.prompt} className={styles.prompt} />
            {s.current.question.visual ? <MathVisual visual={s.current.question.visual} /> : null}

            {s.current.question.kind === "choice" && s.current.question.choices ? (
              <div className={styles.choices} role="radiogroup" aria-label="Choose an answer">
                {s.current.question.choices.map((c) => (
                  <button key={c} type="button" role="radio" aria-checked={value === c} className={`${styles.choice} ${value === c ? styles.chosen : ""}`} onClick={() => setValue(c)}>
                    <MathText text={c} inline />
                  </button>
                ))}
              </div>
            ) : (
              <div className={styles.answerRow}>
                <Input
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && value.trim() && submit(value)}
                  placeholder={s.current.question.placeholder ?? "Type your answer"}
                  autoComplete="off"
                  autoCapitalize="off"
                  autoCorrect="off"
                  spellCheck={false}
                  aria-label="Your answer"
                  className={styles.input}
                />
                {s.current.question.unit ? <span className={styles.unit}>{s.current.question.unit}</span> : null}
              </div>
            )}

            {error ? <p className={styles.error} role="alert">{error}</p> : null}

            <div className={styles.actions}>
              <Button size="lg" className={styles.cta} disabled={!value.trim() || answer.isPending} onClick={() => submit(value)}>
                {answer.isPending ? <Spinner size="sm" /> : <>Next <ArrowRight size={20} /></>}
              </Button>
              <Button size="lg" variant="outline" disabled={answer.isPending} onClick={() => submit(null)}>
                <HelpCircle size={18} /> I'm not sure yet
              </Button>
            </div>
          </Card>
          <p className={styles.muted}>I won't show if an answer is right or wrong during the check-up. We'll go through everything together afterwards.</p>
        </div>
      ) : (
        <Card className={styles.stack}>
          <p>Something went a little wrong with your check-up.</p>
          <Button onClick={() => start.mutate({ restart: true })}>Start again</Button>
        </Card>
      )}
    </div>
  );
};

export default BaselinePage;
