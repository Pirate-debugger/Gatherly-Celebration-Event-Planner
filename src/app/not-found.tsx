import React from "react";
import Link from "next/link";
import { Sparkles, ArrowLeft } from "lucide-react";

/**
 * Gatherly 404 - Not Found Page
 *
 * Rendered when a requested route or celebration resource is missing.
 * Complies with semantic heading hierarchy and WCAG accessibility standards.
 */
export default function NotFound(): React.JSX.Element {
  return (
    <main className="min-h-screen bg-[#090d16] text-slate-100 flex items-center justify-center p-6">
      <div className="max-w-md w-full rounded-3xl border border-slate-800 bg-slate-900/80 p-8 shadow-2xl backdrop-blur-xl text-center space-y-6">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-violet-600/10 text-violet-400 border border-violet-500/20 shadow-inner">
          <Sparkles className="h-8 w-8" aria-hidden="true" />
        </div>

        <div className="space-y-2">
          <p className="text-xs font-bold uppercase tracking-widest text-violet-400">
            404 — Event Missing
          </p>
          <h1 className="text-3xl font-black tracking-tight text-white">
            Plan Not Found
          </h1>
          <p className="text-sm text-slate-400 leading-relaxed">
            The celebration blueprint or page you are looking for does not exist or has been relocated.
          </p>
        </div>

        <div className="pt-2">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-violet-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-600/25 hover:bg-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-400 focus:ring-offset-2 focus:ring-offset-slate-900 transition"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Back to Celebration Dashboard
          </Link>
        </div>
      </div>
    </main>
  );
}
