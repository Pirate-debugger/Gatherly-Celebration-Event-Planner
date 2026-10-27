/**
 * Gatherly - Domain Types and Interfaces
 * Strict TypeScript models for event planning, budget arithmetic, timeline, vendors, and risk analysis.
 */

export type EventType =
  | "wedding"
  | "birthday"
  | "anniversary"
  | "community"
  | "corporate"
  | "graduation"
  | "other";

export type VenueType = "indoor" | "outdoor" | "hybrid";

export type PriorityLevel = "high" | "medium" | "low";

export type CurrencyCode = "USD" | "EUR" | "GBP" | "CAD" | "AUD" | "INR";

export interface PrioritySettings {
  venue: PriorityLevel;
  catering: PriorityLevel;
  decor: PriorityLevel;
  photoVideo: PriorityLevel;
  entertainment: PriorityLevel;
}

export interface EventPreferences {
  title: string;
  eventType: EventType;
  date: string; // ISO date string YYYY-MM-DD
  durationHours: number;
  location: string;
  venueType: VenueType;
  guestCount: number;
  budget: number; // In currency units (e.g., 25000)
  currency: CurrencyCode;
  themeStyle: string;
  colorPalette: string[];
  dietaryRestrictions: string[];
  accessibilityNeeds: string[];
  culturalTraditions: string[];
  priorities: PrioritySettings;
  additionalNotes: string;
  mode: "ai" | "demo";
}

export type BudgetCategory =
  | "venue_permits"
  | "catering_beverages"
  | "decoration_flowers"
  | "photography_videography"
  | "entertainment"
  | "invitations_stationery"
  | "transport_accommodation"
  | "staff_misc"
  | "contingency_reserve";

export interface BudgetItem {
  id: string;
  category: BudgetCategory;
  name: string;
  description: string;
  estimatedCost: number; // Decimal currency units
  confirmedCost: number | null; // Null if unconfirmed
  isConfirmed: boolean;
  isContingency?: boolean;
  notes?: string;
}

export interface CategorySummary {
  category: BudgetCategory;
  label: string;
  estimated: number;
  confirmed: number;
  allocated: number;
  count: number;
  percentageOfTotal: number;
}

export interface BudgetSummary {
  totalBudget: number;
  totalEstimated: number;
  totalConfirmed: number;
  totalAllocated: number; // Sum of confirmed (if confirmed) else estimated
  contingencyAmount: number;
  contingencyPercentage: number;
  remainingBudget: number;
  isOverBudget: boolean;
  overBudgetAmount: number;
  currency: CurrencyCode;
  categoryBreakdown: CategorySummary[];
}

export type TimelinePhase =
  | "6_months_plus"
  | "3_to_6_months"
  | "1_to_2_months"
  | "2_to_4_weeks"
  | "event_week"
  | "event_day"
  | "post_event";

export type TaskStatus = "todo" | "in_progress" | "completed";

export interface TimelineTask {
  id: string;
  title: string;
  description: string;
  phase: TimelinePhase;
  phaseLabel: string;
  targetDate: string; // ISO date string YYYY-MM-DD
  priority: PriorityLevel;
  dependencies: string[];
  status: TaskStatus;
  isOverdue: boolean;
  category: string;
  assignee?: string;
}

export interface ItineraryItem {
  id: string;
  time: string; // e.g. "14:00" or "02:00 PM"
  endTime?: string;
  activity: string;
  location: string;
  responsible: string;
  notes?: string;
}

export type VendorStatus =
  | "researching"
  | "contacted"
  | "quoted"
  | "contract_signed"
  | "deposit_paid"
  | "fully_paid";

export interface VendorItem {
  id: string;
  category: BudgetCategory;
  role: string;
  description: string;
  requirements: string[];
  estimatedCost: number;
  confirmedCost: number | null;
  status: VendorStatus;
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
  depositAmount?: number;
  depositDueDate?: string;
  paymentReminder?: string;
  questionsToAsk: string[];
  alternativeOptions: string[];
  bookingConfirmed: boolean;
}

export interface IdeaItem {
  title: string;
  description: string;
  highlights?: string[];
  tags?: string[];
}

export interface ThematicDecorIdea extends IdeaItem {
  colorAccents: string[];
  visualStyle: string;
}

export interface FoodBeverageIdea extends IdeaItem {
  dietaryCompliance: string[];
  signatureItem: string;
}

export interface ActivityIdea extends IdeaItem {
  targetAudience: string;
  guestEngagementScore: string;
}

export interface InvitationConcept {
  format: string;
  headline: string;
  wordingSample: string;
  aestheticNote: string;
}

export interface SustainabilityAlternative {
  standardApproach: string;
  ecoAlternative: string;
  impact: string;
}

export interface WeatherContingency {
  primaryPlan: string;
  backupPlan: string;
  triggerCondition: string;
  setupTimeline: string;
}

export interface PersonalizedIdeas {
  themesAndDecor: ThematicDecorIdea[];
  foodAndBeverage: FoodBeverageIdea[];
  activitiesAndEntertainment: ActivityIdea[];
  invitationConcepts: InvitationConcept[];
  sustainabilityAlternatives: SustainabilityAlternative[];
  weatherContingency: WeatherContingency;
}

export type RiskSeverity = "high" | "medium" | "low";
export type RiskLikelihood = "high" | "medium" | "low";

export interface RiskContingencyItem {
  id: string;
  category:
    | "weather"
    | "vendor"
    | "budget"
    | "guest_count"
    | "accessibility_dietary"
    | "logistics";
  risk: string;
  severity: RiskSeverity;
  likelihood: RiskLikelihood;
  prevention: string;
  contingencyPlan: string;
  emergencyContact: string;
}

export interface ExecutiveOverview {
  eventConcept: string;
  recommendedAtmosphere: string;
  guestExperienceStrategy: string;
  keyAssumptions: string[];
  criticalRisksSummary: string[];
}

export interface EventPlan {
  id: string;
  createdAt: string;
  updatedAt: string;
  isDemo: boolean;
  modelUsed?: string;
  userPreferences: EventPreferences;
  overview: ExecutiveOverview;
  budgetItems: BudgetItem[];
  budgetSummary: BudgetSummary;
  timeline: TimelineTask[];
  itinerary: ItineraryItem[];
  vendors: VendorItem[];
  ideas: PersonalizedIdeas;
  risks: RiskContingencyItem[];
}
