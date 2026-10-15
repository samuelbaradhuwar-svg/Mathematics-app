import React from "react";
import { Link } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import styles from "./PageHeader.module.css";

interface Props {
  title: string;
  subtitle?: string;
  backTo?: string;
  backLabel?: string;
  action?: React.ReactNode;
  icon?: React.ReactNode;
}

export const PageHeader: React.FC<Props> = ({ title, subtitle, backTo, backLabel, action, icon }) => (
  <div className={styles.wrap}>
    {backTo ? (
      <Link to={backTo} className={styles.back}>
        <ChevronLeft size={18} aria-hidden /> {backLabel ?? "Back"}
      </Link>
    ) : null}
    <div className={styles.row}>
      {icon ? <div className={styles.icon}>{icon}</div> : null}
      <div className={styles.titles}>
        <h1 className={styles.title}>{title}</h1>
        {subtitle ? <p className={styles.subtitle}>{subtitle}</p> : null}
      </div>
      {action ? <div className={styles.action}>{action}</div> : null}
    </div>
  </div>
);