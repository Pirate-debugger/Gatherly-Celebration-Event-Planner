"use client";

import React, { useState } from "react";
import {
  Users,
  Phone,
  Mail,
  HelpCircle,
  PlusCircle,
  Trash2,
  X,
} from "lucide-react";
import {
  VendorItem,
  VendorStatus,
  BudgetCategory,
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
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New Vendor Form State
  const [newRole, setNewRole] = useState("");
  const [newCategory, setNewCategory] = useState<BudgetCategory>("catering_beverages");
  const [newContactName, setNewContactName] = useState("");
  const [newContactEmail, setNewContactEmail] = useState("");
  const [newContactPhone, setNewContactPhone] = useState("");
  const [newEstimatedCost, setNewEstimatedCost] = useState("1500");
  const [newDepositAmount, setNewDepositAmount] = useState("500");
  const [newDepositDueDate, setNewDepositDueDate] = useState("");
  const [newPaymentReminder, setNewPaymentReminder] = useState("");
  const [newDescription, setNewDescription] = useState("");

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

  const handleDeleteVendor = (id: string) => {
    onUpdateVendors(vendors.filter((v) => v.id !== id));
  };

  const toggleQuestion = (vendorId: string, qIdx: number) => {
    const key = `${vendorId}-${qIdx}`;
    setCheckedQuestions((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRole.trim()) return;

    const estCost = Math.max(0, parseFloat(newEstimatedCost) || 0);
    const depAmt = newDepositAmount ? Math.max(0, parseFloat(newDepositAmount) || 0) : undefined;

    const newVendor: VendorItem = {
      id: `vendor-${Date.now()}`,
      category: newCategory,
      role: newRole.trim(),
      description: newDescription.trim() || `Dedicated supplier for ${newRole.trim()}`,
      requirements: ["Deliver signed agreement", "Fulfill celebration specification"],
      estimatedCost: estCost,
      confirmedCost: null,
      status: "researching",
      contactName: newContactName.trim() || undefined,
      contactEmail: newContactEmail.trim() || undefined,
      contactPhone: newContactPhone.trim() || undefined,
      depositAmount: depAmt,
      depositDueDate: newDepositDueDate.trim() || undefined,
      paymentReminder: newPaymentReminder.trim() || undefined,
      questionsToAsk: [
        "What is your cancellation and weather contingency policy?",
        "Are all staffing and setup fees included in this estimate?",
      ],
      alternativeOptions: [],
      bookingConfirmed: false,
    };

    onUpdateVendors([...vendors, newVendor]);
    setIsAddModalOpen(false);
    setNewRole("");
    setNewContactName("");
    setNewContactEmail("");
    setNewContactPhone("");
    setNewDescription("");
    setNewPaymentReminder("");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-bold text-white flex items-center space-x-2">
            <Users className="h-4 w-4 text-violet-400" />
            <span>Vendor Command Hub & Procurement Checklist</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Track contract milestones, deposit reminders, interview questions, and backup suppliers.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex items-center space-x-1.5 rounded-lg bg-violet-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-violet-500 transition shadow-sm self-start sm:self-auto"
        >
          <PlusCircle className="h-3.5 w-3.5" />
          <span>Add Custom Vendor</span>
        </button>
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

                <div className="flex items-center space-x-2">
                  {/* Status Dropdown */}
                  <select
                    value={vendor.status}
                    onChange={(e) => handleStatusChange(vendor.id, e.target.value as VendorStatus)}
                    aria-label={`Status for ${vendor.role}`}
                    className={`rounded-lg border px-2.5 py-1 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-violet-500 cursor-pointer ${statusConfig.bg} ${statusConfig.text} ${statusConfig.border}`}
                  >
                    <option value="researching">Researching</option>
                    <option value="contacted">Contacted</option>
                    <option value="quoted">Quote Received</option>
                    <option value="contract_signed">Contract Signed</option>
                    <option value="deposit_paid">Deposit Paid</option>
                    <option value="fully_paid">Fully Paid</option>
                  </select>

                  {/* Delete Button */}
                  <button
                    type="button"
                    onClick={() => handleDeleteVendor(vendor.id)}
                    title={`Delete ${vendor.role}`}
                    aria-label={`Delete ${vendor.role}`}
                    className="p-1 rounded text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
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

      {/* Add Vendor Modal */}
      {isAddModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200"
        >
          <div className="relative w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl text-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center space-x-2">
                <Users className="h-4 w-4 text-violet-400" />
                <span>Add Custom Vendor Partner</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2 sm:col-span-1">
                  <label className="block font-semibold text-slate-300 mb-1">
                    Vendor Role / Specialty *
                  </label>
                  <input
                    type="text"
                    required
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value)}
                    placeholder="e.g. Master Patisserie & Cake"
                    className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-white focus:border-violet-500"
                  />
                </div>

                <div className="col-span-2 sm:col-span-1">
                  <label className="block font-semibold text-slate-300 mb-1">
                    Budget Category *
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as BudgetCategory)}
                    className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-white focus:border-violet-500"
                  >
                    {Object.entries(CATEGORY_LABELS).map(([catKey, label]) => (
                      <option key={catKey} value={catKey}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">
                    Contact Name
                  </label>
                  <input
                    type="text"
                    value={newContactName}
                    onChange={(e) => setNewContactName(e.target.value)}
                    placeholder="e.g. Alice Chen"
                    className="w-full rounded-lg border border-slate-700 bg-slate-800 px-2.5 py-1.5 text-white focus:border-violet-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={newContactEmail}
                    onChange={(e) => setNewContactEmail(e.target.value)}
                    placeholder="orders@bakery.com"
                    className="w-full rounded-lg border border-slate-700 bg-slate-800 px-2.5 py-1.5 text-white focus:border-violet-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={newContactPhone}
                    onChange={(e) => setNewContactPhone(e.target.value)}
                    placeholder="(555) 234-5678"
                    className="w-full rounded-lg border border-slate-700 bg-slate-800 px-2.5 py-1.5 text-white focus:border-violet-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">
                    Estimated Cost ({currency}) *
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="50"
                    required
                    value={newEstimatedCost}
                    onChange={(e) => setNewEstimatedCost(e.target.value)}
                    className="w-full rounded-lg border border-slate-700 bg-slate-800 px-2.5 py-1.5 text-white focus:border-violet-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">
                    Deposit Amount ({currency})
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="50"
                    value={newDepositAmount}
                    onChange={(e) => setNewDepositAmount(e.target.value)}
                    className="w-full rounded-lg border border-slate-700 bg-slate-800 px-2.5 py-1.5 text-white focus:border-violet-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">
                    Deposit Due Date
                  </label>
                  <input
                    type="date"
                    value={newDepositDueDate}
                    onChange={(e) => setNewDepositDueDate(e.target.value)}
                    className="w-full rounded-lg border border-slate-700 bg-slate-800 px-2.5 py-1.5 text-white focus:border-violet-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Payment Reminder / Terms Note
                </label>
                <input
                  type="text"
                  value={newPaymentReminder}
                  onChange={(e) => setNewPaymentReminder(e.target.value)}
                  placeholder="e.g. 50% deposit upon contract, balance 14 days prior"
                  className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-white focus:border-violet-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Scope & Service Description
                </label>
                <textarea
                  rows={2}
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Describe scope, tasting notes, delivery logistics..."
                  className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-white focus:border-violet-500"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="rounded-lg px-3 py-1.5 text-slate-400 hover:bg-slate-800 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-violet-600 px-4 py-1.5 font-semibold text-white hover:bg-violet-500 transition shadow-md shadow-violet-600/30"
                >
                  Save Vendor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
