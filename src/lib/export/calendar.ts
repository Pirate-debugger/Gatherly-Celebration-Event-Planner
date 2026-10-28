/**
 * Gatherly - RFC 5545 Compliant iCalendar (.ics) Export Engine
 *
 * Generates valid iCalendar (.ics) files for:
 * 1. The Main Celebration Event (with duration & location)
 * 2. Key Timeline Milestone Tasks & Deadlines
 * 3. Day-of Run-of-Show Schedule / Itinerary
 *
 * Adheres strictly to RFC 5545 text escaping and CRLF formatting rules.
 */

import { EventPlan, ItineraryItem, TimelineTask } from "@/types/event";

/**
 * Escapes characters for iCalendar text fields according to RFC 5545:
 * Commas, semicolons, backslashes, and newlines must be escaped.
 */
export function escapeIcsText(text: string): string {
  if (!text) return "";
  return text
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\r?\n/g, "\\n");
}

/**
 * Formats a YYYY-MM-DD date string into iCalendar full-day date format (YYYYMMDD).
 */
export function formatIcsDate(dateStr: string): string {
  return dateStr.replace(/-/g, "");
}

/**
 * Combines an event date (YYYY-MM-DD) and a 12h or 24h time string (e.g., "10:00 AM", "14:30")
 * into an iCalendar floating local timestamp (YYYYMMDDTHHMMSS).
 */
export function formatIcsDateTime(dateStr: string, timeStr: string): string {
  const cleanDate = formatIcsDate(dateStr);
  const normalized = timeStr.trim().toUpperCase();

  // Parse time format: e.g. "10:00 AM", "2:30 PM", "15:00"
  const match = normalized.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/);
  if (!match) {
    // Default to 10:00 AM if unparseable
    return `${cleanDate}T100000`;
  }

  let hours = parseInt(match[1], 10);
  const minutes = match[2];
  const meridian = match[3];

  if (meridian === "PM" && hours < 12) {
    hours += 12;
  } else if (meridian === "AM" && hours === 12) {
    hours = 0;
  }

  const hoursStr = hours.toString().padStart(2, "0");
  return `${cleanDate}T${hoursStr}${minutes}00`;
}

/**
 * Adds hours to an iCalendar timestamp string.
 */
export function addHoursToIcsDateTime(icsDateTime: string, hoursToAdd: number): string {
  const match = icsDateTime.match(/^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})$/);
  if (!match) return icsDateTime;

  const year = parseInt(match[1], 10);
  const month = parseInt(match[2], 10) - 1;
  const day = parseInt(match[3], 10);
  const hour = parseInt(match[4], 10);
  const minute = parseInt(match[5], 10);
  const second = parseInt(match[6], 10);

  const dateObj = new Date(Date.UTC(year, month, day, hour, minute, second));
  dateObj.setUTCHours(dateObj.getUTCHours() + hoursToAdd);

  const y = dateObj.getUTCFullYear();
  const m = (dateObj.getUTCMonth() + 1).toString().padStart(2, "0");
  const d = dateObj.getUTCDate().toString().padStart(2, "0");
  const h = dateObj.getUTCHours().toString().padStart(2, "0");
  const min = dateObj.getUTCMinutes().toString().padStart(2, "0");
  const s = dateObj.getUTCSeconds().toString().padStart(2, "0");

  return `${y}${m}${d}T${h}${min}${s}`;
}

/**
 * Generates a full RFC 5545 iCalendar string from an EventPlan.
 */
export function generateEventIcs(
  plan: EventPlan,
  options: {
    includeTimeline?: boolean;
    includeItinerary?: boolean;
    nowTimestamp?: string;
  } = {}
): string {
  const {
    includeTimeline = true,
    includeItinerary = true,
    nowTimestamp = "20261028T000000Z",
  } = options;

  const prefs = plan.userPreferences;
  const crlf = "\r\n";
  const lines: string[] = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Gatherly//Celebration and Event Planner//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    `X-WR-CALNAME:${escapeIcsText(prefs.title)}`,
    "X-WR-TIMEZONE:UTC",
  ];

  // 1. Primary Event (The Main Celebration)
  const mainEventStart = `${formatIcsDate(prefs.date)}T100000`;
  const mainEventEnd = addHoursToIcsDateTime(mainEventStart, prefs.durationHours || 5);

  lines.push("BEGIN:VEVENT");
  lines.push(`UID:gatherly-main-${plan.id}@gatherly.app`);
  lines.push(`DTSTAMP:${nowTimestamp}`);
  lines.push(`DTSTART:${mainEventStart}`);
  lines.push(`DTEND:${mainEventEnd}`);
  lines.push(`SUMMARY:${escapeIcsText(prefs.title)}`);
  lines.push(
    `DESCRIPTION:${escapeIcsText(
      `Gatherly Celebration Plan\\nConcept: ${plan.overview.eventConcept}\\nGuests: ${prefs.guestCount}\\nBudget: ${prefs.currency} ${prefs.budget.toLocaleString()}`
    )}`
  );
  lines.push(`LOCATION:${escapeIcsText(prefs.location)}`);
  lines.push("STATUS:CONFIRMED");
  lines.push("CATEGORIES:CELEBRATION,EVENT");
  lines.push("END:VEVENT");

  // 2. Timeline Milestone Tasks
  if (includeTimeline && plan.timeline && plan.timeline.length > 0) {
    plan.timeline.forEach((task: TimelineTask, idx: number) => {
      const taskDate = formatIcsDate(task.targetDate);
      lines.push("BEGIN:VEVENT");
      lines.push(`UID:gatherly-task-${task.id || idx}-${plan.id}@gatherly.app`);
      lines.push(`DTSTAMP:${nowTimestamp}`);
      lines.push(`DTSTART;VALUE=DATE:${taskDate}`);
      // All-day event ends next day
      lines.push(`SUMMARY:${escapeIcsText(`[Gatherly Task] ${task.title}`)}`);
      lines.push(
        `DESCRIPTION:${escapeIcsText(
          `${task.description}\\nPriority: ${task.priority.toUpperCase()}\\nPhase: ${task.phaseLabel}\\nStatus: ${task.status}`
        )}`
      );
      lines.push(`STATUS:${task.status === "completed" ? "COMPLETED" : "CONFIRMED"}`);
      lines.push("CATEGORIES:TASK,MILESTONE");
      lines.push("END:VEVENT");
    });
  }

  // 3. Day-of Run-of-Show Itinerary
  if (includeItinerary && plan.itinerary && plan.itinerary.length > 0) {
    plan.itinerary.forEach((item: ItineraryItem, idx: number) => {
      const startDateTime = formatIcsDateTime(prefs.date, item.time);
      const endDateTime = item.endTime
        ? formatIcsDateTime(prefs.date, item.endTime)
        : addHoursToIcsDateTime(startDateTime, 1);

      lines.push("BEGIN:VEVENT");
      lines.push(`UID:gatherly-itinerary-${item.id || idx}-${plan.id}@gatherly.app`);
      lines.push(`DTSTAMP:${nowTimestamp}`);
      lines.push(`DTSTART:${startDateTime}`);
      lines.push(`DTEND:${endDateTime}`);
      lines.push(`SUMMARY:${escapeIcsText(`[Itinerary] ${item.activity}`)}`);
      lines.push(
        `DESCRIPTION:${escapeIcsText(
          `Responsible: ${item.responsible}\\nLocation: ${item.location}${item.notes ? `\\nNotes: ${item.notes}` : ""}`
        )}`
      );
      lines.push(`LOCATION:${escapeIcsText(item.location || prefs.location)}`);
      lines.push("STATUS:CONFIRMED");
      lines.push("CATEGORIES:ITINERARY,SCHEDULE");
      lines.push("END:VEVENT");
    });
  }

  lines.push("END:VCALENDAR");

  return lines.join(crlf) + crlf;
}

/**
 * Triggers a browser download of an .ics file.
 */
export function downloadIcsFile(filename: string, content: string): void {
  const blob = new Blob([content], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename.endsWith(".ics") ? filename : `${filename}.ics`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
