import React from "react";
import { Helmet } from "react-helmet";
import { Link, useParams } from "react-router-dom";
import { ArrowRight, BookOpenCheck, PlayCircle } from "lucide-react";
import { curriculumRegistry } from "../helpers/curriculumRegistry";
import { useLearnerMe, useProgress } from "../helpers/useLearnerData";
import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { PageHeader } from "../components/PageHeader";
import { StatusPill } from "../components/StatusPill";
import { TopicIcon } from "../components/TopicIcon";
import styles from "./lessons.$topicId.module.css";

const TopicPage: React.FC = () => {
  const { topicId = "" } = useParams();
  const me = useLearnerMe();
  const progress = useProgress();
  const grade = me.data?.learner?.grade ?? 8;
  const topic = curriculumRegistry.topic(grade, topicId);

  if (!topic) {
    return (
      <Card>
        <p>We couldn't find that topic.</p>
        <Button asChild>
          <Link to="/lessons">Back to my lessons</Link>
        </Button>
      </Card>
    );
  }
  const tp = progress.data?.summary.topics.find((t) => t.topicId === topic.id);

  return (
    <div className={styles.page}>
      <Helmet>
        <title>{topic.name} · My Maths Tutor</title>
      </Helmet>
      <PageHeader title={topic.name} subtitle={topic.summary} backTo="/lessons" backLabel="All topics" icon={<TopicIcon name={topic.icon} size={28} />} />

      <Card tone="soft" className={styles.block}>
        <h2 className={styles.h2}>What you will learn</h2>
        <ul className={styles.list}>
          {topic.whatYouLearn.map((w) => (
            <li key={w}>{w}</li>
          ))}
        </ul>
        {topic.priorKnowledge.length ? (
          <>
            <h3 className={styles.h3}>It helps if you already know</h3>
            <ul className={styles.list}>
              {topic.priorKnowledge.map((w) => (
                <li key={w}>{w}</li>
              ))}
            </ul>
          </>
        ) : null}
      </Card>

      <h2 className={styles.h2}>Lessons in this topic</h2>
      <div className={styles.subs}>
        {topic.subtopics.map((s, i) => {
          const sp = tp?.subtopics.find((x) => x.subtopicId === s.id);
          return (
            <Card key={s.id} className={styles.sub}>
              <div className={styles.subTop}>
                <span className={styles.num}>{i + 1}</span>
                <div className={styles.subText}>
                  <strong className={styles.subName}>{s.name}</strong>
                  {sp ? <StatusPill status={sp.status} compact /> : null}
                </div>
              </div>
              <ul className={styles.objectives}>
                {s.objectives.map((o) => (
                  <li key={o}>{o}</li>
                ))}
              </ul>
              {sp && sp.status !== "not-started" ? <p className={styles.reason}>{sp.reason}</p> : null}
              <div className={styles.actions}>
                <Button asChild size="lg" className={styles.go}>
                  <Link to={`/learn/${s.id}`}>
                    {sp?.lessonViewed ? "Review the lesson" : "Start the lesson"} <ArrowRight size={18} />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link to={`/practice/${s.id}`}>
                    <BookOpenCheck size={18} /> Practise
                  </Link>
                </Button>
              </div>
            </Card>
          );
        })}
      </div>

      <Button asChild variant="outline" size="lg" className={styles.video}>
        <Link to={`/videos?topic=${topic.id}`}>
          <PlayCircle size={20} /> Videos about {topic.name}
        </Link>
      </Button>

      <Card tone="soft" className={styles.fine}>
        <p>
          <strong>How this is assessed:</strong> {topic.assessmentNote}
        </p>
        <p>
          <strong>Curriculum note:</strong> {topic.placement.note}
        </p>
      </Card>
    </div>
  );
};

export default TopicPage;
