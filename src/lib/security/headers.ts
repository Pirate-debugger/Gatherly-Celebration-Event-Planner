/**
 * Gatherly - Security Headers and Request Defense Utilities
 *
 * Provides standard OWASP-recommended security headers, request body size limits,
 * Content-Type verification, origin checking, and client IP resolution.
 */

import { NextResponse } from "next/server";

export const SECURITY_HEADERS: Record<string, string> = {
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "X-DNS-Prefetch-Control": "on",
  "Strict-Transport-Security": "max-age=63072000; includeSubDomains; preload",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=(), browsing-topics=()",
  "Content-Security-Policy":
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://generativelanguage.googleapis.com;",
};

/**
 * Applies OWASP security headers to a NextResponse.
 */
export function applySecurityHeaders(res: NextResponse): NextResponse {
  for (const [key, value] of Object.entries(SECURITY_HEADERS)) {
    res.headers.set(key, value);
  }
  return res;
}

/**
 * Extracts client IP or proxy forwarded address for rate limiting.
 */
export function getClientIp(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  const realIp = req.headers.get("x-real-ip");
  if (realIp) {
    return realIp.trim();
  }
  return "127.0.0.1";
}

/**
 * Maximum permitted JSON request body payload size: 32 KB.
 */
export const MAX_REQUEST_BODY_BYTES = 32 * 1024;

/**
 * Validates request Content-Length header to prevent denial-of-service via large payloads.
 */
export function isRequestBodyWithinLimit(req: Request): boolean {
  const contentLength = req.headers.get("content-length");
  if (!contentLength) return true;
  const length = parseInt(contentLength, 10);
  if (isNaN(length)) return false;
  return length <= MAX_REQUEST_BODY_BYTES;
}

/**
 * Validates that incoming POST requests specify Content-Type: application/json.
 */
export function isJsonContentType(req: Request): boolean {
  const contentType = req.headers.get("content-type");
  if (!contentType) return false;
  return contentType.toLowerCase().includes("application/json");
}

/**
 * Checks if the request origin matches the request host or is an allowed development origin.
 */
export function isOriginAllowed(req: Request): boolean {
  const origin = req.headers.get("origin");
  if (!origin) {
    // Direct or same-origin programmatic requests without Origin header are permitted
    return true;
  }

  const host = req.headers.get("host");
  if (!host) return true;

  try {
    const originUrl = new URL(origin);
    // Allow matching host
    if (originUrl.host === host) return true;

    // Allow localhost/127.0.0.1 in non-production environments
    if (
      process.env.NODE_ENV !== "production" &&
      (originUrl.hostname === "localhost" || originUrl.hostname === "127.0.0.1")
    ) {
      return true;
    }

    return false;
  } catch {
    return false;
  }
}
