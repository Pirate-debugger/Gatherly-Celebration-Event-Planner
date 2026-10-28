import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Header } from "./Header";
import { generateDemoPlan, SAMPLE_WEDDING_PRESET } from "@/lib/demo/presets";

describe("Header Component", () => {
  const plan = generateDemoPlan(SAMPLE_WEDDING_PRESET);

  it("renders branding and app identity", () => {
    render(
      <Header
        currentPlan={plan}
        onOpenWizard={vi.fn()}
        onLoadPreset={vi.fn()}
        onExportJson={vi.fn()}
        onExportIcs={vi.fn()}
        onImportJson={vi.fn()}
        onPrint={vi.fn()}
        onOpenSettings={vi.fn()}
      />
    );

    expect(screen.getByText("Gatherly")).toBeInTheDocument();
    expect(screen.getByText("AI Planner")).toBeInTheDocument();
  });

  it("triggers preset selections on click", () => {
    const onLoadPreset = vi.fn();
    render(
      <Header
        currentPlan={plan}
        onOpenWizard={vi.fn()}
        onLoadPreset={onLoadPreset}
        onExportJson={vi.fn()}
        onExportIcs={vi.fn()}
        onImportJson={vi.fn()}
        onPrint={vi.fn()}
      />
    );

    fireEvent.click(screen.getByText("Sonoma Wedding"));
    expect(onLoadPreset).toHaveBeenCalledWith("wedding");

    fireEvent.click(screen.getByText("30th Rooftop"));
    expect(onLoadPreset).toHaveBeenCalledWith("birthday");

    fireEvent.click(screen.getByText("Lantern Festival"));
    expect(onLoadPreset).toHaveBeenCalledWith("community");
  });

  it("triggers export, print, and settings handlers", () => {
    const onExportJson = vi.fn();
    const onExportIcs = vi.fn();
    const onPrint = vi.fn();
    const onOpenSettings = vi.fn();

    render(
      <Header
        currentPlan={plan}
        onOpenWizard={vi.fn()}
        onLoadPreset={vi.fn()}
        onExportJson={onExportJson}
        onExportIcs={onExportIcs}
        onImportJson={vi.fn()}
        onPrint={onPrint}
        onOpenSettings={onOpenSettings}
      />
    );

    fireEvent.click(screen.getByTitle("Export plan to JSON"));
    expect(onExportJson).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByTitle("Export to iCalendar (.ics)"));
    expect(onExportIcs).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByTitle("Print or save as PDF"));
    expect(onPrint).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByTitle("Settings & Privacy Information"));
    expect(onOpenSettings).toHaveBeenCalledTimes(1);
  });
});
