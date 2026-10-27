/**
 * Gatherly - Security Headers and Request Defense Utilities
 *
 * Provides standard OWASP-recommended security headers, request body size limits,
 * and client IP resolution.
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
