/**
 * Gatherly - Timeline Date Math and Task Progress Engine
 *
 * Computes dynamic milestone deadlines relative to the target event date.
 * Handles deadline compression for near-term events, detects overdue tasks,
 * and calculates comprehensive progress metrics.
 */

import { TimelineTask, TimelinePhase, TaskStatus } from "@/types/event";

export const PHASE_LABELS: Record<TimelinePhase, string> = {
  "6_months_plus": "6+ Months Before",
  "3_to_6_months": "3–6 Months Before",
  "1_to_2_months": "1–2 Months Before",
  "2_to_4_weeks": "2–4 Weeks Before",
  event_week: "Event Week",
  event_day: "Day of Event",
  post_event: "Post-Event Wrap-up",
};

/**
 * Parses an ISO date string (YYYY-MM-DD) into a Date object at UTC midnight.
 */
export function parseISODate(dateStr: string): Date {
  const parts = dateStr.split("-").map(Number);
  if (parts.length !== 3 || isNaN(parts[0]) || isNaN(parts[1]) || isNaN(parts[2])) {
    return new Date(Date.UTC(2027, 0, 1));
  }
  return new Date(Date.UTC(parts[0], parts[1] - 1, parts[2]));
}

/**
 * Formats a Date object to YYYY-MM-DD.
 */
export function formatISODate(date: Date): string {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, "0");
  const d = String(date.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/**
 * Adds or subtracts days from a base date.
 */
export function addDays(baseDate: Date, days: number): Date {
  const result = new Date(baseDate.getTime());
  result.setUTCDate(result.getUTCDate() + days);
  return result;
}

/**
 * Calculates deadline date based on timeline phase and target event date.
 * If the event is scheduled near-term (e.g. only 30 days out), milestones are
 * compressed proportionally so tasks are not scheduled in the past.
 */
export function computePhaseDeadline(
  eventDateStr: string,
  phase: TimelinePhase,
  referenceDateStr: string = "2027-01-01"
): string {
  const eventDate = parseISODate(eventDateStr);
  const refDate = parseISODate(referenceDateStr);

  // Difference in total days between reference date and event date
  const totalDays = Math.max(
    1,
    Math.round((eventDate.getTime() - refDate.getTime()) / (1000 * 60 * 60 * 24))
  );

  let targetDate: Date;

  switch (phase) {
    case "6_months_plus":
      if (totalDays > 180) {
        targetDate = addDays(eventDate, -180);
      } else {
        // Compress: start near today + 10% of window
        targetDate = addDays(refDate, Math.max(1, Math.round(totalDays * 0.1)));
      }
      break;

    case "3_to_6_months":
      if (totalDays > 90) {
        targetDate = addDays(eventDate, -90);
      } else {
        targetDate = addDays(refDate, Math.max(2, Math.round(totalDays * 0.25)));
      }
      break;

    case "1_to_2_months":
      if (totalDays > 45) {
        targetDate = addDays(eventDate, -45);
      } else {
        targetDate = addDays(refDate, Math.max(3, Math.round(totalDays * 0.5)));
      }
      break;

    case "2_to_4_weeks":
      if (totalDays > 21) {
        targetDate = addDays(eventDate, -21);
      } else {
        targetDate = addDays(refDate, Math.max(4, Math.round(totalDays * 0.75)));
      }
      break;

    case "event_week":
      if (totalDays > 7) {
        targetDate = addDays(eventDate, -5);
      } else {
        targetDate = addDays(eventDate, -Math.max(1, Math.min(2, totalDays - 1)));
      }
      break;

    case "event_day":
      targetDate = eventDate;
      break;

    case "post_event":
      targetDate = addDays(eventDate, 3);
      break;

    default:
      targetDate = eventDate;
  }

  return formatISODate(targetDate);
}

/**
 * Checks whether a task is overdue relative to a reference date (default today).
 */
export function isTaskOverdue(
  targetDateStr: string,
  status: TaskStatus,
  referenceDateStr: string = "2027-01-01"
): boolean {
  if (status === "completed") return false;
  const target = parseISODate(targetDateStr);
  const ref = parseISODate(referenceDateStr);

  return target.getTime() < ref.getTime();
}

export interface TimelineProgress {
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  todoTasks: number;
  overdueTasks: number;
  completionPercentage: number;
}

/**
 * Calculates overall timeline progress metrics.
 */
export function calculateTimelineProgress(
  tasks: TimelineTask[],
  referenceDateStr?: string
): TimelineProgress {
  const totalTasks = tasks.length;
  if (totalTasks === 0) {
    return {
      totalTasks: 0,
      completedTasks: 0,
      inProgressTasks: 0,
      todoTasks: 0,
      overdueTasks: 0,
      completionPercentage: 0,
    };
  }

  let completedTasks = 0;
  let inProgressTasks = 0;
  let todoTasks = 0;
  let overdueTasks = 0;

  for (const task of tasks) {
    if (task.status === "completed") {
      completedTasks += 1;
    } else if (task.status === "in_progress") {
      inProgressTasks += 1;
    } else {
      todoTasks += 1;
    }

    if (isTaskOverdue(task.targetDate, task.status, referenceDateStr)) {
      overdueTasks += 1;
    }
  }

  const completionPercentage = Math.round((completedTasks / totalTasks) * 100);

  return {
    totalTasks,
    completedTasks,
    inProgressTasks,
    todoTasks,
    overdueTasks,
    completionPercentage,
  };
}
