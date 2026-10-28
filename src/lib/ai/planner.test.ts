import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { generateEventPlan } from "./planner";
import { SAMPLE_WEDDING_PRESET } from "@/lib/demo/presets";

const mockGenerateContent = vi.fn();

vi.mock("@google/genai", () => {
  return {
    GoogleGenAI: class {
      models = {
        generateContent: mockGenerateContent,
      };
    },
  };
});

describe("AI Event Planning Engine (generateEventPlan)", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
    mockGenerateContent.mockReset();
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it("returns curated procedural plan when mode is 'demo'", async () => {
    const prefs = { ...SAMPLE_WEDDING_PRESET, mode: "demo" as const };
    const result = await generateEventPlan(prefs);

    expect(result.plan).toBeDefined();
    expect(result.plan.isDemo).toBe(true);
    expect(result.fallbackUsed).toBe(false);
    expect(result.errorReason).toBeUndefined();
    expect(result.plan.budgetSummary.totalBudget).toBe(45000);
  });

  it("gracefully falls back to curated engine when mode is 'ai' but GEMINI_API_KEY is not set", async () => {
    delete process.env.GEMINI_API_KEY;
    const prefs = { ...SAMPLE_WEDDING_PRESET, mode: "ai" as const };

    const result = await generateEventPlan(prefs);

    expect(result.plan).toBeDefined();
    expect(result.plan.isDemo).toBe(true);
    expect(result.fallbackUsed).toBe(true);
    expect(result.errorReason).toContain("GEMINI_API_KEY not configured on server");
  });

  it("calls Gemini API and synthesizes reconciled plan when GEMINI_API_KEY is set", async () => {
    process.env.GEMINI_API_KEY = "test-key-mock";

    const mockAiResponse = {
      overview: {
        eventConcept: "Lush Wine Country Wedding",
        recommendedAtmosphere: "Romantic and relaxed",
        guestExperienceStrategy: "Interactive stations",
        keyAssumptions: ["Sunny weather expected"],
        criticalRisksSummary: ["Outdoor heat index"],
      },
      budgetItems: [
        {
          id: "b-1",
          category: "venue_permits",
          name: "Vineyard Lawn",
          description: "Exclusive reservation",
          estimatedCost: 20000,
          isContingency: false,
        },
        {
          id: "b-2",
          category: "catering_beverages",
          name: "Artisan Feast",
          description: "Family style dinner",
          estimatedCost: 25000,
          isContingency: false,
        },
      ],
      timeline: [
        {
          id: "t-1",
          title: "Book Florist",
          phase: "3_to_6_months",
          phaseLabel: "3-6 Months",
          targetDate: "2027-02-01",
          priority: "high",
        },
      ],
      itinerary: [
        {
          id: "it-1",
          time: "05:00 PM",
          activity: "Ceremony",
          location: "Vineyard Lawn",
          responsible: "Officiant",
        },
      ],
      vendors: [
        {
          id: "v-1",
          category: "photo_video",
          role: "Lead Photographer",
          estimatedCost: 4000,
          questionsToAsk: ["Turnaround time?"],
        },
      ],
      ideas: {
        themesAndDecor: [{ title: "Rustic Elegance", description: "Olive branches" }],
      },
      risks: [
        {
          id: "r-1",
          category: "weather",
          risk: "High temperatures",
          severity: "medium",
          likelihood: "low",
          emergencyContact: "555-1234",
        },
      ],
    };

    mockGenerateContent.mockResolvedValue({
      text: JSON.stringify(mockAiResponse),
    });

    const prefs = { ...SAMPLE_WEDDING_PRESET, mode: "ai" as const, budget: 45000 };
    const result = await generateEventPlan(prefs);

    expect(result.fallbackUsed).toBe(false);
    expect(result.plan.isDemo).toBe(false);
    expect(result.plan.overview.eventConcept).toBe("Lush Wine Country Wedding");
    // Ensure 100% mathematical reconciliation
    expect(result.plan.budgetSummary.totalAllocated).toBe(45000);
    expect(result.plan.budgetSummary.isOverBudget).toBe(false);
    expect(mockGenerateContent).toHaveBeenCalled();
  });

  it("safely handles Gemini API exceptions with graceful degradation to curated plan", async () => {
    process.env.GEMINI_API_KEY = "test-key-mock";

    mockGenerateContent.mockRejectedValue(new Error("API rate quota exceeded 429"));

    const prefs = { ...SAMPLE_WEDDING_PRESET, mode: "ai" as const };
    const result = await generateEventPlan(prefs);

    expect(result.fallbackUsed).toBe(true);
    expect(result.errorReason).toContain("API rate quota exceeded 429");
    expect(result.plan).toBeDefined();
    expect(result.plan.budgetSummary.totalBudget).toBe(45000);
  });
});
