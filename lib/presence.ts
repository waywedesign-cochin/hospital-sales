// A heartbeat fires every 60s while a dashboard tab is open, so three missed
// beats means the session is gone (browser closed, machine asleep, offline).
export const PRESENCE_STALE_MS = 3 * 60 * 1000;

export function isPresenceFresh(
  isOnline: boolean | undefined,
  lastActiveAt: string | Date | null | undefined,
  now: number = Date.now(),
) {
  if (!isOnline || !lastActiveAt) return false;
  return new Date(lastActiveAt).getTime() >= now - PRESENCE_STALE_MS;
}
