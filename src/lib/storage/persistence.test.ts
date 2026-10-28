import { describe, it, expect, beforeEach } from "vitest";
import {
  savePlanToStorage,
  loadPlanFromStorage,
  clearStoredPlan,
  getStorageUsage,
  STORAGE_KEY_PLAN,
} from "./persistence";
import { generateDemoPlan, SAMPLE_WEDDING_PRESET } from "@/lib/demo/presets";

describe("LocalStorage Persistence Engine", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("saves and loads a valid event plan successfully", () => {
    const plan = generateDemoPlan(SAMPLE_WEDDING_PRESET);
    const saved = savePlanToStorage(plan);
    expect(saved).toBe(true);

    const loaded = loadPlanFromStorage();
    expect(loaded).not.toBeNull();
    expect(loaded?.userPreferences.title).toBe(plan.userPreferences.title);
    expect(loaded?.budgetItems.length).toBe(plan.budgetItems.length);
  });

  it("safely handles corrupted or malformed data by returning null", () => {
    window.localStorage.setItem(STORAGE_KEY_PLAN, "{ bad_json: true, missing fields }");
    const loaded = loadPlanFromStorage();
    expect(loaded).toBeNull();
  });

  it("safely handles schema violations (e.g. missing required properties)", () => {
    window.localStorage.setItem(
      STORAGE_KEY_PLAN,
      JSON.stringify({ id: "123", missingOverview: true })
    );
    const loaded = loadPlanFromStorage();
    expect(loaded).toBeNull();
  });

  it("clears stored plan and updates usage", () => {
    const plan = generateDemoPlan(SAMPLE_WEDDING_PRESET);
    savePlanToStorage(plan);

    const usageBefore = getStorageUsage();
    expect(usageBefore.bytes).toBeGreaterThan(0);
    expect(usageBefore.lastSaved).not.toBeNull();

    clearStoredPlan();

    const loadedAfter = loadPlanFromStorage();
    expect(loadedAfter).toBeNull();

    const usageAfter = getStorageUsage();
    expect(usageAfter.bytes).toBe(0);
  });
});
