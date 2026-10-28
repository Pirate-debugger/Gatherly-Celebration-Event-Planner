import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { VendorHubSection } from "./VendorHubSection";
import { VendorItem } from "@/types/event";

describe("VendorHubSection Component", () => {
  const initialVendors: VendorItem[] = [
    {
      id: "v-1",
      role: "Lead Photographer",
      category: "photography_videography",
      description: "Full day wedding coverage",
      requirements: ["Full day coverage", "High-res gallery"],
      contactName: "Alex Rivera",
      contactEmail: "alex@riveraphoto.com",
      contactPhone: "555-0192",
      estimatedCost: 3500,
      confirmedCost: null,
      depositAmount: 1000,
      depositDueDate: "2027-02-01",
      paymentReminder: "Net 30 before ceremony",
      status: "contacted",
      bookingConfirmed: false,
      questionsToAsk: [
        "Do you provide a second shooter?",
        "What is your turnaround time for digital edits?",
      ],
      alternativeOptions: ["Studio Lens", "Focus Arts"],
    },
    {
      id: "v-2",
      role: "Artisan Caterer",
      category: "catering_beverages",
      description: "Organic farm-to-table dining",
      requirements: ["Cocktail hour appetizers", "3-course plated dinner"],
      contactName: "Chef Marie",
      contactEmail: "marie@epicure.com",
      contactPhone: "555-0188",
      estimatedCost: 7500,
      confirmedCost: 7500,
      depositAmount: 2500,
      depositDueDate: "2027-01-15",
      paymentReminder: "Balance due 14 days prior",
      status: "contract_signed",
      bookingConfirmed: true,
      questionsToAsk: ["Can you accommodate celiac and nut allergies?"],
      alternativeOptions: ["Bistro Catering"],
    },
  ];

  it("renders vendor list with roles, contacts, and questions", () => {
    const onUpdateVendors = vi.fn();
    render(
      <VendorHubSection
        vendors={initialVendors}
        currency="USD"
        onUpdateVendors={onUpdateVendors}
      />
    );

    expect(screen.getByText("Lead Photographer")).toBeInTheDocument();
    expect(screen.getByText("Artisan Caterer")).toBeInTheDocument();
    expect(screen.getByText(/Alex Rivera/i)).toBeInTheDocument();
    expect(screen.getByText(/Chef Marie/i)).toBeInTheDocument();
    expect(screen.getByText("Do you provide a second shooter?")).toBeInTheDocument();
  });

  it("updates vendor lifecycle status when selecting a new status", () => {
    const onUpdateVendors = vi.fn();
    render(
      <VendorHubSection
        vendors={initialVendors}
        currency="USD"
        onUpdateVendors={onUpdateVendors}
      />
    );

    const statusSelects = screen.getAllByRole("combobox");
    fireEvent.change(statusSelects[0], { target: { value: "deposit_paid" } });

    expect(onUpdateVendors).toHaveBeenCalledTimes(1);
    const updatedPayload = onUpdateVendors.mock.calls[0][0];
    expect(updatedPayload[0].status).toBe("deposit_paid");
    expect(updatedPayload[0].bookingConfirmed).toBe(true);
  });

  it("deletes a vendor when the trash button is clicked", () => {
    const onUpdateVendors = vi.fn();
    render(
      <VendorHubSection
        vendors={initialVendors}
        currency="USD"
        onUpdateVendors={onUpdateVendors}
      />
    );

    const deleteButtons = screen.getAllByTitle(/Delete Lead Photographer/i);
    fireEvent.click(deleteButtons[0]);

    expect(onUpdateVendors).toHaveBeenCalledWith([initialVendors[1]]);
  });

  it("opens add vendor modal, validates form, and adds custom vendor", () => {
    const onUpdateVendors = vi.fn();
    render(
      <VendorHubSection
        vendors={initialVendors}
        currency="USD"
        onUpdateVendors={onUpdateVendors}
      />
    );

    const addButtons = screen.getAllByText("Add Custom Vendor");
    fireEvent.click(addButtons[0]);

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText("Add Custom Vendor Partner")).toBeInTheDocument();

    const roleInput = screen.getByLabelText(/Vendor Role \/ Specialty \*/i);
    fireEvent.change(roleInput, { target: { value: "Live String Quartet" } });

    const contactInput = screen.getByLabelText(/Contact Name/i);
    fireEvent.change(contactInput, { target: { value: "Elena Rostova" } });

    const submitBtn = screen.getByRole("button", { name: /Save Vendor/i });
    fireEvent.click(submitBtn);

    expect(onUpdateVendors).toHaveBeenCalledTimes(1);
    const addedList = onUpdateVendors.mock.calls[0][0];
    expect(addedList.length).toBe(3);
    expect(addedList[2].role).toBe("Live String Quartet");
  });

  it("closes modal on Escape key press", () => {
    const onUpdateVendors = vi.fn();
    render(
      <VendorHubSection
        vendors={initialVendors}
        currency="USD"
        onUpdateVendors={onUpdateVendors}
      />
    );

    const addButtons = screen.getAllByText("Add Custom Vendor");
    fireEvent.click(addButtons[0]);
    expect(screen.getByRole("dialog")).toBeInTheDocument();

    fireEvent.keyDown(window, { key: "Escape" });
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});
