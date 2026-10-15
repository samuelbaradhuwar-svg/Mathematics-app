import React from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ShieldCheck } from "lucide-react";
import { useLearnerMe } from "../helpers/useLearnerData";
import styles from "./ParentShell.module.css";

// A deliberately plain, calm frame for the parent / guardian area. It is separate from the learner's interface.
export const ParentShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const me = useLearnerMe();
  const name = me.data?.learner?.name ?? "the learner";
  return (
    <div className={styles.shell}>
      <header className={styles.header}>
        <Link to="/" className={styles.back}>
          <ChevronLeft size={18} aria-hidden /> Back to {name}'s maths
        </Link>
        <span className={styles.badge}>
          <ShieldCheck size={16} aria-hidden /> Parent / Guardian area
        </span>
      </header>
      <main className={styles.main}>{children}</main>
    </div>
  );
};
