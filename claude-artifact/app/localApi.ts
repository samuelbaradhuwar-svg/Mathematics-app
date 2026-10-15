// Stands in for the Floot server. Same request/response shapes the screens already expect,
// but everything runs in the page: maths marking and mastery in code, tutoring through Claude.
import { askJson } from "./ai";
import { store } from "./store";
import { buildPlan, nextProbe, BREAK_EVERY, BASELINE_AREAS, type BaselineAnswer, type BaselinePlan, type ProbeRole } from "../src/helpers/baselineEngine";
import { checkAnswer } from "../src/helpers/checkAnswer";
import { curriculumRegistry } from "../src/helpers/curriculumRegistry";
import { LEVELS, type Level, type Visual } from "../src/helpers/curriculumTypes";
import { describeMistake, buildLearnerProfile, subtopicFocus } from "../src/helpers/learnerProfile";
import { MASTERY, computeSubtopicProgress, dayKey, summariseProgress, type AttemptRecord, type LessonRecord } from "../src/helpers/mastery";
import { sameAnswer } from "../src/helpers/answerCompare";
import { verifyAgainstCalculator } from "../src/helpers/mathVerify";
import { generateQuestion, parseQuestionId, randomSeed, regenerateFromId } from "../src/helpers/questionRegistry";
import { toPublicQuestion } from "../src/helpers/publicQuestion";
import { EXPLAIN_SCHEMA, READ_SCHEMA, SOLVE_ONLY_SCHEMA, explainSystemPrompt, readSystemPrompt, solveOnlySystemPrompt, type ExplainJson } from "../src/helpers/scanPrompts";
import type { ScanExplanationDto, ScanReading, ScanServerData, VerificationStatus } from "../src/helpers/scanTypes";
import { chatSystemPrompt, DONT_UNDERSTAND_RE } from "../src/helpers/tutorPersona";
import { questionHome } from "../src/helpers/subtopicLookup";
import { youtubeSearchUrl } from "../src/helpers/videoRanking";
import { sanitiseVisual, type AiVisual } from "../src/helpers/visualFromAi";
import type { ProgressPayload, ActivityItem } from "../src/helpers/loadProgress";

const GRADE = 8;

// ---------------------------------------------------------------- stored shapes
interface Profile {
  name: string;
  grade: number;
  pinHash: string;
  pinSalt: string;
  createdAt: string;
  pinFails?: number;
  lockedUntil?: number;
}
interface CompactAttempt {
  t: string; // ISO time
  s: string; // subtopic
  p: string; // topic
  l: Level;
  o: AttemptRecord["outcome"];
  m?: string | null;
  k?: string | null;
  src: AttemptRecord["source"];
  q: string; // question id (stops the same question counting twice)
}
interface LessonsDoc {
  items: Record<string, { stage: string; completed: boolean; updatedAt: string }>;
}
interface BaselineCurrent {
  areaId: string;
  areaLabel: string;
  role: ProbeRole;
  questionId: string;
}
interface BaselineDoc {
  status: "in_progress" | "completed";
  history: BaselineAnswer[];
  current: BaselineCurrent | null;
  plan: BaselinePlan | null;
  startedAt: string;
  completedAt?: string;
}
interface ChatMsg {
  id: number;
  role: "user" | "assistant";
  content: string;
  visual: Visual | null;
  createdAt: string;
}
interface ChatDoc {
  id: number;
  title: string;
  updatedAt: string;
  messages: ChatMsg[];
}

// ---------------------------------------------------------------- helpers
class ApiError extends Error {}
const fail = (msg: string): never => {
  throw new ApiError(msg);
};

const profile = (): Profile | undefined => store.get<Profile>("profile");
const requireProfile = (): Profile => profile() ?? fail("Please set up the profile first.");

const loadAttempts = (): { list: AttemptRecord[]; ids: Set<string> } => {
  const list: AttemptRecord[] = [];
  const ids = new Set<string>();
  for (const id of store.ids("att-")) {
    const doc = store.get<{ items: CompactAttempt[] }>(id);
    for (const a of doc?.items ?? []) {
      ids.add(a.q);
      list.push({ subtopicId: a.s, topicId: a.p, level: a.l, outcome: a.o, mistakeTag: a.m ?? null, skillTag: a.k ?? null, source: a.src, createdAt: new Date(a.t) });
    }
  }
  return { list, ids };
};

const addAttempt = (a: CompactAttempt): boolean => {
  const { ids } = loadAttempts();
  if (ids.has(a.q)) return false;
  const docId = `att-${dayKey(new Date(a.t))}`;
  const doc = store.get<{ items: CompactAttempt[] }>(docId) ?? { items: [] };
  store.set(docId, { items: [...doc.items, a] });
  return true;
};

const loadLessons = (): LessonRecord[] => {
  const d = store.get<LessonsDoc>("lessons");
  return Object.entries(d?.items ?? {}).map(([subtopicId, v]) => ({ subtopicId, completed: v.completed, updatedAt: new Date(v.updatedAt) }));
};

const baselineDoc = (): BaselineDoc | undefined => store.get<BaselineDoc>("baseline");

// ---------------------------------------------------------------- progress
const progressPayload = (): ProgressPayload => {
  const pr = requireProfile();
  const { list: attempts } = loadAttempts();
  const lessons = loadLessons();
  const b = baselineDoc();
  const plan = b?.status === "completed" ? b.plan : null;
  const summary = summariseProgress(pr.grade, attempts, lessons, new Date(), plan?.order);
  const nameOf = (id: string) => curriculumRegistry.subtopic(pr.grade, id)?.subtopic.name ?? id;
  const desc = [...attempts].sort((x, y) => y.createdAt.getTime() - x.createdAt.getTime());
  const items: ActivityItem[] = [
    ...desc
      .filter((a) => a.source !== "baseline" && curriculumRegistry.subtopic(pr.grade, a.subtopicId))
      .slice(0, 40)
      .map((a) => ({ type: a.source as ActivityItem["type"], subtopicId: a.subtopicId, subtopicName: nameOf(a.subtopicId), outcome: a.outcome, at: a.createdAt })),
    ...lessons.map((l) => ({ type: "lesson" as const, subtopicId: l.subtopicId, subtopicName: nameOf(l.subtopicId), at: l.updatedAt })),
  ]
    .sort((a, b2) => b2.at.getTime() - a.at.getTime())
    .slice(0, 12);
  return { summary, recent: items, plan, baselineCompletedAt: b?.completedAt ? new Date(b.completedAt) : null };
};

const learnerDto = () => {
  const pr = profile();
  if (!pr) return null;
  const b = baselineDoc();
  return { id: 1, name: pr.name, grade: pr.grade, hasPin: !!pr.pinHash, baseline: (b ? b.status : "none") as "none" | "in_progress" | "completed" };
};

// ---------------------------------------------------------------- parent PIN (a convenience lock)
const hashPin = async (pin: string, salt: string): Promise<string> => {
  const data = new TextEncoder().encode(`${salt}:${pin}`);
  try {
    const buf = await crypto.subtle.digest("SHA-256", data);
    return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
  } catch {
    let h = 5381;
    for (const c of `${salt}:${pin}`) h = ((h << 5) + h + c.charCodeAt(0)) | 0;
    return `weak-${h}`;
  }
};
const randomSalt = () => Array.from(crypto.getRandomValues(new Uint8Array(12))).map((b) => b.toString(16).padStart(2, "0")).join("");

const verifyPin = async (pin: string): Promise<void> => {
  const pr = requireProfile();
  if (pr.lockedUntil && pr.lockedUntil > Date.now()) {
    const mins = Math.ceil((pr.lockedUntil - Date.now()) / 60000);
    fail(`Too many tries. Please wait about ${mins} minute${mins === 1 ? "" : "s"} and try again.`);
  }
  if ((await hashPin(pin, pr.pinSalt)) === pr.pinHash) {
    if (pr.pinFails || pr.lockedUntil) store.set("profile", { ...pr, pinFails: 0, lockedUntil: undefined });
    return;
  }
  const fails = (pr.pinFails ?? 0) + 1;
  if (fails >= 5) {
    store.set("profile", { ...pr, pinFails: 0, lockedUntil: Date.now() + 5 * 60000 });
    fail("Too many tries. Please wait 5 minutes and try again.");
  }
  store.set("profile", { ...pr, pinFails: fails });
  fail("That PIN isn't right.");
};

// ---------------------------------------------------------------- baseline
const buildCurrent = (history: BaselineAnswer[]): BaselineCurrent | null => {
  const next = nextProbe(history);
  if (!next) return null;
  const q = generateQuestion(next.probe.generator, next.probe.level, randomSeed());
  return { areaId: next.area.id, areaLabel: next.area.label, role: next.role, questionId: q.id };
};

const baselineState = () => {
  const row = baselineDoc();
  if (!row) return { status: "none" as const, answered: 0, estimatedTotal: 20, breakSuggested: false, current: null, plan: null };
  const history = row.history;
  const next = nextProbe(history);
  const estimatedTotal = Math.max(history.length + (next ? 1 : 0), Math.min(26, BASELINE_AREAS.length + Math.ceil(BASELINE_AREAS.length * 0.7)));
  let current = null as null | { areaLabel: string; role: ProbeRole; question: ReturnType<typeof toPublicQuestion> };
  if (row.status === "in_progress" && row.current) {
    const q = regenerateFromId(row.current.questionId);
    if (q) current = { areaLabel: row.current.areaLabel, role: row.current.role, question: toPublicQuestion(q) };
  }
  return { status: row.status, answered: history.length, estimatedTotal, breakSuggested: history.length > 0 && history.length % BREAK_EVERY === 0, current, plan: row.plan };
};

// ---------------------------------------------------------------- practice
const subtopicProgress = (subtopicId: string, topicId: string) => {
  const { list } = loadAttempts();
  const lesson = loadLessons().find((l) => l.subtopicId === subtopicId);
  return computeSubtopicProgress(subtopicId, topicId, list, lesson);
};

// ---------------------------------------------------------------- tutor chat
const CHAT_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["reply", "visual"],
  properties: {
    reply: { type: "string" },
    visual: {
      anyOf: [
        { type: "null" },
        {
          type: "object",
          additionalProperties: false,
          required: ["type", "numbers", "left", "right", "caption"],
          properties: {
            type: { type: "string", enum: ["numberline", "fractionbar", "balance", "gridrect", "angleline", "coordplane", "cuboid", "circle"] },
            numbers: { type: "array", items: { type: "number" } },
            left: { type: "string" },
            right: { type: "string" },
            caption: { type: "string" },
          },
        },
      ],
    },
  },
};

const chatDocs = (): ChatDoc[] =>
  store
    .ids("chat-")
    .map((id) => store.get<ChatDoc>(id)!)
    .filter(Boolean)
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));

// ---------------------------------------------------------------- scan (kept for this visit)
interface ScanRecord {
  id: number;
  reading?: ScanReading;
  explanation?: { dto: ScanExplanationDto; server: ScanServerData };
  subtopicId?: string | null;
}
const scans = new Map<number, ScanRecord>();
let scanCounter = 0;

const base64ToBlob = (b64: string, type: string): Blob => {
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return new Blob([bytes], { type });
};

const independentAnswer = async (questionText: string): Promise<string | null> => {
  try {
    const r = await askJson<{ finalAnswerPlain: string }>({ system: solveOnlySystemPrompt(), messages: [{ role: "user", content: questionText }], schema: SOLVE_ONLY_SCHEMA, effort: "low" });
    return r.finalAnswerPlain;
  } catch {
    return null;
  }
};

// ---------------------------------------------------------------- videos
const videoLinks = (subtopicId?: string, topicId?: string, q?: string) => {
  if (q && q.trim()) {
    const clean = q.trim().replace(/\s+/g, " ").slice(0, 80);
    const base = /grade\s?8|gr\s?8/i.test(clean) ? clean : `Grade 8 maths ${clean}`;
    return {
      query: `${base} CAPS South Africa`,
      links: [
        { label: `"${clean}" - Grade 8 CAPS lessons`, url: youtubeSearchUrl(`${base} CAPS South Africa`) },
        { label: `"${clean}" - explained slowly`, url: youtubeSearchUrl(`${base} explained step by step`) },
      ],
    };
  }
  if (subtopicId) {
    const ref = curriculumRegistry.subtopic(GRADE, subtopicId) ?? fail("Unknown lesson.");
    const name = ref.subtopic.name;
    return {
      query: `Grade 8 maths ${name} CAPS South Africa`,
      links: [
        { label: `Grade 8 CAPS: ${name}`, url: youtubeSearchUrl(`Grade 8 maths ${name} CAPS South Africa`) },
        { label: `${name} explained slowly (Grade 8)`, url: youtubeSearchUrl(`${name} Grade 8 maths explained step by step South Africa`) },
        ...ref.topic.videoQueries.slice(0, 1).map((vq) => ({ label: `${ref.topic.name}: full topic lessons`, url: youtubeSearchUrl(vq) })),
      ],
    };
  }
  if (topicId) {
    const t = curriculumRegistry.topic(GRADE, topicId) ?? fail("Unknown topic.");
    return {
      query: t.videoQueries[0] ?? `Grade 8 maths ${t.name} CAPS South Africa`,
      links: t.videoQueries.map((vq, i) => ({ label: i === 0 ? `${t.name}: Grade 8 CAPS lessons` : vq.replace(/ South Africa$/, ""), url: youtubeSearchUrl(vq) })),
    };
  }
  return fail("Tell me which topic you want videos for.");
};

// ================================================================ the routes
type Handler = (input: any) => Promise<unknown> | unknown;

const routes: Record<string, Handler> = {
  "GET /_api/learner/me": () => ({ learner: learnerDto() }),

  "POST /_api/learner/setup": async (input: { name: string; parentPin: string }) => {
    if (!profile()) {
      const salt = randomSalt();
      store.set("profile", { name: input.name.trim().slice(0, 40), grade: GRADE, pinHash: await hashPin(input.parentPin, salt), pinSalt: salt, createdAt: new Date().toISOString() } satisfies Profile);
    }
    return { learner: learnerDto() };
  },

  "GET /_api/progress/overview": () => progressPayload(),

  "POST /_api/lesson/progress": (input: { subtopicId: string; stage: string; completed: boolean }) => {
    requireProfile();
    if (!curriculumRegistry.subtopic(GRADE, input.subtopicId)) fail("Unknown lesson.");
    const d = store.get<LessonsDoc>("lessons") ?? { items: {} };
    const prev = d.items[input.subtopicId];
    store.set("lessons", { items: { ...d.items, [input.subtopicId]: { stage: input.stage, completed: prev?.completed ? true : input.completed, updatedAt: new Date().toISOString() } } });
    return { ok: true };
  },

  "POST /_api/practice/record": (input: { questionId: string; givenAnswer: string; firstWrongAnswer?: string; hintsUsed: number; tries: number; revealed: boolean; source: "practice" | "lesson" }) => {
    const pr = requireProfile();
    const parsed = parseQuestionId(input.questionId);
    const q = regenerateFromId(input.questionId);
    if (!parsed || !q) fail("Unknown question.");
    const finalCheck = checkAnswer(q!, input.givenAnswer);
    const correct = finalCheck.status === "correct" && !input.revealed;
    const outcome = !correct ? "incorrect" : input.hintsUsed === 0 && input.tries === 1 ? "clean" : "assisted";
    let mistakeTag: string | null = null;
    if (input.firstWrongAnswer) {
      const c = checkAnswer(q!, input.firstWrongAnswer);
      if (c.status === "incorrect" && c.tag) mistakeTag = c.tag;
    }
    if (!mistakeTag && !correct && input.givenAnswer) {
      const c = checkAnswer(q!, input.givenAnswer);
      if (c.status === "incorrect" && c.tag) mistakeTag = c.tag;
    }
    const home = questionHome(pr.grade, parsed!.generator);
    const before = home.isFoundation ? null : subtopicProgress(home.subtopicId, home.topicId);
    const inserted = addAttempt({ t: new Date().toISOString(), s: home.subtopicId, p: home.topicId, l: parsed!.level, o: outcome, m: mistakeTag, k: q!.skillTag, src: input.source, q: input.questionId });
    const after = home.isFoundation ? null : subtopicProgress(home.subtopicId, home.topicId);
    const events: unknown[] = [];
    if (before && after && inserted) {
      for (const l of LEVELS) if (!before.levels[l].mastered && after.levels[l].mastered) events.push({ type: "level-mastered", level: l });
      if (before.status !== "understood" && after.status === "understood") events.push({ type: "understood" });
      if (before.status !== "needs-help" && after.status === "needs-help") events.push({ type: "needs-help" });
      if (before.recommendedLevel !== after.recommendedLevel && LEVELS.indexOf(after.recommendedLevel) < LEVELS.indexOf(before.recommendedLevel)) events.push({ type: "stepped-back", to: after.recommendedLevel });
    }
    return { outcome, subtopic: after, events, duplicate: !inserted };
  },

  // ---------------- baseline
  "GET /_api/baseline/state": () => ({ state: baselineState() }),

  "POST /_api/baseline/start": (input: { restart?: boolean }) => {
    requireProfile();
    const row = baselineDoc();
    if (!(row && row.status === "in_progress") && !(row && row.status === "completed" && !input?.restart)) {
      store.set("baseline", { status: "in_progress", history: [], current: buildCurrent([]), plan: null, startedAt: new Date().toISOString() } satisfies BaselineDoc);
    }
    return { state: baselineState() };
  },

  "POST /_api/baseline/answer": (input: { questionId: string; answer: string | null }) => {
    const pr = requireProfile();
    const row = baselineDoc() ?? fail("Please start the check-up first.");
    const cur = row.current;
    if (row.status !== "in_progress" || !cur) fail("There is no question waiting.");
    if (cur!.questionId !== input.questionId) fail("That question has already been answered.");
    const parsed = parseQuestionId(input.questionId);
    const q = regenerateFromId(input.questionId);
    if (!parsed || !q) fail("Unknown question.");
    let result: BaselineAnswer["result"] = "unsure";
    let mistakeTag: string | null = "baseline.unsure";
    if (input.answer !== null && input.answer.trim() !== "") {
      const check = checkAnswer(q!, input.answer);
      if (check.status === "correct" || check.status === "almost") {
        result = "correct";
        mistakeTag = null;
      } else {
        result = "wrong";
        mistakeTag = check.tag ?? null;
      }
    }
    const home = questionHome(pr.grade, parsed!.generator);
    addAttempt({ t: new Date().toISOString(), s: home.subtopicId, p: home.topicId, l: parsed!.level, o: result === "correct" ? "clean" : "incorrect", m: mistakeTag, k: q!.skillTag, src: "baseline", q: input.questionId });
    const history = row.history.concat({ areaId: cur!.areaId, role: cur!.role, questionId: input.questionId, result });
    const next = buildCurrent(history);
    if (next) {
      store.set("baseline", { ...row, history, current: next } satisfies BaselineDoc);
    } else {
      store.set("baseline", { ...row, history, current: null, plan: buildPlan(pr.grade, history), status: "completed", completedAt: new Date().toISOString() } satisfies BaselineDoc);
    }
    return { state: baselineState() };
  },

  // ---------------- tutor
  "GET /_api/tutor/history": (input?: { threadId?: number }) => {
    requireProfile();
    const threads = chatDocs().slice(0, 20);
    const wanted = input?.threadId;
    const threadId = wanted && threads.some((t) => t.id === wanted) ? wanted : threads[0]?.id ?? null;
    const t = threads.find((x) => x.id === threadId);
    return {
      threads: threads.map((x) => ({ id: x.id, title: x.title, updatedAt: new Date(x.updatedAt) })),
      threadId,
      messages: (t?.messages ?? []).slice(-60).map((m) => ({ id: m.id, role: m.role, content: m.content, visual: m.visual, createdAt: new Date(m.createdAt) })),
    };
  },

  "POST /_api/tutor/chat": async (input: { threadId?: number; message: string; mode?: "chat" | "hint" | "explain-differently"; context?: { subtopicId?: string; question?: string; studentAnswer?: string; hintsShown?: string[] } }) => {
    const pr = requireProfile();
    const message = input.message.trim().slice(0, 2000);
    if (!message) fail("Type a message first");
    const all = chatDocs();
    let thread = input.threadId ? all.find((t) => t.id === input.threadId) : undefined;
    if (input.threadId && !thread) fail("That chat was not found.");
    if (!thread) thread = { id: Math.max(0, ...all.map((t) => t.id)) + 1, title: message.slice(0, 40), updatedAt: new Date().toISOString(), messages: [] };
    const nextId = () => thread!.id * 100000 + thread!.messages.length + 1;
    const userMsg: ChatMsg = { id: nextId(), role: "user", content: message, visual: null, createdAt: new Date().toISOString() };
    thread = { ...thread, messages: [...thread.messages, userMsg] };

    let dontUnderstand = 0;
    for (const m of [...thread.messages].reverse().filter((x) => x.role === "user")) {
      if (DONT_UNDERSTAND_RE.test(m.content)) dontUnderstand++;
      else break;
    }
    const mode = input.mode ?? "chat";
    if (mode === "explain-differently") dontUnderstand = Math.max(dontUnderstand, 1);
    const payload = progressPayload();
    const ctx = input.context;
    const focusParts = [subtopicFocus(pr.grade, ctx?.subtopicId)];
    if (ctx?.question) focusParts.push(`Question on screen: ${ctx.question}`);
    if (ctx?.studentAnswer) focusParts.push(`His latest answer: ${ctx.studentAnswer}`);
    if (ctx?.hintsShown?.length) focusParts.push(`Hints already shown: ${ctx.hintsShown.join(" || ")}`);
    const system = chatSystemPrompt({ learnerName: pr.name, grade: pr.grade, profile: buildLearnerProfile(pr.grade, payload), focus: focusParts.filter(Boolean).join("\n"), dontUnderstandCount: dontUnderstand, mode });

    let recent = thread.messages.slice(-14).map((m) => ({ role: m.role, content: m.content }));
    while (recent.length && recent[0].role !== "user") recent = recent.slice(1);
    const out = await askJson<{ reply: string; visual: AiVisual | null }>({ system, messages: recent, schema: CHAT_SCHEMA, effort: "low" });
    const reply = (out.reply || "").trim() || "Let's try that again. Could you tell me which part is tricky?";
    const visual = sanitiseVisual(out.visual);
    const aiMsg: ChatMsg = { id: thread.id * 100000 + thread.messages.length + 1, role: "assistant", content: reply, visual, createdAt: new Date().toISOString() };
    const saved: ChatDoc = { ...thread, messages: [...thread.messages, aiMsg].slice(-120), updatedAt: new Date().toISOString() };
    store.set(`chat-${saved.id}`, saved as unknown as Record<string, unknown>);
    return { threadId: saved.id, title: saved.title, message: { id: aiMsg.id, role: "assistant" as const, content: reply, visual, createdAt: new Date(aiMsg.createdAt) } };
  },

  // ---------------- scan
  "POST /_api/scan/read": async (input: { imageBase64: string; mediaType: string; note?: string }) => {
    const pr = requireProfile();
    const blob = base64ToBlob(input.imageBase64, input.mediaType);
    const reading = await askJson<ScanReading>({
      system: readSystemPrompt(pr.name, pr.grade),
      messages: [{ role: "user", content: input.note ? `The attached photo is the learner's maths work. Transcribe it. The learner added this note: ${input.note}` : "The attached photo is the learner's maths work. Transcribe it." }],
      schema: READ_SCHEMA,
      images: [blob],
      effort: "low",
    });
    if (!curriculumRegistry.subtopic(pr.grade, reading.subtopicGuess)) reading.subtopicGuess = "unknown";
    reading.questions = (reading.questions ?? []).slice(0, 12);
    reading.uncertain = (reading.uncertain ?? []).filter((u) => u.questionIndex >= 0 && u.questionIndex < reading.questions.length).slice(0, 12);
    const id = ++scanCounter;
    scans.set(id, { id, reading });
    return { scanId: id, reading };
  },

  "POST /_api/scan/explain": async (input: { scanId: number; confirmedText: string; diagramNote?: string; handwrittenWork?: string }) => {
    const pr = requireProfile();
    const scan = scans.get(input.scanId) ?? fail("That scan was not found.");
    const payload = progressPayload();
    const system = explainSystemPrompt(pr.name, pr.grade, buildLearnerProfile(pr.grade, payload));
    const userText = [
      `Question (confirmed by ${pr.name}):\n${input.confirmedText}`,
      input.diagramNote ? `Description of the diagram:\n${input.diagramNote}` : "",
      input.handwrittenWork ? `His own working from the photo:\n${input.handwrittenWork}` : "",
    ].filter(Boolean).join("\n\n");
    const base = [{ role: "user" as const, content: userText }];

    let sol = await askJson<ExplainJson>({ system, messages: base, schema: EXPLAIN_SCHEMA, effort: "medium" });

    let calc = verifyAgainstCalculator(input.confirmedText, sol.finalAnswerPlain);
    if (calc.status === "mismatch") {
      sol = await askJson<ExplainJson>({
        system,
        messages: [
          ...base,
          { role: "assistant", content: JSON.stringify(sol) },
          { role: "user", content: `A calculator check disagrees with your answer: it found ${calc.expected} (${calc.detail ?? ""}) but your finalAnswerPlain was "${sol.finalAnswerPlain}". Re-read the question, re-check EVERY step, and return the full corrected JSON. If your answer was right, explain clearly why in "check".` },
        ],
        schema: EXPLAIN_SCHEMA,
        effort: "medium",
      });
      calc = verifyAgainstCalculator(input.confirmedText, sol.finalAnswerPlain);
    }

    let status: VerificationStatus;
    let note: string;
    if (calc!.status === "verified") {
      status = "calculator-checked";
      note = "I double-checked this answer with a calculator program. ✓";
    } else if (calc!.status === "mismatch") {
      status = "unsure";
      note = "I got two different answers when I checked this one, so I'm not completely sure. Please look at it together with a parent or your teacher.";
    } else {
      const second = await independentAnswer([input.confirmedText, input.diagramNote ?? ""].filter(Boolean).join("\n"));
      if (second !== null && sameAnswer(second, sol.finalAnswerPlain)) {
        status = "double-checked";
        note = "I solved this twice, separately, and got the same answer both times. ✓";
      } else if (second === null) {
        status = "not-checked";
        note = "I couldn't double-check this one. If something looks odd, ask a parent or your teacher.";
      } else {
        status = "unsure";
        note = "When I solved this a second time I got a different answer, so I'm not completely sure. Please look at it together with a parent or your teacher.";
      }
    }

    const subtopicId = curriculumRegistry.subtopic(pr.grade, sol.topic.subtopicId) ? sol.topic.subtopicId : null;
    let practiceOk = false;
    const pv = verifyAgainstCalculator(sol.practice.question, sol.practice.answerPlain);
    if (pv.status === "verified") practiceOk = true;
    else if (pv.status === "unverifiable") {
      const second = await independentAnswer(sol.practice.question);
      practiceOk = second !== null && sameAnswer(second, sol.practice.answerPlain);
    }

    let practice: ScanExplanationDto["practice"] = null;
    let server: ScanServerData = { practice: null };
    if (practiceOk && sol.practice.hints.length >= 2) {
      practice = { question: sol.practice.question, kind: sol.practice.answerKind, hints: sol.practice.hints.slice(0, 3), source: "similar" };
      server = { practice: { source: "similar", answerPlain: sol.practice.answerPlain, kind: sol.practice.answerKind, solutionSteps: sol.practice.solutionSteps, answerText: sol.practice.answerText } };
    } else if (subtopicId) {
      const ref = curriculumRegistry.subtopic(pr.grade, subtopicId)!;
      const q = generateQuestion(ref.subtopic.generator, "beginner", randomSeed());
      practice = { question: q.prompt, kind: q.kind === "fraction" ? "text" : q.kind, choices: q.choices, unit: q.unit, hints: q.hints.slice(0, 3), visual: q.visual, source: "curriculum" };
      server = { practice: { source: "curriculum", questionId: q.id } };
    }

    const dto: ScanExplanationDto = {
      scanId: scan.id,
      subtopicId,
      topicName: sol.topic.name,
      question: input.confirmedText,
      asking: sol.asking,
      concepts: sol.concepts,
      steps: sol.steps,
      finalAnswer: sol.finalAnswer,
      check: [sol.check, sol.studentWorkFeedback].filter(Boolean).join("\n\n"),
      alternative: sol.alternative,
      similar: sol.similar,
      practice,
      encouragement: sol.encouragement,
      verification: { status, note },
    };
    scans.set(scan.id, { ...scan, explanation: { dto, server }, subtopicId });
    return { explanation: dto };
  },

  "POST /_api/scan/practice": (input: { scanId: number; givenAnswer: string; hintsUsed: number; tries: number; revealed: boolean }) => {
    const pr = requireProfile();
    const scan = scans.get(input.scanId);
    const p = scan?.explanation?.server.practice;
    if (!scan || !p) fail("There is no practice question for this scan.");
    let q: ReturnType<typeof generateQuestion> | { kind: "numeric" | "expression"; prompt: string; answer: string; answerText: string; hints: string[]; steps: []; skillTag: string };
    let solution: { steps: { title: string; say: string; math: string; why?: string }[]; answerText: string };
    let questionId: string;
    if (p!.source === "curriculum") {
      const g = regenerateFromId(p!.questionId) ?? fail("Practice question unavailable.");
      q = g;
      questionId = p!.questionId;
      solution = { steps: g.steps.map((s) => ({ title: s.title, say: s.say, math: s.math ?? "", why: s.why })), answerText: g.answerText };
    } else {
      const plain = p!.answerPlain.replace(/^\s*[a-zA-Z]\s*=\s*/, "");
      const kind = p!.kind === "expression" && /[a-zA-Z]/.test(plain) ? "expression" : "numeric";
      q = { kind, prompt: "", answer: plain, answerText: p!.answerText, hints: [], steps: [], skillTag: `scan.${scan!.subtopicId ?? "unknown"}` };
      questionId = `scan-${scan!.id}`;
      solution = { steps: p!.solutionSteps.map((s) => ({ title: s.title, say: s.say, math: s.math })), answerText: p!.answerText };
    }
    const cleaned = q.kind === "numeric" ? input.givenAnswer.replace(/[a-zA-Z°²³%]+\s*$/g, "").trim() : input.givenAnswer;
    const check = input.revealed
      ? ({ status: "revealed" } as const)
      : q.kind === "numeric" && cleaned === "" && input.givenAnswer.trim() !== ""
        ? ({ status: "unreadable", note: "I couldn't read that as a number. Type just the number, for example 12 or 3,5." } as const)
        : checkAnswer(q as never, cleaned);
    const final = input.revealed || check.status === "correct";
    let outcome: "clean" | "assisted" | "incorrect" | undefined;
    if (final) {
      outcome = input.revealed ? "incorrect" : input.hintsUsed === 0 && input.tries === 1 ? "clean" : "assisted";
      const subtopicId = scan!.subtopicId && curriculumRegistry.subtopic(pr.grade, scan!.subtopicId) ? scan!.subtopicId : null;
      if (subtopicId) {
        const ref = curriculumRegistry.subtopic(pr.grade, subtopicId)!;
        addAttempt({ t: new Date().toISOString(), s: subtopicId, p: ref.topic.id, l: "beginner", o: outcome, m: null, k: q.skillTag, src: "scan", q: questionId });
      }
    }
    return { status: check.status, note: "note" in check ? check.note : undefined, solution: final ? solution : undefined, outcome };
  },

  // ---------------- videos
  "GET /_api/videos/search": (input: { subtopicId?: string; topicId?: string; q?: string }) => {
    requireProfile();
    const { query, links } = videoLinks(input?.subtopicId, input?.topicId, input?.q);
    return {
      mode: "search-links" as const,
      query,
      videos: [],
      searchLinks: links,
      cached: false,
      note: "Inside Claude I can't show video previews, and I won't make up videos. These buttons open YouTube searches for this topic. Look for Grade 8 CAPS lessons from South African teachers.",
    };
  },

  // ---------------- parent
  "POST /_api/parent/overview": async (input: { pin: string }) => {
    const pr = requireProfile();
    await verifyPin(input.pin);
    const payload = progressPayload();
    const grade = pr.grade;
    const name = (id: string) => curriculumRegistry.subtopic(grade, id)?.subtopic.name ?? id;
    const subs = Object.values(payload.summary.subtopics);
    const ranked = [...subs.filter((s) => s.status === "needs-help"), ...subs.filter((s) => s.status === "practising").sort((a, b) => a.score - b.score)].slice(0, 4);
    const practiceTogether = ranked.map((s) => {
      const ref = curriculumRegistry.subtopic(grade, s.subtopicId)!;
      const mistake = ref.subtopic.mistakes[0];
      return {
        subtopicId: s.subtopicId,
        name: ref.subtopic.name,
        topicName: ref.topic.name,
        why: s.status === "needs-help" ? s.reason : `Still being practised (${s.reason.toLowerCase()})`,
        tip: `${ref.subtopic.realWorld} Watch out for this common slip: "${mistake.mistake}" ${mistake.fix}`,
      };
    });
    const mistakes = payload.summary.stats.recurringMistakes.map((m) => ({ tag: m.tag, text: describeMistake(grade, m.tag), count: m.count, subtopicName: name(m.subtopicId) }));
    return { learnerName: pr.name, payload, practiceTogether, mistakes, thresholds: { windowSize: MASTERY.windowSize, requiredClean: MASTERY.requiredClean, understoodDays: MASTERY.understoodDays } };
  },

  "POST /_api/parent/pin": async (input: { currentPin: string; newPin: string }) => {
    const pr = requireProfile();
    await verifyPin(input.currentPin);
    const salt = randomSalt();
    store.set("profile", { ...(store.get<Profile>("profile") ?? pr), pinSalt: salt, pinHash: await hashPin(input.newPin, salt) });
    return { ok: true };
  },
};

export async function api(method: "GET" | "POST", url: string, args: unknown[]): Promise<unknown> {
  const h = routes[`${method} ${url}`];
  if (!h) throw new Error(`Unknown request ${method} ${url}`);
  try {
    // tiny pause so the screens behave exactly as they did against a real server
    return await h(args[0]);
  } catch (e) {
    if (e instanceof ApiError) throw new Error(e.message);
    throw e;
  }
}
