// Number helpers shared by question generators, answer checking and the UI.
// South African convention: decimal COMMA (3,5) and a space for thousands.

export const gcd = (a: number, b: number): number => {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b) [a, b] = [b, a % b];
  return a;
};

export const lcm = (a: number, b: number): number =>
  a === 0 || b === 0 ? 0 : Math.abs(a * b) / gcd(a, b);

export const isPrime = (n: number): boolean => {
  if (n < 2) return false;
  for (let i = 2; i * i <= n; i++) if (n % i === 0) return false;
  return true;
};

export const primeFactors = (n: number): number[] => {
  const out: number[] = [];
  let m = n;
  for (let p = 2; p * p <= m; p++) {
    while (m % p === 0) {
      out.push(p);
      m /= p;
    }
  }
  if (m > 1) out.push(m);
  return out;
};

export const roundTo = (n: number, dp: number): number => {
  const f = Math.pow(10, dp);
  return Math.round((n + Number.EPSILON * Math.sign(n)) * f) / f;
};

const NBSP = " ";

// Format a number the South African way: 1 250,5  (decimal comma, space for thousands).
export const fmtNum = (n: number, dp?: number): string => {
  if (!isFinite(n)) return String(n);
  const rounded = dp === undefined ? roundTo(n, 10) : roundTo(n, dp);
  let s = dp === undefined ? String(rounded) : rounded.toFixed(dp);
  if (/e/i.test(s)) s = rounded.toFixed(6).replace(/\.?0+$/, "");
  const neg = s.startsWith("-");
  if (neg) s = s.slice(1);
  const [intPart, decPart] = s.split(".");
  const grouped =
    intPart.length > 4
      ? intPart.replace(/\B(?=(\d{3})+(?!\d))/g, NBSP)
      : intPart;
  const body = decPart !== undefined ? `${grouped},${decPart}` : grouped;
  return neg ? `−${body}` : body;
};

export const fmtMoney = (n: number): string => {
  const cents = Math.abs(n - Math.trunc(n)) > 1e-9;
  return `R${fmtNum(n, cents ? 2 : 0)}`;
};

// Canonical machine string for an answer (dot decimal, ASCII minus).
export const canon = (n: number): string => String(roundTo(n, 10));

export interface Rational {
  n: number; // numerator (carries sign)
  d: number; // denominator (> 0)
  simplest: boolean; // was the written form already in simplest terms
  form: "fraction" | "mixed" | "decimal" | "integer";
}

const normaliseText = (raw: string): string =>
  raw
    .trim()
    .replace(/[−–—]/g, "-")
    .replace(/ /g, " ");

// Parse a plain number such as "-3,5", "1 250", "x = 5", "R120", "15%".
export const parseNum = (raw: string): number | null => {
  let s = normaliseText(raw).replace(/\s+/g, "").replace(/,/g, ".");
  s = s.replace(/^[a-zA-Z]=/, "");
  s = s.replace(/^R(?=[-+\d.])/i, "");
  s = s.replace(/%$/, "");
  if (!/^[-+]?(\d+\.?\d*|\.\d+)$/.test(s)) return null;
  const v = Number(s);
  return isFinite(v) ? v : null;
};

// Parse "3/4", "1 1/2", "-2/3", "0,75" or "5" into a rational number.
export const parseRational = (raw: string): Rational | null => {
  let s = normaliseText(raw)
    .replace(/,/g, ".")
    .replace(/\s*\/\s*/g, "/")
    .replace(/^[a-zA-Z]\s*=\s*/, "");
  let m = s.match(/^(-?)(\d+)\s+(\d+)\/(\d+)$/);
  if (m) {
    const sign = m[1] ? -1 : 1;
    const w = Number(m[2]);
    const a = Number(m[3]);
    const b = Number(m[4]);
    if (!b) return null;
    const g = gcd(a, b);
    return {
      n: sign * (w * b + a),
      d: b,
      simplest: g === 1 && a < b,
      form: "mixed",
    };
  }
  m = s.match(/^(-?\d+)\/(-?\d+)$/);
  if (m) {
    let n = Number(m[1]);
    let d = Number(m[2]);
    if (!d) return null;
    if (d < 0) {
      n = -n;
      d = -d;
    }
    return { n, d, simplest: gcd(n, d) === 1, form: "fraction" };
  }
  const num = parseNum(s);
  if (num === null) return null;
  const dp = (String(num).split(".")[1] || "").length;
  if (dp > 6) return null;
  const d = Math.pow(10, dp);
  return {
    n: Math.round(num * d),
    d,
    simplest: true,
    form: dp === 0 ? "integer" : "decimal",
  };
};

export const sameRational = (a: Rational, b: Rational): boolean =>
  a.n * b.d === b.n * a.d;

// MathText fraction: {3/4}
export const frac = (n: number, d: number): string => `{${n}/${d}}`;

// MathText mixed number: 2{1/2}; improper stays as a fraction.
export const mixed = (n: number, d: number): string => {
  const w = Math.trunc(n / d);
  const r = Math.abs(n) % d;
  if (r === 0) return String(w);
  if (w === 0) return `${n < 0 ? "−" : ""}{${Math.abs(n)}/${d}}`;
  return `${w}{${r}/${d}}`;
};

// Plain text forms used for answers ("1 1/2").
export const fracText = (n: number, d: number): string => {
  const g = gcd(n, d) || 1;
  const nn = n / g;
  const dd = d / g;
  return dd === 1 ? String(nn) : `${nn}/${dd}`;
};

export const mixedText = (n: number, d: number): string => {
  const g = gcd(n, d) || 1;
  n /= g;
  d /= g;
  const w = Math.trunc(n / d);
  const r = Math.abs(n) % d;
  if (r === 0) return String(w);
  if (w === 0) return `${n}/${d}`;
  return `${w} ${r}/${d}`;
};

export const sign = (n: number): string => (n < 0 ? "−" : "");

// Signed integer for display inside brackets: (−3)
export const br = (n: number): string => (n < 0 ? `(−${Math.abs(n)})` : String(n));

export const plural = (n: number, one: string, many: string): string =>
  n === 1 ? one : many;