import React from "react";
import { MessageCircleHeart } from "lucide-react";
import type { Visual } from "../helpers/curriculumTypes";
import { MathText } from "./MathText";
import { MathVisual } from "./MathVisual";
import styles from "./ChatBubble.module.css";

interface Props {
  role: "user" | "assistant";
  content: string;
  visual?: Visual | null;
  error?: boolean;
}

export const ChatBubble: React.FC<Props> = ({ role, content, visual, error }) => (
  <div className={`${styles.row} ${role === "user" ? styles.user : styles.tutor}`}>
    {role === "assistant" ? (
      <span className={styles.avatar} aria-hidden>
        <MessageCircleHeart size={20} />
      </span>
    ) : null}
    <div className={`${styles.bubble} ${error ? styles.error : ""}`}>
      {role === "assistant" && visual ? <MathVisual visual={visual} /> : null}
      {role === "assistant" ? <MathText text={content} /> : <p className={styles.plain}>{content}</p>}
    </div>
  </div>
);
