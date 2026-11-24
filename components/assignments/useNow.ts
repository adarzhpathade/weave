"use client";

import { useEffect, useState } from "react";

/**
 * A clock that starts at the server time (so the first paint matches the server render) and then
 * ticks on the device clock, aligned to whole `stepMs` boundaries (60_000 = on the minute).
 */
export function useNow(initial: number, stepMs: number): number {
  const [now, setNow] = useState(initial);

  useEffect(() => {
    let timer = 0;
    function tick() {
      const t = Date.now();
      setNow(t);
      timer = window.setTimeout(tick, stepMs - (t % stepMs));
    }
    timer = window.setTimeout(tick, 0);
    return () => window.clearTimeout(timer);
  }, [stepMs]);

  return now;
}
