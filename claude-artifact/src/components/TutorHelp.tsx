import React, { useState } from "react";
import { Lightbulb, MessageCircleHeart, RefreshCw } from "lucide-react";
import { useTutorChat } from "../helpers/useTutorData";
import { Button } from "./Button";
import { MathText } from "./MathText";
import { MathVisual } from "./MathVisual";
import { Spinner } from "./Spinner";
import type { Visual } from "../helpers/curriculumTypes";
import styles from "./TutorHelp.module.css";

interface Props {
  subtopicId?: string;
  question: string;
  studentAnswer?: string;
  hintsShown?: string[];
  // "hint" gives one small hint. "explain-differently" re-explains in a new way.
  mode: "hint" | "explain-differently";
  label?: string;
}

// Asks the AI tutor for help with ONE question on screen (without leaving the page).
export const TutorHelp: React.FC<Props> = ({ subtopicId, question, studentAnswer, hintsShown, mode, label }) => {
  const chat = useTutorChat();
  const [threadId, setThreadId] = useState<number | undefined>();
  const [reply, setReply] = useState<{ content: string; visual: Visual | null } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const asked = reply !== null;

  const ask = () => {
    setError(null);
    chat.mutate(
      {
        threadId,
        mode,
        message:
          mode === "hint"
            ? "I'm stuck on this question. Please give me just one small hint (not the answer)."
            : "I don't understand this question. Please explain it to me in a different way.",
        context: { subtopicId, question, studentAnswer, hintsShown },
      },
      {
        onSuccess: (r) => {
          setThreadId(r.threadId);
          setReply({ content: r.message.content, visual: r.message.visual });
        },
        onError: (e) => setError(e instanceof Error ? e.message : "Something went wrong."),
      }
    );
  };

  return (
    <div className={styles.wrap}>
      <Button variant="outline" onClick={ask} disabled={chat.isPending} className={styles.btn}>
        {chat.isPending ? <Spinner size="sm" /> : asked ? <RefreshCw size={18} /> : mode === "hint" ? <Lightbulb size={18} /> : <MessageCircleHeart size={18} />}
        {chat.isPending ? "My tutor is thinking..." : asked ? "Try another way" : label ?? (mode === "hint" ? "Hint from my tutor" : "Explain it differently")}
      </Button>
      {error ? <p className={styles.error}>{error}</p> : null}
      {reply ? (
        <div className={styles.reply}>
          <div className={styles.replyHead}>
            <MessageCircleHeart size={18} aria-hidden /> My tutor says
          </div>
          {reply.visual ? <MathVisual visual={reply.visual} /> : null}
          <MathText text={reply.content} />
        </div>
      ) : null}
    </div>
  );
};