// Server-only: state of a learner's baseline assessment.
import { db } from "./db";
import {
  BASELINE_AREAS,
  BREAK_EVERY,
  buildPlan,
  nextProbe,
  type BaselineAnswer,
  type BaselinePlan,
  type ProbeRole,
} from "./baselineEngine";
import { HttpError } from "./serverAuth";
import { toPublicQuestion, type PublicQuestion } from "./publicQuestion";
import { generateQuestion, randomSeed } from "./questionRegistry";

export interface BaselineCurrent {
  areaId: string;
  areaLabel: string;
  role: ProbeRole;
  questionId: string;
}

export interface BaselineState {
  status: "none" | "in_progress" | "completed";
  answered: number;
  estimatedTotal: number;
  breakSuggested: boolean;
  current: { areaLabel: string; role: ProbeRole; question: PublicQuestion } | null;
  plan: BaselinePlan | null;
}

interface SessionRow {
  id: number;
  status: "in_progress" | "completed";
  history: unknown;
  current: unknown;
  plan: unknown;
}

const asHistory = (h: unknown): BaselineAnswer[] => (Array.isArray(h) ? (h as BaselineAnswer[]) : []);

export const buildCurrent = (history: BaselineAnswer[]): BaselineCurrent | null => {
  const next = nextProbe(history);
  if (!next) return null;
  const q = generateQuestion(next.probe.generator, next.probe.level, randomSeed());
  return { areaId: next.area.id, areaLabel: next.area.label, role: next.role, questionId: q.id };
};

export const toState = (row: SessionRow | undefined): BaselineState => {
  if (!row) return { status: "none", answered: 0, estimatedTotal: 20, breakSuggested: false, current: null, plan: null };
  const history = asHistory(row.history);
  const next = nextProbe(history);
  const estimatedTotal = Math.max(history.length + (next ? 1 : 0), Math.min(26, BASELINE_AREAS.length + Math.ceil(BASELINE_AREAS.length * 0.7)));
  let current: BaselineState["current"] = null;
  const cur = row.current as BaselineCurrent | null;
  if (row.status === "in_progress" && cur) {
    const [generator, level, seed] = cur.questionId.split("|");
    const q = generateQuestion(generator, level as "beginner" | "intermediate" | "advanced", Number(seed));
    current = { areaLabel: cur.areaLabel, role: cur.role, question: toPublicQuestion(q) };
  }
  return {
    status: row.status,
    answered: history.length,
    estimatedTotal,
    breakSuggested: history.length > 0 && history.length % BREAK_EVERY === 0,
    current,
    plan: (row.plan as BaselinePlan | null) ?? null,
  };
};

export const latestSession = async (learnerId: number): Promise<SessionRow | undefined> =>
  (await db
    .selectFrom("baselineSessions")
    .select(["id", "status", "history", "current", "plan"])
    .where("learnerId", "=", learnerId)
    .orderBy("createdAt", "desc")
    .limit(1)
    .executeTakeFirst()) as SessionRow | undefined;

export const startSession = async (learnerId: number, restart: boolean): Promise<SessionRow> => {
  const latest = await latestSession(learnerId);
  if (latest && latest.status === "in_progress") return latest;
  if (latest && latest.status === "completed" && !restart) return latest;
  const current = buildCurrent([]);
  const created = await db
    .insertInto("baselineSessions")
    .values({ learnerId, status: "in_progress", history: [], current: current as never })
    .returning(["id", "status", "history", "current", "plan"])
    .executeTakeFirstOrThrow();
  return created as SessionRow;
};

export const finishPlan = (grade: number, history: BaselineAnswer[]): BaselinePlan => buildPlan(grade, history);

export const assertCurrent = (row: SessionRow, questionId: string): BaselineCurrent => {
  const cur = row.current as BaselineCurrent | null;
  if (row.status !== "in_progress" || !cur) throw new HttpError(409, "There is no question waiting.");
  if (cur.questionId !== questionId) throw new HttpError(409, "That question has already been answered.", "STALE_QUESTION");
  return cur;
};