import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { EventWizardModal } from "./EventWizardModal";

describe("EventWizardModal Component", () => {
  it("does not render when isOpen is false", () => {
    const { container } = render(
      <EventWizardModal
        isOpen={false}
        onClose={vi.fn()}
        onSubmit={vi.fn()}
      />
    );
    expect(container).toBeEmptyDOMElement();
  });

  it("renders wizard dialog with step 1 and validates required fields", async () => {
    const onSubmit = vi.fn();
    render(
      <EventWizardModal
        isOpen={true}
        onClose={vi.fn()}
        onSubmit={onSubmit}
      />
    );

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText(/Gatherly Event Planner Wizard/i)).toBeInTheDocument();

    const titleInput = screen.getByLabelText(/Event Title \*/i);
    fireEvent.change(titleInput, { target: { value: "" } });

    const continueBtn = screen.getByRole("button", { name: /Continue/i });
    fireEvent.click(continueBtn);

    expect(screen.getByText(/Event title must be at least 2 characters/i)).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("advances through steps and submits event preferences", async () => {
    const onSubmit = vi.fn().mockImplementation(() => Promise.resolve());
    render(
      <EventWizardModal
        isOpen={true}
        onClose={vi.fn()}
        onSubmit={onSubmit}
      />
    );

    // Step 1: Basics
    const titleInput = screen.getByLabelText(/Event Title \*/i);
    fireEvent.change(titleInput, { target: { value: "Celebration Gala 2027" } });

    const dateInput = screen.getByLabelText(/Event Date \*/i);
    fireEvent.change(dateInput, { target: { value: "2027-09-20" } });

    const continueBtn = screen.getByRole("button", { name: /Continue/i });
    fireEvent.click(continueBtn);

    // Step 2: Venue
    expect(screen.getByText(/Step 2 of 5: Atmosphere & Venue/i)).toBeInTheDocument();
    const locationInput = screen.getByLabelText(/Location or Venue Name \*/i);
    fireEvent.change(locationInput, { target: { value: "Grand Plaza Ballroom" } });
    fireEvent.click(screen.getByRole("button", { name: /Continue/i }));

    // Step 3: Inclusivity
    expect(screen.getByText(/Step 3 of 5: Inclusivity & Priorities/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /Continue/i }));

    // Step 4: Notes & Engine
    expect(screen.getByText(/Step 4 of 5: Special Requests & Engine/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /Continue/i }));

    // Step 5: Review
    expect(screen.getByText(/Step 5 of 5: Review & Synthesize/i)).toBeInTheDocument();
    expect(screen.getByText("Celebration Gala 2027")).toBeInTheDocument();

    const submitBtn = screen.getByRole("button", { name: /Generate Complete Plan/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledTimes(1);
    });
    const submitted = onSubmit.mock.calls[0][0];
    expect(submitted.title).toBe("Celebration Gala 2027");
    expect(submitted.location).toBe("Grand Plaza Ballroom");
  });

  it("closes modal when Escape key is pressed", () => {
    const onClose = vi.fn();
    render(
      <EventWizardModal
        isOpen={true}
        onClose={onClose}
        onSubmit={vi.fn()}
      />
    );

    fireEvent.keyDown(window, { key: "Escape" });
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
