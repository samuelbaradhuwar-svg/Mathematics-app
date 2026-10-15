import React, { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { BarChart3, BookOpen, Camera, Flame, Home, LogOut, Menu, MessageCircleHeart, PenLine, PlayCircle, Users } from "lucide-react";
import { useAuth } from "../helpers/useAuth";
import { useLearnerMe, useProgress } from "../helpers/useLearnerData";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "./Sheet";
import { SaveNotice } from "./SaveNotice";
import styles from "./AppShell.module.css";

const TABS = [
  { to: "/", label: "Home", icon: Home, end: true },
  { to: "/lessons", label: "Lessons", icon: BookOpen },
  { to: "/scan", label: "Scan", icon: Camera, primary: true },
  { to: "/tutor", label: "Ask Tutor", icon: MessageCircleHeart },
  { to: "/practice", label: "Practice", icon: PenLine },
] as const;

const DESKTOP_LINKS = [
  { to: "/", label: "Home", end: true },
  { to: "/lessons", label: "My Lessons" },
  { to: "/tutor", label: "Ask My Tutor" },
  { to: "/scan", label: "Scan a Question" },
  { to: "/practice", label: "Practice" },
  { to: "/progress", label: "My Progress" },
  { to: "/videos", label: "Video Library" },
] as const;

export const AppShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const { logout } = useAuth();
  const navigate = useNavigate();
  const me = useLearnerMe();
  const progress = useProgress();
  const streak = progress.data?.summary.stats.streak ?? 0;

  const go = (to: string) => {
    setMenuOpen(false);
    navigate(to);
  };

  return (
    <div className={styles.shell}>
      <header className={styles.header}>
        <Link to="/" className={styles.brand} aria-label="Home">
          <span className={styles.logo} aria-hidden>
            π
          </span>
          <span className={styles.brandText}>{me.data?.learner?.name ? `${me.data.learner.name}'s Maths` : "My Maths"}</span>
        </Link>

        <nav className={styles.desktopNav} aria-label="Main">
          {DESKTOP_LINKS.map((l) => (
            <NavLink key={l.to} to={l.to} end={"end" in l ? l.end : false} className={({ isActive }) => `${styles.desktopLink} ${isActive ? styles.desktopActive : ""}`}>
              {l.label}
            </NavLink>
          ))}
        </nav>

        <div className={styles.headerRight}>
          {streak > 0 ? (
            <span className={styles.streak} title={`${streak} day${streak === 1 ? "" : "s"} in a row`}>
              <Flame size={16} aria-hidden /> {streak}
            </span>
          ) : null}
          <Link to="/progress" className={`${styles.iconBtn} ${styles.mobileOnly}`} aria-label="My progress">
            <BarChart3 size={22} />
          </Link>
          <button type="button" className={styles.iconBtn} aria-label="More" onClick={() => setMenuOpen(true)}>
            <Menu size={22} />
          </button>
        </div>
      </header>

      <main className={styles.main}>
        <SaveNotice />
        {children}
      </main>

      <nav className={styles.tabbar} aria-label="Main">
        {TABS.map((t) => {
          const Icon = t.icon;
          return (
            <NavLink key={t.to} to={t.to} end={"end" in t ? t.end : false} className={({ isActive }) => `${styles.tab} ${"primary" in t && t.primary ? styles.tabPrimary : ""} ${isActive ? styles.tabActive : ""}`}>
              <span className={styles.tabIcon}>
                <Icon size={"primary" in t && t.primary ? 28 : 24} strokeWidth={2.2} aria-hidden />
              </span>
              <span className={styles.tabLabel}>{t.label}</span>
            </NavLink>
          );
        })}
      </nav>

      <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
        <SheetContent side="bottom" className={styles.sheet}>
          <SheetHeader>
            <SheetTitle>More</SheetTitle>
          </SheetHeader>
          <div className={styles.menuList}>
            <button type="button" className={styles.menuItem} onClick={() => go("/progress")}>
              <BarChart3 size={22} /> My Progress
            </button>
            <button type="button" className={styles.menuItem} onClick={() => go("/videos")}>
              <PlayCircle size={22} /> Video Library
            </button>
            <button type="button" className={styles.menuItem} onClick={() => go("/parent")}>
              <Users size={22} /> Parent / Guardian area
            </button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};