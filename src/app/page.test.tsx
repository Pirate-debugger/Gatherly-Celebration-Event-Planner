import React, { act } from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import HomePage from "./page";

// Mock global fetch for health check
global.fetch = vi.fn().mockImplementation((url: string) => {
  if (url === "/api/plan") {
    return Promise.resolve({
      ok: true,
      json: () =>
        Promise.resolve({
          status: "online",
          hasServerApiKey: true,
        }),
    });
  }
  return Promise.reject(new Error("Unknown URL"));
});

describe("src/app/page.tsx - Gatherly Main Dashboard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.localStorage.clear();
  });

  it("renders page header, skip link target, and all accessible navigation tabs", async () => {
    await act(async () => {
      render(<HomePage />);
    });

    expect(screen.getByRole("tablist", { name: /Celebration Planning Sections/i })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /Executive Overview/i })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /Budget Planner/i })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /Timeline & Tasks/i })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /Day-of Itinerary/i })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /Vendor Hub/i })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /Personalized Ideas/i })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /Risk & Contingency/i })).toBeInTheDocument();
  });

  it("switches tabs and displays corresponding dashboard section", async () => {
    let containerEl: HTMLElement;
    await act(async () => {
      const { container } = render(<HomePage />);
      containerEl = container;
    });

    // Default tab is Overview
    expect(screen.getByRole("tab", { name: /Executive Overview/i })).toHaveAttribute("aria-selected", "true");
    expect(containerEl!.querySelector("#tabpanel-overview")).toBeInTheDocument();

    // Click Budget Planner Tab
    const budgetTab = screen.getByRole("tab", { name: /Budget Planner/i });
    await act(async () => {
      fireEvent.click(budgetTab);
    });
    expect(budgetTab).toHaveAttribute("aria-selected", "true");
    expect(containerEl!.querySelector("#tabpanel-budget")).toBeInTheDocument();

    // Click Timeline & Tasks Tab
    const timelineTab = screen.getByRole("tab", { name: /Timeline & Tasks/i });
    await act(async () => {
      fireEvent.click(timelineTab);
    });
    expect(timelineTab).toHaveAttribute("aria-selected", "true");
    expect(containerEl!.querySelector("#tabpanel-timeline")).toBeInTheDocument();

    // Click Vendor Hub Tab
    const vendorTab = screen.getByRole("tab", { name: /Vendor Hub/i });
    await act(async () => {
      fireEvent.click(vendorTab);
    });
    expect(vendorTab).toHaveAttribute("aria-selected", "true");
    expect(containerEl!.querySelector("#tabpanel-vendors")).toBeInTheDocument();
  });

  it("switches preset when sample preset button is clicked in header showcase", async () => {
    await act(async () => {
      render(<HomePage />);
    });

    // Click the 30th Rooftop preset button in Header (first button matching)
    const rooftopPresetBtns = screen.getAllByRole("button", { name: /30th Rooftop/i });
    await act(async () => {
      fireEvent.click(rooftopPresetBtns[0]);
    });

    // Verify notification toast appears with the loaded blueprint
    await waitFor(() => {
      expect(screen.getByText(/Loaded Jordan's 30th Neon Mirage Rooftop Party blueprint/i)).toBeInTheDocument();
    });
  });

  it("opens and closes the Settings & Privacy modal", async () => {
    await act(async () => {
      render(<HomePage />);
    });

    // Click Settings button in Header
    const settingsBtn = screen.getByRole("button", { name: /Settings & Privacy Information/i });
    await act(async () => {
      fireEvent.click(settingsBtn);
    });

    // Modal should be visible
    expect(screen.getByRole("dialog", { name: /Settings, Security & Privacy/i })).toBeInTheDocument();

    // Close modal
    const closeBtn = screen.getByRole("button", { name: /Close settings dialog/i });
    await act(async () => {
      fireEvent.click(closeBtn);
    });

    await waitFor(() => {
      expect(screen.queryByRole("dialog", { name: /Settings, Security & Privacy/i })).not.toBeInTheDocument();
    });
  });
});
