/**
 * Gatherly - In-Memory Sliding-Window Rate Limiter
 *
 * Enforces request throughput limits per IP/client token without external dependencies.
 * Automatically cleans up expired windows to guarantee bounded memory utilization.
 */

interface RateLimitEntry {
  timestamps: number[];
}

export class SlidingWindowRateLimiter {
  private store: Map<string, RateLimitEntry> = new Map();
  private readonly windowMs: number;
  private readonly maxRequests: number;
  private lastCleanup: number = Date.now();

  constructor(windowMs: number = 60000, maxRequests: number = 10) {
    this.windowMs = windowMs;
    this.maxRequests = maxRequests;
  }

  /**
   * Evaluates if a request from the given key is allowed under the rate limit.
   */
  public check(key: string): {
    allowed: boolean;
    remaining: number;
    resetMs: number;
    totalLimit: number;
  } {
    const now = Date.now();

    // Trigger cleanup periodically (every 2 minutes)
    if (now - this.lastCleanup > 120000) {
      this.cleanup(now);
    }

    const windowStart = now - this.windowMs;
    let entry = this.store.get(key);

    if (!entry) {
      entry = { timestamps: [] };
      this.store.set(key, entry);
    }

    // Filter out timestamps outside the sliding window
    entry.timestamps = entry.timestamps.filter((ts) => ts > windowStart);

    if (entry.timestamps.length >= this.maxRequests) {
      const oldestTimestamp = entry.timestamps[0];
      const resetMs = Math.max(0, oldestTimestamp + this.windowMs - now);
      return {
        allowed: false,
        remaining: 0,
        resetMs,
        totalLimit: this.maxRequests,
      };
    }

    // Add current timestamp
    entry.timestamps.push(now);
    const remaining = this.maxRequests - entry.timestamps.length;
    const resetMs = this.windowMs;

    return {
      allowed: true,
      remaining,
      resetMs,
      totalLimit: this.maxRequests,
    };
  }

  /**
   * Resets limit for a specific key (useful in tests).
   */
  public reset(key?: string): void {
    if (key) {
      this.store.delete(key);
    } else {
      this.store.clear();
    }
  }

  /**
   * Removes stale keys whose timestamps are all outside the active window.
   */
  private cleanup(now: number): void {
    this.lastCleanup = now;
    const windowStart = now - this.windowMs;
    for (const [key, entry] of this.store.entries()) {
      entry.timestamps = entry.timestamps.filter((ts) => ts > windowStart);
      if (entry.timestamps.length === 0) {
        this.store.delete(key);
      }
    }
  }
}

// Global singleton instance for the API router
export const globalRateLimiter = new SlidingWindowRateLimiter(60000, 10);
