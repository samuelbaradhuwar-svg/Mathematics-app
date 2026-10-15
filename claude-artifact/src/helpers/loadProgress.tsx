// Server-only: loads a learner's history from the database and runs the mastery engine.
import { db } from "./db";
import { curriculumRegistry } from "./curriculumRegistry";
import type { BaselinePlan } from "./baselineEngine";
import { summariseProgress, type AttemptRecord, type LessonRecord, type ProgressSummary } from "./mastery";

export interface ActivityItem {
  type: "practice" | "lesson" | "scan" | "baseline";
  subtopicId: string;
  subtopicName: string;
  outcome?: "clean" | "assisted" | "incorrect";
  at: Date;
}

export interface ProgressPayload {
  summary: ProgressSummary;
  recent: ActivityItem[];
  plan: BaselinePlan | null;
  baselineCompletedAt: Date | null;
}

export async function loadAttempts(learnerId: number): Promise<AttemptRecord[]> {
  const rows = await db
    .selectFrom("attempts")
    .select(["subtopicId", "topicId", "level", "outcome", "mistakeTag", "skillTag", "source", "createdAt"])
    .where("learnerId", "=", learnerId)
    .orderBy("createdAt", "desc")
    .limit(20000)
    .execute();
  return rows.map((r) => ({
    subtopicId: r.subtopicId,
    topicId: r.topicId,
    level: r.level,
    outcome: r.outcome,
    mistakeTag: r.mistakeTag,
    skillTag: r.skillTag,
    source: r.source,
    createdAt: new Date(r.createdAt),
  }));
}

export async function loadLessons(learnerId: number): Promise<LessonRecord[]> {
  const rows = await db
    .selectFrom("lessonProgress")
    .select(["subtopicId", "completed", "updatedAt"])
    .where("learnerId", "=", learnerId)
    .execute();
  return rows.map((r) => ({ subtopicId: r.subtopicId, completed: r.completed, updatedAt: new Date(r.updatedAt) }));
}

export async function loadPlan(learnerId: number): Promise<{ plan: BaselinePlan | null; completedAt: Date | null }> {
  const row = await db
    .selectFrom("baselineSessions")
    .select(["plan", "completedAt"])
    .where("learnerId", "=", learnerId)
    .where("status", "=", "completed")
    .orderBy("completedAt", "desc")
    .limit(1)
    .executeTakeFirst();
  return {
    plan: (row?.plan as unknown as BaselinePlan | null) ?? null,
    completedAt: row?.completedAt ? new Date(row.completedAt) : null,
  };
}

export async function loadProgress(learnerId: number, grade: number): Promise<ProgressPayload> {
  const [attempts, lessons, { plan, completedAt }] = await Promise.all([
    loadAttempts(learnerId),
    loadLessons(learnerId),
    loadPlan(learnerId),
  ]);
  const summary = summariseProgress(grade, attempts, lessons, new Date(), plan?.order);
  const nameOf = (id: string) => curriculumRegistry.subtopic(grade, id)?.subtopic.name ?? id;
  const items: ActivityItem[] = [
    ...attempts
      .filter((a) => a.source !== "baseline" && curriculumRegistry.subtopic(grade, a.subtopicId))
      .slice(0, 40)
      .map((a) => ({ type: a.source as ActivityItem["type"], subtopicId: a.subtopicId, subtopicName: nameOf(a.subtopicId), outcome: a.outcome, at: a.createdAt })),
    ...lessons.map((l) => ({ type: "lesson" as const, subtopicId: l.subtopicId, subtopicName: nameOf(l.subtopicId), at: l.updatedAt })),
  ]
    .sort((a, b) => b.at.getTime() - a.at.getTime())
    .slice(0, 12);
  return { summary, recent: items, plan, baselineCompletedAt: completedAt };
}