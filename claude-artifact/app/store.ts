// Saves Judah's learning data. Preferred home: the viewer's private area of the artifact
// database (their own Claude account). If that is not available (or not writable for this
// viewer) everything is kept in this browser only, and the app says so.
type Doc = Record<string, unknown>;
type Mode = "loading" | "cloud" | "device";

const LS_KEY = "judah.maths.docs.v1";

interface DbNs {
  collection(p: string): { get(): Promise<{ docs: { id: string; data(): Doc | undefined }[] }> };
  doc(p: string): { set(d: Doc): Promise<void> };
}
interface UserNs {
  id(): Promise<string | null>;
}
declare global {
  interface Window {
    claude?: { use(name: string): Promise<unknown> };
  }
}

const withTimeout = <T,>(p: Promise<T>, ms: number): Promise<T | null> =>
  Promise.race([p, new Promise<null>((r) => setTimeout(() => r(null), ms))]);

class Store {
  mode: Mode = "loading";
  notice: string | null = null;
  private docs: Record<string, Doc> = {};
  private uid: string | null = null;
  private db: DbNs | null = null;
  private chains = new Map<string, Promise<void>>();
  private listeners = new Set<() => void>();
  private version = 0;

  subscribe = (fn: () => void) => {
    this.listeners.add(fn);
    return () => {
      this.listeners.delete(fn);
    };
  };
  getSnapshot = () => this.version;
  private emit() {
    this.version++;
    this.listeners.forEach((l) => l());
  }

  async init(): Promise<void> {
    try {
      const claude = window.claude;
      if (claude) {
        const [db, user] = await Promise.all([
          withTimeout(claude.use("db") as Promise<DbNs | null>, 6000),
          withTimeout(claude.use("user") as Promise<UserNs | null>, 6000),
        ]);
        const uid = user ? await withTimeout(user.id(), 4000) : null;
        if (db && uid) {
          const snap = await withTimeout(db.collection(`data/users/${uid}`).get(), 8000);
          if (snap) {
            this.db = db;
            this.uid = uid;
            snap.docs.forEach((d) => {
              const data = d.data();
              if (data) this.docs[d.id] = data;
            });
            // A first visit after saving on this device only: bring that data across.
            const local = this.readLocal();
            if (!this.docs.profile && local.profile) {
              this.docs = { ...local };
              this.mode = "cloud";
              for (const id of Object.keys(this.docs)) this.persist(id);
            }
            this.mode = "cloud";
            this.emit();
            return;
          }
        }
      }
    } catch {
      /* fall through to device mode */
    }
    this.docs = this.readLocal();
    this.mode = "device";
    this.notice = "Saved on this device only. To keep progress in your Claude account, ask the person who shared this page to share it with edit access (Contributor).";
    this.emit();
  }

  private readLocal(): Record<string, Doc> {
    try {
      const raw = localStorage.getItem(LS_KEY);
      return raw ? (JSON.parse(raw) as Record<string, Doc>) : {};
    } catch {
      return {};
    }
  }
  private writeLocal() {
    try {
      localStorage.setItem(LS_KEY, JSON.stringify(this.docs));
    } catch {
      /* storage blocked: the app still works for this visit */
    }
  }

  get<T = Doc>(id: string): T | undefined {
    return this.docs[id] as T | undefined;
  }
  ids(prefix: string): string[] {
    return Object.keys(this.docs).filter((k) => k.startsWith(prefix));
  }
  set(id: string, data: Doc): void {
    this.docs[id] = data;
    this.persist(id);
    this.emit();
  }

  private persist(id: string) {
    if (this.mode === "cloud" && this.db && this.uid) {
      const db = this.db;
      const path = `data/users/${this.uid}/${id}`;
      const prev = this.chains.get(id) ?? Promise.resolve();
      const next = prev
        .then(() => db.doc(path).set(this.docs[id] as Doc))
        .catch(() => this.fallBackToDevice());
      this.chains.set(id, next);
    } else {
      this.writeLocal();
    }
  }

  private fallBackToDevice() {
    if (this.mode === "device") return;
    this.mode = "device";
    this.notice = "I couldn't save to your Claude account, so progress is being kept on this device only. Ask the person who shared this page for edit access (Contributor) to fix it.";
    this.writeLocal();
    this.emit();
  }
}

export const store = new Store();
