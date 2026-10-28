"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";

/**
 * Gatherly Global Application Error Boundary
 *
 * Catches unhandled runtime errors in client components, presents an accessible
 * recovery interface, logs sanitized telemetry, and offers instant session recovery.
 */
export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}): React.JSX.Element {
  useEffect(() => {
    // Sanitized diagnostic logging
    console.error("Gatherly ErrorBoundary caught:", error?.message || "Unknown error");
  }, [error]);

  return (
    <div
      role="alert"
      aria-live="assertive"
      className="min-h-screen bg-[#090d16] text-slate-100 flex items-center justify-center p-6"
    >
      <div className="max-w-md w-full rounded-3xl border border-rose-500/30 bg-slate-900/90 p-8 shadow-2xl backdrop-blur-xl text-center space-y-6">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-400 border border-rose-500/20 shadow-inner">
          <AlertTriangle className="h-8 w-8" aria-hidden="true" />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-black tracking-tight text-white">
            Something Went Wrong
          </h1>
          <p className="text-sm text-slate-400 leading-relaxed">
            Gatherly encountered an unexpected issue while rendering your celebration workspace. Your saved event data in LocalStorage remains safe.
          </p>
          {error?.digest && (
            <p className="text-xs font-mono text-slate-500 mt-2">
              Reference Code: {error.digest}
            </p>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            type="button"
            onClick={() => reset()}
            className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-violet-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-600/25 hover:bg-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-400 focus:ring-offset-2 focus:ring-offset-slate-900 transition"
          >
            <RefreshCw className="h-4 w-4" aria-hidden="true" />
            Try Again
          </button>
          <Link
            href="/"
            className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-800/80 px-5 py-3 text-sm font-semibold text-slate-200 hover:bg-slate-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-slate-900 transition"
          >
            <Home className="h-4 w-4" aria-hidden="true" />
            Return Home
          </Link>
        </div>
      </div>
    </div>
  );
}
