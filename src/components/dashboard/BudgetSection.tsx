"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  PlusCircle,
  Search,
  CheckCircle2,
  AlertTriangle,
  Trash2,
  X,
} from "lucide-react";
import {
  BudgetItem,
  BudgetSummary,
  BudgetCategory,
  CurrencyCode,
} from "@/types/event";
import {
  formatCurrency,
  CATEGORY_LABELS,
} from "@/lib/calculations/budget";

interface BudgetSectionProps {
  items: BudgetItem[];
  summary: BudgetSummary;
  totalBudget: number;
  currency: CurrencyCode;
  onUpdateItems: (updated: BudgetItem[]) => void;
}

const CATEGORY_COLORS: Record<BudgetCategory, string> = {
  venue_permits: "#8B5CF6", // Violet
  catering_beverages: "#10B981", // Emerald
  decoration_flowers: "#EC4899", // Pink
  photography_videography: "#3B82F6", // Blue
  entertainment: "#F59E0B", // Amber
  invitations_stationery: "#06B6D4", // Cyan
  transport_accommodation: "#6366F1", // Indigo
  staff_misc: "#64748B", // Slate
  contingency_reserve: "#EAB308", // Yellow / Gold
};

/**
 * Interactive Budget Section Component
 *
 * Renders budget overview cards, visual SVG donut allocation charts, category filters,
 * line item confirmation checkboxes, and custom expense management.
 *
 * @param props - BudgetSectionProps containing items, summary, currency, and update callback.
 * @returns React.JSX.Element
 */
export function BudgetSection({
  items,
  summary,
  currency,
  onUpdateItems,
}: BudgetSectionProps): React.JSX.Element {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newCategory, setNewCategory] = useState<BudgetCategory>("catering_beverages");
  const [newCost, setNewCost] = useState(500);
  const [newDescription, setNewDescription] = useState("");

  // Close modal on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isAddModalOpen) {
        setIsAddModalOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isAddModalOpen]);

  // Precompute SVG segments without mutating variables during JSX render
  const svgSegments = useMemo(() => {
    const activeCats = summary.categoryBreakdown.filter((cat) => cat.allocated > 0);
    const radius = 38;
    const circumference = 2 * Math.PI * radius;
    const segments: Array<{
      category: BudgetCategory;
      radius: number;
      strokeDasharray: string;
      strokeDashoffset: number;
    }> = [];

    let cumulative = 0;
    for (let i = 0; i < activeCats.length; i++) {
      const cat = activeCats[i];
      const strokeDasharray = `${(cat.percentageOfTotal / 100) * circumference} ${circumference}`;
      const strokeDashoffset = -((cumulative / 100) * circumference);
      cumulative += cat.percentageOfTotal;
      segments.push({
        category: cat.category,
        radius,
        strokeDasharray,
        strokeDashoffset,
      });
    }

    return segments;
  }, [summary.categoryBreakdown]);

  // Filtered items
  const filteredItems = items.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      categoryFilter === "all" || item.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  // Toggle confirmed status
  const handleToggleConfirmed = (id: string) => {
    const updated = items.map((item) => {
      if (item.id === id) {
        const nextConfirmed = !item.isConfirmed;
        return {
          ...item,
          isConfirmed: nextConfirmed,
          confirmedCost: nextConfirmed ? (item.confirmedCost || item.estimatedCost) : null,
        };
      }
      return item;
    });
    onUpdateItems(updated);
  };

  // Delete line item
  const handleDeleteItem = (id: string) => {
    const updated = items.filter((item) => item.id !== id);
    onUpdateItems(updated);
  };

  // Add custom line item
  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || newCost < 0) return;

    const newItem: BudgetItem = {
      id: `custom-b-${Date.now()}`,
      category: newCategory,
      name: newName.trim(),
      description: newDescription.trim(),
      estimatedCost: Math.max(0, Number(newCost)),
      confirmedCost: null,
      isConfirmed: false,
      isContingency: newCategory === "contingency_reserve",
      notes: "Custom organizer line item",
    };

    onUpdateItems([...items, newItem]);
    setIsAddModalOpen(false);
    setNewName("");
    setNewDescription("");
    setNewCost(500);
  };

  return (
    <div className="space-y-6">
      {/* Over-Budget Warning Banner */}
      {summary.isOverBudget && (
        <div
          role="alert"
          className="flex items-start space-x-3 rounded-xl border border-rose-500/50 bg-rose-950/40 p-4 text-rose-200 backdrop-blur-sm"
        >
          <AlertTriangle className="h-5 w-5 text-rose-400 shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-bold text-rose-300">
              Budget Warning: Allocated Costs Exceed Total Budget
            </h3>
            <p className="mt-1 text-xs text-rose-300/90 leading-relaxed">
              Your currently allocated expenses ({formatCurrency(summary.totalAllocated, currency)})
              exceed your specified total budget ({formatCurrency(summary.totalBudget, currency)}) by{" "}
              <strong className="text-white">
                {formatCurrency(summary.overBudgetAmount, currency)}
              </strong>
              . Review individual line items, negotiate vendor quotes, or draw from contingency.
            </p>
          </div>
        </div>
      )}

      {/* Visual Chart & Category Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* SVG Ring Donut Chart */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-sm flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center justify-between">
              <span>Category Allocation</span>
              <span className="text-xs font-normal text-slate-400">
                {summary.categoryBreakdown.filter((c) => c.allocated > 0).length} active categories
              </span>
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Visual proportion of your allocated celebration budget.
            </p>
          </div>

          {/* SVG Donut Visualizer */}
          <div className="relative flex items-center justify-center my-6">
            <svg
              role="img"
              className="w-48 h-48 -rotate-90 transform"
              viewBox="0 0 100 100"
              aria-label="Category allocation donut chart"
            >
              {/* Background track */}
              <circle
                cx="50"
                cy="50"
                r="38"
                fill="transparent"
                stroke="#1e293b"
                strokeWidth="12"
              />

              {/* Segments */}
              {svgSegments.map((seg) => (
                <circle
                  key={seg.category}
                  cx="50"
                  cy="50"
                  r={seg.radius}
                  fill="transparent"
                  stroke={CATEGORY_COLORS[seg.category] || "#8B5CF6"}
                  strokeWidth="12"
                  strokeDasharray={seg.strokeDasharray}
                  strokeDashoffset={seg.strokeDashoffset}
                  className="transition-all duration-500 hover:opacity-80"
                />
              ))}
            </svg>

            {/* Center Info */}
            <div className="absolute text-center">
              <span className="text-xs text-slate-400 block font-medium">Allocated</span>
              <span className="text-lg font-extrabold text-white">
                {formatCurrency(summary.totalAllocated, currency)}
              </span>
              <span className="text-[11px] text-emerald-400 block font-semibold">
                {summary.contingencyPercentage}% Reserve
              </span>
            </div>
          </div>

          {/* Legend Mini Grid */}
          <div className="grid grid-cols-2 gap-2 text-[11px] pt-3 border-t border-slate-800">
            {summary.categoryBreakdown
              .filter((c) => c.allocated > 0)
              .slice(0, 6)
              .map((c) => (
                <div key={c.category} className="flex items-center space-x-1.5 truncate">
                  <span
                    className="h-2.5 w-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: CATEGORY_COLORS[c.category] }}
                  />
                  <span className="text-slate-300 truncate">{c.label}</span>
                  <span className="text-slate-500 font-semibold">{c.percentageOfTotal}%</span>
                </div>
              ))}
          </div>
        </div>

        {/* Category Cards Overview */}
        <div className="lg:col-span-2 rounded-2xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white">Category Sub-Totals</h3>
            <span className="text-xs text-slate-400">
              Separates estimated vs confirmed quotes
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
            {summary.categoryBreakdown.map((cat) => (
              <div
                key={cat.category}
                className="rounded-xl border border-slate-800/80 bg-slate-850/60 p-3 text-xs space-y-1.5 hover:border-slate-700 transition"
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-200 flex items-center space-x-1.5">
                    <span
                      className="h-2 w-2 rounded-full"
                      style={{ backgroundColor: CATEGORY_COLORS[cat.category] }}
                    />
                    <span>{cat.label}</span>
                  </span>
                  <span className="text-[10px] text-slate-500 font-semibold">
                    {cat.count} items
                  </span>
                </div>

                <div className="flex justify-between items-baseline pt-1">
                  <span className="text-slate-400 text-[11px]">Allocated:</span>
                  <span className="text-sm font-bold text-white">
                    {formatCurrency(cat.allocated, currency)}
                  </span>
                </div>

                <div className="flex justify-between text-[10px] text-slate-500">
                  <span>Est: {formatCurrency(cat.estimated, currency)}</span>
                  <span>Conf: {formatCurrency(cat.confirmed, currency)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Line Items Table & Controls */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-sm space-y-4">
        {/* Table Toolbar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Search */}
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute inset-y-0 left-0 pl-3 my-auto h-4 w-4 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search expenses..."
              className="w-full rounded-lg border border-slate-800 bg-slate-950/80 pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
            />
          </div>

          {/* Category Filter & Add Item */}
          <div className="flex items-center space-x-2">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="rounded-lg border border-slate-800 bg-slate-950/80 px-2.5 py-1.5 text-xs text-slate-300 focus:border-violet-500"
            >
              <option value="all">All Categories</option>
              {Object.entries(CATEGORY_LABELS).map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={() => setIsAddModalOpen(true)}
              className="inline-flex items-center space-x-1.5 rounded-lg bg-violet-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-violet-500 transition shadow-sm"
            >
              <PlusCircle className="h-3.5 w-3.5" />
              <span>Add Expense</span>
            </button>
          </div>
        </div>

        {/* Responsive Table */}
        <div className="overflow-x-auto rounded-xl border border-slate-800">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-950/90 text-slate-400 border-b border-slate-800">
              <tr>
                <th scope="col" className="py-3 px-4 font-semibold">Expense Item</th>
                <th scope="col" className="py-3 px-3 font-semibold">Category</th>
                <th scope="col" className="py-3 px-3 font-semibold text-right">Estimated</th>
                <th scope="col" className="py-3 px-3 font-semibold text-right">Confirmed Quote</th>
                <th scope="col" className="py-3 px-3 font-semibold text-center">Status</th>
                <th scope="col" className="py-3 px-3 font-semibold text-center no-print">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 bg-slate-900/30">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500">
                    No budget items match your active filters.
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => (
                  <tr
                    key={item.id}
                    className={`hover:bg-slate-800/40 transition ${
                      item.isConfirmed ? "bg-emerald-950/10" : ""
                    }`}
                  >
                    {/* Name & Desc */}
                    <td className="py-3 px-4 max-w-xs">
                      <div className="font-semibold text-white flex items-center space-x-1.5">
                        <span>{item.name}</span>
                        {item.isContingency && (
                          <span className="rounded bg-amber-950/80 text-amber-300 text-[10px] px-1.5 py-0.2 border border-amber-800/60">
                            Reserve
                          </span>
                        )}
                      </div>
                      {item.description && (
                        <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">
                          {item.description}
                        </p>
                      )}
                    </td>

                    {/* Category */}
                    <td className="py-3 px-3 text-slate-300">
                      <span className="inline-flex items-center space-x-1 rounded bg-slate-800/80 px-2 py-0.5 text-[10px] font-medium text-slate-300 border border-slate-700/60">
                        <span
                          className="h-1.5 w-1.5 rounded-full"
                          style={{ backgroundColor: CATEGORY_COLORS[item.category] }}
                        />
                        <span>{CATEGORY_LABELS[item.category]}</span>
                      </span>
                    </td>

                    {/* Estimated Cost */}
                    <td className="py-3 px-3 text-right font-medium text-slate-200">
                      {formatCurrency(item.estimatedCost, currency)}
                    </td>

                    {/* Confirmed Cost */}
                    <td className="py-3 px-3 text-right">
                      {item.isConfirmed && item.confirmedCost !== null ? (
                        <span className="font-bold text-emerald-400">
                          {formatCurrency(item.confirmedCost, currency)}
                        </span>
                      ) : (
                        <span className="text-slate-500 italic text-[11px]">Pending quote</span>
                      )}
                    </td>

                    {/* Confirmed Toggle */}
                    <td className="py-3 px-3 text-center">
                      <button
                        type="button"
                        onClick={() => handleToggleConfirmed(item.id)}
                        className={`inline-flex items-center space-x-1 rounded-full px-2.5 py-0.5 text-[10px] font-semibold border transition ${
                          item.isConfirmed
                            ? "bg-emerald-950/80 border-emerald-500/60 text-emerald-300 hover:bg-emerald-900/80"
                            : "bg-slate-800/60 border-slate-700 text-slate-400 hover:border-slate-600 hover:text-slate-200"
                        }`}
                      >
                        {item.isConfirmed ? (
                          <>
                            <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                            <span>Confirmed</span>
                          </>
                        ) : (
                          <span>Mark Confirmed</span>
                        )}
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-3 text-center no-print">
                      <button
                        type="button"
                        onClick={() => handleDeleteItem(item.id)}
                        title="Delete expense"
                        aria-label={`Delete ${item.name}`}
                        className="rounded p-1 text-slate-500 hover:bg-rose-950/60 hover:text-rose-400 transition"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Custom Item Modal */}
      {isAddModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="budget-add-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm"
        >
          <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl text-left relative">
            <div className="flex items-center justify-between mb-1">
              <h3 id="budget-add-title" className="text-base font-bold text-white">
                Add Custom Expense
              </h3>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-slate-800"
                aria-label="Close add custom expense dialog"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="text-xs text-slate-400 mb-4">
              Create an additional line item to track custom celebration costs.
            </p>

            <form onSubmit={handleAddSubmit} className="space-y-4 text-xs">
              <div>
                <label htmlFor="budget-new-name" className="block font-semibold text-slate-300 mb-1">
                  Item Name *
                </label>
                <input
                  id="budget-new-name"
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Vintage Champagne Toast"
                  className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-white focus:border-violet-500"
                />
              </div>

              <div>
                <label htmlFor="budget-new-category" className="block font-semibold text-slate-300 mb-1">
                  Category *
                </label>
                <select
                  id="budget-new-category"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as BudgetCategory)}
                  className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-white focus:border-violet-500"
                >
                  {Object.entries(CATEGORY_LABELS).map(([k, v]) => (
                    <option key={k} value={k}>
                      {v}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="budget-new-cost" className="block font-semibold text-slate-300 mb-1">
                  Estimated Cost ({currency}) *
                </label>
                <input
                  id="budget-new-cost"
                  type="number"
                  min="0"
                  step="10"
                  required
                  value={newCost}
                  onChange={(e) => setNewCost(Math.max(0, parseFloat(e.target.value) || 0))}
                  className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-white focus:border-violet-500"
                />
              </div>

              <div>
                <label htmlFor="budget-new-notes" className="block font-semibold text-slate-300 mb-1">
                  Description / Notes
                </label>
                <input
                  id="budget-new-notes"
                  type="text"
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Optional details, vendor contact, or specifications"
                  className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-white focus:border-violet-500"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 font-medium text-slate-300 hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-violet-600 px-4 py-1.5 font-bold text-white hover:bg-violet-500 shadow-md"
                >
                  Add Line Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
