import React from "react";
import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import type { Topic } from "../helpers/curriculumTypes";
import type { TopicProgress } from "../helpers/mastery";
import { StatusPill } from "./StatusPill";
import { TopicIcon } from "./TopicIcon";
import styles from "./TopicCard.module.css";

interface Props {
  topic: Topic;
  progress?: TopicProgress;
  to?: string;
}

export const TopicCard: React.FC<Props> = ({ topic, progress, to }) => {
  const pct = Math.round((progress?.score ?? 0) * 100);
  return (
    <Link to={to ?? `/lessons/${topic.id}`} className={styles.card}>
      <span className={styles.icon}>
        <TopicIcon name={topic.icon} size={26} />
      </span>
      <span className={styles.main}>
        <span className={styles.row}>
          <strong className={styles.name}>{topic.name}</strong>
          <span className={styles.term}>Term {topic.term}</span>
        </span>
        <span className={styles.summary}>{topic.summary}</span>
        <span className={styles.bar} aria-hidden>
          <span className={styles.fill} style={{ width: `${pct}%` }} />
        </span>
        <span className={styles.row}>
          {progress ? <StatusPill status={progress.status} compact /> : null}
          <span className={styles.count}>
            {progress ? `${progress.understood} of ${progress.total} skills understood` : `${topic.subtopics.length} skills`}
          </span>
        </span>
      </span>
      <ChevronRight size={22} className={styles.chev} aria-hidden />
    </Link>
  );
};
