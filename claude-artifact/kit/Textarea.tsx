import React from "react";
import styles from "./Textarea.module.css";

export const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(({ className, ...rest }, ref) => (
  <textarea ref={ref} className={`${styles.textarea} ${className ?? ""}`} {...rest} />
));
Textarea.displayName = "Textarea";
