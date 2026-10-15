import React, { useState, useSyncExternalStore } from "react";
import { CloudOff } from "lucide-react";
import { store } from "../../app/store";

// Tells the truth about where progress is being kept.
export const SaveNotice: React.FC = () => {
  useSyncExternalStore(store.subscribe, store.getSnapshot);
  const [hidden, setHidden] = useState(false);
  if (!store.notice || hidden) return null;
  return (
    <div
      role="status"
      style={{ display: "flex", gap: 10, alignItems: "flex-start", margin: "0 0 var(--spacing-4)", padding: "var(--spacing-3) var(--spacing-4)", borderRadius: "var(--radius-md)", background: "var(--status-help-soft)", fontSize: "0.92rem", lineHeight: 1.45 }}
    >
      <CloudOff size={18} aria-hidden style={{ flex: "none", marginTop: 2 }} />
      <span style={{ flex: 1 }}>{store.notice}</span>
      <button type="button" onClick={() => setHidden(true)} aria-label="Hide this note" style={{ border: "none", background: "transparent", color: "inherit", fontWeight: 800, cursor: "pointer", fontSize: "1rem" }}>
        ✕
      </button>
    </div>
  );
};
