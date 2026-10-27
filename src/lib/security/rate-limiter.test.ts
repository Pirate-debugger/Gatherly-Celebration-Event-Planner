import { describe, it, expect, beforeEach } from "vitest";
import { SlidingWindowRateLimiter } from "./rate-limiter";

describe("SlidingWindowRateLimiter", () => {
  let limiter: SlidingWindowRateLimiter;

  beforeEach(() => {
    // 1-second window, max 3 requests for fast unit testing
    limiter = new SlidingWindowRateLimiter(1000, 3);
  });

  it("permits requests within the defined threshold", () => {
    const r1 = limiter.check("ip-1");
    expect(r1.allowed).toBe(true);
    expect(r1.remaining).toBe(2);

    const r2 = limiter.check("ip-1");
    expect(r2.allowed).toBe(true);
    expect(r2.remaining).toBe(1);

    const r3 = limiter.check("ip-1");
    expect(r3.allowed).toBe(true);
    expect(r3.remaining).toBe(0);
  });

  it("blocks requests that exceed the limit within window", () => {
    limiter.check("ip-blocked");
    limiter.check("ip-blocked");
    limiter.check("ip-blocked");

    // 4th request exceeds max 3
    const r4 = limiter.check("ip-blocked");
    expect(r4.allowed).toBe(false);
    expect(r4.remaining).toBe(0);
    expect(r4.resetMs).toBeGreaterThan(0);
  });

  it("isolates rate limits per client key", () => {
    limiter.check("client-a");
    limiter.check("client-a");
    limiter.check("client-a");
    expect(limiter.check("client-a").allowed).toBe(false);

    // Client B should still be allowed
    const rB = limiter.check("client-b");
    expect(rB.allowed).toBe(true);
    expect(rB.remaining).toBe(2);
  });
});
