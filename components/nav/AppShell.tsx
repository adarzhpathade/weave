"use client";

import { usePathname } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
  type CSSProperties,
  type ReactNode,
} from "react";
import type { NotificationItem } from "@/lib/db/queries";
import { MenuPanel } from "./MenuPanel";
import { NavPill } from "./NavPill";
import { NotificationsPanel } from "./NotificationsPanel";
import { pillLabel, sectionFromPath } from "./sections";
import type { ShellStudent } from "./types";
import { useFocusTrap } from "./useFocusTrap";

type Mode = "closed" | "menu" | "notifications";

type ShellContextValue = {
  student: ShellStudent;
  unreadCount: number;
  notificationsOpen: boolean;
  openNotifications: () => void;
};

const ShellContext = createContext<ShellContextValue | null>(null);

/** Shell state for screens inside the app (bell badge, opening the notifications panel). */
export function useShell(): ShellContextValue {
  const value = useContext(ShellContext);
  if (!value) throw new Error("useShell() must be used inside <AppShell>.");
  return value;
}

type AppShellProps = {
  student: ShellStudent;
  notifications: NotificationItem[];
  markAllReadAction: () => Promise<{ ok: boolean } | void>;
  signOutAction: () => Promise<void>;
  children: ReactNode;
};

const MENU_ID = "app-menu";
const NOTIF_ID = "app-notifications";
const FOCUSABLE = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';
const MARK_READ_ERROR = "Couldn't mark them as read. Check your connection and try again.";

export function AppShell({ student, notifications, markAllReadAction, signOutAction, children }: AppShellProps) {
  const pathname = usePathname();
  const [mode, setMode] = useState<Mode>("closed");
  const [origin, setOrigin] = useState<CSSProperties>({});
  const [readIds, setReadIds] = useState<ReadonlySet<string>>(() => new Set());
  const [markError, setMarkError] = useState<string | null>(null);
  const [marking, startMarking] = useTransition();
  // Set when a panel opens, so relative times are fresh and the server render has none (no hydration mismatch).
  const [now, setNow] = useState<Date | null>(null);

  const layerRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  const isUnread = useCallback(
    (item: NotificationItem) => !item.read && !readIds.has(`${item.type}-${item.id}`),
    [readIds],
  );
  const unreadCount = useMemo(() => notifications.filter(isUnread).length, [notifications, isUnread]);

  // The circle grows from the centre of the pill's Menu button (kit: --mx / --my).
  const measureOrigin = useCallback(() => {
    const rect = menuButtonRef.current?.getBoundingClientRect();
    if (!rect) return;
    setOrigin({ "--mx": `${rect.left + rect.width / 2}px`, "--my": `${rect.top + rect.height / 2}px` } as CSSProperties);
  }, []);

  const open = useCallback(
    (next: Exclude<Mode, "closed">) => {
      measureOrigin();
      setNow(new Date());
      setMode(next);
    },
    [measureOrigin],
  );

  const close = useCallback(() => {
    setMode("closed");
    menuButtonRef.current?.focus({ preventScroll: true });
  }, []);

  const openNotifications = useCallback(() => open("notifications"), [open]);

  function onMenuButton() {
    if (mode === "closed") open("menu");
    else close();
  }

  // Navigating (a menu link, the back button) closes whatever is open.
  const [lastPath, setLastPath] = useState(pathname);
  if (pathname !== lastPath) {
    setLastPath(pathname);
    if (mode !== "closed") setMode("closed");
  }

  // Move focus into the panel once it opens; lock page scroll behind it.
  useEffect(() => {
    if (mode === "closed") return;
    const panel = mode === "menu" ? menuRef.current : notifRef.current;
    const target = panel?.querySelector<HTMLElement>(FOCUSABLE) ?? menuButtonRef.current;
    target?.focus({ preventScroll: true });
    const root = document.documentElement;
    const previous = root.style.overflow;
    root.style.overflow = "hidden";
    return () => {
      root.style.overflow = previous;
    };
  }, [mode]);

  useFocusTrap(layerRef, mode !== "closed", close);

  function onMarkAllRead() {
    const ids = notifications.filter(isUnread).map((item) => `${item.type}-${item.id}`);
    if (ids.length === 0) return;
    setMarkError(null);
    setReadIds((prev) => new Set([...prev, ...ids]));
    startMarking(async () => {
      try {
        const result = await markAllReadAction();
        if (result && !result.ok) throw new Error("markAllRead returned ok: false");
      } catch (error) {
        console.error("markAllReadAction failed", error);
        setReadIds((prev) => {
          const next = new Set(prev);
          ids.forEach((id) => next.delete(id));
          return next;
        });
        setMarkError(MARK_READ_ERROR);
      }
    });
  }

  const context = useMemo<ShellContextValue>(
    () => ({ student, unreadCount, notificationsOpen: mode === "notifications", openNotifications }),
    [student, unreadCount, mode, openNotifications],
  );

  const where = mode === "menu" ? "Menu" : mode === "notifications" ? "Notifications" : pillLabel(pathname, student);

  return (
    <ShellContext.Provider value={context}>
      <div inert={mode !== "closed"} className="flex min-h-screen-safe flex-1 flex-col">
        {children}
      </div>

      <div ref={layerRef}>
        <MenuPanel
          id={MENU_ID}
          open={mode === "menu"}
          here={sectionFromPath(pathname)}
          student={student}
          origin={origin}
          panelRef={menuRef}
          onNavigate={() => setMode("closed")}
          signOutAction={signOutAction}
        />
        <NotificationsPanel
          id={NOTIF_ID}
          open={mode === "notifications"}
          origin={origin}
          panelRef={notifRef}
          items={notifications}
          isUnread={isUnread}
          unreadCount={unreadCount}
          now={now}
          pending={marking}
          error={markError}
          onMarkAllRead={onMarkAllRead}
        />
        <nav aria-label="App" className="fixed inset-x-3 bottom-dock z-50 mx-auto max-w-pill">
          <NavPill
            where={where}
            mode={mode}
            menuButtonRef={menuButtonRef}
            onMenuButton={onMenuButton}
            controls={mode === "notifications" ? NOTIF_ID : MENU_ID}
          />
        </nav>
      </div>
    </ShellContext.Provider>
  );
}
