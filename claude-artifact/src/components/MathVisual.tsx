import React from "react";
import type { Visual } from "../helpers/curriculumTypes";
import styles from "./MathVisual.module.css";

// Small, lightweight SVG diagrams. All colours come from the design tokens.

const C = {
  ink: "var(--foreground)",
  muted: "var(--muted-foreground)",
  line: "var(--border)",
  primary: "var(--primary)",
  accent: "var(--accent)",
  teal: "var(--chart-color-2)",
  coral: "var(--chart-color-4)",
  paper: "var(--card)",
  soft: "var(--status-practising-soft)",
};
const PALETTE = [C.primary, C.teal, "var(--chart-color-3)", C.coral, "var(--chart-color-5)", "var(--info)"];
const minus = (n: number) => String(n).replace("-", "−");

const Text: React.FC<React.SVGProps<SVGTextElement>> = ({ children, ...p }) => (
  <text fontFamily="var(--font-family-base)" fill={C.ink} fontSize={13} fontWeight={700} {...p}>
    {children}
  </text>
);

// ---------- number line ----------
const NumberLine: React.FC<{ v: Extract<Visual, { type: "numberline" }> }> = ({ v }) => {
  const W = 360;
  const padX = 22;
  const range = v.max - v.min;
  const step = range <= 14 ? 1 : range <= 30 ? 2 : 5;
  const x = (n: number) => padX + ((n - v.min) / range) * (W - padX * 2);
  const ticks: number[] = [];
  for (let n = Math.ceil(v.min / step) * step; n <= v.max; n += step) ticks.push(n);
  const y0 = 62;
  return (
    <svg viewBox={`0 0 ${W} 100`} className={styles.svg} role="img" aria-label="Number line">
      <line x1={padX - 8} x2={W - padX + 8} y1={y0} y2={y0} stroke={C.ink} strokeWidth={2.5} strokeLinecap="round" />
      {ticks.map((n) => (
        <g key={n}>
          <line x1={x(n)} x2={x(n)} y1={y0 - 6} y2={y0 + 6} stroke={C.ink} strokeWidth={n === 0 ? 3 : 1.5} />
          <Text x={x(n)} y={y0 + 24} textAnchor="middle" fontSize={11} fontWeight={n === 0 ? 800 : 600} fill={n === 0 ? C.ink : C.muted}>
            {minus(n)}
          </Text>
        </g>
      ))}
      {(v.jumps ?? []).map((j, i) => {
        const a = x(j.from);
        const b = x(j.to);
        const mid = (a + b) / 2;
        const h = Math.min(34, 14 + Math.abs(b - a) / 6);
        return (
          <g key={i}>
            <path d={`M ${a} ${y0 - 8} Q ${mid} ${y0 - 8 - h * 1.6} ${b} ${y0 - 8}`} fill="none" stroke={C.coral} strokeWidth={2.5} strokeLinecap="round" />
            <path d={`M ${b} ${y0 - 8} l ${b > a ? -7 : 7} -5 m ${b > a ? 7 : -7} 5 l ${b > a ? -7 : 7} 5`} fill="none" stroke={C.coral} strokeWidth={2.5} strokeLinecap="round" />
            {j.label ? (
              <Text x={mid} y={y0 - 12 - h * 0.8} textAnchor="middle" fill={C.coral} fontSize={13}>
                {j.label.replace("-", "−")}
              </Text>
            ) : null}
          </g>
        );
      })}
      {(v.marks ?? []).map((m, i) => (
        <g key={`m${i}`}>
          <circle cx={x(m)} cy={y0} r={7} fill={C.primary} stroke={C.paper} strokeWidth={2} />
          <Text x={x(m)} y={y0 - 14} textAnchor="middle" fill={C.primary} fontSize={13}>
            {minus(m)}
          </Text>
        </g>
      ))}
    </svg>
  );
};

// ---------- fraction bar ----------
const FractionBar: React.FC<{ v: Extract<Visual, { type: "fractionbar" }> }> = ({ v }) => {
  const W = 360;
  const padX = 12;
  const w = (W - padX * 2) / v.parts;
  return (
    <svg viewBox={`0 0 ${W} 74`} className={styles.svg} role="img" aria-label={`${v.shaded} out of ${v.parts} parts shaded`}>
      {Array.from({ length: v.parts }, (_, i) => (
        <rect key={i} x={padX + i * w} y={10} width={w} height={40} rx={4} fill={i < v.shaded ? C.primary : C.paper} stroke={C.ink} strokeWidth={2} />
      ))}
      <Text x={W / 2} y={68} textAnchor="middle" fontSize={13} fill={C.muted}>
        {v.shaded} out of {v.parts} parts shaded
      </Text>
    </svg>
  );
};

// ---------- balance scale ----------
const Balance: React.FC<{ v: Extract<Visual, { type: "balance" }> }> = ({ v }) => (
  <svg viewBox="0 0 360 150" className={styles.svg} role="img" aria-label={`Balance: ${v.left} equals ${v.right}`}>
    <polygon points="180,140 160,140 180,70 200,140" fill={C.soft} stroke={C.ink} strokeWidth={2} strokeLinejoin="round" />
    <line x1={50} x2={310} y1={64} y2={64} stroke={C.ink} strokeWidth={4} strokeLinecap="round" />
    <circle cx={180} cy={64} r={7} fill={C.accent} stroke={C.ink} strokeWidth={2} />
    {[
      { cx: 50, label: v.left },
      { cx: 310, label: v.right },
    ].map((p) => (
      <g key={p.cx}>
        <line x1={p.cx} x2={p.cx - 34} y1={64} y2={92} stroke={C.ink} strokeWidth={1.5} />
        <line x1={p.cx} x2={p.cx + 34} y1={64} y2={92} stroke={C.ink} strokeWidth={1.5} />
        <path d={`M ${p.cx - 44} 92 h 88 a 0 0 0 0 1 0 0 q -6 22 -44 22 q -38 0 -44 -22 z`} fill={C.paper} stroke={C.ink} strokeWidth={2} />
        <Text x={p.cx} y={108} textAnchor="middle" fontSize={15} fontFamily="var(--font-family-math)" fontStyle="italic">
          {p.label}
        </Text>
      </g>
    ))}
    <Text x={180} y={34} textAnchor="middle" fontSize={22} fill={C.primary}>
      =
    </Text>
  </svg>
);

// ---------- grid rectangle ----------
const GridRect: React.FC<{ v: Extract<Visual, { type: "gridrect" }> }> = ({ v }) => {
  const maxW = 280;
  const maxH = 130;
  const cell = Math.max(10, Math.min(36, Math.floor(Math.min(maxW / v.w, maxH / v.h))));
  const w = cell * v.w;
  const h = cell * v.h;
  const ox = (360 - w) / 2;
  const oy = 14;
  const unit = v.unit ?? "";
  return (
    <svg viewBox={`0 0 360 ${h + 56}`} className={styles.svg} role="img" aria-label={`Rectangle ${v.w} by ${v.h}`}>
      <rect x={ox} y={oy} width={w} height={h} fill={C.soft} stroke={C.ink} strokeWidth={2.5} />
      {Array.from({ length: v.w - 1 }, (_, i) => (
        <line key={`v${i}`} x1={ox + (i + 1) * cell} x2={ox + (i + 1) * cell} y1={oy} y2={oy + h} stroke={C.primary} strokeOpacity={0.35} />
      ))}
      {Array.from({ length: v.h - 1 }, (_, i) => (
        <line key={`h${i}`} x1={ox} x2={ox + w} y1={oy + (i + 1) * cell} y2={oy + (i + 1) * cell} stroke={C.primary} strokeOpacity={0.35} />
      ))}
      <Text x={ox + w / 2} y={oy + h + 22} textAnchor="middle">
        {v.w} {unit}
      </Text>
      <Text x={ox - 8} y={oy + h / 2 + 4} textAnchor="end">
        {v.h} {unit}
      </Text>
    </svg>
  );
};

// ---------- angles on a straight line ----------
const AngleLine: React.FC<{ v: Extract<Visual, { type: "angleline" }> }> = ({ v }) => {
  const cx = 180;
  const cy = 100;
  const L = 150;
  const rad = (v.a * Math.PI) / 180;
  const ex = cx + L * Math.cos(Math.PI - rad);
  const ey = cy - L * Math.sin(Math.PI - rad);
  const arc = (r: number, a0: number, a1: number) => {
    const p0 = [cx + r * Math.cos(a0), cy - r * Math.sin(a0)];
    const p1 = [cx + r * Math.cos(a1), cy - r * Math.sin(a1)];
    return `M ${p0[0]} ${p0[1]} A ${r} ${r} 0 0 0 ${p1[0]} ${p1[1]}`;
  };
  const theta = Math.PI - rad; // angle of the ray from the positive x-axis
  const midA = (Math.PI + theta) / 2;
  const midB = theta / 2;
  return (
    <svg viewBox="0 0 360 120" className={styles.svg} role="img" aria-label={`Angles ${v.a} and ${180 - v.a} on a straight line`}>
      <line x1={cx - L} x2={cx + L} y1={cy} y2={cy} stroke={C.ink} strokeWidth={3} strokeLinecap="round" />
      <line x1={cx} y1={cy} x2={ex} y2={ey} stroke={C.ink} strokeWidth={3} strokeLinecap="round" />
      <path d={arc(34, Math.PI, theta)} fill="none" stroke={C.primary} strokeWidth={3} />
      <path d={arc(44, theta, 0)} fill="none" stroke={C.coral} strokeWidth={3} />
      <Text x={cx + 62 * Math.cos(midA)} y={cy - 62 * Math.sin(midA) + 4} textAnchor="middle" fill={C.primary}>
        {v.a}°
      </Text>
      <Text x={cx + 66 * Math.cos(midB)} y={cy - 66 * Math.sin(midB) + 4} textAnchor="middle" fill={C.coral}>
        b
      </Text>
      <circle cx={cx} cy={cy} r={4} fill={C.ink} />
    </svg>
  );
};

// ---------- parallel lines ----------
const Parallel: React.FC<{ v: Extract<Visual, { type: "parallel" }> }> = ({ v }) => (
  <svg viewBox="0 0 360 150" className={styles.svg} role="img" aria-label="Two parallel lines cut by a transversal">
    <line x1={20} x2={340} y1={45} y2={45} stroke={C.ink} strokeWidth={3} />
    <line x1={20} x2={340} y1={110} y2={110} stroke={C.ink} strokeWidth={3} />
    <line x1={110} y1={140} x2={250} y2={15} stroke={C.primary} strokeWidth={3} />
    <polygon points="62,41 70,41 66,34" fill={C.ink} />
    <polygon points="62,106 70,106 66,99" fill={C.ink} />
    <Text x={218} y={40} fill={C.primary}>
      1 = {v.angle}°
    </Text>
    <Text x={152} y={104} fill={C.coral}>
      2 = ?
    </Text>
    <Text x={26} y={28} fontSize={12} fill={C.muted}>
      A ──── B
    </Text>
    <Text x={26} y={135} fontSize={12} fill={C.muted}>
      C ──── D
    </Text>
  </svg>
);

// ---------- cuboid ----------
const Cuboid: React.FC<{ v: Extract<Visual, { type: "cuboid" }> }> = ({ v }) => {
  const s = 110 / Math.max(v.l, v.w, v.h, 1);
  const L = Math.max(30, v.l * s);
  const H = Math.max(24, v.h * s);
  const D = Math.max(18, v.w * s * 0.55);
  const ox = 70;
  const oy = 120;
  return (
    <svg viewBox="0 0 360 160" className={styles.svg} role="img" aria-label="Rectangular prism">
      <polygon points={`${ox},${oy} ${ox + L},${oy} ${ox + L},${oy - H} ${ox},${oy - H}`} fill={C.soft} stroke={C.ink} strokeWidth={2.2} />
      <polygon points={`${ox},${oy - H} ${ox + L},${oy - H} ${ox + L + D},${oy - H - D * 0.7} ${ox + D},${oy - H - D * 0.7}`} fill={C.paper} stroke={C.ink} strokeWidth={2.2} />
      <polygon points={`${ox + L},${oy} ${ox + L + D},${oy - D * 0.7} ${ox + L + D},${oy - H - D * 0.7} ${ox + L},${oy - H}`} fill={C.accent} fillOpacity={0.45} stroke={C.ink} strokeWidth={2.2} />
      <Text x={ox + L / 2} y={oy + 20} textAnchor="middle">
        {v.l}
      </Text>
      <Text x={ox + L + D + 8} y={oy - D * 0.35} textAnchor="start">
        {v.w}
      </Text>
      <Text x={ox - 8} y={oy - H / 2 + 4} textAnchor="end">
        {v.h}
      </Text>
    </svg>
  );
};

// ---------- bar chart ----------
const niceMax = (m: number) => {
  const steps = [5, 10, 20, 25, 50, 100, 200, 500, 1000];
  return steps.find((s) => s >= m) ?? Math.ceil(m / 100) * 100;
};
const Bars: React.FC<{ v: Extract<Visual, { type: "bars" }> }> = ({ v }) => {
  const W = 360;
  const H = 190;
  const left = 34;
  const bottom = 34;
  const top = v.title ? 30 : 12;
  const max = niceMax(Math.max(...v.values, 1));
  const ticks = 5;
  const bw = ((W - left - 10) / v.values.length) * 0.62;
  const gap = (W - left - 10) / v.values.length;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className={styles.svg} role="img" aria-label={v.title ?? "Bar graph"}>
      {v.title ? (
        <Text x={W / 2} y={16} textAnchor="middle" fontSize={13}>
          {v.title}
        </Text>
      ) : null}
      {Array.from({ length: ticks + 1 }, (_, i) => {
        const val = (max / ticks) * i;
        const y = H - bottom - ((H - bottom - top) * i) / ticks;
        return (
          <g key={i}>
            <line x1={left} x2={W - 6} y1={y} y2={y} stroke={C.line} strokeWidth={1} />
            <Text x={left - 6} y={y + 4} textAnchor="end" fontSize={10} fill={C.muted} fontWeight={600}>
              {Math.round(val * 10) / 10}
            </Text>
          </g>
        );
      })}
      {v.values.map((val, i) => {
        const h = ((H - bottom - top) * val) / max;
        const x = left + i * gap + (gap - bw) / 2;
        return (
          <g key={i}>
            <rect x={x} y={H - bottom - h} width={bw} height={h} rx={3} fill={PALETTE[i % PALETTE.length]} />
            <Text x={x + bw / 2} y={H - bottom - h - 4} textAnchor="middle" fontSize={11}>
              {val}
            </Text>
            <Text x={x + bw / 2} y={H - 14} textAnchor="middle" fontSize={11} fill={C.muted}>
              {v.labels[i]}
            </Text>
          </g>
        );
      })}
      <line x1={left} x2={left} y1={top} y2={H - bottom} stroke={C.ink} strokeWidth={2} />
      <line x1={left} x2={W - 6} y1={H - bottom} y2={H - bottom} stroke={C.ink} strokeWidth={2} />
    </svg>
  );
};

// ---------- pie chart ----------
const Pie: React.FC<{ v: Extract<Visual, { type: "pie" }> }> = ({ v }) => {
  const total = v.values.reduce((a, b) => a + b, 0) || 1;
  const cx = 90;
  const cy = 90;
  const r = 70;
  let angle = -Math.PI / 2;
  return (
    <svg viewBox="0 0 360 180" className={styles.svg} role="img" aria-label={v.title ?? "Pie chart"}>
      {v.values.map((val, i) => {
        const a0 = angle;
        const a1 = angle + (val / total) * Math.PI * 2;
        angle = a1;
        const large = a1 - a0 > Math.PI ? 1 : 0;
        const d = `M ${cx} ${cy} L ${cx + r * Math.cos(a0)} ${cy + r * Math.sin(a0)} A ${r} ${r} 0 ${large} 1 ${cx + r * Math.cos(a1)} ${cy + r * Math.sin(a1)} Z`;
        return <path key={i} d={d} fill={PALETTE[i % PALETTE.length]} stroke={C.paper} strokeWidth={2} />;
      })}
      {v.labels.map((l, i) => (
        <g key={i}>
          <rect x={185} y={34 + i * 26} width={14} height={14} rx={3} fill={PALETTE[i % PALETTE.length]} />
          <Text x={206} y={46 + i * 26} fontSize={13}>
            {l}
          </Text>
        </g>
      ))}
      {v.title ? (
        <Text x={185} y={20} fontSize={12} fill={C.muted}>
          {v.title}
        </Text>
      ) : null}
    </svg>
  );
};

// ---------- Cartesian plane ----------
const CoordPlane: React.FC<{ v: Extract<Visual, { type: "coordplane" }> }> = ({ v }) => {
  const R = v.range ?? 6;
  const size = 250;
  const pad = 24;
  const step = (size - pad * 2) / (R * 2);
  const X = (n: number) => pad + (n + R) * step;
  const Y = (n: number) => pad + (R - n) * step;
  const W = 360;
  const ox = (W - size) / 2;
  return (
    <svg viewBox={`0 0 ${W} ${size}`} className={styles.svg} role="img" aria-label="Cartesian plane">
      <g transform={`translate(${ox} 0)`}>
        {Array.from({ length: R * 2 + 1 }, (_, i) => i - R).map((n) => (
          <g key={n}>
            <line x1={X(n)} x2={X(n)} y1={pad} y2={size - pad} stroke={n === 0 ? C.ink : C.line} strokeWidth={n === 0 ? 2.5 : 1} />
            <line x1={pad} x2={size - pad} y1={Y(n)} y2={Y(n)} stroke={n === 0 ? C.ink : C.line} strokeWidth={n === 0 ? 2.5 : 1} />
            {n !== 0 && (R <= 6 || n % 2 === 0) ? (
              <>
                <Text x={X(n)} y={Y(0) + 14} textAnchor="middle" fontSize={9} fill={C.muted} fontWeight={600}>
                  {minus(n)}
                </Text>
                <Text x={X(0) - 5} y={Y(n) + 3} textAnchor="end" fontSize={9} fill={C.muted} fontWeight={600}>
                  {minus(n)}
                </Text>
              </>
            ) : null}
          </g>
        ))}
        <Text x={size - pad + 2} y={Y(0) - 6} fontSize={12} fontStyle="italic" fontFamily="var(--font-family-math)">
          x
        </Text>
        <Text x={X(0) + 6} y={pad - 6} fontSize={12} fontStyle="italic" fontFamily="var(--font-family-math)">
          y
        </Text>
        {v.line ? (
          <line x1={X(-R)} y1={Y(v.line.m * -R + v.line.c)} x2={X(R)} y2={Y(v.line.m * R + v.line.c)} stroke={C.coral} strokeWidth={3} strokeLinecap="round" clipPath="url(#plane-clip)" />
        ) : null}
        <clipPath id="plane-clip">
          <rect x={pad} y={pad} width={size - pad * 2} height={size - pad * 2} />
        </clipPath>
        {v.points.map((p, i) => (
          <g key={i}>
            <circle cx={X(p.x)} cy={Y(p.y)} r={5.5} fill={C.primary} stroke={C.paper} strokeWidth={2} />
            {p.label ? (
              <Text x={X(p.x) + 8} y={Y(p.y) - 8} fill={C.primary} fontSize={14}>
                {p.label}
              </Text>
            ) : null}
          </g>
        ))}
      </g>
    </svg>
  );
};

// ---------- circle ----------
const CircleV: React.FC<{ v: Extract<Visual, { type: "circle" }> }> = ({ v }) => (
  <svg viewBox="0 0 360 170" className={styles.svg} role="img" aria-label={`Circle with radius ${v.r}`}>
    <circle cx={180} cy={85} r={68} fill={C.soft} stroke={C.ink} strokeWidth={2.5} />
    <line x1={180} y1={85} x2={248} y2={85} stroke={C.coral} strokeWidth={3} />
    <circle cx={180} cy={85} r={4} fill={C.ink} />
    <Text x={214} y={78} textAnchor="middle" fill={C.coral}>
      r = {v.r}
    </Text>
    <line x1={112} y1={85} x2={180} y2={85} stroke={C.primary} strokeWidth={2} strokeDasharray="5 4" />
    <Text x={146} y={106} textAnchor="middle" fill={C.primary} fontSize={11}>
      diameter = 2r
    </Text>
  </svg>
);

// ---------- triangle ----------
const TriangleV: React.FC<{ v: Extract<Visual, { type: "triangle" }> }> = ({ v }) => (
  <svg viewBox="0 0 360 170" className={styles.svg} role="img" aria-label="Triangle with angles">
    <polygon points="70,140 290,140 180,26" fill={C.soft} stroke={C.ink} strokeWidth={2.5} strokeLinejoin="round" />
    <Text x={90} y={130} fill={C.primary}>
      {v.angles[0]}
    </Text>
    <Text x={228} y={130} fill={C.primary}>
      {v.angles[1]}
    </Text>
    <Text x={180} y={64} textAnchor="middle" fill={C.coral}>
      {v.angles[2]}
    </Text>
  </svg>
);

export const MathVisual: React.FC<{ visual: Visual; className?: string }> = ({ visual, className }) => {
  let body: React.ReactNode = null;
  switch (visual.type) {
    case "numberline":
      body = <NumberLine v={visual} />;
      break;
    case "fractionbar":
      body = <FractionBar v={visual} />;
      break;
    case "balance":
      body = <Balance v={visual} />;
      break;
    case "gridrect":
      body = <GridRect v={visual} />;
      break;
    case "angleline":
      body = <AngleLine v={visual} />;
      break;
    case "parallel":
      body = <Parallel v={visual} />;
      break;
    case "cuboid":
      body = <Cuboid v={visual} />;
      break;
    case "bars":
      body = <Bars v={visual} />;
      break;
    case "pie":
      body = <Pie v={visual} />;
      break;
    case "coordplane":
      body = <CoordPlane v={visual} />;
      break;
    case "circle":
      body = <CircleV v={visual} />;
      break;
    case "triangle":
      body = <TriangleV v={visual} />;
      break;
  }
  return (
    <figure className={`${styles.figure} ${className ?? ""}`}>
      {body}
      {"caption" in visual && visual.caption ? <figcaption className={styles.caption}>{visual.caption}</figcaption> : null}
    </figure>
  );
};
