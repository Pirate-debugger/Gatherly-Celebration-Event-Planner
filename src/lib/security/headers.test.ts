import { describe, it, expect } from "vitest";
import { NextResponse } from "next/server";
import {
  SECURITY_HEADERS,
  applySecurityHeaders,
  getClientIp,
  isRequestBodyWithinLimit,
  isJsonContentType,
  isOriginAllowed,
  MAX_REQUEST_BODY_BYTES,
} from "./headers";

describe("Security Headers & Defense Utilities", () => {
  describe("SECURITY_HEADERS and applySecurityHeaders", () => {
    it("includes OWASP recommended security headers", () => {
      expect(SECURITY_HEADERS["X-Content-Type-Options"]).toBe("nosniff");
      expect(SECURITY_HEADERS["X-Frame-Options"]).toBe("DENY");
      expect(SECURITY_HEADERS["Referrer-Policy"]).toBe("strict-origin-when-cross-origin");
      expect(SECURITY_HEADERS["X-Permitted-Cross-Domain-Policies"]).toBe("none");
      expect(SECURITY_HEADERS["Cross-Origin-Opener-Policy"]).toBe("same-origin");
      expect(SECURITY_HEADERS["Cross-Origin-Resource-Policy"]).toBe("same-origin");
      expect(SECURITY_HEADERS["Content-Security-Policy"]).toContain("default-src 'self'");
    });

    it("applies headers to a NextResponse", () => {
      const res = NextResponse.json({ ok: true });
      applySecurityHeaders(res);

      expect(res.headers.get("X-Content-Type-Options")).toBe("nosniff");
      expect(res.headers.get("X-Frame-Options")).toBe("DENY");
      expect(res.headers.get("X-Permitted-Cross-Domain-Policies")).toBe("none");
    });
  });

  describe("getClientIp", () => {
    it("extracts and validates clean IP from x-forwarded-for header", () => {
      const req = new Request("http://localhost:3000", {
        headers: { "x-forwarded-for": "203.0.113.195, 70.41.3.18" },
      });
      expect(getClientIp(req)).toBe("203.0.113.195");
    });

    it("falls back to x-real-ip if x-forwarded-for is absent", () => {
      const req = new Request("http://localhost:3000", {
        headers: { "x-real-ip": "198.51.100.4" },
      });
      expect(getClientIp(req)).toBe("198.51.100.4");
    });

    it("falls back to 127.0.0.1 if headers contain malicious injection or invalid chars", () => {
      const req = new Request("http://localhost:3000", {
        headers: { "x-forwarded-for": "invalid<script>alert(1)</script>" },
      });
      expect(getClientIp(req)).toBe("127.0.0.1");
    });

    it("returns default 127.0.0.1 when no IP headers are present", () => {
      const req = new Request("http://localhost:3000");
      expect(getClientIp(req)).toBe("127.0.0.1");
    });
  });

  describe("isRequestBodyWithinLimit", () => {
    it("allows requests without content-length header", () => {
      const req = new Request("http://localhost:3000");
      expect(isRequestBodyWithinLimit(req)).toBe(true);
    });

    it("allows requests under the 32KB payload limit", () => {
      const req = new Request("http://localhost:3000", {
        headers: { "content-length": "1024" },
      });
      expect(isRequestBodyWithinLimit(req)).toBe(true);
    });

    it("rejects requests exceeding the 32KB payload limit", () => {
      const req = new Request("http://localhost:3000", {
        headers: { "content-length": String(MAX_REQUEST_BODY_BYTES + 500) },
      });
      expect(isRequestBodyWithinLimit(req)).toBe(false);
    });

    it("rejects non-numeric content-length headers", () => {
      const req = new Request("http://localhost:3000", {
        headers: { "content-length": "invalid-bytes" },
      });
      expect(isRequestBodyWithinLimit(req)).toBe(false);
    });
  });

  describe("isJsonContentType", () => {
    it("accepts application/json", () => {
      const req = new Request("http://localhost:3000", {
        headers: { "content-type": "application/json" },
      });
      expect(isJsonContentType(req)).toBe(true);
    });

    it("accepts application/json with charset", () => {
      const req = new Request("http://localhost:3000", {
        headers: { "content-type": "application/json; charset=utf-8" },
      });
      expect(isJsonContentType(req)).toBe(true);
    });

    it("rejects missing or non-json content-type", () => {
      const req1 = new Request("http://localhost:3000");
      expect(isJsonContentType(req1)).toBe(false);

      const req2 = new Request("http://localhost:3000", {
        headers: { "content-type": "text/html" },
      });
      expect(isJsonContentType(req2)).toBe(false);
    });
  });

  describe("isOriginAllowed", () => {
    it("permits request when origin header is omitted", () => {
      const req = new Request("http://localhost:3000");
      expect(isOriginAllowed(req)).toBe(true);
    });

    it("permits request when origin matches request host", () => {
      const req = new Request("http://gatherly.app", {
        headers: {
          origin: "https://gatherly.app",
          host: "gatherly.app",
        },
      });
      expect(isOriginAllowed(req)).toBe(true);
    });

    it("rejects malformed origin URL", () => {
      const req = new Request("http://gatherly.app", {
        headers: {
          origin: "not-a-valid-url",
          host: "gatherly.app",
        },
      });
      expect(isOriginAllowed(req)).toBe(false);
    });
  });
});
