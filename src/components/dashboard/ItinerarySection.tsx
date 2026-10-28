"use client";

import React, { useState, useEffect } from "react";
import {
  Clock,
  MapPin,
  UserCheck,
  PlusCircle,
  FileText,
  Trash2,
  X,
} from "lucide-react";
import { ItineraryItem } from "@/types/event";

interface ItinerarySectionProps {
  itinerary: ItineraryItem[];
  onUpdateItinerary: (updated: ItineraryItem[]) => void;
}

/**
 * Event-Day Run of Show & Itinerary Component
 *
 * Renders chronological event day timeline segments, location markers,
 * personnel in charge, logistical cues, and custom itinerary segment creation.
 *
 * @param props - ItinerarySectionProps containing itinerary list and update handler.
 * @returns React.JSX.Element
 */
export function ItinerarySection({
  itinerary,
  onUpdateItinerary,
}: ItinerarySectionProps): React.JSX.Element {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newTime, setNewTime] = useState("06:00 PM");
  const [newEndTime, setNewEndTime] = useState("07:00 PM");
  const [newActivity, setNewActivity] = useState("");
  const [newLocation, setNewLocation] = useState("Main Hall");
  const [newResponsible, setNewResponsible] = useState("Event Coordinator");
  const [newNotes, setNewNotes] = useState("");

  // Close modal on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isAddModalOpen) {
        setIsAddModalOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isAddModalOpen]);

  const handleDeleteItem = (id: string) => {
    onUpdateItinerary(itinerary.filter((item) => item.id !== id));
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newActivity.trim() || !newTime.trim()) return;

    const newItem: ItineraryItem = {
      id: `itinerary-${Date.now()}`,
      time: newTime.trim(),
      endTime: newEndTime.trim() || undefined,
      activity: newActivity.trim(),
      location: newLocation.trim() || "Main Venue",
      responsible: newResponsible.trim() || "Event Coordinator",
      notes: newNotes.trim() || undefined,
    };

    onUpdateItinerary([...itinerary, newItem]);
    setIsAddModalOpen(false);
    setNewActivity("");
    setNewNotes("");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-bold text-white flex items-center space-x-2">
            <Clock className="h-4 w-4 text-violet-400" />
            <span>Event-Day Master Run of Show</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Chronological step-by-step itinerary with responsible leads and logistical cues.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex items-center space-x-1.5 rounded-lg bg-violet-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-violet-500 transition shadow-sm self-start sm:self-auto"
        >
          <PlusCircle className="h-3.5 w-3.5" />
          <span>Add Program Segment</span>
        </button>
      </div>

      {/* Timeline Cards */}
      <div className="relative pl-6 sm:pl-8 border-l-2 border-violet-800/40 space-y-4">
        {itinerary.map((item, index) => (
          <div key={item.id} className="relative group">
            {/* Timeline Marker Dot */}
            <div className="absolute -left-[31px] sm:-left-[39px] top-4 flex h-6 w-6 items-center justify-center rounded-full bg-slate-900 border-2 border-violet-500 text-[10px] font-bold text-violet-300">
              {index + 1}
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4 backdrop-blur-sm text-xs hover:border-violet-500/50 transition">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-2 mb-2">
                <div className="flex items-center space-x-2">
                  <span className="rounded bg-violet-950/80 border border-violet-800/60 px-2 py-0.5 text-xs font-bold text-violet-300 font-mono">
                    {item.time} {item.endTime ? `– ${item.endTime}` : ""}
                  </span>
                  <h4 className="text-sm font-bold text-white">{item.activity}</h4>
                </div>

                <div className="flex items-center space-x-3 text-slate-400 text-[11px]">
                  <span className="flex items-center space-x-1">
                    <MapPin className="h-3 w-3 text-amber-400" />
                    <span>{item.location}</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <UserCheck className="h-3 w-3 text-emerald-400" />
                    <span>{item.responsible}</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => handleDeleteItem(item.id)}
                    title="Remove time slot"
                    aria-label={`Remove ${item.activity} time slot`}
                    className="text-slate-500 hover:text-rose-400 transition p-1 rounded hover:bg-slate-800"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {item.notes && (
                <p className="text-slate-400 text-xs leading-relaxed flex items-start space-x-1.5 mt-1">
                  <FileText className="h-3.5 w-3.5 text-slate-500 shrink-0 mt-0.5" />
                  <span>{item.notes}</span>
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Add Slot Modal */}
      {isAddModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="itinerary-add-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm"
        >
          <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl text-left relative">
            <div className="flex items-center justify-between mb-1">
              <h3 id="itinerary-add-title" className="text-base font-bold text-white">
                Add Program Segment
              </h3>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-slate-800"
                aria-label="Close add program segment dialog"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="text-xs text-slate-400 mb-4">
              Specify the time slot, activity, and team member in charge.
            </p>

            <form onSubmit={handleAddSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="itinerary-new-start-time" className="block font-semibold text-slate-300 mb-1">
                    Start Time *
                  </label>
                  <input
                    id="itinerary-new-start-time"
                    type="text"
                    required
                    value={newTime}
                    onChange={(e) => setNewTime(e.target.value)}
                    placeholder="e.g. 02:00 PM"
                    className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-white focus:border-violet-500"
                  />
                </div>
                <div>
                  <label htmlFor="itinerary-new-end-time" className="block font-semibold text-slate-300 mb-1">
                    End Time
                  </label>
                  <input
                    id="itinerary-new-end-time"
                    type="text"
                    value={newEndTime}
                    onChange={(e) => setNewEndTime(e.target.value)}
                    placeholder="e.g. 03:00 PM"
                    className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-white focus:border-violet-500"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="itinerary-new-activity" className="block font-semibold text-slate-300 mb-1">
                  Activity / Segment *
                </label>
                <input
                  id="itinerary-new-activity"
                  type="text"
                  required
                  value={newActivity}
                  onChange={(e) => setNewActivity(e.target.value)}
                  placeholder="e.g. Sunset Golden Hour Portrait Session"
                  className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-white focus:border-violet-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="itinerary-new-location" className="block font-semibold text-slate-300 mb-1">
                    Location
                  </label>
                  <input
                    id="itinerary-new-location"
                    type="text"
                    value={newLocation}
                    onChange={(e) => setNewLocation(e.target.value)}
                    placeholder="e.g. Garden Pavilion"
                    className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-white focus:border-violet-500"
                  />
                </div>
                <div>
                  <label htmlFor="itinerary-new-responsible" className="block font-semibold text-slate-300 mb-1">
                    Lead Responsible
                  </label>
                  <input
                    id="itinerary-new-responsible"
                    type="text"
                    value={newResponsible}
                    onChange={(e) => setNewResponsible(e.target.value)}
                    placeholder="e.g. Lead Photographer"
                    className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-white focus:border-violet-500"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="itinerary-new-notes" className="block font-semibold text-slate-300 mb-1">
                  Cues / Notes
                </label>
                <input
                  id="itinerary-new-notes"
                  type="text"
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  placeholder="e.g. Audio mics muted; bridal party gathered at staging tent"
                  className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-white focus:border-violet-500"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 font-medium text-slate-300 hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-violet-600 px-4 py-1.5 font-bold text-white hover:bg-violet-500 shadow-md"
                >
                  Add Segment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
