import React from "react";
import { Sparkles } from "lucide-react";

/**
 * Gatherly Loading Fallback
 *
 * Accessible instant-loading state for Next.js App Router Suspense transitions.
 * Features shimmering skeleton placeholders with ARIA live announcements.
 */
export default function Loading(): React.JSX.Element {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Loading Gatherly celebration planner dashboard..."
      className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col"
    >
      {/* Header Skeleton */}
      <header className="border-b border-slate-800/80 bg-slate-950/70 h-20 px-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-2xl bg-slate-800 animate-pulse" />
          <div className="h-6 w-32 rounded bg-slate-800 animate-pulse" />
        </div>
        <div className="flex gap-2">
          <div className="h-9 w-24 rounded-xl bg-slate-800 animate-pulse" />
          <div className="h-9 w-24 rounded-xl bg-slate-800 animate-pulse" />
          <div className="h-9 w-32 rounded-xl bg-slate-800 animate-pulse" />
        </div>
      </header>

      {/* Main Skeleton Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 space-y-6">
        {/* Hero skeleton */}
        <div className="rounded-3xl border border-slate-800 bg-slate-900/40 p-8 space-y-4">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-violet-400 animate-spin" aria-hidden="true" />
            <span className="text-xs font-semibold uppercase tracking-wider text-violet-400">
              Gathering Intelligence...
            </span>
          </div>
          <div className="h-10 w-3/4 rounded-xl bg-slate-800 animate-pulse" />
          <div className="h-4 w-1/2 rounded bg-slate-800/80 animate-pulse" />
        </div>

        {/* Tab Navigation Skeleton */}
        <div className="flex gap-2 border-b border-slate-800 pb-2">
          {[1, 2, 3, 4, 5, 6, 7].map((tab) => (
            <div
              key={tab}
              className="h-10 w-28 rounded-xl bg-slate-800/60 animate-pulse"
            />
          ))}
        </div>

        {/* Dashboard Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="h-64 rounded-3xl bg-slate-900/60 border border-slate-800 animate-pulse" />
          <div className="h-64 rounded-3xl bg-slate-900/60 border border-slate-800 animate-pulse" />
          <div className="h-64 rounded-3xl bg-slate-900/60 border border-slate-800 animate-pulse" />
        </div>
      </main>
      <span className="sr-only">Loading celebration workspace...</span>
    </div>
  );
}
