"use client";

import React from "react";
import {
  Sparkles,
  Calendar,
  MapPin,
  Users,
  DollarSign,
  Clock,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { EventPlan } from "@/types/event";
import { formatCurrency } from "@/lib/calculations/budget";
import { calculateTimelineProgress } from "@/lib/calculations/timeline";

interface ExecutiveOverviewCardProps {
  plan: EventPlan;
}

/**
 * Executive Overview KPI Card Component
 *
 * Displays top-level key performance metrics for the celebration including
 * total budget, allocation percentage, guest count, vendor contracts, countdown status,
 * and high-priority alerts.
 *
 * @param props - ExecutiveOverviewCardProps containing the active EventPlan.
 * @returns React.JSX.Element
 */
export function ExecutiveOverviewCard({ plan }: ExecutiveOverviewCardProps): React.JSX.Element {
  const { userPreferences, overview, budgetSummary, timeline, vendors } = plan;
  const progress = calculateTimelineProgress(timeline);

  const confirmedVendorsCount = vendors.filter(
    (v) =>
      v.status === "contract_signed" ||
      v.status === "deposit_paid" ||
      v.status === "fully_paid"
  ).length;

  return (
    <div className="space-y-6">
      {/* Top Banner KPI Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {/* Total Budget */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4 backdrop-blur-sm">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Total Budget</span>
            <DollarSign className="h-4 w-4 text-emerald-400" />
          </div>
          <p className="mt-2 text-xl font-extrabold text-white">
            {formatCurrency(budgetSummary.totalBudget, budgetSummary.currency)}
          </p>
          <p className="mt-0.5 text-[11px] text-slate-400">
            {userPreferences.guestCount} guests • ~
            {formatCurrency(
              userPreferences.guestCount > 0
                ? Math.round(budgetSummary.totalBudget / userPreferences.guestCount)
                : 0,
              budgetSummary.currency
            )}
            /guest
          </p>
        </div>

        {/* Total Allocated */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4 backdrop-blur-sm">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Total Allocated</span>
            <Sparkles className="h-4 w-4 text-violet-400" />
          </div>
          <p className="mt-2 text-xl font-extrabold text-violet-300">
            {formatCurrency(budgetSummary.totalAllocated, budgetSummary.currency)}
          </p>
          <p className="mt-0.5 text-[11px] text-slate-400">
            {formatCurrency(budgetSummary.contingencyAmount, budgetSummary.currency)} reserve (
            {budgetSummary.contingencyPercentage}%)
          </p>
        </div>

        {/* Remaining Balance */}
        <div
          className={`rounded-xl border p-4 backdrop-blur-sm ${
            budgetSummary.isOverBudget
              ? "border-rose-900/80 bg-rose-950/30 text-rose-300"
              : "border-slate-800 bg-slate-900/70 text-slate-300"
          }`}
        >
          <div className="flex items-center justify-between text-xs">
            <span className={budgetSummary.isOverBudget ? "text-rose-400" : "text-slate-400"}>
              Remaining Balance
            </span>
            {budgetSummary.isOverBudget ? (
              <AlertTriangle className="h-4 w-4 text-rose-400" />
            ) : (
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            )}
          </div>
          <p
            className={`mt-2 text-xl font-extrabold ${
              budgetSummary.isOverBudget ? "text-rose-400" : "text-emerald-400"
            }`}
          >
            {formatCurrency(budgetSummary.remainingBudget, budgetSummary.currency)}
          </p>
          <p className="mt-0.5 text-[11px] text-slate-400">
            {budgetSummary.isOverBudget
              ? `Warning: Over by ${formatCurrency(
                  budgetSummary.overBudgetAmount,
                  budgetSummary.currency
                )}`
              : "Balanced within allocated limits"}
          </p>
        </div>

        {/* Planning Progress */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4 backdrop-blur-sm">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Task Progress</span>
            <CheckCircle2 className="h-4 w-4 text-indigo-400" />
          </div>
          <p className="mt-2 text-xl font-extrabold text-indigo-300">
            {progress.completionPercentage}%
          </p>
          <p className="mt-0.5 text-[11px] text-slate-400">
            {progress.completedTasks} of {progress.totalTasks} tasks complete
          </p>
        </div>

        {/* Overdue / Vendors Status */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4 backdrop-blur-sm col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Vendor Status</span>
            <Users className="h-4 w-4 text-amber-400" />
          </div>
          <p className="mt-2 text-xl font-extrabold text-amber-300">
            {confirmedVendorsCount} / {vendors.length}
          </p>
          <p className="mt-0.5 text-[11px] text-slate-400">
            {vendors.length - confirmedVendorsCount} pending contract confirmation
          </p>
        </div>
      </div>

      {/* Main Executive Summary Card */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-sm space-y-6">
        {/* Title and Metadata Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
          <div>
            <div className="flex items-center space-x-2">
              <span className="rounded-full bg-violet-950/80 border border-violet-800/60 px-2.5 py-0.5 text-[11px] font-semibold text-violet-300 uppercase tracking-wide">
                {userPreferences.eventType}
              </span>
              <span className="text-xs text-slate-400">
                Plan ID: <code className="text-slate-300">{plan.id}</code>
              </span>
              {plan.isDemo && (
                <span className="rounded-full bg-amber-950/60 border border-amber-900/60 px-2 py-0.5 text-[10px] font-medium text-amber-300">
                  Curated Blueprint
                </span>
              )}
            </div>
            <h2 className="text-2xl font-extrabold text-white mt-1.5">
              {userPreferences.title}
            </h2>
          </div>

          {/* Quick Badges */}
          <div className="flex flex-wrap gap-2 text-xs">
            <div className="flex items-center space-x-1.5 rounded-lg border border-slate-800 bg-slate-800/60 px-3 py-1.5 text-slate-300">
              <Calendar className="h-3.5 w-3.5 text-violet-400" />
              <span>{userPreferences.date}</span>
            </div>
            <div className="flex items-center space-x-1.5 rounded-lg border border-slate-800 bg-slate-800/60 px-3 py-1.5 text-slate-300">
              <Clock className="h-3.5 w-3.5 text-indigo-400" />
              <span>{userPreferences.durationHours} Hours</span>
            </div>
            <div className="flex items-center space-x-1.5 rounded-lg border border-slate-800 bg-slate-800/60 px-3 py-1.5 text-slate-300">
              <MapPin className="h-3.5 w-3.5 text-amber-400" />
              <span>{userPreferences.location} ({userPreferences.venueType})</span>
            </div>
            <div className="flex items-center space-x-1.5 rounded-lg border border-slate-800 bg-slate-800/60 px-3 py-1.5 text-slate-300">
              <Users className="h-3.5 w-3.5 text-emerald-400" />
              <span>{userPreferences.guestCount} Guests</span>
            </div>
          </div>
        </div>

        {/* Executive Overview Narrative */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Concept */}
          <div className="rounded-xl border border-slate-800/80 bg-slate-850/50 p-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-violet-400 mb-2">
              Event Concept & Vision
            </h3>
            <p className="text-xs leading-relaxed text-slate-300">
              {overview.eventConcept}
            </p>
          </div>

          {/* Atmosphere */}
          <div className="rounded-xl border border-slate-800/80 bg-slate-850/50 p-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-400 mb-2">
              Atmosphere & Styling
            </h3>
            <p className="text-xs leading-relaxed text-slate-300">
              {overview.recommendedAtmosphere}
            </p>
          </div>

          {/* Guest Experience */}
          <div className="rounded-xl border border-slate-800/80 bg-slate-850/50 p-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 mb-2">
              Guest Experience Strategy
            </h3>
            <p className="text-xs leading-relaxed text-slate-300">
              {overview.guestExperienceStrategy}
            </p>
          </div>
        </div>

        {/* Assumptions & Critical Risks */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2 border-t border-slate-800/80 text-xs">
          <div>
            <h3 className="font-semibold text-slate-300 mb-2 flex items-center">
              <CheckCircle2 className="h-3.5 w-3.5 mr-1.5 text-emerald-400" />
              <span>Key Operating Assumptions</span>
            </h3>
            <ul className="space-y-1.5 text-slate-400 list-disc list-inside">
              {overview.keyAssumptions.map((assump, idx) => (
                <li key={idx} className="leading-relaxed">
                  {assump}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-slate-300 mb-2 flex items-center">
              <ShieldAlert className="h-3.5 w-3.5 mr-1.5 text-rose-400" />
              <span>Critical Risks Under Watch</span>
            </h3>
            <ul className="space-y-1.5 text-slate-400 list-disc list-inside">
              {overview.criticalRisksSummary.map((risk, idx) => (
                <li key={idx} className="leading-relaxed">
                  {risk}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
