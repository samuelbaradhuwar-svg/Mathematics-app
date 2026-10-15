import React from "react";
import { Helmet } from "react-helmet";
import { Link } from "react-router-dom";
import { ArrowRight, BarChart3, Camera, MessageCircleHeart, PenLine, PlayCircle, Sparkles } from "lucide-react";
import { useLearnerMe, useProgress } from "../helpers/useLearnerData";
import { recommendationLink, recommendationVerb } from "../helpers/recommendationLink";
import { STATUS_ORDER } from "../helpers/learningStatus";
import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { ProgressRing } from "../components/ProgressRing";
import { Skeleton } from "../components/Skeleton";
import { StatusPill } from "../components/StatusPill";
import styles from "./_index.module.css";

const greeting = (): string => {
  const h = new Date().getHours();
  return h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening";
};

const HomePage: React.FC = () => {
  const me = useLearnerMe();
  const progress = useProgress();
  const learner = me.data?.learner;
  const summary = progress.data?.summary;
  const rec = summary?.recommendation;
  const baseline = learner?.baseline ?? "none";

  return (
    <div className={styles.page}>
      <Helmet>
        <title>Home · My Maths Tutor</title>
      </Helmet>

      <Card tone="primary" className={styles.hero}>
        <p className={styles.eyebrow}>{greeting()}</p>
        <h1 className={styles.heroTitle}>Hi {learner?.name ?? "there"}!</h1>
        {baseline !== "completed" ? (
          <>
            <p className={styles.heroText}>
              {baseline === "in_progress"
                ? "Your check-up is waiting. You can carry on from where you stopped."
                : "Let's find out what you already know. This is a friendly check-up, not a test, and you can take breaks."}
            </p>
            <Button asChild size="lg" className={styles.cta}>
              <Link to="/baseline">
                {baseline === "in_progress" ? "Carry on my check-up" : "Start my check-up"} <ArrowRight size={20} />
              </Link>
            </Button>
          </>
        ) : progress.isLoading || !rec ? (
          <Skeleton style={{ height: 96 }} />
        ) : (
          <>
            <p className={styles.upNext}>
              <Sparkles size={16} aria-hidden /> Up next: <strong>{rec.title}</strong>
            </p>
            <p className={styles.heroText}>{rec.reason}</p>
            <Button asChild size="lg" className={styles.cta}>
              <Link to={recommendationLink(rec)}>
                {recommendationVerb(rec)} <ArrowRight size={20} />
              </Link>
            </Button>
          </>
        )}
      </Card>

      <Link to="/scan" className={styles.scanCard}>
        <span className={styles.scanIcon}>
          <Camera size={34} />
        </span>
        <span className={styles.scanText}>
          <strong>Scan a question</strong>
          <span>Take a photo of a question you don't understand</span>
        </span>
        <ArrowRight size={22} aria-hidden />
      </Link>

      <div className={styles.tiles}>
        <Link to="/tutor" className={styles.tile}>
          <MessageCircleHeart size={28} />
          <strong>Ask my tutor</strong>
          <span>Chat about any maths</span>
        </Link>
        <Link to="/practice" className={styles.tile}>
          <PenLine size={28} />
          <strong>Practice</strong>
          <span>Questions at your level</span>
        </Link>
        <Link to="/videos" className={styles.tile}>
          <PlayCircle size={28} />
          <strong>Videos</strong>
          <span>Watch and learn</span>
        </Link>
        <Link to="/progress" className={styles.tile}>
          <BarChart3 size={28} />
          <strong>My progress</strong>
          <span>See how far you've come</span>
        </Link>
      </div>

      <Card className={styles.snapshot}>
        <div className={styles.snapshotTop}>
          {summary ? <ProgressRing value={summary.completion} sublabel="of Grade 8" /> : <Skeleton style={{ width: 132, height: 132, borderRadius: 999 }} />}
          <div className={styles.snapshotText}>
            <h2 className={styles.h2}>My Grade 8 maths</h2>
            {summary ? (
              <p className={styles.muted}>
                {summary.counts.understood} of {summary.totalSubtopics} skills understood
              </p>
            ) : null}
            <Link to="/progress" className={styles.link}>
              See my progress <ArrowRight size={16} />
            </Link>
          </div>
        </div>
        {summary ? (
          <div className={styles.counts}>
            {STATUS_ORDER.map((s) => (
              <div key={s} className={styles.countItem}>
                <span className={styles.countNum}>{summary.counts[s]}</span>
                <StatusPill status={s} compact />
              </div>
            ))}
          </div>
        ) : null}
      </Card>
    </div>
  );
};

export default HomePage;