"use client";

import React, { useState } from "react";
import {
  Sparkles,
  Palette,
  Utensils,
  PartyPopper,
  Mail,
  Leaf,
  CloudRain,
  Copy,
  Check,
} from "lucide-react";
import { PersonalizedIdeas } from "@/types/event";

interface PersonalizedIdeasSectionProps {
  ideas: PersonalizedIdeas;
}

/**
 * Curated Experiential Concepts & Personalized Ideas Component
 *
 * Renders thematic decor accents, culinary pairing concepts, interactive guest experiences,
 * invitation wording templates with one-click copy, and sustainability practices.
 *
 * @param props - PersonalizedIdeasSectionProps containing curated ideas.
 * @returns React.JSX.Element
 */
export function PersonalizedIdeasSection({ ideas }: PersonalizedIdeasSectionProps): React.JSX.Element {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleCopyWording = (wording: string, index: number) => {
    navigator.clipboard.writeText(wording);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2500);
  };

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-sm font-bold text-white flex items-center space-x-2">
          <Sparkles className="h-4 w-4 text-amber-400" />
          <span>Curated Experiential Concepts & Personalized Ideas</span>
        </h3>
        <p className="text-xs text-slate-400 mt-0.5">
          Custom inspirations tailored to your budget tier, dietary needs, cultural elements, and venue type.
        </p>
      </div>

      {/* Grid of Concept Categories */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 1. Thematic Decor & Visual Styling */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-sm space-y-4">
          <div className="flex items-center space-x-2 text-violet-400 border-b border-slate-800 pb-2.5">
            <Palette className="h-4 w-4" />
            <h4 className="text-sm font-bold text-white">Thematic Decor & Spatial Design</h4>
          </div>

          <div className="space-y-4">
            {ideas.themesAndDecor.map((item, idx) => (
              <div key={idx} className="rounded-xl bg-slate-950/60 p-3.5 border border-slate-800/80 text-xs space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <h5 className="font-bold text-white text-sm">{item.title}</h5>
                  {/* Swatches */}
                  <div className="flex space-x-1 shrink-0">
                    {item.colorAccents.map((hex, cIdx) => (
                      <span
                        key={cIdx}
                        className="h-3.5 w-3.5 rounded-full border border-slate-700 shadow-sm"
                        style={{ backgroundColor: hex.startsWith("#") ? hex : "#8B5CF6" }}
                        title={hex}
                      />
                    ))}
                  </div>
                </div>

                <p className="text-slate-300 leading-relaxed">{item.description}</p>
                {item.visualStyle && (
                  <p className="text-[11px] text-violet-300 italic">
                    Aesthetic Direction: {item.visualStyle}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* 2. Culinary & Beverage Program */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-sm space-y-4">
          <div className="flex items-center space-x-2 text-emerald-400 border-b border-slate-800 pb-2.5">
            <Utensils className="h-4 w-4" />
            <h4 className="text-sm font-bold text-white">Culinary & Beverage Experiences</h4>
          </div>

          <div className="space-y-4">
            {ideas.foodAndBeverage.map((item, idx) => (
              <div key={idx} className="rounded-xl bg-slate-950/60 p-3.5 border border-slate-800/80 text-xs space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <h5 className="font-bold text-white text-sm">{item.title}</h5>
                  <div className="flex flex-wrap gap-1">
                    {item.dietaryCompliance.map((diet, dIdx) => (
                      <span
                        key={dIdx}
                        className="rounded bg-emerald-950/80 border border-emerald-900/60 px-1.5 py-0.2 text-[9px] text-emerald-300 font-medium"
                      >
                        {diet}
                      </span>
                    ))}
                  </div>
                </div>

                <p className="text-slate-300 leading-relaxed">{item.description}</p>
                {item.signatureItem && (
                  <div className="pt-1.5 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
                    <span className="text-slate-500 font-semibold">Signature Feature:</span>
                    <span className="text-emerald-300 font-medium">{item.signatureItem}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* 3. Interactive Entertainment & Guest Activities */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-sm space-y-4">
          <div className="flex items-center space-x-2 text-amber-400 border-b border-slate-800 pb-2.5">
            <PartyPopper className="h-4 w-4" />
            <h4 className="text-sm font-bold text-white">Guest Engagement & Activities</h4>
          </div>

          <div className="space-y-4">
            {ideas.activitiesAndEntertainment.map((item, idx) => (
              <div key={idx} className="rounded-xl bg-slate-950/60 p-3.5 border border-slate-800/80 text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <h5 className="font-bold text-white text-sm">{item.title}</h5>
                  <span className="rounded bg-amber-950/80 border border-amber-900/60 px-2 py-0.5 text-[10px] text-amber-300 font-semibold">
                    {item.guestEngagementScore} Engagement
                  </span>
                </div>

                <p className="text-slate-300 leading-relaxed">{item.description}</p>
                <div className="text-[11px] text-slate-400">
                  Target Audience: <span className="text-slate-200">{item.targetAudience}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 4. Invitation Concept & Copywriting */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-sm space-y-4">
          <div className="flex items-center space-x-2 text-indigo-400 border-b border-slate-800 pb-2.5">
            <Mail className="h-4 w-4" />
            <h4 className="text-sm font-bold text-white">Invitation Design & Wording Sample</h4>
          </div>

          <div className="space-y-4">
            {ideas.invitationConcepts.map((item, idx) => (
              <div key={idx} className="rounded-xl bg-slate-950/60 p-3.5 border border-slate-800/80 text-xs space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold text-indigo-400">
                    {item.format}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopyWording(item.wordingSample, idx)}
                    className="flex items-center space-x-1 rounded border border-slate-700 bg-slate-800 px-2 py-0.5 text-[11px] font-semibold text-slate-300 hover:text-white transition"
                  >
                    {copiedIndex === idx ? (
                      <>
                        <Check className="h-3 w-3 text-emerald-400" />
                        <span className="text-emerald-400">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3 w-3" />
                        <span>Copy Sample</span>
                      </>
                    )}
                  </button>
                </div>

                <h5 className="font-bold text-white">{item.headline}</h5>
                <blockquote className="border-l-2 border-indigo-500/60 pl-3 italic text-slate-300 text-xs leading-relaxed">
                  &ldquo;{item.wordingSample}&rdquo;
                </blockquote>
                <p className="text-[11px] text-slate-400">
                  Material Aesthetic: {item.aestheticNote}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Sustainability & Weather Contingency */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Sustainability Alternatives */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-sm space-y-4">
          <div className="flex items-center space-x-2 text-emerald-400 border-b border-slate-800 pb-2.5">
            <Leaf className="h-4 w-4" />
            <h4 className="text-sm font-bold text-white">Low-Waste & Sustainable Alternatives</h4>
          </div>

          <div className="space-y-3">
            {ideas.sustainabilityAlternatives.map((alt, idx) => (
              <div key={idx} className="rounded-xl bg-slate-950/60 p-3 border border-slate-800/80 text-xs space-y-1.5">
                <div className="flex justify-between text-slate-400 text-[11px]">
                  <span>Conventional: <del className="text-slate-500">{alt.standardApproach}</del></span>
                </div>
                <div className="font-semibold text-emerald-300">
                  Eco Upgrade: {alt.ecoAlternative}
                </div>
                <p className="text-[11px] text-slate-400 italic">
                  Impact: {alt.impact}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Weather Contingency Protocol */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-sm space-y-4">
          <div className="flex items-center space-x-2 text-blue-400 border-b border-slate-800 pb-2.5">
            <CloudRain className="h-4 w-4" />
            <h4 className="text-sm font-bold text-white">Weather Contingency Action Protocol</h4>
          </div>

          <div className="rounded-xl bg-slate-950/60 p-4 border border-slate-800/80 text-xs space-y-3">
            <div>
              <span className="text-[10px] font-bold uppercase text-slate-500 block">
                Primary Event Layout
              </span>
              <p className="text-slate-300 mt-0.5">{ideas.weatherContingency.primaryPlan}</p>
            </div>

            <div>
              <span className="text-[10px] font-bold uppercase text-blue-400 block">
                Backup Inclement Weather Plan
              </span>
              <p className="text-slate-200 font-medium mt-0.5">
                {ideas.weatherContingency.backupPlan}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-slate-800/80 text-[11px]">
              <div>
                <span className="text-slate-500 block font-semibold">Trigger Threshold:</span>
                <span className="text-amber-400">{ideas.weatherContingency.triggerCondition}</span>
              </div>
              <div>
                <span className="text-slate-500 block font-semibold">Execution Timeline:</span>
                <span className="text-slate-300">{ideas.weatherContingency.setupTimeline}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
