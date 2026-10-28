/**
 * Gatherly - Core AI Planning API Route
 *
 * POST /api/plan
 * GET  /api/plan (Health & status check)
 *
 * Security & Reliability Controls:
 * - Origin / CSRF validation
 * - Content-Type validation (415 Unsupported Media Type for non-JSON)
 * - Request body size check (413 Payload Too Large for > 32 KB)
 * - Sliding-window rate limiting (429 Too Many Requests)
 * - Strict Zod schema validation on input (400 Validation Error)
 * - Server-only API key handling
 * - Strict schema validation on output
 * - Graceful degradation to curated procedural planner
 * - Safe sanitized error responses without stack traces
 */

import { NextRequest, NextResponse } from "next/server";
import { EventPreferencesSchema } from "@/lib/validation/schemas";
import { generateEventPlan } from "@/lib/ai/planner";
import { globalRateLimiter } from "@/lib/security/rate-limiter";
import {
  applySecurityHeaders,
  getClientIp,
  isRequestBodyWithinLimit,
  isJsonContentType,
  isOriginAllowed,
} from "@/lib/security/headers";

export async function GET() {
  const hasKey = Boolean(process.env.GEMINI_API_KEY);
  const res = NextResponse.json(
    {
      status: "online",
      service: "Gatherly AI Event Planner",
      version: "1.0.0",
      aiProvider: "Google Gemini",
      hasServerApiKey: hasKey,
      defaultMode: hasKey ? "ai" : "demo",
      timestamp: new Date().toISOString(),
    },
    { status: 200 }
  );

  return applySecurityHeaders(res);
}

export async function POST(req: NextRequest) {
  try {
    // 1. Guard: Origin / CSRF Defense
    if (!isOriginAllowed(req)) {
      const res = NextResponse.json(
        {
          error: "Forbidden",
          message: "Cross-origin request rejected.",
        },
        { status: 403 }
      );
      return applySecurityHeaders(res);
    }

    // 2. Guard: Content-Type Header Verification
    if (!isJsonContentType(req)) {
      const res = NextResponse.json(
        {
          error: "Unsupported Media Type",
          message: "Request must specify Content-Type: application/json",
        },
        { status: 415 }
      );
      return applySecurityHeaders(res);
    }

    // 3. Guard: Request payload size limit
    if (!isRequestBodyWithinLimit(req)) {
      const res = NextResponse.json(
        {
          error: "Payload Too Large",
          message: "Request body exceeds maximum allowed size of 32 KB",
        },
        { status: 413 }
      );
      return applySecurityHeaders(res);
    }

    // 4. Guard: Sliding-window rate limit
    const clientIp = getClientIp(req);
    const rateCheck = globalRateLimiter.check(clientIp);

    if (!rateCheck.allowed) {
      const res = NextResponse.json(
        {
          error: "Too Many Requests",
          message: "Rate limit exceeded. Please wait before generating another plan.",
          retryAfterMs: rateCheck.resetMs,
        },
        {
          status: 429,
          headers: {
            "Retry-After": String(Math.ceil(rateCheck.resetMs / 1000)),
            "X-RateLimit-Limit": String(rateCheck.totalLimit),
            "X-RateLimit-Remaining": "0",
          },
        }
      );
      return applySecurityHeaders(res);
    }

    // 5. Parse JSON body safely
    let rawBody: unknown;
    try {
      rawBody = await req.json();
    } catch {
      const res = NextResponse.json(
        {
          error: "Invalid JSON",
          message: "The request body could not be parsed as valid JSON.",
        },
        { status: 400 }
      );
      return applySecurityHeaders(res);
    }

    // 6. Validate input with strict Zod schema
    const validationResult = EventPreferencesSchema.safeParse(rawBody);
    if (!validationResult.success) {
      const formattedErrors = validationResult.error.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      }));

      const res = NextResponse.json(
        {
          error: "Validation Error",
          message: "One or more input fields failed validation.",
          details: formattedErrors,
        },
        { status: 400 }
      );
      return applySecurityHeaders(res);
    }

    const preferences = validationResult.data;

    // 7. Generate plan via AI engine or fallback demo
    const { plan, fallbackUsed, errorReason } = await generateEventPlan(preferences);

    // 8. Return response with rate limit and security headers
    const res = NextResponse.json(
      {
        success: true,
        data: plan,
        fallbackUsed,
        notice: fallbackUsed ? errorReason : undefined,
      },
      {
        status: 200,
        headers: {
          "X-RateLimit-Limit": String(rateCheck.totalLimit),
          "X-RateLimit-Remaining": String(rateCheck.remaining),
        },
      }
    );

    return applySecurityHeaders(res);
  } catch (err: unknown) {
    // 9. Safe error handling - never leak stack traces or env variables
    const safeMessage =
      process.env.NODE_ENV === "development" && err instanceof Error
        ? err.message
        : "An unexpected error occurred while generating your event plan.";

    const res = NextResponse.json(
      {
        error: "Internal Server Error",
        message: safeMessage,
      },
      { status: 500 }
    );
    return applySecurityHeaders(res);
  }
}
