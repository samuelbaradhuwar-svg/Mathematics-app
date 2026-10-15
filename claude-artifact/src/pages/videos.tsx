import React, { useState } from "react";
import { Helmet } from "react-helmet";
import { useSearchParams } from "react-router-dom";
import { PlayCircle, Search } from "lucide-react";
import { curriculumRegistry } from "../helpers/curriculumRegistry";
import { useLearnerMe } from "../helpers/useLearnerData";
import { Button } from "../components/Button";
import { PageHeader } from "../components/PageHeader";
import { VideoList } from "../components/VideoList";
import styles from "./videos.module.css";

const VideosPage: React.FC = () => {
  const me = useLearnerMe();
  const grade = me.data?.learner?.grade ?? 8;
  const [params, setParams] = useSearchParams();
  const topics = curriculumRegistry.topics(grade);
  const subtopicId = params.get("subtopic") ?? undefined;
  const topicId = params.get("topic") ?? undefined;
  const q = params.get("q") ?? undefined;
  const [text, setText] = useState(q ?? "");

  const subRef = subtopicId ? curriculumRegistry.subtopic(grade, subtopicId) : undefined;
  const topic = topicId ? topics.find((t) => t.id === topicId) : subRef?.topic;
  const heading = q ? `Videos for "${q}"` : subRef ? subRef.subtopic.name : topic ? topic.name : "Pick a topic";

  const choose = (next: Record<string, string>) => setParams(next, { replace: false });

  return (
    <div className={styles.page}>
      <Helmet>
        <title>Video Library · My Maths Tutor</title>
      </Helmet>
      <PageHeader title="Video Library" subtitle="Short videos that explain a topic. I look for South African Grade 8 teachers first." icon={<PlayCircle size={28} />} />

      <form
        className={styles.search}
        onSubmit={(e) => {
          e.preventDefault();
          if (text.trim()) choose({ q: text.trim() });
        }}
      >
        <input className={styles.input} value={text} onChange={(e) => setText(e.target.value)} placeholder="Search, e.g. solving equations" aria-label="Search for a video" maxLength={120} />
        <Button type="submit" size="lg" aria-label="Search">
          <Search size={20} />
        </Button>
      </form>

      <div className={styles.chips} role="list" aria-label="Topics">
        {topics.map((t) => (
          <button key={t.id} type="button" role="listitem" className={`${styles.chip} ${topic?.id === t.id && !q ? styles.on : ""}`} onClick={() => choose({ topic: t.id })}>
            {t.name}
          </button>
        ))}
      </div>

      {topic && !q && !subRef ? (
        <div className={styles.subs}>
          {topic.subtopics.map((s) => (
            <button key={s.id} type="button" className={styles.sub} onClick={() => choose({ subtopic: s.id })}>
              {s.name}
            </button>
          ))}
        </div>
      ) : null}

      {q || topic ? (
        <section className={styles.results}>
          <h2 className={styles.h2}>{heading}</h2>
          <VideoList subtopicId={subtopicId} topicId={!subtopicId ? topicId : undefined} q={q} />
        </section>
      ) : (
        <p className={styles.muted}>Choose a topic above, or search for something you want to learn.</p>
      )}
    </div>
  );
};

export default VideosPage;
