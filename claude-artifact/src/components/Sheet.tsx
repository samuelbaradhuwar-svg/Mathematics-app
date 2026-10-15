import React, { createContext, useContext, useEffect } from "react";
import { createPortal } from "react-dom";
import styles from "./Sheet.module.css";

const Ctx = createContext<{ open: boolean; onOpenChange: (o: boolean) => void }>({ open: false, onOpenChange: () => {} });

export const Sheet: React.FC<{ open: boolean; onOpenChange: (o: boolean) => void; children: React.ReactNode }> = ({ open, onOpenChange, children }) => (
  <Ctx.Provider value={{ open, onOpenChange }}>{children}</Ctx.Provider>
);

export const SheetContent: React.FC<{ side?: "bottom" | "right"; className?: string; children: React.ReactNode }> = ({ className, children }) => {
  const { open, onOpenChange } = useContext(Ctx);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onOpenChange(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onOpenChange]);
  if (!open) return null;
  return createPortal(
    <div className={styles.overlay} onClick={() => onOpenChange(false)}>
      <div className={`${styles.panel} ${className ?? ""}`} role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
        <div className={styles.grab} aria-hidden />
        {children}
      </div>
    </div>,
    document.body
  );
};

export const SheetHeader: React.FC<{ children: React.ReactNode }> = ({ children }) => <div className={styles.header}>{children}</div>;
export const SheetTitle: React.FC<{ children: React.ReactNode }> = ({ children }) => <h2 className={styles.title}>{children}</h2>;
