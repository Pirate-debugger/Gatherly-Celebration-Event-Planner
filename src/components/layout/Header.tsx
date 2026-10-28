"use client";

import React, { useRef } from "react";
import {
  Sparkles,
  Download,
  Calendar,
  Upload,
  Printer,
  PlusCircle,
  Cpu,
  CheckCircle2,
  Settings,
} from "lucide-react";
import { EventPlan } from "@/types/event";

interface HeaderProps {
  currentPlan: EventPlan | null;
  onOpenWizard: () => void;
  onLoadPreset: (presetKey: "wedding" | "birthday" | "community") => void;
  onExportJson: () => void;
  onExportIcs?: () => void;
  onImportJson: (imported: EventPlan) => void;
  onPrint: () => void;
  onOpenSettings?: () => void;
  isAiAvailable?: boolean;
}

/**
 * Global Application Header Component
 *
 * Provides branding, status indicator, preset selectors (Wedding, Birthday, Community),
 * export/import actions (JSON and iCalendar .ics), quick print trigger, and settings.
 *
 * @param props - HeaderProps containing plan state and action callbacks.
 * @returns React.JSX.Element
 */
export function Header({
  currentPlan,
  onOpenWizard,
  onLoadPreset,
  onExportJson,
  onExportIcs,
  onImportJson,
  onPrint,
  onOpenSettings,
  isAiAvailable = false,
}: HeaderProps): React.JSX.Element {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const parsed = JSON.parse(text);
        if (parsed && parsed.userPreferences && parsed.budgetSummary) {
          onImportJson(parsed as EventPlan);
        } else {
          alert("Invalid Gatherly plan format. Please select a valid exported JSON file.");
        }
      } catch {
        alert("Could not parse file. Ensure it is a valid JSON document.");
      }
    };
    reader.readAsText(file);
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <header className="sticky top-0 z-40 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md no-print">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        {/* Brand */}
        <div className="flex items-center space-x-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-violet-600 to-amber-500 shadow-lg shadow-violet-500/20">
            <Sparkles className="h-5 w-5 text-white" aria-hidden="true" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xl font-bold tracking-tight text-white">
                Gatherly
              </span>
              <span className="rounded-full bg-violet-950/80 px-2 py-0.5 text-[11px] font-semibold text-violet-300 border border-violet-800/60">
                AI Planner
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              Celebration & Event Planning Assistant
            </p>
          </div>
        </div>

        {/* Center / Presets */}
        <div className="hidden lg:flex items-center space-x-1.5 rounded-lg border border-slate-800 bg-slate-900/60 p-1">
          <span className="px-2 text-xs font-medium text-slate-400">Showcase:</span>
          <button
            type="button"
            onClick={() => onLoadPreset("wedding")}
            className="rounded-md px-2.5 py-1 text-xs font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition"
          >
            Sonoma Wedding
          </button>
          <button
            type="button"
            onClick={() => onLoadPreset("birthday")}
            className="rounded-md px-2.5 py-1 text-xs font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition"
          >
            30th Rooftop
          </button>
          <button
            type="button"
            onClick={() => onLoadPreset("community")}
            className="rounded-md px-2.5 py-1 text-xs font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition"
          >
            Lantern Festival
          </button>
        </div>

        {/* Right Actions */}
        <div className="flex items-center space-x-2">
          {/* Mode Indicator */}
          <button
            type="button"
            onClick={onOpenSettings}
            title="View AI Engine & Privacy Details"
            className="hidden md:flex items-center space-x-1 rounded-full border border-slate-800 bg-slate-900/80 px-2.5 py-1 text-xs text-slate-300 hover:bg-slate-800 transition"
          >
            {isAiAvailable ? (
              <>
                <Cpu className="h-3.5 w-3.5 text-emerald-400" />
                <span className="text-slate-300">Gemini Live</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="h-3.5 w-3.5 text-amber-400" />
                <span className="text-slate-300">Curated Engine</span>
              </>
            )}
          </button>

          {currentPlan && (
            <>
              {/* Export JSON */}
              <button
                type="button"
                onClick={onExportJson}
                title="Export plan to JSON"
                aria-label="Export plan to JSON"
                className="flex items-center space-x-1.5 rounded-lg border border-slate-700/80 bg-slate-800/80 px-2.5 py-1.5 text-xs font-medium text-slate-200 hover:bg-slate-700 hover:text-white transition"
              >
                <Download className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">JSON</span>
              </button>

              {/* Export Calendar (.ics) */}
              {onExportIcs && (
                <button
                  type="button"
                  onClick={onExportIcs}
                  title="Export to iCalendar (.ics)"
                  aria-label="Export to iCalendar (.ics)"
                  className="flex items-center space-x-1.5 rounded-lg border border-slate-700/80 bg-slate-800/80 px-2.5 py-1.5 text-xs font-medium text-slate-200 hover:bg-slate-700 hover:text-white transition"
                >
                  <Calendar className="h-3.5 w-3.5 text-indigo-400" />
                  <span className="hidden sm:inline">iCal</span>
                </button>
              )}

              {/* Print */}
              <button
                type="button"
                onClick={onPrint}
                title="Print or save as PDF"
                aria-label="Print or save as PDF"
                className="flex items-center space-x-1.5 rounded-lg border border-slate-700/80 bg-slate-800/80 px-2.5 py-1.5 text-xs font-medium text-slate-200 hover:bg-slate-700 hover:text-white transition"
              >
                <Printer className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Print</span>
              </button>
            </>
          )}

          {/* Import JSON */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".json,application/json"
            className="hidden"
            aria-hidden="true"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            title="Import an existing plan"
            aria-label="Import an existing plan"
            className="flex items-center space-x-1.5 rounded-lg border border-slate-700/80 bg-slate-800/80 px-2.5 py-1.5 text-xs font-medium text-slate-200 hover:bg-slate-700 hover:text-white transition"
          >
            <Upload className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Import</span>
          </button>

          {/* Settings & Privacy Button */}
          {onOpenSettings && (
            <button
              type="button"
              onClick={onOpenSettings}
              title="Settings & Privacy Information"
              aria-label="Settings & Privacy Information"
              className="flex items-center justify-center rounded-lg border border-slate-700/80 bg-slate-800/80 p-1.5 text-slate-200 hover:bg-slate-700 hover:text-white transition"
            >
              <Settings className="h-4 w-4" />
            </button>
          )}

          {/* New Event Wizard Button */}
          <button
            type="button"
            onClick={onOpenWizard}
            className="flex items-center space-x-1.5 rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-md shadow-violet-600/30 hover:from-violet-500 hover:to-indigo-500 transition active:scale-95"
          >
            <PlusCircle className="h-4 w-4" />
            <span>Create Plan</span>
          </button>
        </div>
      </div>
    </header>
  );
}
