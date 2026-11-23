"use client";

import { useState, type JSX, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import type { NotifyPrefs, ProfileActions, ProfileData } from "./types";

type NotifyKey = keyof NotifyPrefs;

const NOTIFY_ROWS: { key: NotifyKey; label: string }[] = [
  { key: "deadline", label: "Deadline reminders" },
  { key: "newAssignment", label: "New assignments" },
  { key: "status", label: "Status marked" },
];

/**
 * Profile — no kit phone exists, so it is built from the kit's sheet language: mono label, screen title
 * (first name plain, the rest light italic accent like `.scr-title .it`), hairline `.kv` rows and `.toggle-row`
 * switches, then a ghost "Sign out" button.
 */
export function ProfileScreen({ data, actions }: { data: ProfileData; actions: ProfileActions }): JSX.Element {
  const [first, ...rest] = data.fullName.trim().split(/\s+/);
  const restName = rest.join(" ");

  return (
    <main className="@container mx-auto flex w-full max-w-column flex-1 flex-col gap-4 px-4.5 pt-screen pb-screen">
      <span className="font-mono text-label tracking-label text-muted uppercase">
        {`${data.enrollmentNo} · ${data.divisionCode} · Sem ${data.semester}`}
      </span>
      <h1 className="font-display text-scr-title font-black tracking-display break-words">
        {first}
        {restName ? (
          <>
            {" "}
            <span className="font-light italic tracking-title text-accent">{restName}</span>
          </>
        ) : null}
      </h1>

      <section aria-labelledby="profile-account" className="mt-3 grid gap-2.5">
        <h2 id="profile-account" className="text-row font-bold">
          Account
        </h2>
        <dl className="grid border-t border-line">
          <Row label="Email">
            <span className="break-all">{data.email}</span>
          </Row>
          <Row label="Enrollment no.">
            <span className="font-mono tabular-nums">{data.enrollmentNo}</span>
          </Row>
          <Row label="Program">{data.programCode}</Row>
          <Row label="Division">{data.divisionCode}</Row>
          <Row label="Semester">
            <span className="tabular-nums">{data.semester}</span>
          </Row>
          {data.phone !== null ? (
            <Row label="Phone">
              <span className="tabular-nums">{data.phone}</span>
            </Row>
          ) : null}
        </dl>
      </section>

      <NotifySection initial={data.notify} updateNotify={actions.updateNotify} />

      <form action={actions.signOut} className="mt-4">
        <Button type="submit" variant="ghost" size="wide">
          Sign out
        </Button>
      </form>
    </main>
  );
}

// Three switches, saved optimistically. On failure the switch flips back and the server's message shows inline.
function NotifySection({
  initial,
  updateNotify,
}: {
  initial: NotifyPrefs;
  updateNotify: ProfileActions["updateNotify"];
}) {
  const [prefs, setPrefs] = useState<NotifyPrefs>(initial);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function toggle(key: NotifyKey) {
    if (saving) return;
    const previous = prefs;
    const next = { ...prefs, [key]: !prefs[key] };
    setPrefs(next);
    setError(null);
    setSaving(true);
    try {
      const result = await updateNotify(next);
      if (!result.ok) {
        setPrefs(previous);
        setError(result.error.message);
      }
    } catch {
      setPrefs(previous);
      setError("Couldn't save your notification settings. Check your connection and try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section aria-labelledby="profile-notify" aria-busy={saving} className="mt-3 grid gap-2.5">
      <h2 id="profile-notify" className="text-row font-bold">
        Notifications
      </h2>
      <div className="grid border-t border-line">
        {NOTIFY_ROWS.map(({ key, label }) => (
          <div
            key={key}
            className="flex items-center justify-between gap-4 border-b border-line py-2.5 text-small font-semibold"
          >
            <span id={`notify-${key}`}>{label}</span>
            <button
              type="button"
              role="switch"
              aria-checked={prefs[key]}
              aria-labelledby={`notify-${key}`}
              disabled={saving}
              onClick={() => toggle(key)}
              className="relative h-8 w-13 flex-none rounded-pill bg-line transition-colors duration-base ease-out after:absolute after:top-0.75 after:left-0.75 after:size-6.5 after:rounded-full after:bg-surface after:shadow-knob after:transition-transform after:duration-base after:ease-spring aria-checked:bg-lime aria-checked:after:translate-x-5 disabled:cursor-progress"
            />
          </div>
        ))}
      </div>
      {error !== null ? (
        <p
          role="alert"
          className="flex items-center gap-2 text-fine font-semibold before:size-2 before:flex-none before:rounded-full before:bg-missing"
        >
          {error}
        </p>
      ) : null}
      <p className="text-fine text-muted">Push notifications arrive after you install Weave on your phone.</p>
    </section>
  );
}

// Kit .sheet .kv row: muted key left, bold value right, hairline below.
function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-2.5 border-b border-line py-2.25 text-small">
      <dt className="flex-none text-muted">{label}</dt>
      <dd className="min-w-0 text-right font-bold">{children}</dd>
    </div>
  );
}
