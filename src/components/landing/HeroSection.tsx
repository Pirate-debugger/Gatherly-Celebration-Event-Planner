"use client";

import React from "react";
import {
  Sparkles,
  Calendar,
  DollarSign,
  CheckSquare,
  ShieldAlert,
  ArrowRight,
  Heart,
  PartyPopper,
  Users,
} from "lucide-react";

interface HeroSectionProps {
  onOpenWizard: () => void;
  onLoadPreset: (presetKey: "wedding" | "birthday" | "community") => void;
}

/**
 * Landing Page Hero Banner Component
 *
 * Displays primary value propositions, quick one-click celebration template selectors
 * (Wedding, Birthday, Community), and call-to-actions to launch the planning assistant.
 *
 * @param props - HeroSectionProps containing wizard launch and preset loaders.
 * @returns React.JSX.Element
 */
export function HeroSection({ onOpenWizard, onLoadPreset }: HeroSectionProps): React.JSX.Element {
  return (
    <section className="relative overflow-hidden py-12 sm:py-20 no-print">
      {/* Background ambient gradient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-violet-600/20 via-indigo-600/15 to-amber-500/10 blur-[120px] pointer-events-none rounded-full" />

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 text-center">
        {/* Pill Badge */}
        <div className="inline-flex items-center space-x-2 rounded-full border border-violet-500/30 bg-violet-950/40 px-3.5 py-1 text-xs font-medium text-violet-300 backdrop-blur-sm mb-6">
          <Sparkles className="h-3.5 w-3.5 text-amber-400" />
          <span>GenAI Celebration & Event Planner</span>
        </div>

        {/* Main Headline */}
        <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-6xl max-w-4xl mx-auto leading-tight">
          Plan Unforgettable Celebrations with{" "}
          <span className="bg-gradient-to-r from-violet-400 via-indigo-300 to-amber-300 bg-clip-text text-transparent">
            Precision & Heart
          </span>
        </h1>

        {/* Subtitle */}
        <p className="mt-5 text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
          From weddings and milestone birthdays to vibrant cultural festivals.
          Synthesize mathematically reconciled budgets, dynamic countdown timelines,
          vendor checklists, and tailored experiential concepts in seconds.
        </p>

        {/* Main CTA Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            type="button"
            onClick={onOpenWizard}
            className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-violet-600/30 hover:from-violet-500 hover:to-indigo-500 transition active:scale-95"
          >
            <Sparkles className="h-4 w-4" />
            <span>Launch Event Wizard</span>
            <ArrowRight className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => onLoadPreset("wedding")}
            className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 rounded-xl border border-slate-700/80 bg-slate-900/80 px-6 py-3.5 text-sm font-medium text-slate-200 hover:bg-slate-800 hover:text-white transition"
          >
            <span>Preview Sample Wedding</span>
          </button>
        </div>

        {/* Feature Grid Highlights */}
        <div className="mt-14 grid grid-cols-2 sm:grid-cols-4 gap-4 text-left">
          <div className="rounded-xl border border-slate-800/80 bg-slate-900/50 p-4 backdrop-blur-sm">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400 mb-3">
              <DollarSign className="h-4 w-4" />
            </div>
            <h3 className="text-sm font-semibold text-white">Reconciled Budgets</h3>
            <p className="mt-1 text-xs text-slate-400">
              Integer minor-unit math, automatic 10% contingency, and real-time overage detection.
            </p>
          </div>

          <div className="rounded-xl border border-slate-800/80 bg-slate-900/50 p-4 backdrop-blur-sm">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400 mb-3">
              <Calendar className="h-4 w-4" />
            </div>
            <h3 className="text-sm font-semibold text-white">Dynamic Timelines</h3>
            <p className="mt-1 text-xs text-slate-400">
              Milestone deadlines automatically scaled to your date with overdue status tracking.
            </p>
          </div>

          <div className="rounded-xl border border-slate-800/80 bg-slate-900/50 p-4 backdrop-blur-sm">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10 text-amber-400 mb-3">
              <CheckSquare className="h-4 w-4" />
            </div>
            <h3 className="text-sm font-semibold text-white">Vendor Command Hub</h3>
            <p className="mt-1 text-xs text-slate-400">
              Contract milestones, payment reminders, and essential questions to ask.
            </p>
          </div>

          <div className="rounded-xl border border-slate-800/80 bg-slate-900/50 p-4 backdrop-blur-sm">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-500/10 text-rose-400 mb-3">
              <ShieldAlert className="h-4 w-4" />
            </div>
            <h3 className="text-sm font-semibold text-white">Risk Contingency</h3>
            <p className="mt-1 text-xs text-slate-400">
              Weather backup triggers, allergen protocols, and speed-dial emergency contacts.
            </p>
          </div>
        </div>

        {/* Preset Cards Showcase */}
        <div className="mt-12 text-left">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-white">
              Or explore pre-configured event blueprints:
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Wedding Card */}
            <div
              onClick={() => onLoadPreset("wedding")}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onLoadPreset("wedding");
                }
              }}
              className="cursor-pointer group rounded-xl border border-slate-800 bg-slate-900/60 p-5 hover:border-violet-500/60 hover:bg-slate-900/90 transition shadow-sm hover:shadow-violet-500/10"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="inline-flex items-center space-x-1 text-xs font-semibold text-rose-400 bg-rose-950/40 border border-rose-900/60 px-2 py-0.5 rounded-full">
                  <Heart className="h-3 w-3" />
                  <span>Wedding</span>
                </span>
                <span className="text-xs text-slate-400">120 Guests • $45,000</span>
              </div>
              <h3 className="text-base font-semibold text-white group-hover:text-violet-300 transition">
                Sonoma Garden Elegance
              </h3>
              <p className="mt-1.5 text-xs text-slate-400 line-clamp-2">
                Terracotta & sage palette, open-air vineyard dinner, acoustic serenade, and zero-plastic protocol.
              </p>
              <div className="mt-4 flex items-center text-xs font-medium text-violet-400 group-hover:translate-x-0.5 transition">
                <span>Load Blueprint</span>
                <ArrowRight className="h-3.5 w-3.5 ml-1" />
              </div>
            </div>

            {/* Birthday Card */}
            <div
              onClick={() => onLoadPreset("birthday")}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onLoadPreset("birthday");
                }
              }}
              className="cursor-pointer group rounded-xl border border-slate-800 bg-slate-900/60 p-5 hover:border-amber-500/60 hover:bg-slate-900/90 transition shadow-sm hover:shadow-amber-500/10"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="inline-flex items-center space-x-1 text-xs font-semibold text-amber-400 bg-amber-950/40 border border-amber-900/60 px-2 py-0.5 rounded-full">
                  <PartyPopper className="h-3 w-3" />
                  <span>Birthday</span>
                </span>
                <span className="text-xs text-slate-400">65 Guests • $8,500</span>
              </div>
              <h3 className="text-base font-semibold text-white group-hover:text-amber-300 transition">
                Cyberpunk 30th Rooftop
              </h3>
              <p className="mt-1.5 text-xs text-slate-400 line-clamp-2">
                Neon skyline lounge, retro synth DJ, illuminated mocktail bar, and quiet sensory break room.
              </p>
              <div className="mt-4 flex items-center text-xs font-medium text-amber-400 group-hover:translate-x-0.5 transition">
                <span>Load Blueprint</span>
                <ArrowRight className="h-3.5 w-3.5 ml-1" />
              </div>
            </div>

            {/* Community Card */}
            <div
              onClick={() => onLoadPreset("community")}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onLoadPreset("community");
                }
              }}
              className="cursor-pointer group rounded-xl border border-slate-800 bg-slate-900/60 p-5 hover:border-indigo-500/60 hover:bg-slate-900/90 transition shadow-sm hover:shadow-indigo-500/10"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="inline-flex items-center space-x-1 text-xs font-semibold text-indigo-400 bg-indigo-950/40 border border-indigo-900/60 px-2 py-0.5 rounded-full">
                  <Users className="h-3 w-3" />
                  <span>Community</span>
                </span>
                <span className="text-xs text-slate-400">450 Guests • $18,000</span>
              </div>
              <h3 className="text-base font-semibold text-white group-hover:text-indigo-300 transition">
                Multicultural Lantern Festival
              </h3>
              <p className="mt-1.5 text-xs text-slate-400 line-clamp-2">
                Civic park festival, folklore parade, twilight eco-lanterns, ASL interpreters, and food rescue partnership.
              </p>
              <div className="mt-4 flex items-center text-xs font-medium text-indigo-400 group-hover:translate-x-0.5 transition">
                <span>Load Blueprint</span>
                <ArrowRight className="h-3.5 w-3.5 ml-1" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
