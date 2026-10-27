"use client";

import React from "react";
import { EventPlan } from "@/types/event";
import { formatCurrency } from "@/lib/calculations/budget";

interface PrintViewProps {
  plan: EventPlan;
}

export function PrintView({ plan }: PrintViewProps) {
  const { userPreferences, overview, budgetSummary, budgetItems, itinerary, vendors, risks } = plan;

  return (
    <div className="hidden print:block p-8 bg-white text-black font-sans max-w-4xl mx-auto print:max-w-none text-xs leading-normal">
      {/* Title Header */}
      <div className="border-b-2 border-black pb-4 mb-6 flex justify-between items-baseline">
        <div>
          <h1 className="text-2xl font-bold uppercase tracking-tight text-black">
            {userPreferences.title}
          </h1>
          <p className="text-sm font-semibold text-gray-700 mt-1">
            Official Celebration & Event Blueprint • Gatherly Planning System
          </p>
        </div>
        <div className="text-right">
          <p className="font-bold text-base">{userPreferences.date}</p>
          <p className="text-gray-600">{userPreferences.location} ({userPreferences.venueType})</p>
        </div>
      </div>

      {/* Overview Block */}
      <div className="card-print p-4 mb-6">
        <h2 className="text-sm font-bold uppercase border-b border-gray-300 pb-1 mb-2">
          1. Executive Overview & Concept
        </h2>
        <p className="mb-2"><strong>Concept:</strong> {overview.eventConcept}</p>
        <p className="mb-2"><strong>Atmosphere & Styling:</strong> {overview.recommendedAtmosphere}</p>
        <p className="mb-2"><strong>Guest Strategy:</strong> {overview.guestExperienceStrategy}</p>
        <div className="grid grid-cols-2 gap-4 mt-3 pt-2 border-t border-gray-200">
          <div>
            <strong>Target Attendance:</strong> {userPreferences.guestCount} Guests ({userPreferences.durationHours} Hours)
          </div>
          <div>
            <strong>Total Reconciled Budget:</strong> {formatCurrency(budgetSummary.totalBudget, budgetSummary.currency)}
          </div>
        </div>
      </div>

      {/* Budget Summary Table */}
      <div className="card-print p-4 mb-6">
        <h2 className="text-sm font-bold uppercase border-b border-gray-300 pb-1 mb-2">
          2. Master Budget Reconciliation ({budgetSummary.currency})
        </h2>
        <table className="w-full text-left border border-gray-300 text-xs mb-3">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-1.5 border border-gray-300">Category</th>
              <th className="p-1.5 border border-gray-300 text-right">Allocated Cost</th>
              <th className="p-1.5 border border-gray-300 text-right">Items Count</th>
              <th className="p-1.5 border border-gray-300 text-right">% of Total</th>
            </tr>
          </thead>
          <tbody>
            {budgetSummary.categoryBreakdown.map((cat) => (
              <tr key={cat.category}>
                <td className="p-1.5 border border-gray-300 font-medium">{cat.label}</td>
                <td className="p-1.5 border border-gray-300 text-right font-mono">
                  {formatCurrency(cat.allocated, budgetSummary.currency)}
                </td>
                <td className="p-1.5 border border-gray-300 text-right">{cat.count}</td>
                <td className="p-1.5 border border-gray-300 text-right">{cat.percentageOfTotal}%</td>
              </tr>
            ))}
          </tbody>
          <tfoot className="bg-gray-100 font-bold">
            <tr>
              <td className="p-1.5 border border-gray-300">Total Allocated</td>
              <td className="p-1.5 border border-gray-300 text-right font-mono">
                {formatCurrency(budgetSummary.totalAllocated, budgetSummary.currency)}
              </td>
              <td className="p-1.5 border border-gray-300 text-right">{budgetItems.length}</td>
              <td className="p-1.5 border border-gray-300 text-right">100%</td>
            </tr>
          </tfoot>
        </table>
        <p className="text-[11px] text-gray-700">
          Contingency Reserve: {formatCurrency(budgetSummary.contingencyAmount, budgetSummary.currency)} ({budgetSummary.contingencyPercentage}%). Remaining Balance: {formatCurrency(budgetSummary.remainingBudget, budgetSummary.currency)}.
        </p>
      </div>

      {/* Page break for itinerary and timeline */}
      <div className="page-break" />

      {/* Day of Itinerary */}
      <div className="card-print p-4 mb-6">
        <h2 className="text-sm font-bold uppercase border-b border-gray-300 pb-1 mb-2">
          3. Day-of-Event Master Run of Show ({userPreferences.date})
        </h2>
        <table className="w-full text-left border border-gray-300 text-xs">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-1.5 border border-gray-300 w-28">Time Slot</th>
              <th className="p-1.5 border border-gray-300">Activity / Segment</th>
              <th className="p-1.5 border border-gray-300">Location</th>
              <th className="p-1.5 border border-gray-300">Lead Responsible</th>
            </tr>
          </thead>
          <tbody>
            {itinerary.map((it) => (
              <tr key={it.id}>
                <td className="p-1.5 border border-gray-300 font-mono font-bold">
                  {it.time} {it.endTime ? `– ${it.endTime}` : ""}
                </td>
                <td className="p-1.5 border border-gray-300">
                  <span className="font-semibold">{it.activity}</span>
                  {it.notes && <p className="text-[10px] text-gray-600 italic">{it.notes}</p>}
                </td>
                <td className="p-1.5 border border-gray-300">{it.location}</td>
                <td className="p-1.5 border border-gray-300 font-medium">{it.responsible}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Vendor Directory */}
      <div className="card-print p-4 mb-6">
        <h2 className="text-sm font-bold uppercase border-b border-gray-300 pb-1 mb-2">
          4. Vendor Directory & Contact Roster
        </h2>
        <table className="w-full text-left border border-gray-300 text-xs">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-1.5 border border-gray-300">Role / Category</th>
              <th className="p-1.5 border border-gray-300">Contact Person</th>
              <th className="p-1.5 border border-gray-300">Email & Phone</th>
              <th className="p-1.5 border border-gray-300 text-right">Est. Cost</th>
              <th className="p-1.5 border border-gray-300">Status</th>
            </tr>
          </thead>
          <tbody>
            {vendors.map((v) => (
              <tr key={v.id}>
                <td className="p-1.5 border border-gray-300 font-semibold">{v.role}</td>
                <td className="p-1.5 border border-gray-300">{v.contactName || "—"}</td>
                <td className="p-1.5 border border-gray-300">
                  {v.contactPhone || ""} {v.contactEmail ? `(${v.contactEmail})` : ""}
                </td>
                <td className="p-1.5 border border-gray-300 text-right font-mono">
                  {formatCurrency(v.estimatedCost, budgetSummary.currency)}
                </td>
                <td className="p-1.5 border border-gray-300 uppercase text-[10px] font-bold">
                  {v.status.replace("_", " ")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Emergency & Risk Contacts */}
      <div className="card-print p-4">
        <h2 className="text-sm font-bold uppercase border-b border-gray-300 pb-1 mb-2">
          5. Emergency Contacts & Critical Contingencies
        </h2>
        <div className="grid grid-cols-2 gap-3 text-xs">
          {risks.map((r) => (
            <div key={r.id} className="border border-gray-300 p-2 rounded">
              <strong className="block text-black uppercase text-[10px]">{r.category}: {r.risk}</strong>
              <p className="text-[11px] mt-0.5"><strong>Plan:</strong> {r.contingencyPlan}</p>
              <p className="text-[11px] text-gray-700 mt-1"><strong>Emergency:</strong> {r.emergencyContact}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
