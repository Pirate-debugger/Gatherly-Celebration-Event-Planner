import { describe, it, expect } from "vitest";
import {
  GatherlyValidationError,
  GatherlySecurityError,
  GatherlyRateLimitError,
  GatherlyPayloadTooLargeError,
  GatherlyUnsupportedMediaTypeError,
  GatherlyAiProviderError,
  GatherlyStorageError,
} from "./domain-errors";

describe("Domain Error Hierarchy", () => {
  it("instantiates validation error with correct status code and name", () => {
    const err = new GatherlyValidationError("Field missing", { field: "title" });
    expect(err.statusCode).toBe(400);
    expect(err.errorCode).toBe("GATHERLY_VALIDATION_ERROR");
    expect(err.name).toBe("GatherlyValidationError");
    expect(err.message).toBe("Field missing");
  });

  it("instantiates security error with 403 status", () => {
    const err = new GatherlySecurityError("Origin rejected");
    expect(err.statusCode).toBe(403);
    expect(err.errorCode).toBe("GATHERLY_SECURITY_ERROR");
  });

  it("instantiates rate limit error with retry duration", () => {
    const err = new GatherlyRateLimitError("Too many calls", 45000);
    expect(err.statusCode).toBe(429);
    expect(err.retryAfterMs).toBe(45000);
  });

  it("instantiates payload and media type errors with correct status codes", () => {
    const payloadErr = new GatherlyPayloadTooLargeError();
    expect(payloadErr.statusCode).toBe(413);

    const mediaErr = new GatherlyUnsupportedMediaTypeError();
    expect(mediaErr.statusCode).toBe(415);
  });

  it("instantiates provider and storage errors", () => {
    const aiErr = new GatherlyAiProviderError("Rate quota depleted");
    expect(aiErr.statusCode).toBe(502);

    const storageErr = new GatherlyStorageError("Quota exceeded");
    expect(storageErr.statusCode).toBe(500);
  });
});
