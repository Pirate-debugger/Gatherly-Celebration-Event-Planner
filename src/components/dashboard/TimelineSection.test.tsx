import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { TimelineSection } from "./TimelineSection";
import { TimelineTask } from "@/types/event";

describe("TimelineSection Component", () => {
  const initialTasks: TimelineTask[] = [
    {
      id: "t-1",
      title: "Confirm Venue Contract",
      description: "Sign initial contract",
      phase: "6_months_plus",
      phaseLabel: "6+ Months Before",
      targetDate: "2027-01-01",
      priority: "high",
      dependencies: [],
      status: "todo",
      isOverdue: false,
      category: "Venue",
    },
    {
      id: "t-2",
      title: "Book Photographer",
      description: "Review portfolio",
      phase: "3_to_6_months",
      phaseLabel: "3–6 Months Before",
      targetDate: "2027-03-01",
      priority: "medium",
      dependencies: [],
      status: "in_progress",
      isOverdue: false,
      category: "Media",
    },
  ];

  it("renders tasks and phase labels", () => {
    const onUpdateTasks = vi.fn();
    render(
      <TimelineSection
        tasks={initialTasks}
        eventDate="2027-06-15"
        onUpdateTasks={onUpdateTasks}
      />
    );

    expect(screen.getByText("Confirm Venue Contract")).toBeInTheDocument();
    expect(screen.getByText("Book Photographer")).toBeInTheDocument();
  });

  it("cycles task status when checkbox button is clicked", () => {
    const onUpdateTasks = vi.fn();
    render(
      <TimelineSection
        tasks={initialTasks}
        eventDate="2027-06-15"
        onUpdateTasks={onUpdateTasks}
      />
    );

    const markStatusButtons = screen.getAllByRole("button", {
      name: /Mark status for Confirm Venue Contract/i,
    });
    fireEvent.click(markStatusButtons[0]);

    expect(onUpdateTasks).toHaveBeenCalledTimes(1);
    const updatedTasks = onUpdateTasks.mock.calls[0][0];
    expect(updatedTasks[0].status).toBe("in_progress");
  });

  it("filters tasks by search query", () => {
    const onUpdateTasks = vi.fn();
    render(
      <TimelineSection
        tasks={initialTasks}
        eventDate="2027-06-15"
        onUpdateTasks={onUpdateTasks}
      />
    );

    const searchInput = screen.getByPlaceholderText(/Search milestone tasks/i);
    fireEvent.change(searchInput, { target: { value: "Photographer" } });

    expect(screen.queryByText("Confirm Venue Contract")).not.toBeInTheDocument();
    expect(screen.getByText("Book Photographer")).toBeInTheDocument();
  });
});
