export interface TimeInterval {
  start: number;
  end: number;
}

/**
 * Converts a time string like "10:20" to minutes since midnight (e.g., 620)
 */
export function timeStringToMinutes(timeStr: string): number {
  if (!timeStr) return 0;
  const parts = timeStr.split(":");
  if (parts.length !== 2) return 0;
  const hours = parseInt(parts[0], 10);
  const minutes = parseInt(parts[1], 10);
  return hours * 60 + minutes;
}

/**
 * Converts minutes since midnight (e.g., 620) to a time string like "10:20"
 */
export function minutesToTimeString(minutes: number): string {
  if (minutes == null || isNaN(minutes)) return "00:00";
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
}

/**
 * Given a list of available intervals and a list of blocking intervals,
 * subtract the blocking intervals from the available ones.
 */
export function subtractIntervals(
  available: TimeInterval[],
  blocked: TimeInterval[]
): TimeInterval[] {
  let result = [...available];

  for (const block of blocked) {
    const nextResult: TimeInterval[] = [];
    for (const avail of result) {
      // If block is completely outside avail, keep avail
      if (block.end <= avail.start || block.start >= avail.end) {
        nextResult.push(avail);
      } else {
        // Block overlaps with avail. It could split it or reduce it.
        if (block.start > avail.start) {
          nextResult.push({ start: avail.start, end: block.start });
        }
        if (block.end < avail.end) {
          nextResult.push({ start: block.end, end: avail.end });
        }
      }
    }
    result = nextResult;
  }

  // Sort and merge any adjacent intervals just in case
  result.sort((a, b) => a.start - b.start);
  const merged: TimeInterval[] = [];
  for (const current of result) {
    if (merged.length === 0) {
      merged.push(current);
    } else {
      const prev = merged[merged.length - 1];
      if (prev.end === current.start) {
        prev.end = current.end; // Merge adjacent
      } else {
        merged.push(current);
      }
    }
  }

  return merged;
}

/**
 * Chunks free intervals into back-to-back slots of durationMinutes.
 */
export function chunkIntoSlots(
  freeIntervals: TimeInterval[],
  durationMinutes: number
): { start: number; end: number }[] {
  const slots: { start: number; end: number }[] = [];

  for (const interval of freeIntervals) {
    let current = interval.start;
    while (current + durationMinutes <= interval.end) {
      slots.push({ start: current, end: current + durationMinutes });
      current += durationMinutes;
    }
  }

  return slots;
}
