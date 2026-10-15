import React, { useState } from "react";
import { Helmet } from "react-helmet";
import { Link } from "react-router-dom";
import { ArrowRight, BarChart3, ChevronDown, Flame } from "lucide-react";
import { curriculumRegistry } from "../helpers/curriculumRegistry";
import { describeMistake } from "../helpers/learnerProfile";
import { STATUS_ORDER } from "../helpers/learningStatus";
import { recommendationLink, recommendationVerb } from "../helpers/recommendationLink";
import { useLearnerMe, useProgress } from "../helpers/useLearnerData";
import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { MiniBars } from "../components/MiniBars";
import { PageHeader } from "../components/PageHeader";
import { ProgressRing } from "../components/ProgressRing";
import { Skeleton } from "../components/Skeleton";
import { StatusPill } from "../components/StatusPill";
import { TopicIcon } from "../components/TopicIcon";
import styles from "./progress.module.css";

const when = (d: Date): string => {
  const days = Math.floor((Date.now() - new Date(d).getTime()) / 86400000);
  return days <= 0 ? "Today" : days === 1 ? "Yesterday" : `${days} days ago`;
};
const OUTCOME = { clean: "Got it", assisted: "Got it with help", incorrect: "Needs another go" } as const;
const ACTIVITY = { practice: "Practised", lesson: "Lesson", scan: "Scanned question", baseline: "Check-up" } as const;

const ProgressPage: React.FC = () => {
  const me = useLearnerMe();
  const progress = useProgress();
  const grade = me.data?.learner?.grade ?? 8;
  const [open, setOpen] = useState<string | null>(null);
  const data = progress.data;
  const s = data?.summary;
  const topics = curriculumRegistry.topics(grade);
  const topicProgress = new Map(s?.topics.map((t) => [t.topicId, t]));

  return (
    <div className={styles.page}>
      <Helmet>
        <title>My Progress · My Maths Tutor</title>
      </Helmet>
      <PageHeader title="My Progress" subtitle="See how far you've come. Every question you try helps you grow." icon={<BarChart3 size={28} />} />

      {!s ? (
        <Skeleton style={{ height: 220 }} />
      ) : (
        <>
          <Card className={styles.top}>
            <ProgressRing value={s.completion} sublabel="of Grade 8" />
            <div className={styles.topText}>
              <p className={styles.big}>
                {s.counts.understood} of {s.totalSubtopics} skills understood
              </p>
              <div className={styles.counts}>
                {STATUS_ORDER.map((st) => (
                  <div key={st} className={styles.countItem}>
                    <span className={styles.countNum}>{s.counts[st]}</span>
                    <StatusPill status={st} compact />
                  </div>
                ))}
              </div>
            </div>
          </Card>

          <Card tone="primary" className={styles.rec}>
            <p className={styles.eyebrow}>Recommended next</p>
            <h2 className={styles.recTitle}>{s.recommendation.title}</h2>
            <p className={styles.recText}>{s.recommendation.reason}</p>
            <Button asChild size="lg" className={styles.cta}>
              <Link to={recommendationLink(s.recommendation)}>
                {recommendationVerb(s.recommendation)} <ArrowRight size={20} />
              </Link>
            </Button>
          </Card>

          <div className={styles.statGrid}>
            <Card className={styles.stat}>
              <span className={styles.statNum}>{s.stats.totalQuestions}</span>
              <span className={styles.statLabel}>questions tried</span>
            </Card>
            <Card className={styles.stat}>
              <span className={styles.statNum}>{s.stats.totalQuestions ? `${Math.round(s.stats.accuracy)}%` : "-"}</span>
              <span className={styles.statLabel}>right (hints allowed)</span>
            </Card>
            <Card className={styles.stat}>
              <span className={styles.statNum}>{s.stats.totalQuestions ? `${Math.round(s.stats.cleanAccuracy)}%` : "-"}</span>
              <span className={styles.statLabel}>right with no hints</span>
            </Card>
            <Card className={styles.stat}>
              <span className={styles.statNum}>
                <Flame size={20} aria-hidden /> {s.stats.streak}
              </span>
              <span className={styles.statLabel}>day streak</span>
            </Card>
          </div>

          <Card className={styles.section}>
            <h2 className={styles.h2}>Questions each week</h2>
            <MiniBars
              ariaLabel="Questions answered per week"
              data={s.stats.weekly.slice(-6).map((w) => ({ label: w.weekStart.slice(5), value: w.questions, sub: w.questions ? `${Math.round(w.accuracy)}%` : "" }))}
            />
          </Card>

          {s.stats.recurringMistakes.length ? (
            <Card tone="help" className={styles.section}>
              <h2 className={styles.h2}>Things to watch out for</h2>
              <p className={styles.muted}>These slips keep coming up. Knowing them is the first step to fixing them.</p>
              <ul className={styles.mistakes}>
                {s.stats.recurringMistakes.slice(0, 4).map((m) => (
                  <li key={m.tag}>
                    {describeMistake(grade, m.tag)} <span className={styles.muted}>({m.count} times)</span>
                  </li>
                ))}
              </ul>
            </Card>
          ) : null}

          <section className={styles.section}>
            <h2 className={styles.h2}>By topic</h2>
            <div className={styles.topics}>
              {topics.map((t) => {
                const tp = topicProgress.get(t.id);
                const isOpen = open === t.id;
                return (
                  <Card key={t.id} className={styles.topic} padded={false}>
                    <button type="button" className={styles.topicHead} onClick={() => setOpen(isOpen ? null : t.id)} aria-expanded={isOpen}>
                      <TopicIcon name={t.icon} size={26} />
                      <span className={styles.topicName}>
                        <strong>{t.name}</strong>
                        <span className={styles.muted}>
                          {tp ? `${tp.understood} of ${tp.total} understood` : ""}
                        </span>
                        <span className={styles.bar} aria-hidden>
                          <span className={styles.barFill} style={{ width: `${Math.round((tp?.score ?? 0) * 100)}%` }} />
                        </span>
                      </span>
                      {tp ? <StatusPill status={tp.status} compact /> : null}
                      <ChevronDown size={20} className={isOpen ? styles.flip : ""} aria-hidden />
                    </button>
                    {isOpen && tp ? (
                      <ul className={styles.subList}>
                        {tp.subtopics.map((sp) => {
                          const st = t.subtopics.find((x) => x.id === sp.subtopicId);
                          return (
                            <li key={sp.subtopicId} className={styles.subRow}>
                              <Link to={`/learn/${sp.subtopicId}`} className={styles.subLink}>
                                {st?.name ?? sp.subtopicId}
                              </Link>
                              <StatusPill status={sp.status} compact />
                            </li>
                          );
                        })}
                      </ul>
                    ) : null}
                  </Card>
                );
              })}
            </div>
          </section>

          <Card className={styles.section}>
            <h2 className={styles.h2}>Recent activity</h2>
            {data && data.recent.length ? (
              <ul className={styles.recent}>
                {data.recent.map((a, i) => (
                  <li key={i} className={styles.recentRow}>
                    <span>
                      <strong>{ACTIVITY[a.type]}</strong> · {a.subtopicName}
                      {a.outcome ? <span className={styles.muted}> · {OUTCOME[a.outcome]}</span> : null}
                    </span>
                    <span className={styles.muted}>{when(a.at)}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className={styles.muted}>Nothing yet. Try a lesson or some practice and it will show up here.</p>
            )}
          </Card>
        </>
      )}
    </div>
  );
};

export default ProgressPage;
