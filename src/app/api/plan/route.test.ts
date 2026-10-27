import { describe, it, expect, beforeEach } from "vitest";
import { GET, POST } from "./route";
import { NextRequest } from "next/server";
import { globalRateLimiter } from "@/lib/security/rate-limiter";

describe("API Route: /api/plan", () => {
  beforeEach(() => {
    globalRateLimiter.reset();
  });

  describe("GET /api/plan", () => {
    it("returns service health and configuration status", async () => {
      const res = await GET();
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.status).toBe("online");
      expect(data.service).toBe("Gatherly AI Event Planner");
    });
  });

  describe("POST /api/plan", () => {
    const validBody = {
      title: "Golden Anniversary Celebration",
      eventType: "anniversary",
      date: "2027-11-20",
      durationHours: 6,
      location: "Fairmont Grand Hall, SF",
      venueType: "indoor",
      guestCount: 120,
      budget: 40000,
      currency: "USD",
      themeStyle: "Golden Warmth & Ivory",
      colorPalette: ["#FFD700", "#FFF8DC"],
      dietaryRestrictions: ["Vegetarian", "Gluten-Free"],
      accessibilityNeeds: ["Wheelchair Accessible"],
      culturalTraditions: ["Anniversary Toast"],
      priorities: {
        venue: "high",
        catering: "high",
        decor: "medium",
        photoVideo: "high",
        entertainment: "medium",
      },
      additionalNotes: "Golden ballroom dinner with acoustic trio.",
      mode: "demo",
    };

    it("generates and reconciles plan for valid input", async () => {
      const req = new NextRequest("http://localhost:3000/api/plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validBody),
      });

      const res = await POST(req);
      expect(res.status).toBe(200);

      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.data).toBeDefined();
      expect(json.data.userPreferences.title).toBe("Golden Anniversary Celebration");
      expect(json.data.budgetSummary.totalAllocated).toBe(40000);
    });

    it("returns 400 for invalid payload (e.g., negative guest count)", async () => {
      const req = new NextRequest("http://localhost:3000/api/plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...validBody,
          guestCount: -10,
        }),
      });

      const res = await POST(req);
      expect(res.status).toBe(400);

      const json = await res.json();
      expect(json.error).toBe("Validation Error");
      expect(json.details).toBeDefined();
    });

    it("returns 400 for malformed JSON", async () => {
      const req = new NextRequest("http://localhost:3000/api/plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: "NOT_VALID_JSON{",
      });

      const res = await POST(req);
      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json.error).toBe("Invalid JSON");
    });

    it("returns 413 if content-length exceeds maximum limit", async () => {
      const req = new NextRequest("http://localhost:3000/api/plan", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Content-Length": "100000", // 100 KB > 32 KB limit
        },
        body: JSON.stringify(validBody),
      });

      const res = await POST(req);
      expect(res.status).toBe(413);
      const json = await res.json();
      expect(json.error).toBe("Payload Too Large");
    });
  });
});
