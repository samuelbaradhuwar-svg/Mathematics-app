import React from "react";
import styles from "./Spinner.module.css";

export const Spinner: React.FC<{ size?: "sm" | "md" | "lg"; className?: string }> = ({ size = "md", className }) => (
  <span className={`${styles.spinner} ${styles[size]} ${className ?? ""}`} role="status" aria-label="Loading" />
);
