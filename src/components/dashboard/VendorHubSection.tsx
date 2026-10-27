"use client";

import React, { useState } from "react";
import {
  Users,
  Phone,
  Mail,
  HelpCircle,
} from "lucide-react";
import {
  VendorItem,
  VendorStatus,
  CurrencyCode,
} from "@/types/event";
import { formatCurrency, CATEGORY_LABELS } from "@/lib/calculations/budget";

interface VendorHubSectionProps {
  vendors: VendorItem[];
  currency: CurrencyCode;
  onUpdateVendors: (updated: VendorItem[]) => void;
}

const STATUS_LABELS: Record<
  VendorStatus,
  { label: string; bg: string; text: string; border: string }
> = {
  researching: {
    label: "Researching",
    bg: "bg-slate-800",
    text: "text-slate-300",
    border: "border-slate-700",
  },
  contacted: {
    label: "Contacted",
    bg: "bg-blue-950/70",
    text: "text-blue-300",
    border: "border-blue-800/60",
  },
  quoted: {
    label: "Quote Received",
    bg: "bg-indigo-950/70",
    text: "text-indigo-300",
    border: "border-indigo-800/60",
  },
  contract_signed: {
    label: "Contract Signed",
    bg: "bg-violet-950/70",
    text: "text-violet-300",
    border: "border-violet-800/60",
  },
  deposit_paid: {
    label: "Deposit Paid",
    bg: "bg-amber-950/70",
    text: "text-amber-300",
    border: "border-amber-800/60",
  },
  fully_paid: {
    label: "Fully Paid & Confirmed",
    bg: "bg-emerald-950/70",
    text: "text-emerald-300",
    border: "border-emerald-800/60",
  },
};

export function VendorHubSection({
  vendors,
  currency,
  onUpdateVendors,
}: VendorHubSectionProps) {
  const [checkedQuestions, setCheckedQuestions] = useState<Record<string, boolean>>({});

  const handleStatusChange = (id: string, newStatus: VendorStatus) => {
    const isConfirmed =
      newStatus === "contract_signed" ||
      newStatus === "deposit_paid" ||
      newStatus === "fully_paid";

    const updated = vendors.map((v) => {
      if (v.id === id) {
        return {
          ...v,
          status: newStatus,
          bookingConfirmed: isConfirmed,
        };
      }
      return v;
    });
    onUpdateVendors(updated);
  };

  const toggleQuestion = (vendorId: string, qIdx: number) => {
    const key = `${vendorId}-${qIdx}`;
    setCheckedQuestions((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-bold text-white flex items-center space-x-2">
          <Users className="h-4 w-4 text-violet-400" />
          <span>Vendor Command Hub & Procurement Checklist</span>
        </h3>
        <p className="text-xs text-slate-400 mt-0.5">
          Track contract milestones, deposit reminders, interview questions, and backup suppliers.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {vendors.map((vendor) => {
          const statusConfig = STATUS_LABELS[vendor.status] || STATUS_LABELS.researching;

          return (
            <div
              key={vendor.id}
              className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-sm space-y-4 hover:border-slate-700 transition text-xs"
            >
              {/* Header: Role & Category */}
              <div className="flex items-start justify-between gap-3 border-b border-slate-800 pb-3">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-violet-400">
                    {CATEGORY_LABELS[vendor.category] || vendor.category}
                  </span>
                  <h4 className="text-base font-bold text-white mt-0.5">
                    {vendor.role}
                  </h4>
                  {vendor.contactName && (
                    <p className="text-slate-400 text-xs mt-0.5 font-medium">
                      Contact: {vendor.contactName}
                    </p>
                  )}
                </div>

                {/* Status Dropdown */}
                <select
                  value={vendor.status}
                  onChange={(e) => handleStatusChange(vendor.id, e.target.value as VendorStatus)}
                  className={`rounded-lg border px-2.5 py-1 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-violet-500 cursor-pointer ${statusConfig.bg} ${statusConfig.text} ${statusConfig.border}`}
                >
                  <option value="researching">Researching</option>
                  <option value="contacted">Contacted</option>
                  <option value="quoted">Quote Received</option>
                  <option value="contract_signed">Contract Signed</option>
                  <option value="deposit_paid">Deposit Paid</option>
                  <option value="fully_paid">Fully Paid</option>
                </select>
              </div>

              {/* Description */}
              {vendor.description && (
                <p className="text-slate-300 leading-relaxed">
                  {vendor.description}
                </p>
              )}

              {/* Contact Information & Reminders */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 rounded-xl bg-slate-950/60 p-3 border border-slate-800/80 text-[11px]">
                <div>
                  <span className="text-slate-500 block font-semibold text-[10px] uppercase">
                    Financial Terms
                  </span>
                  <span className="font-bold text-slate-200">
                    Est: {formatCurrency(vendor.estimatedCost, currency)}
                  </span>
                  {vendor.depositAmount && (
                    <span className="text-amber-400 block mt-0.5">
                      Deposit: {formatCurrency(vendor.depositAmount, currency)}
                    </span>
                  )}
                </div>

                <div>
                  <span className="text-slate-500 block font-semibold text-[10px] uppercase">
                    Deposit & Payment Reminders
                  </span>
                  {vendor.depositDueDate && (
                    <span className="text-slate-300 block">Due: {vendor.depositDueDate}</span>
                  )}
                  {vendor.paymentReminder && (
                    <span className="text-slate-400 italic block line-clamp-1">
                      {vendor.paymentReminder}
                    </span>
                  )}
                </div>

                {/* Contact links */}
                {(vendor.contactEmail || vendor.contactPhone) && (
                  <div className="sm:col-span-2 pt-2 border-t border-slate-800/80 flex flex-wrap gap-3 text-slate-400">
                    {vendor.contactEmail && (
                      <span className="flex items-center space-x-1">
                        <Mail className="h-3 w-3 text-violet-400" />
                        <span className="text-slate-300">{vendor.contactEmail}</span>
                      </span>
                    )}
                    {vendor.contactPhone && (
                      <span className="flex items-center space-x-1">
                        <Phone className="h-3 w-3 text-emerald-400" />
                        <span className="text-slate-300">{vendor.contactPhone}</span>
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Questions to Ask */}
              {vendor.questionsToAsk.length > 0 && (
                <div className="space-y-1.5">
                  <h5 className="font-semibold text-slate-300 flex items-center space-x-1">
                    <HelpCircle className="h-3.5 w-3.5 text-indigo-400" />
                    <span>Interview & Vetting Checklist</span>
                  </h5>
                  <div className="space-y-1">
                    {vendor.questionsToAsk.map((q, idx) => {
                      const isChecked = Boolean(checkedQuestions[`${vendor.id}-${idx}`]);
                      return (
                        <div
                          key={idx}
                          onClick={() => toggleQuestion(vendor.id, idx)}
                          role="checkbox"
                          aria-checked={isChecked}
                          tabIndex={0}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              e.preventDefault();
                              toggleQuestion(vendor.id, idx);
                            }
                          }}
                          className={`flex items-start space-x-2 p-1.5 rounded cursor-pointer transition ${
                            isChecked
                              ? "bg-emerald-950/30 text-slate-400"
                              : "hover:bg-slate-800/40 text-slate-300"
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => {}}
                            className="mt-0.5 rounded border-slate-700 bg-slate-800 text-violet-600 focus:ring-0 cursor-pointer"
                          />
                          <span className={`text-[11px] leading-tight ${isChecked ? "line-through" : ""}`}>
                            {q}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Alternative Options */}
              {vendor.alternativeOptions.length > 0 && (
                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                  <span className="font-semibold text-slate-500">Backup Alternatives:</span>
                  <span className="text-slate-300">{vendor.alternativeOptions.join(", ")}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
