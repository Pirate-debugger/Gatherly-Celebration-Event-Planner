import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import ErrorBoundary from "./error";

describe("src/app/error.tsx - Application Error Boundary", () => {
  beforeEach(() => {
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders error heading, accessible alert role, and reference code", () => {
    const mockReset = vi.fn();
    const mockError = new Error("Database connection timed out") as Error & { digest?: string };
    mockError.digest = "ERR_PLAN_9918";

    render(<ErrorBoundary error={mockError} reset={mockReset} />);

    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(screen.getByText("Something Went Wrong")).toBeInTheDocument();
    expect(screen.getByText(/Reference Code: ERR_PLAN_9918/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Try Again/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Return Home/i })).toHaveAttribute("href", "/");
  });

  it("invokes reset callback when Try Again button is clicked", () => {
    const mockReset = vi.fn();
    const mockError = new Error("Unexpected crash");

    render(<ErrorBoundary error={mockError} reset={mockReset} />);

    const retryBtn = screen.getByRole("button", { name: /Try Again/i });
    fireEvent.click(retryBtn);

    expect(mockReset).toHaveBeenCalledTimes(1);
  });
});
