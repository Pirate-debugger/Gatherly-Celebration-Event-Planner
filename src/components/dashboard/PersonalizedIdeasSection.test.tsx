import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { PersonalizedIdeasSection } from "./PersonalizedIdeasSection";
import { generateDemoPlan, SAMPLE_WEDDING_PRESET } from "@/lib/demo/presets";

describe("PersonalizedIdeasSection Component", () => {
  const plan = generateDemoPlan(SAMPLE_WEDDING_PRESET);
  const ideas = plan.ideas;

  beforeEach(() => {
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn().mockImplementation(() => Promise.resolve()),
      },
    });
  });

  it("renders thematic decor, culinary, and interactive experience concepts", () => {
    render(<PersonalizedIdeasSection ideas={ideas} />);

    expect(screen.getByText("Curated Experiential Concepts & Personalized Ideas")).toBeInTheDocument();
    expect(screen.getByText("Thematic Decor & Spatial Design")).toBeInTheDocument();
    expect(screen.getByText("Culinary & Beverage Experiences")).toBeInTheDocument();
    expect(screen.getByText("Guest Engagement & Activities")).toBeInTheDocument();
    expect(screen.getByText("Low-Waste & Sustainable Alternatives")).toBeInTheDocument();
    expect(screen.getByText("Weather Contingency Action Protocol")).toBeInTheDocument();
  });

  it("displays decor concepts from the plan", () => {
    render(<PersonalizedIdeasSection ideas={ideas} />);

    expect(ideas.themesAndDecor.length).toBeGreaterThan(0);
    expect(screen.getByText(ideas.themesAndDecor[0].title)).toBeInTheDocument();
  });

  it("copies invitation wording template to clipboard on click", () => {
    render(<PersonalizedIdeasSection ideas={ideas} />);

    const copyButtons = screen.getAllByRole("button", { name: /Copy Sample/i });
    expect(copyButtons.length).toBeGreaterThan(0);

    fireEvent.click(copyButtons[0]);
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(ideas.invitationConcepts[0].wordingSample);
  });
});
