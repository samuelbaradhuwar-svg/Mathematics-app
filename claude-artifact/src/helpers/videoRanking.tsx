// Ranking rules for YouTube results (pure, tested). Prefers South African, CAPS-aligned,
// Grade 8 lessons of a sensible length that match the topic words.
export interface RawVideo {
  id: string;
  title: string;
  channel: string;
  description: string;
  durationSeconds: number;
}

export const parseIsoDuration = (iso: string): number => {
  const m = iso.match(/^P(?:\d+D)?T?(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/);
  if (!m) return 0;
  return (Number(m[1] ?? 0) * 3600) + (Number(m[2] ?? 0) * 60) + Number(m[3] ?? 0);
};

export const formatDuration = (seconds: number): string => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return h > 0 ? `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}` : `${m}:${String(s).padStart(2, "0")}`;
};

const STOP = new Set(["grade", "maths", "math", "mathematics", "caps", "south", "africa", "the", "and", "of", "with", "lesson"]);

export const keywordsOf = (query: string): string[] =>
  query
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOP.has(w) && !/^\d+$/.test(w));

export interface ScoredVideo extends RawVideo {
  score: number;
  signals: string[];
  why: string;
}

export const scoreVideo = (v: RawVideo, query: string): ScoredVideo => {
  const hay = `${v.title} ${v.channel}`.toLowerCase();
  const full = `${hay} ${v.description.slice(0, 400).toLowerCase()}`;
  const signals: string[] = [];
  let score = 0;

  if (/\bcaps\b/.test(full)) { score += 3; signals.push("mentions CAPS"); }
  if (/south africa|\bsa\b|\bza\b|\bzar\b|rand/.test(full)) { score += 2; signals.push("South African"); }
  if (/(grade|gr\.?)\s?8\b/.test(full)) { score += 4; signals.push("Grade 8"); }
  else if (/(grade|gr\.?)\s?(9|10|11|12|7|6|5)\b/.test(hay)) { score -= 4; signals.push("a different grade"); }

  const kws = keywordsOf(query);
  const hits = kws.filter((k) => hay.includes(k));
  score += Math.min(4, hits.length * 1.5);
  if (hits.length) signals.push(`covers "${hits.slice(0, 3).join(", ")}"`);

  const mins = v.durationSeconds / 60;
  if (mins >= 4 && mins <= 20) score += 2;
  else if (mins < 2 || mins > 40) score -= 3;

  if (/\bexam\b|\bpaper\b|\bmemo\b|\bfull course\b|\bmarathon\b/.test(hay)) score -= 2;

  const dur = mins < 1 ? "under a minute" : `about ${Math.round(mins)} minute${Math.round(mins) === 1 ? "" : "s"}`;
  const why = `${signals.filter((s) => !s.startsWith("a different")).length ? `Picked because it ${signals.filter((s) => !s.startsWith("a different")).map((s) => (s.startsWith("covers") ? s : s === "mentions CAPS" ? "mentions CAPS" : s === "Grade 8" ? "is labelled Grade 8" : "looks South African")).join(", ")}.` : "Matches your topic words."} Length: ${dur}.`;
  return { ...v, score, signals, why };
};

export const rankVideos = (videos: RawVideo[], query: string, take = 6): ScoredVideo[] => {
  const seen = new Set<string>();
  return videos
    .filter((v) => (seen.has(v.id) ? false : (seen.add(v.id), true)))
    .map((v) => scoreVideo(v, query))
    .sort((a, b) => b.score - a.score)
    .slice(0, take);
};

export const youtubeSearchUrl = (q: string): string => `https://www.youtube.com/results?search_query=${encodeURIComponent(q)}`;