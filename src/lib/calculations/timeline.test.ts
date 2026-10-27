import { describe, it, expect } from "vitest";
import {
  computePhaseDeadline,
  isTaskOverdue,
  calculateTimelineProgress,
  parseISODate,
  formatISODate,
  addDays,
} from "./timeline";
import { TimelineTask } from "@/types/event";

describe("Timeline Calculations Engine", () => {
  describe("Date parsing and formatting", () => {
    it("safely round-trips ISO dates YYYY-MM-DD", () => {
      const original = "2027-08-15";
      const parsed = parseISODate(original);
      expect(formatISODate(parsed)).toBe(original);
    });

    it("correctly offsets dates with addDays", () => {
      const base = parseISODate("2027-01-10");
      const future = addDays(base, 5);
      expect(formatISODate(future)).toBe("2027-01-15");
      const past = addDays(base, -5);
      expect(formatISODate(past)).toBe("2027-01-05");
    });
  });

  describe("computePhaseDeadline", () => {
    it("computes 6-month-before deadline for distant event", () => {
      const eventDate = "2027-12-01";
      const referenceDate = "2027-01-01";
      const deadline = computePhaseDeadline(eventDate, "6_months_plus", referenceDate);
      // 180 days before Dec 1
      expect(deadline).toBe("2027-06-04");
    });

    it("compresses phase deadlines when event is near-term", () => {
      // Event is only 20 days away
      const eventDate = "2027-04-20";
      const referenceDate = "2027-04-01";
      const deadline = computePhaseDeadline(eventDate, "6_months_plus", referenceDate);

      // Should not be in the past relative to reference date!
      const targetTime = parseISODate(deadline).getTime();
      const refTime = parseISODate(referenceDate).getTime();
      expect(targetTime).toBeGreaterThanOrEqual(refTime);
    });

    it("assigns exact event date for event_day phase", () => {
      const eventDate = "2027-09-25";
      const deadline = computePhaseDeadline(eventDate, "event_day");
      expect(deadline).toBe("2027-09-25");
    });
  });

  describe("isTaskOverdue", () => {
    it("identifies overdue tasks based on target date and reference date", () => {
      const targetDate = "2027-05-01";
      const today = "2027-05-10"; // Today is after target

      expect(isTaskOverdue(targetDate, "todo", today)).toBe(true);
      expect(isTaskOverdue(targetDate, "in_progress", today)).toBe(true);
      // Completed tasks are never overdue
      expect(isTaskOverdue(targetDate, "completed", today)).toBe(false);
    });

    it("considers future tasks as not overdue", () => {
      const targetDate = "2027-06-01";
      const today = "2027-05-10";

      expect(isTaskOverdue(targetDate, "todo", today)).toBe(false);
    });
  });

  describe("calculateTimelineProgress", () => {
    it("computes task progress percentages and status totals accurately", () => {
      const tasks: TimelineTask[] = [
        {
          id: "1",
          title: "Book Venue",
          description: "",
          phase: "6_months_plus",
          phaseLabel: "6+ Months",
          targetDate: "2027-01-01",
          priority: "high",
          dependencies: [],
          status: "completed",
          isOverdue: false,
          category: "Venue",
        },
        {
          id: "2",
          title: "Book Caterer",
          description: "",
          phase: "3_to_6_months",
          phaseLabel: "3-6 Months",
          targetDate: "2027-03-01",
          priority: "high",
          dependencies: [],
          status: "in_progress",
          isOverdue: false,
          category: "Catering",
        },
        {
          id: "3",
          title: "Send Invites",
          description: "",
          phase: "1_to_2_months",
          phaseLabel: "1-2 Months",
          targetDate: "2027-02-01",
          priority: "medium",
          dependencies: [],
          status: "todo",
          isOverdue: false,
          category: "Invites",
        },
        {
          id: "4",
          title: "Walkthrough",
          description: "",
          phase: "event_week",
          phaseLabel: "Week of",
          targetDate: "2027-06-01",
          priority: "low",
          dependencies: [],
          status: "todo",
          isOverdue: false,
          category: "Operations",
        },
      ];

      // Reference date where task 3 (Feb 1) is overdue, but task 4 (Jun 1) is not
      const progress = calculateTimelineProgress(tasks, "2027-02-15");

      expect(progress.totalTasks).toBe(4);
      expect(progress.completedTasks).toBe(1);
      expect(progress.inProgressTasks).toBe(1);
      expect(progress.todoTasks).toBe(2);
      expect(progress.completionPercentage).toBe(25); // 1/4 = 25%
      expect(progress.overdueTasks).toBe(1); // Task 3 is overdue
    });
  });
});
