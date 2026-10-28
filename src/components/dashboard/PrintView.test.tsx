import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { PrintView } from "./PrintView";
import { generateDemoPlan, SAMPLE_WEDDING_PRESET } from "@/lib/demo/presets";

describe("PrintView Component", () => {
  const plan = generateDemoPlan(SAMPLE_WEDDING_PRESET);

  it("renders printable blueprint header, overview, and budget tables", () => {
    render(<PrintView plan={plan} />);

    expect(screen.getByText(plan.userPreferences.title)).toBeInTheDocument();
    expect(
      screen.getByText(/Official Celebration & Event Blueprint/i)
    ).toBeInTheDocument();
    expect(screen.getByText("1. Executive Overview & Concept")).toBeInTheDocument();
    expect(
      screen.getByText(new RegExp(`2\\. Master Budget Reconciliation \\(${plan.budgetSummary.currency}\\)`, "i"))
    ).toBeInTheDocument();
    expect(
      screen.getByText(new RegExp(`3\\. Day-of-Event Master Run of Show \\(${plan.userPreferences.date}\\)`, "i"))
    ).toBeInTheDocument();
    expect(screen.getByText("4. Vendor Directory & Contact Roster")).toBeInTheDocument();
    expect(screen.getByText("5. Emergency Contacts & Critical Contingencies")).toBeInTheDocument();
  });

  it("renders vendor and contingency details in print tables", () => {
    render(<PrintView plan={plan} />);

    expect(screen.getByText(plan.vendors[0].role)).toBeInTheDocument();
    expect(screen.getByText(new RegExp(plan.risks[0].risk, "i"))).toBeInTheDocument();
  });
});
