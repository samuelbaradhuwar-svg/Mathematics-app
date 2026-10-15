// A tiny algebra engine: parses expressions such as "3x + 5", "2(x - 4)",
// "x^2 * 3x" or "(1/2)y" into a canonical polynomial. Used to
//  - accept equivalent algebra answers ("5+3x" = "3x+5"),
//  - verify arithmetic / linear-equation solutions (including AI-written ones).

export type Poly = Map<string, number>; // monomial key -> coefficient
type Mono = Record<string, number>;

const EPS = 1e-9;

const keyOf = (m: Mono): string =>
  Object.keys(m)
    .filter((v) => m[v] > 0)
    .sort()
    .map((v) => (m[v] === 1 ? v : `${v}^${m[v]}`))
    .join("*");

const monoOf = (k: string): Mono => {
  const m: Mono = {};
  if (!k) return m;
  for (const part of k.split("*")) {
    const [v, e] = part.split("^");
    m[v] = e ? Number(e) : 1;
  }
  return m;
};

const clean = (p: Poly): Poly => {
  for (const [k, v] of Array.from(p.entries())) {
    if (Math.abs(v) < EPS) p.delete(k);
  }
  return p;
};

const constant = (c: number): Poly => clean(new Map([["", c]]));

const add = (a: Poly, b: Poly, s = 1): Poly => {
  const out: Poly = new Map(a);
  for (const [k, v] of b) out.set(k, (out.get(k) ?? 0) + s * v);
  return clean(out);
};

const mul = (a: Poly, b: Poly): Poly => {
  const out: Poly = new Map();
  for (const [ka, va] of a) {
    for (const [kb, vb] of b) {
      const m = monoOf(ka);
      const mb = monoOf(kb);
      for (const v of Object.keys(mb)) m[v] = (m[v] ?? 0) + mb[v];
      const k = keyOf(m);
      out.set(k, (out.get(k) ?? 0) + va * vb);
    }
  }
  return clean(out);
};

const asConstant = (p: Poly): number | null => {
  if (p.size === 0) return 0;
  if (p.size === 1 && p.has("")) return p.get("") as number;
  return null;
};

type Tok = { t: "num"; v: number } | { t: "var"; v: string } | { t: "op"; v: string };

const tokenize = (src: string): Tok[] => {
  const s = src
    .replace(/[−–—]/g, "-")
    .replace(/[×·*]/g, "*")
    .replace(/÷/g, "/")
    .replace(/²/g, "^2")
    .replace(/³/g, "^3")
    .replace(/\s+/g, "")
    .replace(/(\d),(\d)/g, "$1.$2");
  const toks: Tok[] = [];
  let i = 0;
  while (i < s.length) {
    const c = s[i];
    if (/[0-9.]/.test(c)) {
      let j = i;
      while (j < s.length && /[0-9.]/.test(s[j])) j++;
      const v = Number(s.slice(i, j));
      if (!isFinite(v)) throw new Error("bad number");
      toks.push({ t: "num", v });
      i = j;
    } else if (/[a-zA-Z]/.test(c)) {
      toks.push({ t: "var", v: c });
      i++;
    } else if ("+-*/^()√".includes(c)) {
      toks.push({ t: "op", v: c });
      i++;
    } else {
      throw new Error(`unexpected character ${c}`);
    }
  }
  return toks;
};

const parseTokens = (toks: Tok[]): Poly => {
  let pos = 0;
  const peek = () => toks[pos];
  const isOp = (v: string) => {
    const t = peek();
    return !!t && t.t === "op" && t.v === v;
  };

  const parseExpr = (): Poly => {
    let left = parseTerm();
    while (isOp("+") || isOp("-")) {
      const op = (toks[pos++] as { v: string }).v;
      const right = parseTerm();
      left = add(left, right, op === "+" ? 1 : -1);
    }
    return left;
  };

  const parseTerm = (): Poly => {
    let left = parseUnary();
    for (;;) {
      if (isOp("*")) {
        pos++;
        left = mul(left, parseUnary());
      } else if (isOp("/")) {
        pos++;
        const right = parseUnary();
        const c = asConstant(right);
        if (c === null || Math.abs(c) < EPS) throw new Error("cannot divide");
        left = mul(left, constant(1 / c));
      } else {
        const t = peek();
        if (t && (t.t === "var" || (t.t === "op" && (t.v === "(" || t.v === "√")))) {
          left = mul(left, parseUnary()); // implicit multiplication: 3x, 2(x+1)
        } else if (t && t.t === "num" && pos > 0 && toks[pos - 1].t === "op" && (toks[pos - 1] as { v: string }).v === ")") {
          left = mul(left, parseUnary());
        } else break;
      }
    }
    return left;
  };

  const parseUnary = (): Poly => {
    if (isOp("-")) {
      pos++;
      return mul(constant(-1), parseUnary());
    }
    if (isOp("+")) {
      pos++;
      return parseUnary();
    }
    if (isOp("√")) {
      pos++;
      const arg = parseAtom();
      const c = asConstant(arg);
      if (c === null || c < 0) throw new Error("bad root");
      return constant(Math.sqrt(c));
    }
    return parsePower();
  };

  const parsePower = (): Poly => {
    const base = parseAtom();
    if (isOp("^")) {
      pos++;
      const e = parseExponent();
      const bc = asConstant(base);
      if (bc !== null) return constant(Math.pow(bc, e));
      if (!Number.isInteger(e) || e < 0 || e > 12) throw new Error("bad exponent");
      let out = constant(1);
      for (let i = 0; i < e; i++) out = mul(out, base);
      return out;
    }
    return base;
  };

  const parseExponent = (): number => {
    let sgn = 1;
    if (isOp("-")) {
      pos++;
      sgn = -1;
    }
    const atom = parseAtom();
    const c = asConstant(atom);
    if (c === null) throw new Error("exponent must be a number");
    return sgn * c;
  };

  const parseAtom = (): Poly => {
    const t = peek();
    if (!t) throw new Error("unexpected end");
    if (t.t === "num") {
      pos++;
      return constant(t.v);
    }
    if (t.t === "var") {
      pos++;
      return new Map([[t.v, 1]]);
    }
    if (t.t === "op" && t.v === "(") {
      pos++;
      const inner = parseExpr();
      if (!isOp(")")) throw new Error("missing )");
      pos++;
      return inner;
    }
    throw new Error("unexpected token");
  };

  const result = parseExpr();
  if (pos !== toks.length) throw new Error("unexpected trailing input");
  return result;
};

export const parsePoly = (src: string): Poly => {
  const toks = tokenize(src);
  if (toks.length === 0) throw new Error("empty");
  return parseTokens(toks);
};

export const polyEquals = (a: string, b: string): boolean => {
  try {
    const pa = parsePoly(a);
    const pb = parsePoly(b);
    const keys = new Set([...pa.keys(), ...pb.keys()]);
    for (const k of keys) {
      const x = pa.get(k) ?? 0;
      const y = pb.get(k) ?? 0;
      if (Math.abs(x - y) > 1e-7 * (1 + Math.abs(x) + Math.abs(y))) return false;
    }
    return true;
  } catch {
    return false;
  }
};

// True if the text can be parsed as an expression at all.
export const isParsable = (src: string): boolean => {
  try {
    parsePoly(src);
    return true;
  } catch {
    return false;
  }
};

// Evaluate pure arithmetic ("3(5)+5", "2^3 - 4/2"); null if it has letters.
export const evalNumber = (src: string): number | null => {
  try {
    const c = asConstant(parsePoly(src));
    return c;
  } catch {
    return null;
  }
};

// Solve a linear equation in one letter ("3x + 5 = 20", "2(x-1) = x + 4").
export const solveLinear = (
  eq: string
): { variable: string; value: number } | null => {
  const parts = eq.split("=");
  if (parts.length !== 2) return null;
  try {
    const diff = add(parsePoly(parts[0]), parsePoly(parts[1]), -1);
    const keys = Array.from(diff.keys()).filter((k) => k !== "");
    if (keys.length !== 1) return null;
    const k = keys[0];
    if (!/^[a-zA-Z]$/.test(k)) return null; // only degree-1 in a single letter
    const c1 = diff.get(k) as number;
    const c0 = diff.get("") ?? 0;
    if (Math.abs(c1) < EPS) return null;
    return { variable: k, value: -c0 / c1 };
  } catch {
    return null;
  }
};