/**
 * Gatherly - Domain Error Hierarchy
 *
 * Provides strongly-typed domain error classes for validation, security,
 * rate limiting, storage, and AI engine exceptions.
 * Eliminates reliance on untyped generic Error instances.
 */

/**
 * Base abstract error class for all Gatherly domain exceptions.
 */
export abstract class GatherlyError extends Error {
  public abstract readonly statusCode: number;
  public abstract readonly errorCode: string;

  constructor(message: string, public readonly details?: unknown) {
    super(message);
    this.name = this.constructor.name;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

/**
 * Thrown when incoming payload or plan structure violates schema bounds.
 */
export class GatherlyValidationError extends GatherlyError {
  public readonly statusCode = 400;
  public readonly errorCode = "GATHERLY_VALIDATION_ERROR";

  constructor(message: string, details?: unknown) {
    super(message, details);
  }
}

/**
 * Thrown when request origin or headers violate CSRF/CORS security policies.
 */
export class GatherlySecurityError extends GatherlyError {
  public readonly statusCode = 403;
  public readonly errorCode = "GATHERLY_SECURITY_ERROR";

  constructor(message: string, details?: unknown) {
    super(message, details);
  }
}

/**
 * Thrown when client exceeds sliding-window rate limit threshold.
 */
export class GatherlyRateLimitError extends GatherlyError {
  public readonly statusCode = 429;
  public readonly errorCode = "GATHERLY_RATE_LIMIT_ERROR";

  constructor(message: string, public readonly retryAfterMs: number) {
    super(message, { retryAfterMs });
  }
}

/**
 * Thrown when request body exceeds maximum payload size limit.
 */
export class GatherlyPayloadTooLargeError extends GatherlyError {
  public readonly statusCode = 413;
  public readonly errorCode = "GATHERLY_PAYLOAD_TOO_LARGE";

  constructor(message: string = "Request body exceeds maximum allowed size") {
    super(message);
  }
}

/**
 * Thrown when request content-type is unsupported.
 */
export class GatherlyUnsupportedMediaTypeError extends GatherlyError {
  public readonly statusCode = 415;
  public readonly errorCode = "GATHERLY_UNSUPPORTED_MEDIA_TYPE";

  constructor(message: string = "Request Content-Type must be application/json") {
    super(message);
  }
}

/**
 * Thrown when upstream Gemini AI fails or times out.
 */
export class GatherlyAiProviderError extends GatherlyError {
  public readonly statusCode = 502;
  public readonly errorCode = "GATHERLY_AI_PROVIDER_ERROR";

  constructor(message: string, details?: unknown) {
    super(message, details);
  }
}

/**
 * Thrown when client-side storage operations fail.
 */
export class GatherlyStorageError extends GatherlyError {
  public readonly statusCode = 500;
  public readonly errorCode = "GATHERLY_STORAGE_ERROR";

  constructor(message: string, details?: unknown) {
    super(message, details);
  }
}
