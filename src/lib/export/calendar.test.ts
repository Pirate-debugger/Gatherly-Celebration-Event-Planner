import { describe, it, expect } from "vitest";
import {
  escapeIcsText,
  formatIcsDate,
  formatIcsDateTime,
  addHoursToIcsDateTime,
  generateEventIcs,
} from "./calendar";
import { generateDemoPlan, SAMPLE_WEDDING_PRESET } from "@/lib/demo/presets";

describe("iCalendar (.ics) Export Engine", () => {
  it("escapes special characters per RFC 5545", () => {
    const raw = "Dinner, Dancing; & Fun\\Celebration\nNext line";
    const escaped = escapeIcsText(raw);
    expect(escaped).toBe("Dinner\\, Dancing\\; & Fun\\\\Celebration\\nNext line");
  });

  it("formats dates into YYYYMMDD", () => {
    expect(formatIcsDate("2027-06-15")).toBe("20270615");
  });

  it("formats 12-hour AM/PM times into standard iCalendar timestamps", () => {
    expect(formatIcsDateTime("2027-06-15", "10:30 AM")).toBe("20270615T103000");
    expect(formatIcsDateTime("2027-06-15", "2:45 PM")).toBe("20270615T144500");
    expect(formatIcsDateTime("2027-06-15", "12:00 PM")).toBe("20270615T120000");
    expect(formatIcsDateTime("2027-06-15", "12:30 AM")).toBe("20270615T003000");
  });

  it("handles fallback if time string is unparseable", () => {
    expect(formatIcsDateTime("2027-06-15", "TBD")).toBe("20270615T100000");
  });

  it("accurately adds hours across timestamps", () => {
    const initial = "20270615T100000";
    const added = addHoursToIcsDateTime(initial, 6);
    expect(added).toBe("20270615T160000");
  });

  it("generates a valid complete RFC 5545 VCALENDAR document", () => {
    const plan = generateDemoPlan(SAMPLE_WEDDING_PRESET);
    const ics = generateEventIcs(plan, { nowTimestamp: "20261028T000000Z" });

    // Validate RFC 5545 calendar envelope
    expect(ics).toContain("BEGIN:VCALENDAR");
    expect(ics).toContain("VERSION:2.0");
    expect(ics).toContain("PRODID:-//Gatherly//Celebration and Event Planner//EN");
    expect(ics).toContain("END:VCALENDAR");

    // Validate main event presence
    expect(ics).toContain("BEGIN:VEVENT");
    expect(ics).toContain(`UID:gatherly-main-${plan.id}@gatherly.app`);
    expect(ics).toContain("CATEGORIES:CELEBRATION,EVENT");

    // Validate timeline tasks presence
    expect(ics).toContain("CATEGORIES:TASK,MILESTONE");

    // Validate itinerary presence
    expect(ics).toContain("CATEGORIES:ITINERARY,SCHEDULE");

    // Validate CRLF line endings
    expect(ics).toMatch(/\r\n/);
  });
});
