import React, { useState } from "react";
import { Helmet } from "react-helmet";
import { Link, useParams } from "react-router-dom";
import { BookOpen, CheckCircle2, Coffee, MessageCircleHeart } from "lucide-react";
import { curriculumRegistry } from "../helpers/curriculumRegistry";
import { LEVELS, LEVEL_LABEL, type Level } from "../helpers/curriculumTypes";
import { foundationSkillById } from "../helpers/foundationSkills";
import { MASTERY } from "../helpers/mastery";
import { generateQuestion, randomSeed } from "../helpers/questionRegistry";
import { useLearnerMe, useProgress } from "../helpers/useLearnerData";
import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { MathText } from "../components/MathText";
import { MathVisual } from "../components/MathVisual";
import { PageHeader } from "../components/PageHeader";
import { QuestionRunner } from "../components/QuestionRunner";
import { StatusPill } from "../components/StatusPill";
import styles from "./practice.$subtopicId.module.css";

const PracticeSessionPage: React.FC = () => {
  const { subtopicId = "" } = useParams();
  const me = useLearnerMe();
  const progress = useProgress();
  const grade = me.data?.learner?.grade ?? 8;
  const ref = curriculumRegistry.subtopic(grade, subtopicId);
  const foundation = foundationSkillById(subtopicId);
  const generator = ref?.subtopic.generator ?? (foundation ? foundation.id : "");
  const sp = progress.data?.summary.subtopics[subtopicId];

  const [manual, setManual] = useState<Level | null>(null);
  const [seed, setSeed] = useState(() => randomSeed());
  const [done, setDone] = useState(0);
  const [breakShown, setBreakShown] = useState(false);

  if (!generator) {
    return (
      <Card>
        <p>We couldn't find that skill.</p>
        <Button asChild>
          <Link to="/practice">Back to practice</Link>
        </Button>
      </Card>
    );
  }

  const recommended: Level = sp?.recommendedLevel ?? "beginner";
  const level: Level = foundation ? "beginner" : manual ?? recommended;
  const question = generateQuestion(generator, level, seed);
  const lv = sp?.levels[level];
  const name = ref?.subtopic.name ?? foundation?.name ?? "Practice";
  const showBreak = done > 0 && done % 8 === 0 && !breakShown;

  return (
    <div className={styles.page}>
      <Helmet>
        <title>{name} · Practice</title>
      </Helmet>
      <PageHeader title={name} backTo="/practice" backLabel="All practice" subtitle={ref ? ref.topic.name : "Warm-up: a basic skill that helps with Grade 8"} />

      {foundation ? (
        <Card tone="soft" className={styles.refresher}>
          <h2 className={styles.h2}>A quick reminder</h2>
          <p className={styles.muted}>{foundation.intro}</p>
          {foundation.explain.map((b, i) => (
            <div key={i}>
              {b.heading ? <h3 className={styles.h3}>{b.heading}</h3> : null}
              <MathText text={b.body} />
              {b.visual ? <MathVisual visual={b.visual} /> : null}
            </div>
          ))}
        </Card>
      ) : (
        <>
          <div className={styles.levels} role="tablist" aria-label="Level">
            {LEVELS.map((l) => {
              const mastered = sp?.masteredLevels.includes(l);
              return (
                <button
                  key={l}
                  type="button"
                  role="tab"
                  aria-selected={level === l}
                  className={`${styles.level} ${level === l ? styles.levelOn : ""}`}
                  onClick={() => {
                    setManual(l === recommended ? null : l);
                    setSeed(randomSeed());
                  }}
                >
                  {mastered ? <CheckCircle2 size={16} aria-hidden /> : null}
                  <span>{LEVEL_LABEL[l]}</span>
                  {l === recommended && !mastered ? <span className={styles.rec}>for you</span> : null}
                </button>
              );
            })}
          </div>

          <Card tone="soft" className={styles.meter}>
            <div className={styles.meterTop}>
              <strong>{LEVEL_LABEL[level]} level</strong>
              {sp ? <StatusPill status={sp.status} compact /> : null}
            </div>
            <div className={styles.dots} aria-label={`${lv?.windowClean ?? 0} of ${MASTERY.requiredClean} clean answers`}>
              {Array.from({ length: MASTERY.requiredClean }, (_, i) => (
                <span key={i} className={`${styles.dot} ${i < (lv?.windowClean ?? 0) ? styles.dotOn : ""}`} />
              ))}
            </div>
            <p className={styles.muted}>
              {lv?.mastered
                ? "You've mastered this level. Try the next one when you're ready!"
                : `To master this level: answer ${MASTERY.requiredClean} of your last ${MASTERY.windowSize} questions correctly, without hints.`}
            </p>
            {sp?.awaitingSecondDay ? <p className={styles.muted}>All levels done! Come back on another day to confirm it. That's what makes it stick.</p> : null}
          </Card>
        </>
      )}

      {showBreak ? (
        <Card tone="warm" className={styles.break}>
          <Coffee size={24} aria-hidden />
          <div>
            <strong>You've done {done} questions. Great focus!</strong>
            <p className={styles.muted}>A short break helps your brain remember. Want to stop here, or keep going?</p>
            <div className={styles.breakBtns}>
              <Button asChild variant="outline">
                <Link to="/progress">I'll stop for now</Link>
              </Button>
              <Button onClick={() => setBreakShown(true)}>Keep going</Button>
            </div>
          </div>
        </Card>
      ) : (
        <QuestionRunner
          key={`${generator}-${level}-${seed}`}
          question={question}
          source="practice"
          subtopicId={ref ? subtopicId : undefined}
          onDone={() => {
            setDone((d) => d + 1);
            setBreakShown(false);
            setSeed(randomSeed());
          }}
        />
      )}

      <div className={styles.links}>
        {ref ? (
          <Button asChild variant="ghost">
            <Link to={`/learn/${subtopicId}`}>
              <BookOpen size={18} /> Need a refresher? Open the lesson
            </Link>
          </Button>
        ) : null}
        <Button asChild variant="ghost">
          <Link to={`/tutor${ref ? `?subtopic=${subtopicId}` : ""}`}>
            <MessageCircleHeart size={18} /> Ask my tutor about this
          </Link>
        </Button>
      </div>
    </div>
  );
};

export default PracticeSessionPage;
