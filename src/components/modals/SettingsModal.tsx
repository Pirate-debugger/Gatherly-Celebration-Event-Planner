"use client";

import React, { useEffect, useState } from "react";
import {
  X,
  Shield,
  Database,
  Cpu,
  Keyboard,
  FileDown,
  Trash2,
  CheckCircle2,
} from "lucide-react";
import {
  getStorageUsage,
  clearStoredPlan,
} from "@/lib/storage/persistence";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onResetToDefaults: () => void;
  isAiAvailable: boolean;
}

export function SettingsModal({
  isOpen,
  onClose,
  onResetToDefaults,
  isAiAvailable,
}: SettingsModalProps) {
  const [resetConfirmed, setResetConfirmed] = useState(false);
  const storageStats = isOpen ? getStorageUsage() : { bytes: 0, lastSaved: null };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleClearData = () => {
    clearStoredPlan();
    onResetToDefaults();
    setResetConfirmed(true);
    setTimeout(() => {
      setResetConfirmed(false);
      onClose();
    }, 1200);
  };

  const formattedKb = (storageStats.bytes / 1024).toFixed(1);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="settings-dialog-title"
    >
      <div
        className="relative w-full max-w-2xl rounded-2xl border border-slate-800 bg-slate-900 p-6 sm:p-8 shadow-2xl space-y-6 text-slate-200 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center space-x-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-600/20 text-violet-400 border border-violet-500/30">
              <Shield className="h-5 w-5" />
            </div>
            <div>
              <h2
                id="settings-dialog-title"
                className="text-lg font-bold text-white tracking-tight"
              >
                Settings, Security & Privacy
              </h2>
              <p className="text-xs text-slate-400">
                Transparent controls, privacy disclosures, and local storage management
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white transition"
            aria-label="Close settings dialog"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Section 1: AI Engine & Privacy Disclosure */}
        <div className="space-y-3 rounded-xl border border-slate-800/80 bg-slate-950/50 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-sm font-semibold text-white">
              <Cpu className="h-4 w-4 text-violet-400" />
              <span>AI Provider & Privacy Disclosure</span>
            </div>
            <span
              className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold border ${
                isAiAvailable
                  ? "bg-emerald-950/80 text-emerald-300 border-emerald-800/60"
                  : "bg-amber-950/80 text-amber-300 border-amber-800/60"
              }`}
            >
              {isAiAvailable ? "Gemini Live Active" : "Curated Procedural Mode"}
            </span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Gatherly uses the official Google Gemini API (model{" "}
            <code className="text-violet-300 bg-slate-800 px-1 py-0.5 rounded">gemini-2.5-flash</code>
            ) to generate synthesized celebration blueprints. All API credentials remain
            strictly server-side. Requests are protected against prompt injection and bounded by a 32 KB payload limit.
          </p>
          <div className="rounded-lg bg-slate-900/80 border border-slate-800 p-2.5 text-[11px] text-slate-300 space-y-1">
            <p>
              • <strong>External Transmission:</strong> Event parameters are transmitted to Google Gemini solely when explicitly submitting the AI Planning wizard.
            </p>
            <p>
              • <strong>Zero Training Retention:</strong> Data processed via enterprise Gemini API endpoints is not used to train foundation models.
            </p>
            <p>
              • <strong>Deterministic Fallback:</strong> If no API key is configured or network failure occurs, Gatherly falls back to its offline Curated Procedural Engine with 100% budget reconciliation.
            </p>
          </div>
        </div>

        {/* Section 2: Local Storage & Offline Persistence */}
        <div className="space-y-3 rounded-xl border border-slate-800/80 bg-slate-950/50 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-sm font-semibold text-white">
              <Database className="h-4 w-4 text-emerald-400" />
              <span>Client-Side Offline Persistence</span>
            </div>
            <span className="text-xs text-slate-400">
              Storage: <strong className="text-white">{formattedKb} KB</strong>
            </span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Your event timeline, confirmed vendor checklist states, and custom budget expenses are
            automatically synchronized to browser LocalStorage (<code className="text-emerald-300">gatherly_active_plan_v1</code>). All restored data is strictly validated with Zod schemas to protect against corrupted state.
          </p>
          {storageStats.lastSaved && (
            <p className="text-[11px] text-slate-500">
              Last saved: {new Date(storageStats.lastSaved).toLocaleString()}
            </p>
          )}

          <div className="pt-1 flex items-center justify-between">
            <button
              type="button"
              onClick={handleClearData}
              disabled={resetConfirmed}
              className="flex items-center space-x-1.5 rounded-lg border border-rose-800/80 bg-rose-950/40 px-3 py-1.5 text-xs font-semibold text-rose-300 hover:bg-rose-900/60 transition disabled:opacity-50"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Clear Cache & Reset Blueprint</span>
            </button>
            {resetConfirmed && (
              <span className="flex items-center space-x-1 text-xs text-emerald-400">
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>Reset to default preset!</span>
              </span>
            )}
          </div>
        </div>

        {/* Section 3: Keyboard & Accessibility */}
        <div className="space-y-3 rounded-xl border border-slate-800/80 bg-slate-950/50 p-4">
          <div className="flex items-center space-x-2 text-sm font-semibold text-white">
            <Keyboard className="h-4 w-4 text-amber-400" />
            <span>Accessibility & Keyboard Navigation (WCAG 2.2 AA)</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-300">
            <div className="rounded-lg bg-slate-900/80 p-2 border border-slate-800">
              <span className="font-semibold text-white">Tab / Shift+Tab</span>
              <p className="text-slate-400 mt-0.5">Navigate through all interactive controls and inputs.</p>
            </div>
            <div className="rounded-lg bg-slate-900/80 p-2 border border-slate-800">
              <span className="font-semibold text-white">Enter / Space</span>
              <p className="text-slate-400 mt-0.5">Toggle checkboxes, select tabs, and trigger actions.</p>
            </div>
            <div className="rounded-lg bg-slate-900/80 p-2 border border-slate-800">
              <span className="font-semibold text-white">Escape</span>
              <p className="text-slate-400 mt-0.5">Dismiss any active modal dialog immediately.</p>
            </div>
            <div className="rounded-lg bg-slate-900/80 p-2 border border-slate-800">
              <span className="font-semibold text-white">Screen Readers</span>
              <p className="text-slate-400 mt-0.5">ARIA roles, live regions, and semantic labels throughout.</p>
            </div>
          </div>
        </div>

        {/* Section 4: Export Standards */}
        <div className="space-y-2 rounded-xl border border-slate-800/80 bg-slate-950/50 p-4 text-xs text-slate-400">
          <div className="flex items-center space-x-2 text-sm font-semibold text-white">
            <FileDown className="h-4 w-4 text-indigo-400" />
            <span>Supported Export Standards</span>
          </div>
          <p>
            • <strong>iCalendar (.ics):</strong> Compliant with RFC 5545 for Google Calendar, Apple Calendar, and Outlook.
          </p>
          <p>
            • <strong>JSON Blueprint:</strong> Full machine-readable export with zero loss of timeline or financial parameters.
          </p>
          <p>
            • <strong>Print / PDF:</strong> Clean print CSS layout with high contrast typography for stakeholder review.
          </p>
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-2 border-t border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg bg-violet-600 px-5 py-2 text-xs font-semibold text-white hover:bg-violet-500 transition shadow-md shadow-violet-600/30"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
