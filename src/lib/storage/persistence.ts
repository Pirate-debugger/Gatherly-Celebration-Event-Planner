/**
 * Gatherly - LocalStorage Persistence Engine
 *
 * Provides safe client-side persistence for active event plans.
 * Validates restored data using Zod to prevent crashes from malformed, tampered,
 * or outdated schema versions in browser storage.
 */

import { EventPlan } from "@/types/event";
import { EventPlanSchema } from "@/lib/validation/schemas";

export const STORAGE_KEY_PLAN = "gatherly_active_plan_v1";
export const STORAGE_KEY_META = "gatherly_plan_meta_v1";

export interface StorageMetadata {
  lastSavedAt: string;
  version: string;
  byteSize: number;
}

/**
 * Checks if browser LocalStorage is available and accessible.
 */
export function isStorageAvailable(): boolean {
  if (typeof window === "undefined" || !window.localStorage) {
    return false;
  }
  try {
    const testKey = "__gatherly_test__";
    window.localStorage.setItem(testKey, "1");
    window.localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}

/**
 * Saves the active event plan to LocalStorage with schema validation.
 */
export function savePlanToStorage(plan: EventPlan): boolean {
  if (!isStorageAvailable()) return false;

  try {
    const serialized = JSON.stringify(plan);
    window.localStorage.setItem(STORAGE_KEY_PLAN, serialized);

    const meta: StorageMetadata = {
      lastSavedAt: new Date().toISOString(),
      version: "1.0.0",
      byteSize: new Blob([serialized]).size,
    };
    window.localStorage.setItem(STORAGE_KEY_META, JSON.stringify(meta));
    return true;
  } catch (err) {
    console.warn("Gatherly: Failed to save plan to LocalStorage", err);
    return false;
  }
}

/**
 * Loads and validates the persisted event plan from LocalStorage.
 * Returns null if missing or schema validation fails.
 */
export function loadPlanFromStorage(): EventPlan | null {
  if (!isStorageAvailable()) return null;

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY_PLAN);
    if (!raw) return null;

    const parsed = JSON.parse(raw);
    const validation = EventPlanSchema.safeParse(parsed);

    if (!validation.success) {
      console.warn(
        "Gatherly: Corrupt or outdated plan in storage. Discarding invalid data.",
        validation.error.issues
      );
      return null;
    }

    return validation.data as EventPlan;
  } catch (err) {
    console.warn("Gatherly: Could not parse stored plan from LocalStorage", err);
    return null;
  }
}

/**
 * Clears saved plan and metadata from LocalStorage.
 */
export function clearStoredPlan(): void {
  if (!isStorageAvailable()) return;
  try {
    window.localStorage.removeItem(STORAGE_KEY_PLAN);
    window.localStorage.removeItem(STORAGE_KEY_META);
  } catch (err) {
    console.warn("Gatherly: Failed to clear LocalStorage", err);
  }
}

/**
 * Gets storage usage stats for diagnostics and the Settings modal.
 */
export function getStorageUsage(): { bytes: number; lastSaved: string | null } {
  if (!isStorageAvailable()) {
    return { bytes: 0, lastSaved: null };
  }

  try {
    const metaRaw = window.localStorage.getItem(STORAGE_KEY_META);
    if (!metaRaw) return { bytes: 0, lastSaved: null };

    const meta = JSON.parse(metaRaw) as StorageMetadata;
    return {
      bytes: meta.byteSize || 0,
      lastSaved: meta.lastSavedAt || null,
    };
  } catch {
    return { bytes: 0, lastSaved: null };
  }
}
