import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ItinerarySection } from "./ItinerarySection";
import { ItineraryItem } from "@/types/event";

describe("ItinerarySection Component", () => {
  const initialItinerary: ItineraryItem[] = [
    {
      id: "it-1",
      time: "04:00 PM",
      endTime: "04:45 PM",
      activity: "Guest Arrival & Welcome Refreshments",
      location: "Garden Courtyard",
      responsible: "Host & Coordinator",
      notes: "Acoustic playlist playing, welcome champagne served",
    },
    {
      id: "it-2",
      time: "05:00 PM",
      endTime: "05:45 PM",
      activity: "Ceremony & Speeches",
      location: "Main Pavilion",
      responsible: "Officiant & Sound Tech",
      notes: "Wireless mic check at 4:30 PM",
    },
  ];

  it("renders chronological schedule items and logistical details", () => {
    const onUpdateItinerary = vi.fn();
    render(
      <ItinerarySection
        itinerary={initialItinerary}
        onUpdateItinerary={onUpdateItinerary}
      />
    );

    expect(screen.getByText("Guest Arrival & Welcome Refreshments")).toBeInTheDocument();
    expect(screen.getByText("Ceremony & Speeches")).toBeInTheDocument();
    expect(screen.getByText("Garden Courtyard")).toBeInTheDocument();
    expect(screen.getByText("Main Pavilion")).toBeInTheDocument();
    expect(screen.getByText(/04:00 PM/)).toBeInTheDocument();
  });

  it("deletes an itinerary segment when trash button is clicked", () => {
    const onUpdateItinerary = vi.fn();
    render(
      <ItinerarySection
        itinerary={initialItinerary}
        onUpdateItinerary={onUpdateItinerary}
      />
    );

    const deleteButtons = screen.getAllByTitle("Remove time slot");
    fireEvent.click(deleteButtons[0]);

    expect(onUpdateItinerary).toHaveBeenCalledWith([initialItinerary[1]]);
  });

  it("opens add segment modal, accepts form fields, and submits new item", () => {
    const onUpdateItinerary = vi.fn();
    render(
      <ItinerarySection
        itinerary={initialItinerary}
        onUpdateItinerary={onUpdateItinerary}
      />
    );

    const addBtn = screen.getByRole("button", { name: /Add Program Segment/i });
    fireEvent.click(addBtn);

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Add Program Segment" })).toBeInTheDocument();

    const activityInput = screen.getByLabelText(/Activity \/ Segment \*/i);
    fireEvent.change(activityInput, { target: { value: "First Dance & Cake Cutting" } });

    const submitBtn = screen.getByRole("button", { name: "Add Segment" });
    fireEvent.click(submitBtn);

    expect(onUpdateItinerary).toHaveBeenCalledTimes(1);
    const updated = onUpdateItinerary.mock.calls[0][0];
    expect(updated.length).toBe(3);
    expect(updated[2].activity).toBe("First Dance & Cake Cutting");
  });

  it("closes modal on Escape key press", () => {
    const onUpdateItinerary = vi.fn();
    render(
      <ItinerarySection
        itinerary={initialItinerary}
        onUpdateItinerary={onUpdateItinerary}
      />
    );

    const addBtn = screen.getByRole("button", { name: /Add Program Segment/i });
    fireEvent.click(addBtn);
    expect(screen.getByRole("dialog")).toBeInTheDocument();

    fireEvent.keyDown(window, { key: "Escape" });
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});
