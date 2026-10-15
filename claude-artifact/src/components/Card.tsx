import React from "react";
import styles from "./Card.module.css";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  tone?: "default" | "soft" | "primary" | "warm" | "success" | "help";
  padded?: boolean;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(({ tone = "default", padded = true, className, children, ...rest }, ref) => (
  <div ref={ref} className={`${styles.card} ${styles[tone]} ${padded ? styles.padded : ""} ${className ?? ""}`} {...rest}>
    {children}
  </div>
));
Card.displayName = "Card";