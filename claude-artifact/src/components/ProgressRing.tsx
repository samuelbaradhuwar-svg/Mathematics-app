import React from "react";
import styles from "./ProgressRing.module.css";

interface Props {
  value: number; // 0..100
  size?: number;
  stroke?: number;
  label?: React.ReactNode;
  sublabel?: React.ReactNode;
  color?: string;
  track?: string;
}

export const ProgressRing: React.FC<Props> = ({ value, size = 132, stroke = 12, label, sublabel, color = "var(--primary)", track = "var(--muted)" }) => {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const v = Math.max(0, Math.min(100, value));
  return (
    <div className={styles.ring} style={{ width: size, height: size }} role="img" aria-label={`${Math.round(v)} percent`}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={track} strokeWidth={stroke} opacity={0.5} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c - (c * v) / 100}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          className={styles.arc}
        />
      </svg>
      <div className={styles.center}>
        <div className={styles.label}>{label ?? `${Math.round(v)}%`}</div>
        {sublabel ? <div className={styles.sublabel}>{sublabel}</div> : null}
      </div>
    </div>
  );
};