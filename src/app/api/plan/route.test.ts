import { describe, it, expect, beforeEach } from "vitest";
import { GET, POST, OPTIONS } from "./route";
import { NextRequest } from "next/server";
import { globalRateLimiter } from "@/lib/security/rate-limiter";

describe("API Route: /api/plan", () => {
  beforeEach(() => {
    globalRateLimiter.reset();
  });

  describe("OPTIONS /api/plan", () => {
    it("responds to CORS preflight with 204 and allowed methods", async () => {
      const res = await OPTIONS();
      expect(res.status).toBe(204);
      expect(res.headers.get("access-control-allow-methods")).toContain("POST");
      expect(res.headers.get("x-frame-options")).toBe("DENY");
    });
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
        headers: {
          "Content-Type": "application/json",
          Host: "localhost:3000",
        },
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

    it("returns 415 if Content-Type is missing or not application/json", async () => {
      const req = new NextRequest("http://localhost:3000/api/plan", {
        method: "POST",
        headers: {
          "Content-Type": "text/plain",
          Host: "localhost:3000",
        },
        body: JSON.stringify(validBody),
      });

      const res = await POST(req);
      expect(res.status).toBe(415);
      const json = await res.json();
      expect(json.error).toBe("Unsupported Media Type");
    });

    it("returns 403 if request origin is hostile / unauthorized", () => {
      const originalEnv = process.env.NODE_ENV;
      // In production mode, mismatched foreign origins are rejected
      (process.env as Record<string, string | undefined>).NODE_ENV = "production";

      const req = new NextRequest("http://localhost:3000/api/plan", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Origin: "https://evil-attacker.example.com",
          Host: "gatherly.app",
        },
        body: JSON.stringify(validBody),
      });

      return POST(req).then((res) => {
        (process.env as Record<string, string | undefined>).NODE_ENV = originalEnv;
        expect(res.status).toBe(403);
      });
    });

    it("returns 400 for invalid payload (e.g., negative guest count)", async () => {
      const req = new NextRequest("http://localhost:3000/api/plan", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Host: "localhost:3000",
        },
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
        headers: {
          "Content-Type": "application/json",
          Host: "localhost:3000",
        },
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
          Host: "localhost:3000",
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
