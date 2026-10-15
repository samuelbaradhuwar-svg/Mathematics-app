import React from "react";
import { CheckCircle2, Circle, LifeBuoy, PencilLine } from "lucide-react";
import type { LearningStatus } from "../helpers/curriculumTypes";
import { STATUS_META } from "../helpers/learningStatus";
import styles from "./StatusPill.module.css";

const ICONS = { check: CheckCircle2, pencil: PencilLine, help: LifeBuoy, circle: Circle };

interface Props {
  status: LearningStatus;
  compact?: boolean;
  friendly?: boolean;
  className?: string;
}

export const StatusPill: React.FC<Props> = ({ status, compact, friendly, className }) => {
  const meta = STATUS_META[status];
  const Icon = ICONS[meta.icon];
  return (
    <span
      className={`${styles.pill} ${compact ? styles.compact : ""} ${className ?? ""}`}
      style={{ color: meta.color, background: meta.soft }}
      title={meta.friendly}
    >
      <Icon size={compact ? 13 : 15} strokeWidth={2.5} aria-hidden />
      <span>{friendly ? meta.friendly : meta.label}</span>
    </span>
  );
};