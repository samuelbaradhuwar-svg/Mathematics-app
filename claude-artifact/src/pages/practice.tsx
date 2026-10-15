import React from "react";
import { Helmet } from "react-helmet";
import { Link } from "react-router-dom";
import { ArrowRight, PenLine, Sparkles } from "lucide-react";
import { curriculumRegistry } from "../helpers/curriculumRegistry";
import { LEVEL_LABEL } from "../helpers/curriculumTypes";
import { FOUNDATION_SKILLS } from "../helpers/foundationSkills";
import { recommendationLink, recommendationVerb } from "../helpers/recommendationLink";
import { useLearnerMe, useProgress } from "../helpers/useLearnerData";
import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { PageHeader } from "../components/PageHeader";
import { Skeleton } from "../components/Skeleton";
import { StatusPill } from "../components/StatusPill";
import { TopicIcon } from "../components/TopicIcon";
import styles from "./practice.module.css";

const PracticePage: React.FC = () => {
  const me = useLearnerMe();
  const progress = useProgress();
  const grade = me.data?.learner?.grade ?? 8;
  const topics = curriculumRegistry.topics(grade);
  const summary = progress.data?.summary;
  const rec = summary?.recommendation;
  const gaps = progress.data?.plan?.foundationGaps ?? [];

  return (
    <div className={styles.page}>
      <Helmet>
        <title>Practice · My Maths Tutor</title>
      </Helmet>
      <PageHeader title="Practice" subtitle="Questions that match your level. Hints are free, and mistakes are how we learn." icon={<PenLine size={28} />} />

      {progress.isLoading ? (
        <Skeleton style={{ height: 150 }} />
      ) : rec && rec.subtopicId ? (
        <Card tone="primary" className={styles.rec}>
          <p className={styles.recEyebrow}>
            <Sparkles size={16} aria-hidden /> Best next step
          </p>
          <h2 className={styles.recTitle}>{rec.title}</h2>
          <p className={styles.recText}>{rec.reason}</p>
          <Button asChild size="lg" className={styles.cta}>
            <Link to={recommendationLink(rec)}>
              {recommendationVerb(rec)} <ArrowRight size={20} />
            </Link>
          </Button>
        </Card>
      ) : null}

      {gaps.length ? (
        <Card tone="warm" className={styles.warm}>
          <h2 className={styles.h2}>Warm-ups</h2>
          <p className={styles.muted}>Your check-up showed a few basics to strengthen first. They make everything else easier.</p>
          <div className={styles.warmList}>
            {gaps.map((g) => {
              const skill = FOUNDATION_SKILLS.find((f) => f.id === g);
              return skill ? (
                <Button key={g} asChild variant="outline" size="lg" className={styles.warmBtn}>
                  <Link to={`/practice/${g}`}>{skill.name}</Link>
                </Button>
              ) : null;
            })}
          </div>
        </Card>
      ) : null}

      <h2 className={styles.h2}>All skills</h2>
      <div className={styles.topics}>
        {topics.map((t) => {
          const tp = summary?.topics.find((x) => x.topicId === t.id);
          return (
            <details key={t.id} className={styles.topic}>
              <summary className={styles.summary}>
                <span className={styles.icon}>
                  <TopicIcon name={t.icon} size={22} />
                </span>
                <span className={styles.topicName}>{t.name}</span>
                {tp ? <StatusPill status={tp.status} compact /> : null}
              </summary>
              <ul className={styles.subs}>
                {t.subtopics.map((s) => {
                  const sp = summary?.subtopics[s.id];
                  return (
                    <li key={s.id}>
                      <Link to={`/practice/${s.id}`} className={styles.sub}>
                        <span className={styles.subName}>{s.name}</span>
                        <span className={styles.subMeta}>
                          {sp && sp.status !== "not-started" ? <span>{LEVEL_LABEL[sp.recommendedLevel]}</span> : null}
                          {sp ? <StatusPill status={sp.status} compact /> : null}
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </details>
          );
        })}
      </div>
    </div>
  );
};

export default PracticePage;
