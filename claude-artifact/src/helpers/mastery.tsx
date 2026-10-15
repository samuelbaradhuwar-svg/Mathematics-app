// The learning engine: turns a learner's attempt history into statuses, levels,
// recommendations and statistics. Pure functions: used on the server (source of
// truth) and in tests. See docs/architecture.md for the rules in plain English.
import { curriculumRegistry } from "./curriculumRegistry";
import { LEVELS, type LearningStatus, type Level } from "./curriculumTypes";

export type AttemptOutcome = "clean" | "assisted" | "incorrect";
// clean    = correct on the first try with no hints
// assisted = correct, but needed hints and/or more than one try
// incorrect = wrong, or the learner asked to see the solution

export interface AttemptRecord {
  subtopicId: string;
  topicId: string;
  level: Level;
  outcome: AttemptOutcome;
  mistakeTag?: string | null;
  skillTag?: string | null;
  source: "practice" | "lesson" | "baseline" | "scan";
  createdAt: Date;
}

export interface LessonRecord {
  subtopicId: string;
  completed: boolean;
  updatedAt: Date;
}

// ---- Mastery thresholds (documented in the Parent view and architecture notes) ----
export const MASTERY = {
  windowSize: 6, // look at the last 6 questions at a level
  requiredClean: 5, // 5 of those 6 correct with no hints/retries
  needsHelpMinAttempts: 4,
  needsHelpWindow: 6,
  needsHelpErrorRate: 0.5, // half or more of the last 6 not correct
  needsHelpStreak: 3, // or 3 wrong in a row
  regressStreak: 3, // 3 wrong in a row at a level -> step back one level
  understoodDays: 2, // advanced mastery must be shown on 2+ different days
  staleRevisionDays: 14,
} as const;

export const SA_OFFSET_HOURS = 2; // South Africa (no daylight saving)
export const dayKey = (d: Date): string =>
  new Date(d.getTime() + SA_OFFSET_HOURS * 3600 * 1000).toISOString().slice(0, 10);

const sortAsc = (a: AttemptRecord, b: AttemptRecord) => a.createdAt.getTime() - b.createdAt.getTime();

export interface LevelState {
  level: Level;
  attempts: number;
  windowClean: number;
  windowSize: number;
  mastered: boolean;
  distinctDays: number;
}

export interface SubtopicProgress {
  subtopicId: string;
  topicId: string;
  status: LearningStatus;
  recommendedLevel: Level;
  levels: Record<Level, LevelState>;
  masteredLevels: Level[];
  attempts: number;
  correct: number; // clean + assisted
  clean: number;
  lessonDone: boolean;
  lessonViewed: boolean;
  lastActivity: Date | null;
  // human friendly reason for the status (shown to the parent)
  reason: string;
  // "needs a second day to confirm"
  awaitingSecondDay: boolean;
  // 0..1 weighted progress used for progress bars
  score: number;
}

const emptyLevel = (level: Level): LevelState => ({
  level,
  attempts: 0,
  windowClean: 0,
  windowSize: 0,
  mastered: false,
  distinctDays: 0,
});

export const computeSubtopicProgress = (
  subtopicId: string,
  topicId: string,
  attemptsAll: AttemptRecord[],
  lesson: LessonRecord | undefined
): SubtopicProgress => {
  const attempts = attemptsAll.filter((a) => a.subtopicId === subtopicId).sort(sortAsc);
  const levels = { beginner: emptyLevel("beginner"), intermediate: emptyLevel("intermediate"), advanced: emptyLevel("advanced") } as Record<Level, LevelState>;

  for (const level of LEVELS) {
    const at = attempts.filter((a) => a.level === level);
    const window = at.slice(-MASTERY.windowSize);
    const clean = window.filter((a) => a.outcome === "clean").length;
    const days = new Set(window.map((a) => dayKey(a.createdAt)));
    levels[level] = {
      level,
      attempts: at.length,
      windowClean: clean,
      windowSize: window.length,
      mastered: window.length >= MASTERY.windowSize && clean >= MASTERY.requiredClean,
      distinctDays: days.size,
    };
  }

  const masteredLevels = LEVELS.filter((l) => levels[l].mastered);
  const lessonViewed = !!lesson;
  const lessonDone = !!lesson?.completed;
  const lastActivity = attempts.length ? attempts[attempts.length - 1].createdAt : lesson?.updatedAt ?? null;
  const correct = attempts.filter((a) => a.outcome !== "incorrect").length;
  const clean = attempts.filter((a) => a.outcome === "clean").length;

  // recommended level = lowest not-yet-mastered level, with a step back after 3 misses in a row
  let recommended: Level = LEVELS.find((l) => !levels[l].mastered) ?? "advanced";
  const lastAtRec = attempts.filter((a) => a.level === recommended).slice(-MASTERY.regressStreak);
  if (
    lastAtRec.length === MASTERY.regressStreak &&
    lastAtRec.every((a) => a.outcome === "incorrect") &&
    recommended !== "beginner"
  ) {
    recommended = recommended === "advanced" ? "intermediate" : "beginner";
  }

  // status
  const lastN = attempts.slice(-MASTERY.needsHelpWindow);
  const wrongInLastN = lastN.filter((a) => a.outcome === "incorrect").length;
  const lastStreak = attempts.slice(-MASTERY.needsHelpStreak);
  const threeWrong = lastStreak.length === MASTERY.needsHelpStreak && lastStreak.every((a) => a.outcome === "incorrect");
  const lastThreeClean = attempts.slice(-3).length === 3 && attempts.slice(-3).every((a) => a.outcome === "clean");

  let status: LearningStatus;
  let reason: string;
  let awaitingSecondDay = false;
  const allMastered = masteredLevels.length === 3;

  if (allMastered && levels.advanced.distinctDays >= MASTERY.understoodDays) {
    status = "understood";
    reason = "Answered 5 of the last 6 questions correctly without help at every level, on more than one day.";
  } else if (
    attempts.length >= MASTERY.needsHelpMinAttempts &&
    !lastThreeClean &&
    (threeWrong || wrongInLastN / Math.max(1, lastN.length) >= MASTERY.needsHelpErrorRate)
  ) {
    status = "needs-help";
    reason = threeWrong
      ? "Got the last 3 questions wrong. This topic needs more teaching."
      : `Got ${wrongInLastN} of the last ${lastN.length} questions wrong.`;
  } else if (attempts.length === 0 && !lessonViewed) {
    status = "not-started";
    reason = "Not started yet.";
  } else {
    status = "practising";
    if (allMastered) {
      awaitingSecondDay = true;
      reason = "All three levels done. One more good session on another day will confirm it.";
    } else if (attempts.length === 0) {
      reason = "Lesson started. Practice questions come next.";
    } else {
      reason = `Working on the ${recommended} level.`;
    }
  }

  const score =
    status === "understood"
      ? 1
      : Math.min(0.95, masteredLevels.length / 3 * 0.85 + (lessonDone ? 0.1 : lessonViewed ? 0.04 : 0) + (levels[recommended].windowClean / MASTERY.requiredClean) * 0.05);

  return {
    subtopicId,
    topicId,
    status,
    recommendedLevel: recommended,
    levels,
    masteredLevels,
    attempts: attempts.length,
    correct,
    clean,
    lessonDone,
    lessonViewed,
    lastActivity,
    reason,
    awaitingSecondDay,
    score,
  };
};

export interface TopicProgress {
  topicId: string;
  status: LearningStatus;
  understood: number;
  practising: number;
  needsHelp: number;
  notStarted: number;
  total: number;
  score: number; // 0..1
  subtopics: SubtopicProgress[];
}

export interface Recommendation {
  kind: "fix-gap" | "continue" | "revise" | "new" | "finished";
  subtopicId: string | null;
  action: "lesson" | "practice" | "video";
  title: string;
  reason: string; // friendly, for Judah
  parentReason: string;
}

export interface Stats {
  totalQuestions: number;
  correct: number;
  clean: number;
  accuracy: number; // 0..100, correct (incl. with help) / total
  cleanAccuracy: number; // 0..100 without hints
  daysActiveLast28: number;
  streak: number;
  questionsLast7Days: number;
  weekly: { weekStart: string; questions: number; accuracy: number }[];
  recurringMistakes: { tag: string; count: number; subtopicId: string }[];
}

export interface ProgressSummary {
  grade: number;
  subtopics: Record<string, SubtopicProgress>;
  topics: TopicProgress[];
  counts: Record<LearningStatus, number>;
  totalSubtopics: number;
  completion: number; // 0..100 weighted
  understoodPercent: number; // 0..100 strict
  stats: Stats;
  recommendation: Recommendation;
}

const mondayKey = (d: Date): string => {
  const sa = new Date(d.getTime() + SA_OFFSET_HOURS * 3600 * 1000);
  const dow = (sa.getUTCDay() + 6) % 7; // Monday = 0
  sa.setUTCDate(sa.getUTCDate() - dow);
  return sa.toISOString().slice(0, 10);
};

export const computeStats = (attempts: AttemptRecord[], lessons: LessonRecord[], now: Date): Stats => {
  const practice = attempts;
  const total = practice.length;
  const correct = practice.filter((a) => a.outcome !== "incorrect").length;
  const clean = practice.filter((a) => a.outcome === "clean").length;

  const activeDays = new Set<string>([...attempts.map((a) => dayKey(a.createdAt)), ...lessons.map((l) => dayKey(l.updatedAt))]);
  const today = dayKey(now);
  const cutoff28 = new Date(now.getTime() - 27 * 86400000);
  let daysActiveLast28 = 0;
  for (const d of activeDays) if (d >= dayKey(cutoff28) && d <= today) daysActiveLast28++;

  // streak: consecutive active days ending today (or yesterday)
  let streak = 0;
  const cursor = new Date(now.getTime());
  if (!activeDays.has(dayKey(cursor))) cursor.setTime(cursor.getTime() - 86400000);
  while (activeDays.has(dayKey(cursor))) {
    streak++;
    cursor.setTime(cursor.getTime() - 86400000);
  }

  const q7 = practice.filter((a) => now.getTime() - a.createdAt.getTime() < 7 * 86400000).length;

  const weekMap = new Map<string, { q: number; c: number }>();
  for (const a of practice) {
    const k = mondayKey(a.createdAt);
    const w = weekMap.get(k) ?? { q: 0, c: 0 };
    w.q++;
    if (a.outcome !== "incorrect") w.c++;
    weekMap.set(k, w);
  }
  const weekly = Array.from(weekMap.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .slice(-8)
    .map(([weekStart, w]) => ({ weekStart, questions: w.q, accuracy: Math.round((w.c / w.q) * 100) }));

  const mistakeMap = new Map<string, { count: number; subtopicId: string }>();
  const recent = practice.filter((a) => now.getTime() - a.createdAt.getTime() < 45 * 86400000);
  for (const a of recent) {
    if (a.mistakeTag && a.outcome !== "clean") {
      const m = mistakeMap.get(a.mistakeTag) ?? { count: 0, subtopicId: a.subtopicId };
      m.count++;
      mistakeMap.set(a.mistakeTag, m);
    }
  }
  const recurringMistakes = Array.from(mistakeMap.entries())
    .filter(([, m]) => m.count >= 2)
    .map(([tag, m]) => ({ tag, count: m.count, subtopicId: m.subtopicId }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);

  return {
    totalQuestions: total,
    correct,
    clean,
    accuracy: total ? Math.round((correct / total) * 100) : 0,
    cleanAccuracy: total ? Math.round((clean / total) * 100) : 0,
    daysActiveLast28,
    streak,
    questionsLast7Days: q7,
    weekly,
    recurringMistakes,
  };
};

const statusRank: Record<LearningStatus, number> = { "needs-help": 0, practising: 1, "not-started": 2, understood: 3 };

export const recommendNext = (
  grade: number,
  subtopics: Record<string, SubtopicProgress>,
  now: Date,
  preferredOrder?: string[]
): Recommendation => {
  const all = curriculumRegistry.allSubtopics(grade);
  const nameOf = (id: string) => curriculumRegistry.subtopic(grade, id)?.subtopic.name ?? id;
  // Teach before practising: practice only once the lesson has been seen, or the baseline
  // already showed solid skill (at least 2 questions with 60%+ answered cleanly).
  const actionFor = (p: SubtopicProgress): "lesson" | "practice" =>
    p.lessonViewed || (p.attempts >= 2 && p.clean / p.attempts >= 0.6) ? "practice" : "lesson";
  const planRank = (id: string): number => {
    const i = preferredOrder ? preferredOrder.indexOf(id) : -1;
    return i === -1 ? Number.MAX_SAFE_INTEGER : i;
  };

  // 1. Fix the weakest area, starting from a shaky prerequisite if there is one.
  const needsHelp = all.map((r) => subtopics[r.subtopic.id]).filter((p) => p && p.status === "needs-help");
  if (needsHelp.length) {
    needsHelp.sort((a, b) => (b.lastActivity?.getTime() ?? 0) - (a.lastActivity?.getTime() ?? 0));
    const target = needsHelp[0];
    const ref = curriculumRegistry.subtopic(grade, target.subtopicId)!;
    const weakPrereq = ref.subtopic.prerequisites
      .map((id) => subtopics[id])
      .filter((p) => p && (p.status === "needs-help" || (p.status === "not-started") || (p.status === "practising" && p.masteredLevels.length === 0)))
      .sort((a, b) => statusRank[a.status] - statusRank[b.status])[0];
    if (weakPrereq) {
      return {
        kind: "fix-gap",
        subtopicId: weakPrereq.subtopicId,
        action: weakPrereq.lessonViewed ? "practice" : "lesson",
        title: nameOf(weakPrereq.subtopicId),
        reason: `Let's strengthen "${nameOf(weakPrereq.subtopicId)}" first. It will make "${nameOf(target.subtopicId)}" much easier.`,
        parentReason: `"${nameOf(target.subtopicId)}" is hard at the moment, and its building block "${nameOf(weakPrereq.subtopicId)}" is not solid yet.`,
      };
    }
    return {
      kind: "fix-gap",
      subtopicId: target.subtopicId,
      action: "lesson",
      title: nameOf(target.subtopicId),
      reason: `Let's go back over "${nameOf(target.subtopicId)}" together, a little slower this time.`,
      parentReason: `Recent questions on "${nameOf(target.subtopicId)}" were mostly wrong, so the lesson should be repeated before more practice.`,
    };
  }

  // 2. Keep going with something already started.
  const practising = all
    .map((r) => subtopics[r.subtopic.id])
    .filter((p) => p && p.status === "practising")
    .sort((a, b) => {
      const byPlan = planRank(a.subtopicId) - planRank(b.subtopicId);
      return byPlan !== 0 ? byPlan : (b.lastActivity?.getTime() ?? 0) - (a.lastActivity?.getTime() ?? 0);
    });
  if (practising.length) {
    const p = practising[0];
    return {
      kind: "continue",
      subtopicId: p.subtopicId,
      action: actionFor(p),
      title: nameOf(p.subtopicId),
      reason: p.awaitingSecondDay
        ? `You've nearly mastered "${nameOf(p.subtopicId)}". A few more questions will lock it in.`
        : `Let's keep going with "${nameOf(p.subtopicId)}". You're making progress.`,
      parentReason: `Currently practising "${nameOf(p.subtopicId)}" at the ${p.recommendedLevel} level.`,
    };
  }

  // 3. Start something new (baseline order first, then curriculum order), only when its prerequisites are practised.
  const order = preferredOrder && preferredOrder.length ? [...preferredOrder, ...all.map((r) => r.subtopic.id)] : all.map((r) => r.subtopic.id);
  const seen = new Set<string>();
  for (const id of order) {
    if (seen.has(id)) continue;
    seen.add(id);
    const p = subtopics[id];
    const ref = curriculumRegistry.subtopic(grade, id);
    if (!p || !ref || p.status !== "not-started") continue;
    const prereqsOk = ref.subtopic.prerequisites.every((pid) => subtopics[pid] && subtopics[pid].status !== "not-started");
    if (prereqsOk) {
      return {
        kind: "new",
        subtopicId: id,
        action: "lesson",
        title: nameOf(id),
        reason: `Ready for something new? Let's learn "${nameOf(id)}" one small step at a time.`,
        parentReason: `Next topic in the plan: "${nameOf(id)}".`,
      };
    }
  }
  // not-started whose prerequisites are not started: go to the earliest prerequisite
  for (const id of order) {
    const p = subtopics[id];
    if (p && p.status === "not-started") {
      return {
        kind: "new",
        subtopicId: id,
        action: "lesson",
        title: nameOf(id),
        reason: `Let's start "${nameOf(id)}".`,
        parentReason: `Next topic in the plan: "${nameOf(id)}".`,
      };
    }
  }

  // 4. Revise the understood topic that has gone longest without practice.
  const understood = all
    .map((r) => subtopics[r.subtopic.id])
    .filter((p) => p && p.status === "understood")
    .sort((a, b) => (a.lastActivity?.getTime() ?? 0) - (b.lastActivity?.getTime() ?? 0));
  if (understood.length) {
    const p = understood[0];
    const days = p.lastActivity ? Math.floor((now.getTime() - p.lastActivity.getTime()) / 86400000) : 999;
    return {
      kind: days >= MASTERY.staleRevisionDays ? "revise" : "finished",
      subtopicId: p.subtopicId,
      action: "practice",
      title: nameOf(p.subtopicId),
      reason: days >= MASTERY.staleRevisionDays ? `It's been a while since "${nameOf(p.subtopicId)}". A quick revision keeps it fresh.` : "Wow, you have worked through everything! Keep it fresh with a quick revision.",
      parentReason: "All topics understood. Regular revision keeps knowledge fresh.",
    };
  }
  return { kind: "finished", subtopicId: null, action: "practice", title: "All done", reason: "Nothing left to do right now.", parentReason: "" };
};

export const summariseProgress = (
  grade: number,
  attempts: AttemptRecord[],
  lessons: LessonRecord[],
  now: Date = new Date(),
  preferredOrder?: string[]
): ProgressSummary => {
  const lessonBy = new Map(lessons.map((l) => [l.subtopicId, l]));
  const refs = curriculumRegistry.allSubtopics(grade);
  const subtopics: Record<string, SubtopicProgress> = {};
  for (const r of refs) {
    subtopics[r.subtopic.id] = computeSubtopicProgress(r.subtopic.id, r.topic.id, attempts, lessonBy.get(r.subtopic.id));
  }

  const topics: TopicProgress[] = curriculumRegistry.topics(grade).map((t) => {
    const subs = t.subtopics.map((s) => subtopics[s.id]);
    const understood = subs.filter((s) => s.status === "understood").length;
    const needsHelp = subs.filter((s) => s.status === "needs-help").length;
    const notStarted = subs.filter((s) => s.status === "not-started").length;
    const practising = subs.filter((s) => s.status === "practising").length;
    const status: LearningStatus = understood === subs.length ? "understood" : needsHelp > 0 ? "needs-help" : notStarted === subs.length ? "not-started" : "practising";
    return {
      topicId: t.id,
      status,
      understood,
      practising,
      needsHelp,
      notStarted,
      total: subs.length,
      score: subs.reduce((acc, s) => acc + s.score, 0) / subs.length,
      subtopics: subs,
    };
  });

  const counts: Record<LearningStatus, number> = { understood: 0, practising: 0, "needs-help": 0, "not-started": 0 };
  for (const s of Object.values(subtopics)) counts[s.status]++;
  const total = refs.length;
  const completion = Math.round((Object.values(subtopics).reduce((a, s) => a + s.score, 0) / total) * 100);

  return {
    grade,
    subtopics,
    topics,
    counts,
    totalSubtopics: total,
    completion,
    understoodPercent: Math.round((counts.understood / total) * 100),
    // baseline questions count as evidence for mastery, but not as "practice done"
    stats: computeStats(attempts.filter((a) => a.source !== "baseline"), lessons, now),
    recommendation: recommendNext(grade, subtopics, now, preferredOrder),
  };
};