import { describe, it, expect } from "vitest";
import {
  EventPreferencesSchema,
  BudgetItemSchema,
} from "./schemas";

describe("Validation Schemas", () => {
  describe("EventPreferencesSchema", () => {
    const validPayload = {
      title: "Silver Anniversary Gala",
      eventType: "anniversary",
      date: "2027-10-15",
      durationHours: 6,
      location: "Metropolitan Grand Ballroom",
      venueType: "indoor",
      guestCount: 150,
      budget: 30000,
      currency: "USD",
      themeStyle: "Silver & Midnight Navy Classic",
      colorPalette: ["#C0C0C0", "#000080", "#FFFFFF"],
      dietaryRestrictions: ["Gluten-Free", "Vegetarian"],
      accessibilityNeeds: ["Wheelchair Accessible"],
      culturalTraditions: ["Anniversary Toast"],
      priorities: {
        venue: "high",
        catering: "high",
        decor: "medium",
        photoVideo: "high",
        entertainment: "medium",
      },
      additionalNotes: "Include an anniversary cake cutting ceremony.",
      mode: "demo",
    };

    it("accepts a fully compliant payload", () => {
      const result = EventPreferencesSchema.safeParse(validPayload);
      expect(result.success).toBe(true);
    });

    it("rejects an invalid date format", () => {
      const result = EventPreferencesSchema.safeParse({
        ...validPayload,
        date: "15/10/2027",
      });
      expect(result.success).toBe(false);
    });

    it("rejects negative or zero guest count", () => {
      const result = EventPreferencesSchema.safeParse({
        ...validPayload,
        guestCount: 0,
      });
      expect(result.success).toBe(false);
    });

    it("rejects non-integer guest count", () => {
      const result = EventPreferencesSchema.safeParse({
        ...validPayload,
        guestCount: 25.5,
      });
      expect(result.success).toBe(false);
    });

    it("rejects budget less than 50", () => {
      const result = EventPreferencesSchema.safeParse({
        ...validPayload,
        budget: 20,
      });
      expect(result.success).toBe(false);
    });

    it("sanitizes script tags in user notes and title", () => {
      const result = EventPreferencesSchema.safeParse({
        ...validPayload,
        title: "Celebration <script>alert('xss')</script>",
        additionalNotes: "<script>dangerous()</script>Please provide vegan menu.",
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.title).toBe("Celebration");
        expect(result.data.additionalNotes).toBe("Please provide vegan menu.");
      }
    });
  });

  describe("BudgetItemSchema", () => {
    it("rejects negative estimated cost", () => {
      const result = BudgetItemSchema.safeParse({
        id: "b1",
        category: "venue_permits",
        name: "Hall",
        estimatedCost: -500,
      });
      expect(result.success).toBe(false);
    });

    it("accepts valid zero and positive estimated costs", () => {
      const resultZero = BudgetItemSchema.safeParse({
        id: "b1",
        category: "venue_permits",
        name: "Complimentary Venue",
        estimatedCost: 0,
      });
      expect(resultZero.success).toBe(true);

      const resultPositive = BudgetItemSchema.safeParse({
        id: "b2",
        category: "catering_beverages",
        name: "Food",
        estimatedCost: 2500,
      });
      expect(resultPositive.success).toBe(true);
    });
  });
});
