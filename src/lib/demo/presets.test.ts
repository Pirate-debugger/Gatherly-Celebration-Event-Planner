import { describe, it, expect } from "vitest";
import {
  SAMPLE_WEDDING_PRESET,
  SAMPLE_BIRTHDAY_PRESET,
  SAMPLE_COMMUNITY_PRESET,
  generateDemoPlan,
} from "./presets";
import { EventPlanSchema } from "@/lib/validation/schemas";

describe("Demo Presets and Procedural Engine", () => {
  it("synthesizes a valid, schema-compliant wedding plan", () => {
    const plan = generateDemoPlan(SAMPLE_WEDDING_PRESET);
    expect(plan.isDemo).toBe(true);
    expect(plan.userPreferences.eventType).toBe("wedding");
    expect(plan.budgetSummary.totalBudget).toBe(45000);
    expect(plan.budgetSummary.totalAllocated).toBe(45000);
    expect(plan.budgetSummary.remainingBudget).toBe(0);
    expect(plan.budgetSummary.isOverBudget).toBe(false);
    expect(plan.budgetItems.length).toBeGreaterThan(5);
    expect(plan.timeline.length).toBeGreaterThan(5);
    expect(plan.itinerary.length).toBeGreaterThan(5);
    expect(plan.vendors.length).toBeGreaterThan(3);

    // Schema validation check
    const validation = EventPlanSchema.safeParse(plan);
    expect(validation.success).toBe(true);
  });

  it("synthesizes a valid, schema-compliant birthday celebration", () => {
    const plan = generateDemoPlan(SAMPLE_BIRTHDAY_PRESET);
    expect(plan.userPreferences.eventType).toBe("birthday");
    expect(plan.budgetSummary.totalBudget).toBe(8500);
    expect(plan.budgetSummary.totalAllocated).toBe(8500);
    expect(plan.budgetSummary.remainingBudget).toBe(0);

    const validation = EventPlanSchema.safeParse(plan);
    expect(validation.success).toBe(true);
  });

  it("synthesizes a valid, schema-compliant community festival", () => {
    const plan = generateDemoPlan(SAMPLE_COMMUNITY_PRESET);
    expect(plan.userPreferences.eventType).toBe("community");
    expect(plan.budgetSummary.totalBudget).toBe(18000);
    expect(plan.budgetSummary.totalAllocated).toBe(18000);
    expect(plan.budgetSummary.remainingBudget).toBe(0);

    const validation = EventPlanSchema.safeParse(plan);
    expect(validation.success).toBe(true);
  });

  it("reconciles budget math dynamically for an arbitrary custom budget", () => {
    const customPrefs = {
      ...SAMPLE_WEDDING_PRESET,
      budget: 37450,
      guestCount: 88,
    };
    const plan = generateDemoPlan(customPrefs);
    expect(plan.budgetSummary.totalBudget).toBe(37450);
    expect(plan.budgetSummary.totalAllocated).toBe(37450);
    expect(plan.budgetSummary.remainingBudget).toBe(0);
  });
});
