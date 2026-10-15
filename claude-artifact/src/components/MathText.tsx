import React from "react";
import styles from "./MathText.module.css";

// Renders the tutor's maths format: text with $math$ segments, **bold**, line breaks,
// {a/b} fractions, x^2 powers and T_n subscripts. No LaTeX library is needed.
// Everything is built from React nodes (never dangerouslySetInnerHTML), so AI text is safe.

type Node = React.ReactNode;

const findMatching = (s: string, open: number): number => {
  let depth = 0;
  for (let i = open; i < s.length; i++) {
    if (s[i] === "{") depth++;
    else if (s[i] === "}") {
      depth--;
      if (depth === 0) return i;
    }
  }
  return -1;
};

const findTopLevelSlash = (s: string): number => {
  let depth = 0;
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (c === "{" || c === "(") depth++;
    else if (c === "}" || c === ")") depth--;
    else if (c === "/" && depth === 0) return i;
  }
  return -1;
};

// Single letters are variables (italic); words (cm, HCF, speed) and currency R150 stay upright.
const renderPlainMath = (text: string, key: string): Node[] => {
  const t = text.replace(/\\%/g, "%").replace(/\\\$/g, "$").replace(/-/g, "−").replace(/\*/g, "×");
  const parts = t.split(/([A-Za-z]+)/);
  return parts.map((p, i) => {
    if (!p) return null;
    if (/^[A-Za-z]+$/.test(p)) {
      const prev = parts[i - 1] ?? "";
      const next = parts[i + 1] ?? "";
      const isCurrency = p === "R" && /^\d/.test(next);
      const isUnit = p.length === 1 && /[mgtlhs]/.test(p) && /\d\s$/.test(prev);
      if (p.length === 1 && !isCurrency && !isUnit) {
        return (
          <i key={`${key}-${i}`} className={styles.variable}>
            {p}
          </i>
        );
      }
      return <span key={`${key}-${i}`}>{p}</span>;
    }
    return <span key={`${key}-${i}`}>{p}</span>;
  });
};

const renderMath = (src: string, key: string): Node[] => {
  const out: Node[] = [];
  let buf = "";
  let i = 0;
  const flush = () => {
    if (buf) {
      out.push(...renderPlainMath(buf, `${key}-p${out.length}`));
      buf = "";
    }
  };
  while (i < src.length) {
    const c = src[i];
    if (c === "{") {
      const close = findMatching(src, i);
      if (close > i) {
        const inner = src.slice(i + 1, close);
        const slash = findTopLevelSlash(inner);
        if (slash > 0) {
          flush();
          out.push(
            <span key={`${key}-f${i}`} className={styles.fraction}>
              <span className={styles.numerator}>{renderMath(inner.slice(0, slash).trim(), `${key}-n${i}`)}</span>
              <span className={styles.denominator}>{renderMath(inner.slice(slash + 1).trim(), `${key}-d${i}`)}</span>
            </span>
          );
          i = close + 1;
          continue;
        }
      }
    }
    if (c === "^") {
      let j = i + 1;
      let exp = "";
      if (src[j] === "(") {
        let depth = 0;
        let k = j;
        for (; k < src.length; k++) {
          if (src[k] === "(") depth++;
          else if (src[k] === ")") {
            depth--;
            if (depth === 0) break;
          }
        }
        exp = src.slice(j + 1, k);
        j = k + 1;
      } else {
        const m = src.slice(j).match(/^[-−]?[0-9A-Za-z]+/);
        if (m) {
          exp = m[0];
          j += m[0].length;
        }
      }
      if (exp) {
        flush();
        out.push(
          <sup key={`${key}-s${i}`} className={styles.sup}>
            {renderMath(exp, `${key}-e${i}`)}
          </sup>
        );
        i = j;
        continue;
      }
    }
    if (c === "_" && /[A-Za-z]$/.test(buf)) {
      const m = src.slice(i + 1).match(/^[0-9A-Za-z]+/);
      if (m) {
        flush();
        out.push(
          <sub key={`${key}-b${i}`} className={styles.sub}>
            {m[0]}
          </sub>
        );
        i += 1 + m[0].length;
        continue;
      }
    }
    buf += c;
    i++;
  }
  flush();
  return out;
};

const renderBold = (text: string, key: string): Node[] => {
  const parts = text.split("**");
  return parts.map((p, i) => {
    const clean = p.replace(/\\%/g, "%").replace(/\\\$/g, "$");
    return i % 2 === 1 ? (
      <strong key={`${key}-b${i}`} className={styles.bold}>
        {clean}
      </strong>
    ) : (
      <React.Fragment key={`${key}-t${i}`}>{clean}</React.Fragment>
    );
  });
};

const renderLine = (line: string, key: string): Node[] => {
  // split into plain / math segments on unescaped $
  const segments: { math: boolean; text: string }[] = [];
  let cur = "";
  let inMath = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === "$" && line[i - 1] !== "\\") {
      segments.push({ math: inMath, text: cur });
      cur = "";
      inMath = !inMath;
    } else cur += c;
  }
  // an unclosed $ is treated as plain text
  if (inMath) segments.push({ math: false, text: `$${cur}` });
  else segments.push({ math: false, text: cur });
  return segments.flatMap<Node>((s, i) =>
    !s.text
      ? []
      : s.math
        ? [
            <span key={`${key}-m${i}`} className={styles.math}>
              {renderMath(s.text.trim() === "" ? s.text : s.text, `${key}-mm${i}`)}
            </span>,
          ]
        : renderBold(s.text, `${key}-x${i}`)
  );
};

interface MathTextProps {
  text: string | null | undefined;
  className?: string;
  // render inline (single span) - for options and short labels
  inline?: boolean;
}

export const MathText: React.FC<MathTextProps> = ({ text, className, inline }) => {
  if (!text) return null;
  if (inline) {
    return <span className={`${styles.inline} ${className ?? ""}`}>{renderLine(text.replace(/\n+/g, " "), "i")}</span>;
  }
  const paragraphs = text.split(/\n{2,}/);
  return (
    <div className={`${styles.text} ${className ?? ""}`}>
      {paragraphs.map((para, pi) => (
        <p key={pi} className={styles.paragraph}>
          {para.split("\n").map((line, li, arr) => (
            <React.Fragment key={li}>
              {renderLine(line, `${pi}-${li}`)}
              {li < arr.length - 1 ? <br /> : null}
            </React.Fragment>
          ))}
        </p>
      ))}
    </div>
  );
};
