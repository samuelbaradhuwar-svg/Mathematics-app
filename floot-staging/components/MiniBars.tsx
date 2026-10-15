import React from "react";
import styles from "./MiniBars.module.css";

interface Props {
  data: { label: string; value: number; sub?: string }[];
  max?: number;
  ariaLabel: string;
}

// Small, dependency-free bar chart for the weekly activity.
export const MiniBars: React.FC<Props> = ({ data, max, ariaLabel }) => {
  const top = Math.max(1, max ?? Math.max(...data.map((d) => d.value), 1));
  return (
    <div className={styles.bars} role="img" aria-label={ariaLabel}>
      {data.map((d) => (
        <div key={d.label} className={styles.col}>
          <span className={styles.value}>{d.value}</span>
          <div className={styles.track}>
            <div className={styles.fill} style={{ height: `${Math.round((d.value / top) * 100)}%` }} />
          </div>
          <span className={styles.label}>{d.label}</span>
          {d.sub ? <span className={styles.sub}>{d.sub}</span> : null}
        </div>
      ))}
    </div>
  );
};
