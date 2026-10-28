import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { HeroSection } from "./HeroSection";

describe("HeroSection Component", () => {
  it("renders main headline and core feature pillars", () => {
    render(
      <HeroSection
        onOpenWizard={vi.fn()}
        onLoadPreset={vi.fn()}
      />
    );

    expect(
      screen.getByText(/Plan Unforgettable Celebrations with/i)
    ).toBeInTheDocument();
    expect(screen.getByText("Reconciled Budgets")).toBeInTheDocument();
    expect(screen.getByText("Dynamic Timelines")).toBeInTheDocument();
    expect(screen.getByText("Vendor Command Hub")).toBeInTheDocument();
    expect(screen.getByText("Risk Contingency")).toBeInTheDocument();
  });

  it("launches event wizard when primary CTA is clicked", () => {
    const onOpenWizard = vi.fn();
    render(
      <HeroSection
        onOpenWizard={onOpenWizard}
        onLoadPreset={vi.fn()}
      />
    );

    const ctaBtn = screen.getByRole("button", { name: /Launch Event Wizard/i });
    fireEvent.click(ctaBtn);
    expect(onOpenWizard).toHaveBeenCalledTimes(1);
  });

  it("loads presets from showcase cards via click and keyboard", () => {
    const onLoadPreset = vi.fn();
    render(
      <HeroSection
        onOpenWizard={vi.fn()}
        onLoadPreset={onLoadPreset}
      />
    );

    const weddingCard = screen.getByText("Sonoma Garden Elegance");
    fireEvent.click(weddingCard);
    expect(onLoadPreset).toHaveBeenCalledWith("wedding");

    const birthdayCard = screen.getByText("Cyberpunk 30th Rooftop");
    fireEvent.keyDown(birthdayCard.closest('[role="button"]')!, { key: "Enter" });
    expect(onLoadPreset).toHaveBeenCalledWith("birthday");
  });
});
