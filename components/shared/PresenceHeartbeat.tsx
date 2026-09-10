"use client";

import { useEffect } from "react";

const HEARTBEAT_INTERVAL_MS = 60 * 1000;

// Keeps the signed-in user's lastSeenAt fresh while a dashboard tab is open.
// Deliberately fire-and-forget: presence is not worth surfacing errors for,
// and a missed beat just means the badge goes stale a minute early.
export default function PresenceHeartbeat() {
  useEffect(() => {
    const ping = () => {
      fetch("/api/presence", { method: "POST", keepalive: true }).catch(
        () => {},
      );
    };

    ping();
    const id = setInterval(ping, HEARTBEAT_INTERVAL_MS);

    return () => clearInterval(id);
  }, []);

  return null;
}
