import React, { useState } from "react";
import { Helmet } from "react-helmet";
import { BookOpen } from "lucide-react";
import { curriculumRegistry } from "../helpers/curriculumRegistry";
import { useLearnerMe, useProgress } from "../helpers/useLearnerData";
import { PageHeader } from "../components/PageHeader";
import { TopicCard } from "../components/TopicCard";
import styles from "./lessons.module.css";

const LessonsPage: React.FC = () => {
  const me = useLearnerMe();
  const progress = useProgress();
  const grade = me.data?.learner?.grade ?? 8;
  const topics = curriculumRegistry.topics(grade);
  const [term, setTerm] = useState<0 | 1 | 2 | 3 | 4>(0);
  const shown = term === 0 ? topics : topics.filter((t) => t.term === term);
  const byTopic = new Map(progress.data?.summary.topics.map((t) => [t.topicId, t]));

  return (
    <div className={styles.page}>
      <Helmet>
        <title>My Lessons · My Maths Tutor</title>
      </Helmet>
      <PageHeader title="My Lessons" subtitle={`Grade ${grade} Mathematics (CAPS). Pick a topic and we'll go step by step.`} icon={<BookOpen size={28} />} />

      <div className={styles.filters} role="tablist" aria-label="Filter by term">
        {([0, 1, 2, 3, 4] as const).map((t) => (
          <button key={t} type="button" role="tab" aria-selected={term === t} className={`${styles.chip} ${term === t ? styles.chipOn : ""}`} onClick={() => setTerm(t)}>
            {t === 0 ? "All" : `Term ${t}`}
          </button>
        ))}
      </div>

      <div className={styles.list}>
        {shown.map((t) => (
          <TopicCard key={t.id} topic={t} progress={byTopic.get(t.id)} />
        ))}
      </div>

      <p className={styles.note}>
        Topics are shown in the usual Grade {grade} order. The term numbers are a guide: your school's own plan may be a little different, so follow your teacher if they teach a topic earlier or later.
      </p>
    </div>
  );
};

export default LessonsPage;
