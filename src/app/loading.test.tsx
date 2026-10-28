import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import Loading from "./loading";

describe("src/app/loading.tsx - Loading Skeleton", () => {
  it("renders accessible status role and polite live region", () => {
    render(<Loading />);

    const statusEl = screen.getByRole("status");
    expect(statusEl).toBeInTheDocument();
    expect(statusEl).toHaveAttribute("aria-live", "polite");
    expect(screen.getByText(/Gathering Intelligence.../i)).toBeInTheDocument();
    expect(screen.getByText(/Loading celebration workspace.../i)).toBeInTheDocument();
  });
});
