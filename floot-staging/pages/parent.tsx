import React, { useState } from "react";
import { Helmet } from "react-helmet";
import { Link } from "react-router-dom";
import { Lock } from "lucide-react";
import { curriculumRegistry } from "../helpers/curriculumRegistry";
import { STATUS_ORDER } from "../helpers/learningStatus";
import { useChangeParentPin, useParentOverview } from "../helpers/useParentData";
import type { OutputType as Overview } from "../endpoints/parent/overview_POST.schema";
import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { Input } from "../components/Input";
import { MiniBars } from "../components/MiniBars";
import { Spinner } from "../components/Spinner";
import { StatusPill } from "../components/StatusPill";
import styles from "./parent.module.css";

const when = (d: Date | null): string => (d ? new Date(d).toLocaleDateString("en-ZA", { day: "numeric", month: "short", year: "numeric" }) : "No activity yet");

const ChangePin: React.FC<{ currentPin: string; onChanged: (pin: string) => void }> = ({ currentPin, onChanged }) => {
  const m = useChangeParentPin();
  const [next, setNext] = useState("");
  const [done, setDone] = useState(false);
  return (
    <Card className={styles.section}>
      <h2 className={styles.h2}>Change the parent PIN</h2>
      <form
        className={styles.row}
        onSubmit={(e) => {
          e.preventDefault();
          m.mutate(
            { currentPin, newPin: next },
            {
              onSuccess: () => {
                setDone(true);
                onChanged(next);
                setNext("");
              },
            }
          );
        }}
      >
        <Input type="password" inputMode="numeric" value={next} onChange={(e) => { setNext(e.target.value.replace(/\D/g, "")); setDone(false); }} maxLength={6} placeholder="New PIN (4 to 6 numbers)" aria-label="New PIN" autoComplete="new-password" />
        <Button type="submit" disabled={next.length < 4 || m.isPending}>
          Save
        </Button>
      </form>
      {m.isError ? <p className={styles.err}>{m.error instanceof Error ? m.error.message : "Could not change the PIN."}</p> : null}
      {done ? <p className={styles.ok}>PIN changed.</p> : null}
    </Card>
  );
};

const Report: React.FC<{ o: Overview; pin: string; onPin: (p: string) => void; onLock: () => void }> = ({ o, pin, onPin, onLock }) => {
  const p = o.payload;
  const s = p.summary;
  const grade = s.grade;
  const topics = curriculumRegistry.topics(grade);
  const byTopic = new Map(s.topics.map((t) => [t.topicId, t]));
  const t = o.thresholds;

  return (
    <div className={styles.stack}>
      <div className={styles.titleRow}>
        <div>
          <h1 className={styles.title}>{o.learnerName}'s progress</h1>
          <p className={styles.muted}>Grade {grade} Mathematics (CAPS) · last baseline check-up: {p.baselineCompletedAt ? when(p.baselineCompletedAt) : "not done yet"}</p>
        </div>
        <Button variant="outline" onClick={onLock}>
          <Lock size={16} /> Lock
        </Button>
      </div>

      <div className={styles.grid}>
        <Card className={styles.stat}>
          <span className={styles.num}>{Math.round(s.completion)}%</span>
          <span className={styles.muted}>Grade {grade} completion</span>
        </Card>
        <Card className={styles.stat}>
          <span className={styles.num}>{s.counts.understood}/{s.totalSubtopics}</span>
          <span className={styles.muted}>skills understood</span>
        </Card>
        <Card className={styles.stat}>
          <span className={styles.num}>{s.stats.totalQuestions ? `${Math.round(s.stats.accuracy)}%` : "-"}</span>
          <span className={styles.muted}>accuracy (hints allowed)</span>
        </Card>
        <Card className={styles.stat}>
          <span className={styles.num}>{s.stats.daysActiveLast28}</span>
          <span className={styles.muted}>days active (last 28)</span>
        </Card>
      </div>

      <Card className={styles.section}>
        <h2 className={styles.h2}>Skills by status</h2>
        <div className={styles.pills}>
          {STATUS_ORDER.map((st) => (
            <span key={st} className={styles.pillItem}>
              <strong>{s.counts[st]}</strong> <StatusPill status={st} compact />
            </span>
          ))}
        </div>
      </Card>

      <Card tone="soft" className={styles.section}>
        <h2 className={styles.h2}>What to do next</h2>
        <p>{s.recommendation.parentReason}</p>
      </Card>

      {o.practiceTogether.length ? (
        <Card className={styles.section}>
          <h2 className={styles.h2}>Practise together</h2>
          <p className={styles.muted}>Ten minutes on one of these, a few times a week, helps more than one long session.</p>
          <ul className={styles.list}>
            {o.practiceTogether.map((x) => (
              <li key={x.subtopicId} className={styles.item}>
                <strong>{x.name}</strong> <span className={styles.muted}>({x.topicName})</span>
                <span>{x.why}</span>
                <span className={styles.tip}>{x.tip}</span>
              </li>
            ))}
          </ul>
        </Card>
      ) : null}

      {o.mistakes.length ? (
        <Card tone="help" className={styles.section}>
          <h2 className={styles.h2}>Mistakes that keep repeating</h2>
          <ul className={styles.list}>
            {o.mistakes.map((m) => (
              <li key={m.tag}>
                {m.text} <span className={styles.muted}>· {m.count} times · {m.subtopicName}</span>
              </li>
            ))}
          </ul>
        </Card>
      ) : null}

      <Card className={styles.section}>
        <h2 className={styles.h2}>Questions each week</h2>
        <MiniBars ariaLabel="Questions answered per week" data={s.stats.weekly.slice(-8).map((w) => ({ label: w.weekStart.slice(5), value: w.questions, sub: w.questions ? `${Math.round(w.accuracy)}%` : "" }))} />
      </Card>

      <Card className={styles.section}>
        <h2 className={styles.h2}>Every topic</h2>
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Topic / skill</th>
                <th>Status</th>
                <th>Why</th>
              </tr>
            </thead>
            <tbody>
              {topics.flatMap((tp) => {
                const tpr = byTopic.get(tp.id);
                return [
                  <tr key={tp.id} className={styles.topicRow}>
                    <td colSpan={2}>
                      <strong>{tp.name}</strong> <span className={styles.muted}>Term {tp.term}</span>
                    </td>
                    <td>{tpr ? `${tpr.understood} of ${tpr.total} understood` : ""}</td>
                  </tr>,
                  ...(tpr?.subtopics ?? []).map((sp) => (
                    <tr key={sp.subtopicId}>
                      <td>{tp.subtopics.find((x) => x.id === sp.subtopicId)?.name ?? sp.subtopicId}</td>
                      <td>
                        <StatusPill status={sp.status} compact />
                      </td>
                      <td className={styles.muted}>{sp.reason}</td>
                    </tr>
                  )),
                ];
              })}
            </tbody>
          </table>
        </div>
      </Card>

      <Card className={styles.section}>
        <h2 className={styles.h2}>How "understood" is decided</h2>
        <ul className={styles.list}>
          <li>
            A skill is <strong>UNDERSTOOD</strong> only when {t.requiredClean} of the last {t.windowSize} questions at a level were right first time with no hints, at every level, <em>and</em> this was seen on at least {t.understoodDays} different days. One correct answer never counts.
          </li>
          <li>
            <strong>NEEDS MORE HELP</strong> shows when several recent questions in a row go wrong, or more than half of the recent questions are wrong.
          </li>
          <li>A skill that was understood but not practised for two weeks is moved back to practising for revision.</li>
          <li>Questions are generated and marked by the app itself, so their answers are always right. AI-explained scanned questions are checked by a calculator or a second solve, but the AI can still make mistakes.</li>
        </ul>
      </Card>

      <ChangePin currentPin={pin} onChanged={onPin} />
      <p className={styles.muted}>
        <Link to="/">Back to {o.learnerName}'s maths</Link>
      </p>
    </div>
  );
};

const ParentPage: React.FC = () => {
  const m = useParentOverview();
  const [pin, setPin] = useState("");
  const [data, setData] = useState<Overview | null>(null);

  const unlock = (e: React.FormEvent) => {
    e.preventDefault();
    m.mutate({ pin }, { onSuccess: (d) => setData(d) });
  };

  if (data) {
    return (
      <>
        <Helmet>
          <title>Parent area · My Maths Tutor</title>
        </Helmet>
        <Report
          o={data}
          pin={pin}
          onPin={setPin}
          onLock={() => {
            setData(null);
            setPin("");
            m.reset();
          }}
        />
      </>
    );
  }

  return (
    <div className={styles.gate}>
      <Helmet>
        <title>Parent area · My Maths Tutor</title>
      </Helmet>
      <Card className={styles.gateCard}>
        <Lock size={34} aria-hidden />
        <h1 className={styles.title}>Parent / Guardian area</h1>
        <p className={styles.muted}>Enter the parent PIN you chose when you set up the profile.</p>
        <form onSubmit={unlock} className={styles.stack}>
          <Input type="password" inputMode="numeric" value={pin} onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))} maxLength={6} placeholder="Parent PIN" aria-label="Parent PIN" autoComplete="off" className={styles.pinInput} />
          {m.isError ? <p className={styles.err} role="alert">{m.error instanceof Error ? m.error.message : "That didn't work."}</p> : null}
          <Button type="submit" size="lg" disabled={pin.length < 4 || m.isPending}>
            {m.isPending ? <Spinner size="sm" /> : "Open"}
          </Button>
        </form>
      </Card>
    </div>
  );
};

export default ParentPage;
