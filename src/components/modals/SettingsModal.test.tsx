import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { SettingsModal } from "./SettingsModal";

describe("SettingsModal Component", () => {
  it("does not render when isOpen is false", () => {
    const { container } = render(
      <SettingsModal
        isOpen={false}
        onClose={vi.fn()}
        onResetToDefaults={vi.fn()}
        isAiAvailable={true}
      />
    );
    expect(container).toBeEmptyDOMElement();
  });

  it("renders privacy disclosures and storage details when open", () => {
    render(
      <SettingsModal
        isOpen={true}
        onClose={vi.fn()}
        onResetToDefaults={vi.fn()}
        isAiAvailable={true}
      />
    );

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText("Settings, Security & Privacy")).toBeInTheDocument();
    expect(screen.getByText("AI Provider & Privacy Disclosure")).toBeInTheDocument();
    expect(screen.getByText("Client-Side Offline Persistence")).toBeInTheDocument();
  });

  it("triggers data wipe and reset handler", () => {
    const onReset = vi.fn();
    render(
      <SettingsModal
        isOpen={true}
        onClose={vi.fn()}
        onResetToDefaults={onReset}
        isAiAvailable={false}
      />
    );

    const clearBtn = screen.getByRole("button", { name: /Clear Cache & Reset Blueprint/i });
    fireEvent.click(clearBtn);

    expect(onReset).toHaveBeenCalledTimes(1);
    expect(screen.getByText("Reset to default preset!")).toBeInTheDocument();
  });

  it("closes modal when Escape key is pressed", () => {
    const onClose = vi.fn();
    render(
      <SettingsModal
        isOpen={true}
        onClose={onClose}
        onResetToDefaults={vi.fn()}
        isAiAvailable={true}
      />
    );

    fireEvent.keyDown(window, { key: "Escape" });
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
