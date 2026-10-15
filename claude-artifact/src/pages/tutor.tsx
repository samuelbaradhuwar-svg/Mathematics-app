import React, { useEffect, useMemo, useRef, useState } from "react";
import { Helmet } from "react-helmet";
import { Link, useSearchParams } from "react-router-dom";
import { Camera, History, MessageCircleHeart, Plus, Send } from "lucide-react";
import { curriculumRegistry } from "../helpers/curriculumRegistry";
import type { Visual } from "../helpers/curriculumTypes";
import { useLearnerMe } from "../helpers/useLearnerData";
import { useTutorChat, useTutorHistory } from "../helpers/useTutorData";
import { Button } from "../components/Button";
import { ChatBubble } from "../components/ChatBubble";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "../components/Sheet";
import { Spinner } from "../components/Spinner";
import { Textarea } from "../components/Textarea";
import styles from "./tutor.module.css";

interface Msg {
  key: string;
  role: "user" | "assistant";
  content: string;
  visual?: Visual | null;
  error?: boolean;
}

const STARTERS = [
  "Can you explain how to solve 3x + 5 = 20?",
  "I don't understand fractions",
  "What is a prime number?",
  "Help me with area and perimeter",
];

const TutorPage: React.FC = () => {
  const me = useLearnerMe();
  const learner = me.data?.learner;
  const [params] = useSearchParams();
  const subtopicId = params.get("subtopic") ?? undefined;
  const focus = subtopicId ? curriculumRegistry.subtopic(learner?.grade ?? 8, subtopicId) : undefined;

  const [threadId, setThreadId] = useState<number | undefined>(undefined);
  const [explicitThread, setExplicitThread] = useState<number | undefined>(undefined);
  const history = useTutorHistory(explicitThread);
  const chat = useTutorChat();
  const [messages, setMessages] = useState<Msg[]>([]);
  const [text, setText] = useState("");
  const [loaded, setLoaded] = useState(false);
  const [threadsOpen, setThreadsOpen] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  // load the latest (or chosen) conversation once
  useEffect(() => {
    if (history.data && !loaded) {
      setThreadId(history.data.threadId ?? undefined);
      setMessages(history.data.messages.map((m) => ({ key: `h${m.id}`, role: m.role, content: m.content, visual: m.visual })));
      setLoaded(true);
    }
  }, [history.data, loaded]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages.length, chat.isPending]);

  const send = (value: string) => {
    const msg = value.trim();
    if (!msg || chat.isPending) return;
    setText("");
    setMessages((m) => [...m, { key: `u${Date.now()}`, role: "user", content: msg }]);
    chat.mutate(
      { threadId, message: msg, mode: "chat", context: subtopicId ? { subtopicId } : undefined },
      {
        onSuccess: (r) => {
          setThreadId(r.threadId);
          setMessages((m) => [...m, { key: `a${r.message.id}`, role: "assistant", content: r.message.content, visual: r.message.visual }]);
        },
        onError: (e) =>
          setMessages((m) => [...m, { key: `e${Date.now()}`, role: "assistant", error: true, content: e instanceof Error ? e.message : "Something went wrong. Please try again." }]),
      }
    );
  };

  const newChat = () => {
    setThreadId(undefined);
    setExplicitThread(undefined);
    setMessages([]);
    setLoaded(true);
  };

  const empty = messages.length === 0 && loaded;
  const name = learner?.name ?? "there";
  const threads = useMemo(() => history.data?.threads ?? [], [history.data]);

  return (
    <div className={styles.page}>
      <Helmet>
        <title>Ask My Tutor · My Maths Tutor</title>
      </Helmet>

      <div className={styles.top}>
        <div className={styles.titleRow}>
          <span className={styles.avatar}>
            <MessageCircleHeart size={26} />
          </span>
          <div>
            <h1 className={styles.title}>Ask my tutor</h1>
            <p className={styles.sub}>Ask anything. There are no silly questions.</p>
          </div>
        </div>
        <div className={styles.topBtns}>
          <Button variant="ghost" size="icon-md" aria-label="Earlier chats" onClick={() => setThreadsOpen(true)}>
            <History size={22} />
          </Button>
          <Button variant="ghost" size="icon-md" aria-label="New chat" onClick={newChat}>
            <Plus size={22} />
          </Button>
        </div>
      </div>

      {focus ? <div className={styles.focus}>We're talking about: <strong>{focus.subtopic.name}</strong></div> : null}

      <div className={styles.messages} aria-live="polite">
        {empty ? (
          <div className={styles.welcome}>
            <ChatBubble role="assistant" content={`Hi ${name}! I'm your maths tutor. I'll go slowly and explain every step. What would you like help with today?`} />
            <div className={styles.starters}>
              {STARTERS.map((s) => (
                <button key={s} type="button" className={styles.starter} onClick={() => send(s)}>
                  {s}
                </button>
              ))}
              <Link to="/scan" className={`${styles.starter} ${styles.scan}`}>
                <Camera size={18} aria-hidden /> Take a photo of my question
              </Link>
            </div>
          </div>
        ) : null}
        {!loaded && history.isLoading ? <Spinner /> : null}
        {messages.map((m) => (
          <ChatBubble key={m.key} role={m.role} content={m.content} visual={m.visual} error={m.error} />
        ))}
        {chat.isPending ? (
          <div className={styles.thinking} role="status">
            <Spinner size="sm" /> My tutor is working it out, step by step...
          </div>
        ) : null}
        <div ref={endRef} />
      </div>

      <form
        className={styles.composer}
        onSubmit={(e) => {
          e.preventDefault();
          send(text);
        }}
      >
        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              send(text);
            }
          }}
          placeholder="Type your question here..."
          rows={2}
          className={styles.input}
          aria-label="Your message"
          maxLength={2000}
        />
        <Button type="submit" size="icon-lg" className={styles.send} disabled={!text.trim() || chat.isPending} aria-label="Send">
          <Send size={22} />
        </Button>
      </form>

      <Sheet open={threadsOpen} onOpenChange={setThreadsOpen}>
        <SheetContent side="bottom" className={styles.sheet}>
          <SheetHeader>
            <SheetTitle>Earlier chats</SheetTitle>
          </SheetHeader>
          <div className={styles.threads}>
            {threads.length === 0 ? <p className={styles.sub}>No earlier chats yet.</p> : null}
            {threads.map((t) => (
              <button
                key={t.id}
                type="button"
                className={styles.thread}
                onClick={() => {
                  setExplicitThread(t.id);
                  setLoaded(false);
                  setThreadsOpen(false);
                }}
              >
                {t.title}
              </button>
            ))}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default TutorPage;
