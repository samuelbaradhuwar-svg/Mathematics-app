import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, BookOpenCheck, ChevronLeft, ChevronRight, CircleHelp, Eye, PartyPopper, Sparkles, TriangleAlert } from "lucide-react";
import { curriculumRegistry } from "../helpers/curriculumRegistry";
import type { ExplainBlock } from "../helpers/curriculumTypes";
import { generateQuestion, randomSeed } from "../helpers/questionRegistry";
import { useLearnerMe, useLessonProgress, useProgress } from "../helpers/useLearnerData";
import { Button } from "./Button";
import { Card } from "./Card";
import { GuidedSolution } from "./GuidedSolution";
import { MathText } from "./MathText";
import { MathVisual } from "./MathVisual";
import { QuestionSet } from "./QuestionSet";
import type { RunnerResult } from "./QuestionRunner";
import { StepCard } from "./StepCard";
import { VideoList } from "./VideoList";
import styles from "./LessonPlayer.module.css";

type Stage = "explain" | "see" | "together" | "try" | "check" | "done";
const STAGES: { id: Exclude<Stage, "done">; label: string }[] = [
  { id: "explain", label: "EXPLAIN" },
  { id: "see", label: "SEE IT" },
  { id: "together", label: "TOGETHER" },
  { id: "try", label: "YOU TRY" },
  { id: "check", label: "CHECK" },
];

type CardDef =
  | { kind: "intro" }
  | { kind: "block"; block: ExplainBlock; alt: ExplainBlock | undefined }
  | { kind: "terms" }
  | { kind: "rules" };

export const LessonPlayer: React.FC<{ subtopicId: string }> = ({ subtopicId }) => {
  const me = useLearnerMe();
  const grade = me.data?.learner?.grade ?? 8;
  const ref = curriculumRegistry.subtopic(grade, subtopicId);
  const progress = useProgress();
  const lessonProgress = useLessonProgress();

  const [stage, setStage] = useState<Stage>("explain");
  const [cardIdx, setCardIdx] = useState(0);
  const [confused, setConfused] = useState<Record<number, number>>({});
  const [exIdx, setExIdx] = useState(0);
  const [stepsShown, setStepsShown] = useState(0);
  const [seed] = useState(() => randomSeed());
  const [checkResults, setCheckResults] = useState<RunnerResult[] | null>(null);

  const sub = ref?.subtopic;

  const cards = useMemo<CardDef[]>(() => {
    if (!sub) return [];
    const list: CardDef[] = [{ kind: "intro" }];
    sub.explain.forEach((block, i) => list.push({ kind: "block", block, alt: sub.altExplain[Math.min(i, sub.altExplain.length - 1)] }));
    if (sub.terms.length) list.push({ kind: "terms" });
    if (sub.rules.length) list.push({ kind: "rules" });
    return list;
  }, [sub]);

  // Save which stage Judah is on (this is also what marks the lesson as "started").
  useEffect(() => {
    if (!sub) return;
    lessonProgress.mutate({ subtopicId, stage, completed: stage === "done" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage, subtopicId]);

  if (!ref || !sub) {
    return (
      <Card>
        <p>We couldn't find that lesson.</p>
        <Button asChild>
          <Link to="/lessons">Back to my lessons</Link>
        </Button>
      </Card>
    );
  }

  const { topic } = ref;
  const sp = progress.data?.summary.subtopics[subtopicId];
  const checkLevel = sp && sp.masteredLevels.includes("beginner") ? (sp.masteredLevels.includes("intermediate") ? "advanced" : "intermediate") : "beginner";
  const together = generateQuestion(sub.generator, "beginner", seed);
  const stageIndex = STAGES.findIndex((s) => s.id === stage);

  const card = cards[cardIdx];
  const confusion = confused[cardIdx] ?? 0;
  const example = sub.workedExamples[exIdx];

  const tracker = (
    <ol className={styles.tracker} aria-label="Lesson steps">
      {STAGES.map((s, i) => (
        <li key={s.id} className={`${styles.trackItem} ${i < stageIndex || stage === "done" ? styles.trackDone : ""} ${i === stageIndex ? styles.trackNow : ""}`}>
          <span className={styles.trackDot}>{i < stageIndex || stage === "done" ? "✓" : i + 1}</span>
          <span className={styles.trackLabel}>{s.label}</span>
        </li>
      ))}
    </ol>
  );

  return (
    <div className={styles.player}>
      <Link to={`/lessons/${topic.id}`} className={styles.back}>
        <ChevronLeft size={18} aria-hidden /> {topic.name}
      </Link>
      <h1 className={styles.title}>{sub.name}</h1>
      {tracker}

      {stage === "explain" && card ? (
        <div className={styles.stageBody}>
          <div className={styles.cardCount}>
            Idea {cardIdx + 1} of {cards.length}
          </div>

          {card.kind === "intro" ? (
            <Card className={styles.lessonCard}>
              <h2 className={styles.h2}>In this lesson</h2>
              <ul className={styles.list}>
                {sub.objectives.map((o) => (
                  <li key={o}>
                    <MathText text={o} inline />
                  </li>
                ))}
              </ul>
              {sub.priorKnowledge.length ? (
                <>
                  <h3 className={styles.h3}>Before we start, it helps to know</h3>
                  <ul className={styles.list}>
                    {sub.priorKnowledge.map((o) => (
                      <li key={o}>{o}</li>
                    ))}
                  </ul>
                </>
              ) : null}
              <div className={styles.callout}>
                <Sparkles size={18} aria-hidden /> <MathText text={sub.realWorld} inline />
              </div>
              <p className={styles.reassure}>We'll go slowly, one idea at a time. You can always tap "I don't understand".</p>
            </Card>
          ) : null}

          {card.kind === "block" ? (
            <>
              <Card className={styles.lessonCard}>
                {card.block.heading ? <h2 className={styles.h2}>{card.block.heading}</h2> : null}
                <MathText text={card.block.body} className={styles.body} />
                {card.block.example ? (
                  <div className={styles.example}>
                    <MathText text={card.block.example} />
                  </div>
                ) : null}
                {card.block.visual ? <MathVisual visual={card.block.visual} /> : null}
              </Card>

              {confusion > 0 && card.alt ? (
                <Card tone="warm" className={styles.lessonCard}>
                  <h3 className={styles.h3}>Let's try it a different way</h3>
                  {confusion === 1 ? (
                    <>
                      {card.alt.heading ? <h4 className={styles.h4}>{card.alt.heading}</h4> : null}
                      <MathText text={card.alt.body} className={styles.body} />
                      {card.alt.example ? (
                        <div className={styles.example}>
                          <MathText text={card.alt.example} />
                        </div>
                      ) : null}
                      {card.alt.visual ? <MathVisual visual={card.alt.visual} /> : null}
                    </>
                  ) : (
                    <>
                      <p className={styles.body}>That's completely okay. Some ideas take a few tries. Here are three things we can do:</p>
                      <div className={styles.helpBtns}>
                        <Button asChild variant="outline">
                          <Link to={`/tutor?subtopic=${subtopicId}`}>Ask my tutor to explain</Link>
                        </Button>
                        {sub.prerequisites[0] ? (
                          <Button asChild variant="outline">
                            <Link to={`/learn/${sub.prerequisites[0]}`}>Go back to the building block first</Link>
                          </Button>
                        ) : null}
                        <Button asChild variant="outline">
                          <Link to={`/videos?subtopic=${subtopicId}`}>Watch a video about it</Link>
                        </Button>
                      </div>
                    </>
                  )}
                </Card>
              ) : null}
            </>
          ) : null}

          {card.kind === "terms" ? (
            <Card className={styles.lessonCard}>
              <h2 className={styles.h2}>Words to know</h2>
              <dl className={styles.terms}>
                {sub.terms.map((t) => (
                  <div key={t.word} className={styles.term}>
                    <dt>{t.word}</dt>
                    <dd>
                      <MathText text={t.meaning} inline />
                    </dd>
                  </div>
                ))}
              </dl>
            </Card>
          ) : null}

          {card.kind === "rules" ? (
            <Card className={styles.lessonCard}>
              <h2 className={styles.h2}>Remember</h2>
              <ul className={styles.rules}>
                {sub.rules.map((r) => (
                  <li key={r}>
                    <MathText text={r} inline />
                  </li>
                ))}
              </ul>
            </Card>
          ) : null}

          <div className={styles.nav}>
            {card.kind === "block" ? (
              <Button variant="outline" size="lg" className={styles.confused} onClick={() => setConfused((c) => ({ ...c, [cardIdx]: Math.min(2, (c[cardIdx] ?? 0) + 1) }))}>
                <CircleHelp size={20} /> {confusion === 0 ? "I don't understand this" : confusion === 1 ? "Still not clear" : "Still confusing"}
              </Button>
            ) : null}
            <div className={styles.navRow}>
              <Button variant="ghost" size="lg" onClick={() => setCardIdx((i) => Math.max(0, i - 1))} disabled={cardIdx === 0}>
                <ChevronLeft size={20} /> Back
              </Button>
              {cardIdx < cards.length - 1 ? (
                <Button size="lg" className={styles.primaryBtn} onClick={() => setCardIdx((i) => i + 1)}>
                  I get it, next <ChevronRight size={20} />
                </Button>
              ) : (
                <Button
                  size="lg"
                  className={styles.primaryBtn}
                  onClick={() => {
                    setStage("see");
                    setStepsShown(0);
                    setExIdx(0);
                  }}
                >
                  Show me an example <ChevronRight size={20} />
                </Button>
              )}
            </div>
          </div>
        </div>
      ) : null}

      {stage === "see" && example ? (
        <div className={styles.stageBody}>
          <Card className={styles.lessonCard}>
            <h2 className={styles.h2}>{example.title}</h2>
            <div className={styles.problem}>
              <MathText text={example.problem} />
              {example.visual ? <MathVisual visual={example.visual} /> : null}
            </div>
          </Card>
          <div className={styles.steps}>
            {example.steps.slice(0, stepsShown).map((s, i) => (
              <StepCard key={i} number={i + 1} step={s} state={i === stepsShown - 1 ? "current" : "done"} />
            ))}
          </div>

          {stepsShown < example.steps.length ? (
            <Button size="lg" className={styles.primaryBtn} onClick={() => setStepsShown((n) => n + 1)}>
              <Eye size={20} /> {stepsShown === 0 ? "Show the first step" : "Show the next step"}
            </Button>
          ) : (
            <>
              <div className={styles.answerBox}>
                Answer: <MathText text={example.answer} inline />
              </div>
              {sub.mistakes.length ? (
                <Card tone="warm" className={styles.lessonCard}>
                  <h3 className={styles.h3}>
                    <TriangleAlert size={18} aria-hidden /> Watch out! Common slips
                  </h3>
                  <ul className={styles.list}>
                    {sub.mistakes.map((m) => (
                      <li key={m.tag}>
                        <strong>Slip:</strong> <MathText text={m.mistake} inline />
                        <br />
                        <strong>Fix:</strong> <MathText text={m.fix} inline />
                      </li>
                    ))}
                  </ul>
                </Card>
              ) : null}
              <div className={styles.navRow}>
                <Button variant="ghost" size="lg" onClick={() => setStepsShown(0)}>
                  See it again
                </Button>
                {exIdx < sub.workedExamples.length - 1 ? (
                  <Button
                    size="lg"
                    className={styles.primaryBtn}
                    onClick={() => {
                      setExIdx(exIdx + 1);
                      setStepsShown(0);
                    }}
                  >
                    Another example <ChevronRight size={20} />
                  </Button>
                ) : (
                  <Button size="lg" className={styles.primaryBtn} onClick={() => setStage("together")}>
                    Let's do one together <ChevronRight size={20} />
                  </Button>
                )}
              </div>
            </>
          )}
        </div>
      ) : null}

      {stage === "together" ? (
        <div className={styles.stageBody}>
          <Card tone="soft" className={styles.lessonCard}>
            <h2 className={styles.h2}>Now we do one together</h2>
            <p className={styles.body}>I'll show each step. When you see "Your turn", answer the small question first.</p>
          </Card>
          <GuidedSolution key={seed} question={together} onDone={() => setStage("try")} />
        </div>
      ) : null}

      {stage === "try" ? (
        <div className={styles.stageBody}>
          <Card tone="soft" className={styles.lessonCard}>
            <h2 className={styles.h2}>Now you try</h2>
            <p className={styles.body}>Three questions on your own. I won't tell you the answer, but you can ask for hints.</p>
          </Card>
          <QuestionSet generator={sub.generator} level="beginner" count={3} source="lesson" subtopicId={subtopicId} onFinish={() => setStage("check")} />
        </div>
      ) : null}

      {stage === "check" ? (
        <div className={styles.stageBody}>
          <Card tone="soft" className={styles.lessonCard}>
            <h2 className={styles.h2}>Let's check your understanding</h2>
            <p className={styles.body}>Three more questions {checkLevel === "beginner" ? "" : `(${checkLevel} level) `}to see how it's going. There's no pressure.</p>
          </Card>
          <QuestionSet
            generator={sub.generator}
            level={checkLevel}
            count={3}
            source="lesson"
            subtopicId={subtopicId}
            onFinish={(r) => {
              setCheckResults(r);
              setStage("done");
            }}
          />
        </div>
      ) : null}

      {stage === "done" ? (
        <div className={styles.stageBody}>
          <Card tone="primary" className={styles.doneCard}>
            <PartyPopper size={36} aria-hidden />
            <h2 className={styles.doneTitle}>Lesson finished!</h2>
            {checkResults ? (
              <p className={styles.doneText}>
                {(() => {
                  const clean = checkResults.filter((r) => r.outcome === "clean").length;
                  const ok = checkResults.filter((r) => r.outcome !== "incorrect").length;
                  if (clean >= 2) return `You got ${clean} of 3 right all by yourself. That's a great start!`;
                  if (ok >= 2) return `You got ${ok} of 3 right. Some needed a hint, and that's fine. A little more practice will help.`;
                  return "That one was tricky, and that's completely okay. Let's go over it once more and practise a bit, slowly.";
                })()}
              </p>
            ) : null}
            <p className={styles.doneText}>One correct answer is not the same as understanding it, so we'll keep practising until it feels easy.</p>
          </Card>

          <div className={styles.doneBtns}>
            <Button asChild size="lg" className={styles.primaryBtn}>
              <Link to={`/practice/${subtopicId}`}>
                <BookOpenCheck size={20} /> Practise this skill
              </Link>
            </Button>
            {(() => {
              const nx = curriculumRegistry.nextInTopic(grade, subtopicId);
              return nx ? (
                <Button asChild variant="outline" size="lg">
                  <Link to={`/learn/${nx.id}`}>
                    Next lesson: {nx.name} <ArrowRight size={18} />
                  </Link>
                </Button>
              ) : (
                <Button asChild variant="outline" size="lg">
                  <Link to={`/lessons/${topic.id}`}>Back to {topic.name}</Link>
                </Button>
              );
            })()}
            <Button
              variant="ghost"
              size="lg"
              onClick={() => {
                setStage("explain");
                setCardIdx(0);
                setConfused({});
              }}
            >
              Go through the lesson again
            </Button>
          </div>

          <h3 className={styles.h3}>Videos about this</h3>
          <VideoList subtopicId={subtopicId} compact />
        </div>
      ) : null}
    </div>
  );
};
