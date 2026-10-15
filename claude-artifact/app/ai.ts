// The tutor's brain is Claude itself, reached through the artifact "sample" capability.
// It runs on the viewer's own Claude account: there is no API key anywhere in this page.
export interface Turn {
  role: "user" | "assistant";
  content: string;
}
interface SampleFn {
  json<T>(input: string | Turn[], opts?: Record<string, unknown>): Promise<T>;
  limits(): Promise<{ images?: { maxCount: number; mediaTypes: string[] } }>;
}

let samplePromise: Promise<SampleFn | null> | null = null;
const getSample = (): Promise<SampleFn | null> => {
  if (!samplePromise) {
    samplePromise = (async () => {
      try {
        const c = window.claude;
        if (!c) return null;
        const s = await Promise.race([c.use("sample") as Promise<SampleFn | null>, new Promise<null>((r) => setTimeout(() => r(null), 12000))]);
        return s;
      } catch {
        return null;
      }
    })();
  }
  return samplePromise;
};

const friendly = (code: string | undefined): string => {
  switch (code) {
    case "not_granted":
      return "To use the tutor, please tap Allow when Claude asks. Then try again.";
    case "sampling_disabled":
    case "capability_disabled":
    case "capability_removed":
    case "not_declared":
      return "The tutor isn't available on this account. Please ask a parent or guardian to check.";
    case "rate_limited":
      return "That's a lot of questions in a short time. Let's take a short break and try again in a little while.";
    case "session_expired":
      return "Please sign in to Claude again, then try once more.";
    case "image_rejected":
    case "images_unavailable":
      return "I couldn't use that picture. Please try a different photo.";
    case "refused":
      return "I can't help with that one. Let's try a different maths question.";
    case "invalid_json":
    case "empty_completion":
      return "The tutor got muddled for a moment. Please try again.";
    case "cancelled":
      return "Stopped.";
    default:
      return "Something went wrong talking to the tutor. Please try again in a moment.";
  }
};

export interface AskOptions {
  system: string;
  messages: Turn[];
  schema: unknown;
  images?: Blob[];
  effort?: "low" | "medium" | "high";
}

export async function askJson<T>(o: AskOptions): Promise<T> {
  const sample = await getSample();
  if (!sample) throw new Error("The tutor needs to run inside Claude. Please open this page from Claude.");
  if (o.images?.length) {
    const lim = await sample.limits().catch(() => null);
    if (!lim?.images) throw new Error("Photo scanning isn't available here. You can type the question into Ask My Tutor instead.");
  }
  const instruction = `${o.system}\n\nREPLY WITH ONLY ONE JSON OBJECT (no code fence, no extra text) that matches this JSON Schema exactly:\n${JSON.stringify(o.schema)}`;
  const turns: Turn[] = [{ role: "user", content: instruction }, ...o.messages];
  try {
    return await sample.json<T>(turns, {
      cache: false,
      effort: o.effort ?? "low",
      ...(o.images?.length ? { images: o.images } : {}),
    });
  } catch (e) {
    const err = e as { code?: string; message?: string };
    console.error("sample failed", err?.code, err?.message);
    throw new Error(friendly(err?.code));
  }
}
