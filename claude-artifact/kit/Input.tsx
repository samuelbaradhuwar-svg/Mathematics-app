import React from "react";
import styles from "./Input.module.css";

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(({ className, ...rest }, ref) => (
  <input ref={ref} className={`${styles.input} ${className ?? ""}`} {...rest} />
));
Input.displayName = "Input";
