import { describe, it, expect } from "vitest";
import {
  toMinorUnits,
  fromMinorUnits,
  calculateBudgetSummary,
  reconcileBudgetItems,
  formatCurrency,
} from "./budget";
import { BudgetItem } from "@/types/event";

describe("Budget Calculation Engine", () => {
  describe("Minor unit conversions", () => {
    it("converts decimal currency to integer minor units without float distortion", () => {
      expect(toMinorUnits(19.99)).toBe(1999);
      expect(toMinorUnits(0.1 + 0.2)).toBe(30); // Classic JS 0.30000000000000004 float test
      expect(toMinorUnits(10500.5)).toBe(1050050);
      expect(toMinorUnits(-50)).toBe(0); // Clamped non-negative
    });

    it("converts integer minor units back to decimal units", () => {
      expect(fromMinorUnits(1999)).toBe(19.99);
      expect(fromMinorUnits(30)).toBe(0.3);
      expect(fromMinorUnits(1000000)).toBe(10000);
    });

    it("formats currency cleanly with locale code", () => {
      const formattedUSD = formatCurrency(5000, "USD");
      expect(formattedUSD).toContain("5,000");
    });
  });

  describe("calculateBudgetSummary", () => {
    const sampleItems: BudgetItem[] = [
      {
        id: "1",
        category: "venue_permits",
        name: "Venue Rental",
        description: "Main hall",
        estimatedCost: 10000,
        confirmedCost: 10500,
        isConfirmed: true,
      },
      {
        id: "2",
        category: "catering_beverages",
        name: "Dinner Catering",
        description: "100 guests",
        estimatedCost: 8000,
        confirmedCost: null,
        isConfirmed: false,
      },
      {
        id: "3",
        category: "contingency_reserve",
        name: "Contingency Fund",
        description: "Emergency buffer",
        estimatedCost: 2000,
        confirmedCost: null,
        isConfirmed: false,
        isContingency: true,
      },
    ];

    it("correctly reconciles estimated, confirmed, and allocated totals", () => {
      const summary = calculateBudgetSummary(sampleItems, 25000, "USD");

      expect(summary.totalBudget).toBe(25000);
      expect(summary.totalEstimated).toBe(20000); // 10000 + 8000 + 2000
      expect(summary.totalConfirmed).toBe(10500); // Only item 1 is confirmed
      // Allocated = item 1 confirmed (10500) + item 2 estimated (8000) + item 3 estimated (2000) = 20500
      expect(summary.totalAllocated).toBe(20500);
      expect(summary.remainingBudget).toBe(4500); // 25000 - 20500
      expect(summary.isOverBudget).toBe(false);
      expect(summary.overBudgetAmount).toBe(0);
      expect(summary.contingencyAmount).toBe(2000);
      expect(summary.contingencyPercentage).toBe(8); // 2000 / 25000 = 8%
    });

    it("detects and flags over-budget situations with accurate overage amount", () => {
      // Total budget is 15000, but allocated is 20500
      const summary = calculateBudgetSummary(sampleItems, 15000, "USD");

      expect(summary.isOverBudget).toBe(true);
      expect(summary.remainingBudget).toBe(-5500);
      expect(summary.overBudgetAmount).toBe(5500);
    });

    it("generates deterministic category breakdown for all 9 categories", () => {
      const summary = calculateBudgetSummary(sampleItems, 25000, "USD");

      expect(summary.categoryBreakdown).toHaveLength(9);
      const venueCategory = summary.categoryBreakdown.find(
        (c) => c.category === "venue_permits"
      );
      expect(venueCategory).toBeDefined();
      expect(venueCategory?.allocated).toBe(10500);
      expect(venueCategory?.count).toBe(1);
    });
  });

  describe("reconcileBudgetItems", () => {
    it("proportianally scales estimated items so total sum matches target budget", () => {
      const items: BudgetItem[] = [
        {
          id: "1",
          category: "venue_permits",
          name: "Venue",
          description: "",
          estimatedCost: 300,
          confirmedCost: null,
          isConfirmed: false,
        },
        {
          id: "2",
          category: "catering_beverages",
          name: "Food",
          description: "",
          estimatedCost: 700,
          confirmedCost: null,
          isConfirmed: false,
        },
      ];

      // Target budget 2000 (2x current total of 1000)
      const reconciled = reconcileBudgetItems(items, 2000);
      const sum = reconciled.reduce((acc, i) => acc + i.estimatedCost, 0);

      expect(sum).toBe(2000);
      expect(reconciled[0].estimatedCost).toBe(600);
      expect(reconciled[1].estimatedCost).toBe(1400);
    });

    it("preserves confirmed costs intact during rebalancing", () => {
      const items: BudgetItem[] = [
        {
          id: "1",
          category: "venue_permits",
          name: "Venue (Locked)",
          description: "",
          estimatedCost: 500,
          confirmedCost: 500,
          isConfirmed: true,
        },
        {
          id: "2",
          category: "catering_beverages",
          name: "Food (Flexible)",
          description: "",
          estimatedCost: 500,
          confirmedCost: null,
          isConfirmed: false,
        },
      ];

      const reconciled = reconcileBudgetItems(items, 1500);
      expect(reconciled[0].confirmedCost).toBe(500);
      expect(reconciled[0].isConfirmed).toBe(true);
    });
  });
});
