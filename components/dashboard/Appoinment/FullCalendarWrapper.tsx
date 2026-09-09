"use client";

import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import timeGridPlugin from "@fullcalendar/timegrid";
import listPlugin from "@fullcalendar/list";
import type { CalendarOptions } from "@fullcalendar/core";

// Module-level constant: passing a fresh array literal on every parent render
// makes FullCalendar reprocess its plugin set each time.
const PLUGINS = [dayGridPlugin, interactionPlugin, timeGridPlugin, listPlugin];

// Exists so the FullCalendar runtime and all four plugins resolve into one
// lazily-loaded chunk. Importing the plugins from the parent instead would pull
// them into the main route bundle, leaving only the thin React wrapper deferred.
export default function FullCalendarWrapper(props: CalendarOptions) {
  return <FullCalendar plugins={PLUGINS} {...props} />;
}
