"use client";

import React from "react";
import {
  ShieldAlert,
  AlertTriangle,
  PhoneCall,
  CheckCircle,
} from "lucide-react";
import { RiskContingencyItem, RiskSeverity } from "@/types/event";

interface RiskContingencySectionProps {
  risks: RiskContingencyItem[];
}

const SEVERITY_CONFIG: Record<
  RiskSeverity,
  { label: string; bg: string; text: string; border: string }
> = {
  high: {
    label: "High Severity",
    bg: "bg-rose-950/80",
    text: "text-rose-300",
    border: "border-rose-900/60",
  },
  medium: {
    label: "Medium Severity",
    bg: "bg-amber-950/80",
    text: "text-amber-300",
    border: "border-amber-900/60",
  },
  low: {
    label: "Low Severity",
    bg: "bg-blue-950/80",
    text: "text-blue-300",
    border: "border-blue-900/60",
  },
};

export function RiskContingencySection({ risks }: RiskContingencySectionProps) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-bold text-white flex items-center space-x-2">
          <ShieldAlert className="h-4 w-4 text-rose-400" />
          <span>Risk Mitigation Matrix & Emergency Contingency Protocol</span>
        </h3>
        <p className="text-xs text-slate-400 mt-0.5">
          Proactive safeguards, immediate triggers, and 24/7 emergency contacts to guarantee smooth execution.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {risks.map((item) => {
          const sev = SEVERITY_CONFIG[item.severity] || SEVERITY_CONFIG.medium;

          return (
            <div
              key={item.id}
              className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-sm space-y-3.5 hover:border-slate-700 transition text-xs"
            >
              {/* Category & Badges */}
              <div className="flex items-start justify-between gap-2 border-b border-slate-800 pb-2.5">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-rose-400">
                    Category: {item.category.replace("_", " ")}
                  </span>
                  <h4 className="text-sm font-bold text-white mt-0.5">
                    {item.risk}
                  </h4>
                </div>

                <div className="flex flex-col items-end space-y-1">
                  <span
                    className={`rounded px-2 py-0.5 text-[10px] font-bold uppercase border ${sev.bg} ${sev.text} ${sev.border}`}
                  >
                    {sev.label}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    Likelihood: <strong className="text-slate-300 capitalize">{item.likelihood}</strong>
                  </span>
                </div>
              </div>

              {/* Prevention Strategy */}
              <div className="rounded-xl bg-slate-950/60 p-3 border border-slate-800/80 space-y-1">
                <span className="text-[10px] font-bold uppercase text-emerald-400 flex items-center space-x-1">
                  <CheckCircle className="h-3 w-3" />
                  <span>Preventative Measure</span>
                </span>
                <p className="text-slate-300 text-xs leading-relaxed">
                  {item.prevention}
                </p>
              </div>

              {/* Actionable Contingency Plan */}
              <div className="rounded-xl bg-slate-950/60 p-3 border border-slate-800/80 space-y-1">
                <span className="text-[10px] font-bold uppercase text-amber-400 flex items-center space-x-1">
                  <AlertTriangle className="h-3 w-3" />
                  <span>Contingency Action Trigger</span>
                </span>
                <p className="text-slate-200 text-xs leading-relaxed font-medium">
                  {item.contingencyPlan}
                </p>
              </div>

              {/* Emergency Contact */}
              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                <span className="flex items-center space-x-1 text-slate-500 font-semibold">
                  <PhoneCall className="h-3 w-3 text-rose-400" />
                  <span>On-Call Contact:</span>
                </span>
                <span className="text-slate-200 font-semibold">{item.emergencyContact}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
