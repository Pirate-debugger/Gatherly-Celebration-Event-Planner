import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ExecutiveOverviewCard } from "./ExecutiveOverviewCard";
import { generateDemoPlan, SAMPLE_WEDDING_PRESET } from "@/lib/demo/presets";

describe("ExecutiveOverviewCard Component", () => {
  const plan = generateDemoPlan(SAMPLE_WEDDING_PRESET);

  it("renders key performance indicator banner (budget, guests, progress)", () => {
    render(<ExecutiveOverviewCard plan={plan} />);

    expect(screen.getByText("Total Budget")).toBeInTheDocument();
    expect(screen.getAllByText("$45,000").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/120 guests/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("Task Progress")).toBeInTheDocument();
    expect(screen.getByText("Vendor Status")).toBeInTheDocument();
  });

  it("renders executive event summary details and vision", () => {
    render(<ExecutiveOverviewCard plan={plan} />);

    expect(screen.getByText("Event Concept & Vision")).toBeInTheDocument();
    expect(screen.getByText(plan.overview.eventConcept)).toBeInTheDocument();
    expect(screen.getByText("Atmosphere & Styling")).toBeInTheDocument();
    expect(screen.getByText(plan.overview.recommendedAtmosphere)).toBeInTheDocument();
    expect(screen.getByText("Guest Experience Strategy")).toBeInTheDocument();
    expect(screen.getByText(plan.overview.guestExperienceStrategy)).toBeInTheDocument();
  });

  it("displays key operating assumptions and critical risks under watch", () => {
    render(<ExecutiveOverviewCard plan={plan} />);

    expect(screen.getByText("Key Operating Assumptions")).toBeInTheDocument();
    expect(screen.getByText("Critical Risks Under Watch")).toBeInTheDocument();
    expect(screen.getByText(plan.overview.keyAssumptions[0])).toBeInTheDocument();
    expect(screen.getByText(plan.overview.criticalRisksSummary[0])).toBeInTheDocument();
  });
});
