"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Utensils,
  Accessibility,
  Flame,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from "lucide-react";
import {
  EventPreferences,
  EventType,
  VenueType,
  CurrencyCode,
  PriorityLevel,
} from "@/types/event";

interface EventWizardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (preferences: EventPreferences) => Promise<void>;
  isSubmitting?: boolean;
}

const EVENT_TYPE_OPTIONS: { type: EventType; label: string; icon: string }[] = [
  { type: "wedding", label: "Wedding & Engagement", icon: "💍" },
  { type: "birthday", label: "Birthday Party", icon: "🎂" },
  { type: "anniversary", label: "Anniversary", icon: "🥂" },
  { type: "community", label: "Community & Cultural", icon: "🏮" },
  { type: "corporate", label: "Corporate Event", icon: "🏢" },
  { type: "graduation", label: "Graduation Party", icon: "🎓" },
  { type: "other", label: "Other Celebration", icon: "✨" },
];

const COMMON_DIETARY = [
  "Vegetarian",
  "Vegan",
  "Gluten-Free",
  "Halal Friendly",
  "Kosher Friendly",
  "Nut-Free",
  "Dairy-Free",
];

const COMMON_ACCESSIBILITY = [
  "Wheelchair Accessible Pathways",
  "Step-Free Entrance & Ramps",
  "Accessible Restrooms",
  "ASL Interpreters",
  "Assistive Listening System",
  "Sensory Break / Quiet Lounge",
  "Accessible Reserved Parking",
];

const COMMON_CULTURAL = [
  "Olive Branch / Candle Ceremony",
  "Acoustic Sunset Serenade",
  "Folklore Music / Cultural Dance",
  "Traditional Tea Ceremony",
  "Ceremonial Toasts & Speeches",
  "Lantern / Ribbon Send-Off",
];

/**
 * Interactive Event Planning Wizard Modal Component
 *
 * Multi-step guided modal to capture celebration preferences:
 * Step 1: Core Details (Title, Type, Date, Duration, Location, Guests, Budget)
 * Step 2: Atmosphere & Aesthetic (Venue type, Theme, Color accents)
 * Step 3: Inclusivity & Priorities (Dietary, Accessibility, Traditions, Tier weighting)
 * Step 4: Special Logistics & Engine (Notes, AI synthesis toggle)
 * Step 5: Summary & Validation
 *
 * @param props - EventWizardModalProps containing isOpen, onClose, and onSubmit callbacks.
 * @returns React.JSX.Element | null
 */
export function EventWizardModal({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting = false,
}: EventWizardModalProps): React.JSX.Element | null {
  const [step, setStep] = useState(1);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Form State
  const [title, setTitle] = useState("Summer Garden Celebration");
  const [eventType, setEventType] = useState<EventType>("wedding");
  const [date, setDate] = useState("2027-06-15");
  const [durationHours, setDurationHours] = useState(6);
  const [location, setLocation] = useState("San Francisco Bay Area, CA");
  const [venueType, setVenueType] = useState<VenueType>("hybrid");
  const [guestCount, setGuestCount] = useState(100);
  const [budget, setBudget] = useState(35000);
  const [currency, setCurrency] = useState<CurrencyCode>("USD");
  const [themeStyle, setThemeStyle] = useState("Modern Botanical Elegance");
  const [colorInput, setColorInput] = useState("#C97A63, #60725C, #E8D8C8");
  const [selectedDietary, setSelectedDietary] = useState<string[]>([
    "Vegetarian",
    "Gluten-Free",
  ]);
  const [selectedAccessibility, setSelectedAccessibility] = useState<string[]>([
    "Wheelchair Accessible Pathways",
    "Accessible Restrooms",
  ]);
  const [selectedCultural, setSelectedCultural] = useState<string[]>([
    "Ceremonial Toasts & Speeches",
  ]);
  const [priorities, setPriorities] = useState<{
    venue: PriorityLevel;
    catering: PriorityLevel;
    decor: PriorityLevel;
    photoVideo: PriorityLevel;
    entertainment: PriorityLevel;
  }>({
    venue: "high",
    catering: "high",
    decor: "medium",
    photoVideo: "high",
    entertainment: "medium",
  });
  const [additionalNotes, setAdditionalNotes] = useState(
    "Focus on an inviting open-air cocktail hour with live acoustic music and sustainable, low-waste table settings."
  );
  const [mode, setMode] = useState<"ai" | "demo">("demo");

  // Reset state when modal is opened without effect setState
  const [prevIsOpen, setPrevIsOpen] = useState(isOpen);
  if (isOpen !== prevIsOpen) {
    setPrevIsOpen(isOpen);
    if (isOpen) {
      setStep(1);
      setErrors({});
    }
  }

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen && !isSubmitting) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isSubmitting, onClose]);

  if (!isOpen) return null;

  const toggleItem = (list: string[], setList: (val: string[]) => void, item: string) => {
    if (list.includes(item)) {
      setList(list.filter((x) => x !== item));
    } else {
      setList([...list, item]);
    }
  };

  const validateStep = (currentStep: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (currentStep === 1) {
      if (!title.trim() || title.trim().length < 2) {
        newErrors.title = "Event title must be at least 2 characters.";
      }
      if (!date) {
        newErrors.date = "Event date is required.";
      }
      if (guestCount < 1 || !Number.isInteger(guestCount)) {
        newErrors.guestCount = "Guest count must be at least 1.";
      }
      if (budget < 50) {
        newErrors.budget = "Total budget must be at least 50.";
      }
    }

    if (currentStep === 2) {
      if (!location.trim() || location.trim().length < 2) {
        newErrors.location = "Location or venue name is required.";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep((prev) => Math.min(prev + 1, 5));
    }
  };

  const handleBack = () => {
    setErrors({});
    setStep((prev) => Math.max(prev - 1, 1));
  };

  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep(1) || !validateStep(2)) {
      setStep(1);
      return;
    }

    const colorPalette = colorInput
      .split(",")
      .map((c) => c.trim())
      .filter((c) => Boolean(c));

    const preferences: EventPreferences = {
      title: title.trim(),
      eventType,
      date,
      durationHours: Number(durationHours) || 5,
      location: location.trim(),
      venueType,
      guestCount: Number(guestCount) || 50,
      budget: Number(budget) || 10000,
      currency,
      themeStyle: themeStyle.trim() || "Modern Celebration",
      colorPalette,
      dietaryRestrictions: selectedDietary,
      accessibilityNeeds: selectedAccessibility,
      culturalTraditions: selectedCultural,
      priorities,
      additionalNotes: additionalNotes.trim(),
      mode,
    };

    await onSubmit(preferences);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="wizard-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm overflow-y-auto"
    >
      <div className="relative w-full max-w-2xl rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl p-6 sm:p-8 my-8 text-left">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-600/20 text-violet-400">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <h2 id="wizard-title" className="text-lg font-bold text-white">
                Gatherly Event Planner Wizard
              </h2>
              <p className="text-xs text-slate-400">
                Step {step} of 5:{" "}
                {step === 1 && "Core Event Details"}
                {step === 2 && "Atmosphere & Venue"}
                {step === 3 && "Inclusivity & Priorities"}
                {step === 4 && "Special Requests & Engine"}
                {step === 5 && "Review & Synthesize"}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            aria-label="Close modal"
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition disabled:opacity-50"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Step Progress Bar */}
        <div className="mt-4 mb-6">
          <div className="flex justify-between text-[11px] font-medium text-slate-400 mb-1.5">
            <span className={step >= 1 ? "text-violet-400 font-semibold" : ""}>1. Basics</span>
            <span className={step >= 2 ? "text-violet-400 font-semibold" : ""}>2. Venue</span>
            <span className={step >= 3 ? "text-violet-400 font-semibold" : ""}>3. Inclusivity</span>
            <span className={step >= 4 ? "text-violet-400 font-semibold" : ""}>4. Notes</span>
            <span className={step >= 5 ? "text-violet-400 font-semibold" : ""}>5. Review</span>
          </div>
          <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-violet-600 to-indigo-500 transition-all duration-300"
              style={{ width: `${(step / 5) * 100}%` }}
            />
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleFinalSubmit} className="space-y-5">
          {/* STEP 1: BASICS */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label htmlFor="event-title" className="block text-xs font-semibold text-slate-300 mb-1">
                  Event Title *
                </label>
                <input
                  id="event-title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Elena & Marcus's Wedding"
                  className="w-full rounded-lg border border-slate-700 bg-slate-800/80 px-3.5 py-2 text-sm text-white placeholder-slate-500 focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
                />
                {errors.title && (
                  <p className="mt-1 text-xs text-rose-400 flex items-center">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    {errors.title}
                  </p>
                )}
              </div>

              {/* Event Type Grid */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2">
                  Event Type *
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {EVENT_TYPE_OPTIONS.map((opt) => (
                    <button
                      key={opt.type}
                      type="button"
                      onClick={() => setEventType(opt.type)}
                      className={`flex items-center space-x-2 rounded-lg border p-2.5 text-left text-xs font-medium transition ${
                        eventType === opt.type
                          ? "border-violet-500 bg-violet-950/60 text-white"
                          : "border-slate-800 bg-slate-800/40 text-slate-300 hover:border-slate-700"
                      }`}
                    >
                      <span className="text-base">{opt.icon}</span>
                      <span>{opt.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Date, Duration & Guests */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label htmlFor="event-date" className="block text-xs font-semibold text-slate-300 mb-1">
                    Event Date *
                  </label>
                  <input
                    id="event-date"
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full rounded-lg border border-slate-700 bg-slate-800/80 px-3 py-2 text-sm text-white focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
                  />
                  {errors.date && (
                    <p className="mt-1 text-xs text-rose-400">{errors.date}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="duration-hours" className="block text-xs font-semibold text-slate-300 mb-1">
                    Duration (Hours)
                  </label>
                  <input
                    id="duration-hours"
                    type="number"
                    min="1"
                    max="72"
                    value={durationHours}
                    onChange={(e) => setDurationHours(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full rounded-lg border border-slate-700 bg-slate-800/80 px-3 py-2 text-sm text-white focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
                  />
                </div>

                <div>
                  <label htmlFor="guest-count" className="block text-xs font-semibold text-slate-300 mb-1">
                    Guest Count *
                  </label>
                  <input
                    id="guest-count"
                    type="number"
                    min="1"
                    max="50000"
                    value={guestCount}
                    onChange={(e) => setGuestCount(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full rounded-lg border border-slate-700 bg-slate-800/80 px-3 py-2 text-sm text-white focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
                  />
                  {errors.guestCount && (
                    <p className="mt-1 text-xs text-rose-400">{errors.guestCount}</p>
                  )}
                </div>
              </div>

              {/* Budget & Currency */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label htmlFor="total-budget" className="block text-xs font-semibold text-slate-300 mb-1">
                    Total Budget *
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 text-sm">
                      $
                    </span>
                    <input
                      id="total-budget"
                      type="number"
                      min="50"
                      max="10000000"
                      step="100"
                      value={budget}
                      onChange={(e) => setBudget(Math.max(0, parseFloat(e.target.value) || 0))}
                      className="w-full rounded-lg border border-slate-700 bg-slate-800/80 pl-8 pr-3 py-2 text-sm text-white focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
                    />
                  </div>
                  {errors.budget && (
                    <p className="mt-1 text-xs text-rose-400">{errors.budget}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="currency-select" className="block text-xs font-semibold text-slate-300 mb-1">
                    Currency
                  </label>
                  <select
                    id="currency-select"
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value as CurrencyCode)}
                    className="w-full rounded-lg border border-slate-700 bg-slate-800/80 px-3 py-2 text-sm text-white focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
                  >
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                    <option value="CAD">CAD ($)</option>
                    <option value="AUD">AUD ($)</option>
                    <option value="INR">INR (₹)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: VENUE & ATMOSPHERE */}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <label htmlFor="location-input" className="block text-xs font-semibold text-slate-300 mb-1">
                  Location or Venue Name *
                </label>
                <input
                  id="location-input"
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Sonoma Valley Vineyards, CA"
                  className="w-full rounded-lg border border-slate-700 bg-slate-800/80 px-3.5 py-2 text-sm text-white placeholder-slate-500 focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
                />
                {errors.location && (
                  <p className="mt-1 text-xs text-rose-400">{errors.location}</p>
                )}
              </div>

              {/* Venue Environment */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Venue Environment
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {(["indoor", "outdoor", "hybrid"] as VenueType[]).map((vt) => (
                    <button
                      key={vt}
                      type="button"
                      onClick={() => setVenueType(vt)}
                      className={`rounded-lg border p-2.5 text-center text-xs font-medium capitalize transition ${
                        venueType === vt
                          ? "border-violet-500 bg-violet-950/60 text-white font-semibold"
                          : "border-slate-800 bg-slate-800/40 text-slate-400 hover:border-slate-700"
                      }`}
                    >
                      {vt === "hybrid" ? "Hybrid (Indoor/Outdoor)" : vt}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label htmlFor="theme-style" className="block text-xs font-semibold text-slate-300 mb-1">
                  Theme & Stylistic Vibe
                </label>
                <input
                  id="theme-style"
                  type="text"
                  value={themeStyle}
                  onChange={(e) => setThemeStyle(e.target.value)}
                  placeholder="e.g. Modern Rustic Garden, Cyberpunk Lounge, Classic Formal"
                  className="w-full rounded-lg border border-slate-700 bg-slate-800/80 px-3.5 py-2 text-sm text-white placeholder-slate-500 focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
                />
              </div>

              <div>
                <label htmlFor="color-palette" className="block text-xs font-semibold text-slate-300 mb-1">
                  Color Palette (Hex or Names, comma-separated)
                </label>
                <input
                  id="color-palette"
                  type="text"
                  value={colorInput}
                  onChange={(e) => setColorInput(e.target.value)}
                  placeholder="#C97A63, #60725C, #E8D8C8, #D4AF37"
                  className="w-full rounded-lg border border-slate-700 bg-slate-800/80 px-3.5 py-2 text-sm text-white placeholder-slate-500 focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
                />
              </div>
            </div>
          )}

          {/* STEP 3: INCLUSIVITY & PRIORITIES */}
          {step === 3 && (
            <div className="space-y-4">
              {/* Dietary */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center">
                  <Utensils className="h-3.5 w-3.5 mr-1 text-emerald-400" />
                  <span>Dietary Requirements & Accommodations</span>
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {COMMON_DIETARY.map((item) => {
                    const isSelected = selectedDietary.includes(item);
                    return (
                      <button
                        key={item}
                        type="button"
                        onClick={() => toggleItem(selectedDietary, setSelectedDietary, item)}
                        className={`rounded-full px-2.5 py-1 text-xs font-medium border transition ${
                          isSelected
                            ? "bg-emerald-950/70 border-emerald-500/60 text-emerald-200"
                            : "bg-slate-800/40 border-slate-800 text-slate-400 hover:border-slate-700"
                        }`}
                      >
                        {item} {isSelected ? "✓" : "+"}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Accessibility */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center">
                  <Accessibility className="h-3.5 w-3.5 mr-1 text-indigo-400" />
                  <span>Accessibility & Inclusion Needs</span>
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {COMMON_ACCESSIBILITY.map((item) => {
                    const isSelected = selectedAccessibility.includes(item);
                    return (
                      <button
                        key={item}
                        type="button"
                        onClick={() => toggleItem(selectedAccessibility, setSelectedAccessibility, item)}
                        className={`rounded-full px-2.5 py-1 text-xs font-medium border transition ${
                          isSelected
                            ? "bg-indigo-950/70 border-indigo-500/60 text-indigo-200"
                            : "bg-slate-800/40 border-slate-800 text-slate-400 hover:border-slate-700"
                        }`}
                      >
                        {item} {isSelected ? "✓" : "+"}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Cultural */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center">
                  <Flame className="h-3.5 w-3.5 mr-1 text-amber-400" />
                  <span>Cultural Traditions & Ceremonial Elements</span>
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {COMMON_CULTURAL.map((item) => {
                    const isSelected = selectedCultural.includes(item);
                    return (
                      <button
                        key={item}
                        type="button"
                        onClick={() => toggleItem(selectedCultural, setSelectedCultural, item)}
                        className={`rounded-full px-2.5 py-1 text-xs font-medium border transition ${
                          isSelected
                            ? "bg-amber-950/70 border-amber-500/60 text-amber-200"
                            : "bg-slate-800/40 border-slate-800 text-slate-400 hover:border-slate-700"
                        }`}
                      >
                        {item} {isSelected ? "✓" : "+"}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Priority Allocations */}
              <div className="pt-2 border-t border-slate-800">
                <label className="block text-xs font-semibold text-slate-300 mb-2">
                  Budget & Experience Priorities
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                  {(["venue", "catering", "decor", "photoVideo", "entertainment"] as const).map(
                    (aspect) => {
                      const labels: Record<string, string> = {
                        venue: "Venue",
                        catering: "Catering",
                        decor: "Decor & Flowers",
                        photoVideo: "Photo / Video",
                        entertainment: "Entertainment",
                      };
                      return (
                        <div key={aspect} className="rounded-lg border border-slate-800 bg-slate-850 p-2">
                          <span className="font-medium text-slate-300 block mb-1">
                            {labels[aspect]}
                          </span>
                          <div className="flex space-x-1">
                            {(["low", "medium", "high"] as PriorityLevel[]).map((level) => (
                              <button
                                key={level}
                                type="button"
                                onClick={() =>
                                  setPriorities((prev) => ({
                                    ...prev,
                                    [aspect]: level,
                                  }))
                                }
                                className={`flex-1 rounded py-0.5 text-[10px] font-semibold uppercase transition ${
                                  priorities[aspect] === level
                                    ? level === "high"
                                      ? "bg-violet-600 text-white"
                                      : level === "medium"
                                      ? "bg-amber-600 text-white"
                                      : "bg-slate-700 text-slate-200"
                                    : "bg-slate-800 text-slate-500 hover:bg-slate-700"
                                }`}
                              >
                                {level[0]}
                              </button>
                            ))}
                          </div>
                        </div>
                      );
                    }
                  )}
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: NOTES & ENGINE */}
          {step === 4 && (
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label htmlFor="additional-notes" className="text-xs font-semibold text-slate-300">
                    Additional Notes & Special Requests
                  </label>
                  <span className="text-[11px] text-slate-500">
                    {additionalNotes.length}/2000 chars
                  </span>
                </div>
                <textarea
                  id="additional-notes"
                  rows={4}
                  maxLength={2000}
                  value={additionalNotes}
                  onChange={(e) => setAdditionalNotes(e.target.value)}
                  placeholder="Tell us about specific must-haves, sentimental details, or unusual logistics..."
                  className="w-full rounded-lg border border-slate-700 bg-slate-800/80 p-3 text-sm text-white placeholder-slate-500 focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
                />
              </div>

              {/* Mode Selection */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2">
                  Planning Engine Mode
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div
                    onClick={() => setMode("demo")}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && setMode("demo")}
                    className={`cursor-pointer rounded-xl border p-3.5 transition text-left ${
                      mode === "demo"
                        ? "border-amber-500 bg-amber-950/30 text-white shadow-sm"
                        : "border-slate-800 bg-slate-800/40 text-slate-400 hover:border-slate-700"
                    }`}
                  >
                    <div className="flex items-center space-x-1.5 text-xs font-bold text-amber-400 mb-1">
                      <CheckCircle2 className="h-4 w-4" />
                      <span>Curated Engine (Recommended)</span>
                    </div>
                    <p className="text-xs text-slate-300">
                      High-fidelity procedural planning engine. Instant generation, 100% mathematically reconciled, works without external API keys.
                    </p>
                  </div>

                  <div
                    onClick={() => setMode("ai")}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && setMode("ai")}
                    className={`cursor-pointer rounded-xl border p-3.5 transition text-left ${
                      mode === "ai"
                        ? "border-violet-500 bg-violet-950/30 text-white shadow-sm"
                        : "border-slate-800 bg-slate-800/40 text-slate-400 hover:border-slate-700"
                    }`}
                  >
                    <div className="flex items-center space-x-1.5 text-xs font-bold text-violet-400 mb-1">
                      <Sparkles className="h-4 w-4" />
                      <span>Live Gemini GenAI</span>
                    </div>
                    <p className="text-xs text-slate-300">
                      Calls Google Gemini 2.5 Flash on the server. If GEMINI_API_KEY is not configured, automatically degrades safely to Curated Engine.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 5: REVIEW */}
          {step === 5 && (
            <div className="space-y-4">
              <div className="rounded-xl border border-slate-800 bg-slate-850 p-4 space-y-3 text-xs">
                <div className="flex justify-between items-start border-b border-slate-800 pb-2.5">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-violet-400">
                      {eventType} celebration
                    </span>
                    <h3 className="text-base font-bold text-white mt-0.5">{title}</h3>
                    <p className="text-slate-400">
                      {location} • {venueType}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-base font-bold text-emerald-400">
                      {currency} {budget.toLocaleString()}
                    </span>
                    <p className="text-[11px] text-slate-400">
                      {guestCount} Guests • {durationHours}h
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-slate-300">
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase font-semibold">
                      Target Date
                    </span>
                    <span>{date}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase font-semibold">
                      Theme & Style
                    </span>
                    <span>{themeStyle}</span>
                  </div>
                </div>

                {selectedDietary.length > 0 && (
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase font-semibold mb-1">
                      Dietary Accommodations
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {selectedDietary.map((d) => (
                        <span
                          key={d}
                          className="rounded bg-emerald-950/60 border border-emerald-900/60 px-2 py-0.5 text-[10px] text-emerald-300"
                        >
                          {d}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {selectedAccessibility.length > 0 && (
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase font-semibold mb-1">
                      Accessibility Provisions
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {selectedAccessibility.map((a) => (
                        <span
                          key={a}
                          className="rounded bg-indigo-950/60 border border-indigo-900/60 px-2 py-0.5 text-[10px] text-indigo-300"
                        >
                          {a}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
                  <span>Engine: {mode === "ai" ? "Live Gemini AI" : "Curated Procedural Engine"}</span>
                  <span className="text-amber-400">Reconciled with 10% Contingency Reserve</span>
                </div>
              </div>
            </div>
          )}

          {/* Modal Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-800">
            {step > 1 ? (
              <button
                type="button"
                onClick={handleBack}
                disabled={isSubmitting}
                className="inline-flex items-center space-x-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3.5 py-2 text-xs font-medium text-slate-300 hover:bg-slate-700 hover:text-white transition disabled:opacity-50"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>Back</span>
              </button>
            ) : (
              <div />
            )}

            {step < 5 ? (
              <button
                type="button"
                onClick={handleNext}
                className="inline-flex items-center space-x-1.5 rounded-lg bg-violet-600 px-4 py-2 text-xs font-semibold text-white hover:bg-violet-500 transition active:scale-95"
              >
                <span>Continue</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center space-x-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-violet-600/30 hover:from-violet-500 hover:to-indigo-500 transition active:scale-95 disabled:opacity-60"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Synthesizing Plan...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    <span>Generate Complete Plan</span>
                  </>
                )}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
