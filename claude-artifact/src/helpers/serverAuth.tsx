// Server-only helpers shared by endpoints: request parsing, JSON responses,
// consistent error handling and "who is the learner?" lookup.
import superjson from "superjson";
import { z } from "zod";
import { db } from "./db";
import { getServerUserSession } from "./getServerUserSession";
import { NotAuthenticatedError } from "./getSetServerSession";

export class HttpError extends Error {
  status: number;
  code?: string;
  constructor(status: number, message: string, code?: string) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

export const jsonResponse = <T,>(data: T, status = 200): Response =>
  new Response(superjson.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });

export const errorResponse = (e: unknown): Response => {
  if (e instanceof NotAuthenticatedError) {
    return jsonResponse({ error: "Please sign in again.", code: "NOT_AUTHENTICATED" }, 401);
  }
  if (e instanceof HttpError) {
    return jsonResponse({ error: e.message, code: e.code }, e.status);
  }
  if (e instanceof z.ZodError) {
    const first = e.issues[0];
    return jsonResponse({ error: first ? `${first.path.join(".") || "input"}: ${first.message}` : "Invalid input" }, 400);
  }
  const name = e && typeof e === "object" ? (e as { name?: string }).name : undefined;
  if (name === "FlootAiOutOfCreditsError") {
    // Floot notifies the app owner itself; the learner just gets a calm message.
    return jsonResponse(
      { error: "The tutor is resting right now. Please ask a parent or guardian to check on the app.", code: "OUT_OF_CREDITS" },
      503
    );
  }
  console.error("Unhandled endpoint error:", e);
  return jsonResponse({ error: "Something went wrong. Please try again." }, 500);
};

export async function parseBody<S extends z.ZodTypeAny>(request: Request, schema: S): Promise<z.infer<S>> {
  const text = await request.text();
  let raw: unknown = {};
  if (text) {
    try {
      raw = superjson.parse(text);
    } catch {
      throw new HttpError(400, "Could not read the request.");
    }
  }
  return schema.parse(raw);
}

export interface LearnerRow {
  id: number;
  userId: number;
  name: string;
  grade: number;
}

export async function requireLearner(request: Request): Promise<{ userId: number; learner: LearnerRow }> {
  const { user } = await getServerUserSession(request);
  const learner = await db
    .selectFrom("learners")
    .select(["id", "userId", "name", "grade"])
    .where("userId", "=", user.id)
    .orderBy("id", "asc")
    .executeTakeFirst();
  if (!learner) throw new HttpError(404, "No learner profile yet.", "NO_LEARNER");
  return { userId: user.id, learner };
}