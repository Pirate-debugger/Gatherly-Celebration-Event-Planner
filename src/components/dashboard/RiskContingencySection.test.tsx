import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { RiskContingencySection } from "./RiskContingencySection";
import { generateDemoPlan, SAMPLE_WEDDING_PRESET } from "@/lib/demo/presets";

describe("RiskContingencySection Component", () => {
  const plan = generateDemoPlan(SAMPLE_WEDDING_PRESET);
  const risks = plan.risks;

  it("renders risk matrix title and contingency items", () => {
    render(<RiskContingencySection risks={risks} />);

    expect(
      screen.getByText("Risk Mitigation Matrix & Emergency Contingency Protocol")
    ).toBeInTheDocument();
    expect(risks.length).toBeGreaterThan(0);
    expect(screen.getByText(risks[0].risk)).toBeInTheDocument();
  });

  it("renders trigger and emergency contact details for each risk", () => {
    render(<RiskContingencySection risks={risks} />);

    expect(screen.getAllByText(/Preventative Measure/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Contingency Action Trigger/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/On-Call Contact:/i).length).toBeGreaterThan(0);
    expect(screen.getByText(risks[0].emergencyContact)).toBeInTheDocument();
  });
});
