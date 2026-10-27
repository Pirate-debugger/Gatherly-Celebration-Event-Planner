/**
 * Gatherly - Pure Budget Calculations and Reconciliation Engine
 *
 * Implements integer minor-unit arithmetic (cents) to avoid floating-point inaccuracies.
 * Enforces non-negative values, maintains strict separation between estimated and confirmed costs,
 * and provides accurate reconciliation and over-budget detection.
 */

import {
  BudgetItem,
  BudgetSummary,
  BudgetCategory,
  CategorySummary,
  CurrencyCode,
} from "@/types/event";

export const CATEGORY_LABELS: Record<BudgetCategory, string> = {
  venue_permits: "Venue & Permits",
  catering_beverages: "Catering & Beverages",
  decoration_flowers: "Decoration & Flowers",
  photography_videography: "Photography & Videography",
  entertainment: "Entertainment & Music",
  invitations_stationery: "Invitations & Stationery",
  transport_accommodation: "Transport & Lodging",
  staff_misc: "Staff & Miscellaneous",
  contingency_reserve: "Contingency Reserve",
};

/**
 * Converts a decimal currency amount to integer minor units (e.g., cents).
 * Uses Math.round to avoid standard IEEE 754 floating-point inaccuracies.
 */
export function toMinorUnits(amount: number): number {
  if (typeof amount !== "number" || isNaN(amount)) return 0;
  // Ensure non-negative minor units
  const sanitized = Math.max(0, amount);
  return Math.round(sanitized * 100);
}

/**
 * Converts integer minor units back to decimal currency units.
 */
export function fromMinorUnits(minorUnits: number): number {
  if (typeof minorUnits !== "number" || isNaN(minorUnits)) return 0;
  return Math.round(minorUnits) / 100;
}

/**
 * Format currency with international standard and appropriate symbol/code.
 */
export function formatCurrency(
  amount: number,
  currency: CurrencyCode = "USD",
  locale: string = "en-US"
): string {
  const safeAmount = isNaN(amount) ? 0 : amount;
  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(safeAmount);
  } catch {
    return `${currency} ${safeAmount.toFixed(2)}`;
  }
}

/**
 * Recalculate complete budget summary from line items and user total budget.
 *
 * Integrity rules:
 * 1. Total estimated = sum of estimated costs (in minor units)
 * 2. Total confirmed = sum of confirmed costs for items where isConfirmed is true
 * 3. Total allocated = sum of confirmedCost if item is confirmed, else estimatedCost
 * 4. Contingency reserve = items flagged as isContingency or category "contingency_reserve"
 * 5. Remaining = total budget - total allocated (can be negative if over budget)
 * 6. Over budget flag and over budget amount are accurately calculated.
 */
export function calculateBudgetSummary(
  items: BudgetItem[],
  totalBudget: number,
  currency: CurrencyCode = "USD"
): BudgetSummary {
  const safeTotalBudget = Math.max(0, Number(totalBudget) || 0);
  const budgetMinor = toMinorUnits(safeTotalBudget);

  let totalEstimatedMinor = 0;
  let totalConfirmedMinor = 0;
  let totalAllocatedMinor = 0;
  let contingencyMinor = 0;

  // Group by category in minor units
  const categoryMap = new Map<
    BudgetCategory,
    { estimated: number; confirmed: number; allocated: number; count: number }
  >();

  // Initialize all known categories so breakdowns are deterministic
  const allCategories: BudgetCategory[] = [
    "venue_permits",
    "catering_beverages",
    "decoration_flowers",
    "photography_videography",
    "entertainment",
    "invitations_stationery",
    "transport_accommodation",
    "staff_misc",
    "contingency_reserve",
  ];

  for (const cat of allCategories) {
    categoryMap.set(cat, { estimated: 0, confirmed: 0, allocated: 0, count: 0 });
  }

  for (const item of items) {
    // Validate non-negative cost
    const estMinor = toMinorUnits(item.estimatedCost);
    const confMinor =
      item.isConfirmed && item.confirmedCost !== null
        ? toMinorUnits(item.confirmedCost)
        : null;

    totalEstimatedMinor += estMinor;

    if (confMinor !== null) {
      totalConfirmedMinor += confMinor;
      totalAllocatedMinor += confMinor;
    } else {
      totalAllocatedMinor += estMinor;
    }

    if (item.isContingency || item.category === "contingency_reserve") {
      contingencyMinor += confMinor !== null ? confMinor : estMinor;
    }

    const catData = categoryMap.get(item.category) || {
      estimated: 0,
      confirmed: 0,
      allocated: 0,
      count: 0,
    };

    catData.estimated += estMinor;
    if (confMinor !== null) {
      catData.confirmed += confMinor;
      catData.allocated += confMinor;
    } else {
      catData.allocated += estMinor;
    }
    catData.count += 1;

    categoryMap.set(item.category, catData);
  }

  const remainingMinor = budgetMinor - totalAllocatedMinor;
  const isOverBudget = remainingMinor < 0;
  const overBudgetMinor = isOverBudget ? Math.abs(remainingMinor) : 0;

  // Calculate contingency percentage against total budget
  const contingencyPercentage =
    budgetMinor > 0 ? Math.round((contingencyMinor / budgetMinor) * 1000) / 10 : 0;

  // Build category breakdown
  const categoryBreakdown: CategorySummary[] = allCategories.map((cat) => {
    const data = categoryMap.get(cat)!;
    const catAllocated = fromMinorUnits(data.allocated);
    const percentage =
      totalAllocatedMinor > 0
        ? Math.round((data.allocated / totalAllocatedMinor) * 1000) / 10
        : 0;

    return {
      category: cat,
      label: CATEGORY_LABELS[cat],
      estimated: fromMinorUnits(data.estimated),
      confirmed: fromMinorUnits(data.confirmed),
      allocated: catAllocated,
      count: data.count,
      percentageOfTotal: percentage,
    };
  });

  return {
    totalBudget: fromMinorUnits(budgetMinor),
    totalEstimated: fromMinorUnits(totalEstimatedMinor),
    totalConfirmed: fromMinorUnits(totalConfirmedMinor),
    totalAllocated: fromMinorUnits(totalAllocatedMinor),
    contingencyAmount: fromMinorUnits(contingencyMinor),
    contingencyPercentage,
    remainingBudget: fromMinorUnits(remainingMinor),
    isOverBudget,
    overBudgetAmount: fromMinorUnits(overBudgetMinor),
    currency,
    categoryBreakdown,
  };
}

/**
 * Rebalance or normalize budget items to match a specific target budget while maintaining
 * realistic category ratios. Used during plan generation and budget resets.
 */
export function reconcileBudgetItems(
  items: BudgetItem[],
  targetBudget: number
): BudgetItem[] {
  if (items.length === 0 || targetBudget <= 0) return items;

  const currentSummary = calculateBudgetSummary(items, targetBudget);
  if (currentSummary.totalAllocated === 0) return items;

  // If already matches within minor unit tolerance, return as-is
  const currentAllocatedMinor = toMinorUnits(currentSummary.totalAllocated);
  const targetBudgetMinor = toMinorUnits(targetBudget);

  if (Math.abs(currentAllocatedMinor - targetBudgetMinor) <= 100) {
    return items;
  }

  const ratio = targetBudgetMinor / currentAllocatedMinor;

  let allocatedRunningMinor = 0;
  const updatedItems = items.map((item, index) => {
    // Keep confirmed costs intact if set
    if (item.isConfirmed && item.confirmedCost !== null) {
      allocatedRunningMinor += toMinorUnits(item.confirmedCost);
      return item;
    }

    const currentEstMinor = toMinorUnits(item.estimatedCost);
    let newEstMinor = Math.round(currentEstMinor * ratio);

    // Ensure last item absorbs any rounding difference
    if (index === items.length - 1) {
      const diff = targetBudgetMinor - (allocatedRunningMinor + newEstMinor);
      newEstMinor = Math.max(0, newEstMinor + diff);
    }

    allocatedRunningMinor += newEstMinor;

    return {
      ...item,
      estimatedCost: fromMinorUnits(newEstMinor),
    };
  });

  return updatedItems;
}
