/**
 * Gatherly - Strict Zod Validation Schemas
 *
 * Validates user preferences, input payloads, and generated event plans.
 * Enforces length limits, non-negative numbers, date formats, and data sanitization.
 */

import { z } from "zod";

export const EventTypeEnum = z.enum([
  "wedding",
  "birthday",
  "anniversary",
  "community",
  "corporate",
  "graduation",
  "other",
]);

export const VenueTypeEnum = z.enum(["indoor", "outdoor", "hybrid"]);

export const PriorityLevelEnum = z.enum(["high", "medium", "low"]);

export const CurrencyCodeEnum = z.enum(["USD", "EUR", "GBP", "CAD", "AUD", "INR"]);

export const BudgetCategoryEnum = z.enum([
  "venue_permits",
  "catering_beverages",
  "decoration_flowers",
  "photography_videography",
  "entertainment",
  "invitations_stationery",
  "transport_accommodation",
  "staff_misc",
  "contingency_reserve",
]);

export const TimelinePhaseEnum = z.enum([
  "6_months_plus",
  "3_to_6_months",
  "1_to_2_months",
  "2_to_4_weeks",
  "event_week",
  "event_day",
  "post_event",
]);

export const TaskStatusEnum = z.enum(["todo", "in_progress", "completed"]);

export const VendorStatusEnum = z.enum([
  "researching",
  "contacted",
  "quoted",
  "contract_signed",
  "deposit_paid",
  "fully_paid",
]);

// Basic sanitization helper to strip dangerous script tags or injection strings
function sanitizeString(val: string): string {
  return val
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .trim();
}

export const EventPreferencesSchema = z.object({
  title: z
    .string()
    .min(2, "Title must be at least 2 characters")
    .max(100, "Title must not exceed 100 characters")
    .transform(sanitizeString),
  eventType: EventTypeEnum,
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be formatted as YYYY-MM-DD")
    .refine((dateStr) => {
      const parsed = new Date(dateStr);
      return !isNaN(parsed.getTime());
    }, "Invalid date format"),
  durationHours: z
    .number()
    .min(1, "Duration must be at least 1 hour")
    .max(72, "Duration must not exceed 72 hours")
    .default(5),
  location: z
    .string()
    .min(2, "Location must be at least 2 characters")
    .max(150, "Location must not exceed 150 characters")
    .transform(sanitizeString),
  venueType: VenueTypeEnum.default("indoor"),
  guestCount: z
    .number()
    .int("Guest count must be a whole number")
    .min(1, "Guest count must be at least 1")
    .max(50000, "Guest count must not exceed 50,000"),
  budget: z
    .number()
    .min(50, "Budget must be at least 50")
    .max(10000000, "Budget must not exceed 10,000,000"),
  currency: CurrencyCodeEnum.default("USD"),
  themeStyle: z
    .string()
    .max(150, "Theme must not exceed 150 characters")
    .default("Elegant & Contemporary")
    .transform(sanitizeString),
  colorPalette: z.array(z.string().max(30)).max(8).default([]),
  dietaryRestrictions: z.array(z.string().max(50)).max(15).default([]),
  accessibilityNeeds: z.array(z.string().max(80)).max(15).default([]),
  culturalTraditions: z.array(z.string().max(80)).max(15).default([]),
  priorities: z
    .object({
      venue: PriorityLevelEnum.default("high"),
      catering: PriorityLevelEnum.default("high"),
      decor: PriorityLevelEnum.default("medium"),
      photoVideo: PriorityLevelEnum.default("medium"),
      entertainment: PriorityLevelEnum.default("medium"),
    })
    .default({
      venue: "high",
      catering: "high",
      decor: "medium",
      photoVideo: "medium",
      entertainment: "medium",
    }),
  additionalNotes: z
    .string()
    .max(2000, "Notes must not exceed 2000 characters")
    .default("")
    .transform(sanitizeString),
  mode: z.enum(["ai", "demo"]).default("demo"),
});

export const BudgetItemSchema = z.object({
  id: z.string(),
  category: BudgetCategoryEnum,
  name: z.string().min(1).max(120),
  description: z.string().max(400).default(""),
  estimatedCost: z.number().min(0, "Cost must be non-negative"),
  confirmedCost: z.number().min(0).nullable().default(null),
  isConfirmed: z.boolean().default(false),
  isContingency: z.boolean().optional(),
  notes: z.string().max(400).optional(),
});

export const TimelineTaskSchema = z.object({
  id: z.string(),
  title: z.string().min(1).max(150),
  description: z.string().max(500).default(""),
  phase: TimelinePhaseEnum,
  phaseLabel: z.string(),
  targetDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  priority: PriorityLevelEnum,
  dependencies: z.array(z.string()).default([]),
  status: TaskStatusEnum.default("todo"),
  isOverdue: z.boolean().default(false),
  category: z.string().default("General"),
  assignee: z.string().optional(),
});

export const ItineraryItemSchema = z.object({
  id: z.string(),
  time: z.string().min(1).max(30),
  endTime: z.string().max(30).optional(),
  activity: z.string().min(1).max(200),
  location: z.string().max(150).default("Main Venue"),
  responsible: z.string().max(100).default("Event Lead"),
  notes: z.string().max(300).optional(),
});

export const VendorItemSchema = z.object({
  id: z.string(),
  category: BudgetCategoryEnum,
  role: z.string().min(1).max(100),
  description: z.string().max(500).default(""),
  requirements: z.array(z.string()).default([]),
  estimatedCost: z.number().min(0),
  confirmedCost: z.number().min(0).nullable().default(null),
  status: VendorStatusEnum.default("researching"),
  contactName: z.string().max(100).optional(),
  contactEmail: z.string().max(120).optional(),
  contactPhone: z.string().max(50).optional(),
  depositAmount: z.number().min(0).optional(),
  depositDueDate: z.string().optional(),
  paymentReminder: z.string().max(200).optional(),
  questionsToAsk: z.array(z.string()).default([]),
  alternativeOptions: z.array(z.string()).default([]),
  bookingConfirmed: z.boolean().default(false),
});

export const PersonalizedIdeasSchema = z.object({
  themesAndDecor: z.array(
    z.object({
      title: z.string(),
      description: z.string(),
      colorAccents: z.array(z.string()).default([]),
      visualStyle: z.string().default(""),
    })
  ),
  foodAndBeverage: z.array(
    z.object({
      title: z.string(),
      description: z.string(),
      dietaryCompliance: z.array(z.string()).default([]),
      signatureItem: z.string().default(""),
    })
  ),
  activitiesAndEntertainment: z.array(
    z.object({
      title: z.string(),
      description: z.string(),
      targetAudience: z.string().default("All Guests"),
      guestEngagementScore: z.string().default("High"),
    })
  ),
  invitationConcepts: z.array(
    z.object({
      format: z.string(),
      headline: z.string(),
      wordingSample: z.string(),
      aestheticNote: z.string(),
    })
  ),
  sustainabilityAlternatives: z.array(
    z.object({
      standardApproach: z.string(),
      ecoAlternative: z.string(),
      impact: z.string(),
    })
  ),
  weatherContingency: z.object({
    primaryPlan: z.string(),
    backupPlan: z.string(),
    triggerCondition: z.string(),
    setupTimeline: z.string(),
  }),
});

export const RiskContingencyItemSchema = z.object({
  id: z.string(),
  category: z.enum([
    "weather",
    "vendor",
    "budget",
    "guest_count",
    "accessibility_dietary",
    "logistics",
  ]),
  risk: z.string(),
  severity: z.enum(["high", "medium", "low"]),
  likelihood: z.enum(["high", "medium", "low"]),
  prevention: z.string(),
  contingencyPlan: z.string(),
  emergencyContact: z.string(),
});

export const ExecutiveOverviewSchema = z.object({
  eventConcept: z.string(),
  recommendedAtmosphere: z.string(),
  guestExperienceStrategy: z.string(),
  keyAssumptions: z.array(z.string()),
  criticalRisksSummary: z.array(z.string()),
});

export const EventPlanSchema = z.object({
  id: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
  isDemo: z.boolean(),
  modelUsed: z.string().optional(),
  userPreferences: EventPreferencesSchema,
  overview: ExecutiveOverviewSchema,
  budgetItems: z.array(BudgetItemSchema),
  budgetSummary: z.any(), // Calculated deterministically via calculateBudgetSummary
  timeline: z.array(TimelineTaskSchema),
  itinerary: z.array(ItineraryItemSchema),
  vendors: z.array(VendorItemSchema),
  ideas: PersonalizedIdeasSchema,
  risks: z.array(RiskContingencyItemSchema),
});

export type ValidatedPreferences = z.infer<typeof EventPreferencesSchema>;
export type ValidatedEventPlan = z.infer<typeof EventPlanSchema>;
