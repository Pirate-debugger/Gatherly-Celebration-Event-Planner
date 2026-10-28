/**
 * Gatherly - Security Headers and Request Defense Utilities
 *
 * Provides standard OWASP-recommended security headers, request body size limits,
 * Content-Type verification, origin checking, and client IP resolution.
 */

import { NextResponse } from "next/server";

/**
 * Standard OWASP and Mozilla Observatory recommended security headers.
 * Eliminates unsafe-eval, restricts frame-ancestors, blocks object plugins,
 * and sets strict transport security.
 */
export const SECURITY_HEADERS: Readonly<Record<string, string>> = Object.freeze({
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "X-DNS-Prefetch-Control": "on",
  "Strict-Transport-Security": "max-age=63072000; includeSubDomains; preload",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=(), browsing-topics=()",
  "X-Permitted-Cross-Domain-Policies": "none",
  "Cross-Origin-Opener-Policy": "same-origin",
  "Cross-Origin-Resource-Policy": "same-origin",
  "Content-Security-Policy":
    "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://generativelanguage.googleapis.com; frame-ancestors 'none'; base-uri 'self'; form-action 'self'; object-src 'none';",
});

/**
 * Applies OWASP security headers to a NextResponse.
 *
 * @param res - The NextResponse object to enhance.
 * @returns The enhanced NextResponse with security headers.
 */
export function applySecurityHeaders(res: NextResponse): NextResponse {
  for (const [key, value] of Object.entries(SECURITY_HEADERS)) {
    res.headers.set(key, value);
  }
  return res;
}

/**
 * Regex pattern to validate clean IPv4 or IPv6 format.
 */
const IP_REGEX = /^([0-9a-fA-F:.]+)$/;

/**
 * Extracts client IP or proxy forwarded address for rate limiting.
 * Validates format to prevent IP header injection or spoofing.
 *
 * @param req - The incoming Request object.
 * @returns Clean client IP address string.
 */
export function getClientIp(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    const rawIp = forwarded.split(",")[0].trim();
    if (IP_REGEX.test(rawIp)) {
      return rawIp;
    }
  }
  const realIp = req.headers.get("x-real-ip");
  if (realIp) {
    const cleanReal = realIp.trim();
    if (IP_REGEX.test(cleanReal)) {
      return cleanReal;
    }
  }
  return "127.0.0.1";
}

/**
 * Maximum permitted JSON request body payload size: 32 KB.
 */
export const MAX_REQUEST_BODY_BYTES = 32 * 1024;

/**
 * Validates request Content-Length header to prevent denial-of-service via large payloads.
 *
 * @param req - The incoming Request object.
 * @returns True if payload is within limit, false otherwise.
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
 *
 * @param req - The incoming Request object.
 * @returns True if Content-Type includes application/json.
 */
export function isJsonContentType(req: Request): boolean {
  const contentType = req.headers.get("content-type");
  if (!contentType) return false;
  return contentType.toLowerCase().includes("application/json");
}

/**
 * Checks if the request origin matches the request host or is an allowed development origin.
 * Defends against cross-origin request forgery (CSRF) on JSON endpoints.
 *
 * @param req - The incoming Request object.
 * @returns True if origin is verified or absent, false if foreign origin in production.
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
