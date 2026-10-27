import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { BudgetSection } from "./BudgetSection";
import { BudgetItem, BudgetSummary } from "@/types/event";
import { calculateBudgetSummary } from "@/lib/calculations/budget";

describe("BudgetSection Component", () => {
  const initialItems: BudgetItem[] = [
    {
      id: "b-1",
      category: "venue_permits",
      name: "Grand Ballroom Rental",
      description: "Includes setup",
      estimatedCost: 10000,
      confirmedCost: null,
      isConfirmed: false,
    },
    {
      id: "b-2",
      category: "catering_beverages",
      name: "Plated Dinner",
      description: "100 guests",
      estimatedCost: 8000,
      confirmedCost: null,
      isConfirmed: false,
    },
  ];

  const summary: BudgetSummary = calculateBudgetSummary(initialItems, 20000, "USD");

  it("renders budget categories, total allocated, and line items", () => {
    const onUpdateItems = vi.fn();
    render(
      <BudgetSection
        items={initialItems}
        summary={summary}
        totalBudget={20000}
        currency="USD"
        onUpdateItems={onUpdateItems}
      />
    );

    expect(screen.getByText("Grand Ballroom Rental")).toBeInTheDocument();
    expect(screen.getByText("Plated Dinner")).toBeInTheDocument();
    expect(screen.getByText("Category Allocation")).toBeInTheDocument();
  });

  it("displays budget warning alert when allocated exceeds budget", () => {
    const overSummary: BudgetSummary = calculateBudgetSummary(initialItems, 12000, "USD");
    const onUpdateItems = vi.fn();

    render(
      <BudgetSection
        items={initialItems}
        summary={overSummary}
        totalBudget={12000}
        currency="USD"
        onUpdateItems={onUpdateItems}
      />
    );

    expect(
      screen.getByText(/Budget Warning: Allocated Costs Exceed Total Budget/i)
    ).toBeInTheDocument();
  });

  it("calls onUpdateItems when user clicks Mark Confirmed", () => {
    const onUpdateItems = vi.fn();
    render(
      <BudgetSection
        items={initialItems}
        summary={summary}
        totalBudget={20000}
        currency="USD"
        onUpdateItems={onUpdateItems}
      />
    );

    const markConfirmedButtons = screen.getAllByText("Mark Confirmed");
    fireEvent.click(markConfirmedButtons[0]);

    expect(onUpdateItems).toHaveBeenCalledTimes(1);
    const updatedPayload = onUpdateItems.mock.calls[0][0];
    expect(updatedPayload[0].isConfirmed).toBe(true);
    expect(updatedPayload[0].confirmedCost).toBe(10000);
  });
});
