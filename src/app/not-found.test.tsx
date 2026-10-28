import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import NotFound from "./not-found";

describe("src/app/not-found.tsx - 404 Page", () => {
  it("renders 404 heading and link to return to celebration dashboard", () => {
    render(<NotFound />);

    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Plan Not Found");
    expect(screen.getByText(/404 — Event Missing/i)).toBeInTheDocument();
    const homeLink = screen.getByRole("link", { name: /Back to Celebration Dashboard/i });
    expect(homeLink).toBeInTheDocument();
    expect(homeLink).toHaveAttribute("href", "/");
  });
});
