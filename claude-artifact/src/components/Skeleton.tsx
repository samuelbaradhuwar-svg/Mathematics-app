import React from "react";
import styles from "./Skeleton.module.css";

export const Skeleton: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className, ...rest }) => <div className={`${styles.skeleton} ${className ?? ""}`} aria-hidden {...rest} />;
