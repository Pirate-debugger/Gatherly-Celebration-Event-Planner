/**
 * Gatherly - High-Fidelity Curated Demo Presets and Procedural Engine
 *
 * Provides realistic pre-configured showcase plans for:
 * 1. Modern Garden Elegance Wedding (120 guests, $45,000)
 * 2. Milestone 30th Cyberpunk Rooftop Birthday (65 guests, $8,500)
 * 3. Oakwood Multicultural Lantern Festival (450 guests, $18,000)
 *
 * Also includes `generateDemoPlan` to synthesize realistic, tailored, mathematically
 * reconciled event plans on-demand without external API keys.
 */

import {
  EventPlan,
  EventPreferences,
  BudgetItem,
  TimelineTask,
  ItineraryItem,
  VendorItem,
  PersonalizedIdeas,
  RiskContingencyItem,
  ExecutiveOverview,
} from "@/types/event";
import {
  calculateBudgetSummary,
  reconcileBudgetItems,
} from "@/lib/calculations/budget";
import {
  computePhaseDeadline,
  PHASE_LABELS,
} from "@/lib/calculations/timeline";

export const SAMPLE_WEDDING_PRESET: EventPreferences = {
  title: "Elena & Marcus's Modern Garden Elegance Wedding",
  eventType: "wedding",
  date: "2027-06-19",
  durationHours: 8,
  location: "Sonoma Valley Vineyards, CA",
  venueType: "hybrid",
  guestCount: 120,
  budget: 45000,
  currency: "USD",
  themeStyle: "Modern Garden Elegance with Terracotta and Sage",
  colorPalette: ["#C97A63", "#60725C", "#E8D8C8", "#D4AF37"],
  dietaryRestrictions: ["Gluten-Free Options", "Vegetarian", "Nut-Free Station"],
  accessibilityNeeds: ["Wheelchair Accessible Pathways", "Shaded Rest Areas"],
  culturalTraditions: ["Olive Branch Unity Ceremony", "Acoustic Sunset Serenade"],
  priorities: {
    venue: "high",
    catering: "high",
    decor: "medium",
    photoVideo: "high",
    entertainment: "medium",
  },
  additionalNotes:
    "We want an open-air dinner under string lights, a lively dance floor, and a sustainable, zero single-use plastic setup.",
  mode: "demo",
};

export const SAMPLE_BIRTHDAY_PRESET: EventPreferences = {
  title: "Jordan's 30th Neon Mirage Rooftop Party",
  eventType: "birthday",
  date: "2027-04-10",
  durationHours: 5,
  location: "Skyline Terrace Lounge, Chicago, IL",
  venueType: "indoor",
  guestCount: 65,
  budget: 8500,
  currency: "USD",
  themeStyle: "Cyberpunk Neon Lounge with Retro Synth Vibes",
  colorPalette: ["#00F0FF", "#FF007F", "#1A1A2E", "#F8E71C"],
  dietaryRestrictions: ["Vegan Tapas", "Halal Friendly", "Mocktail Bar"],
  accessibilityNeeds: ["Elevator Access", "Low-Sensory Quiet Lounge Corner"],
  culturalTraditions: ["Midnight Birthday Countdown", "Polaroid Guestbook Wall"],
  priorities: {
    venue: "high",
    catering: "medium",
    decor: "high",
    photoVideo: "medium",
    entertainment: "high",
  },
  additionalNotes:
    "Signature illuminated cocktail bar, interactive 360 photo booth, and a live DJ spinning deep house.",
  mode: "demo",
};

export const SAMPLE_COMMUNITY_PRESET: EventPreferences = {
  title: "Oakwood Multicultural Spring Lantern Festival",
  eventType: "community",
  date: "2027-05-15",
  durationHours: 7,
  location: "Oakwood Civic Community Park",
  venueType: "outdoor",
  guestCount: 450,
  budget: 18000,
  currency: "USD",
  themeStyle: "Vibrant Community Heritage & Eco-Lantern Festival",
  colorPalette: ["#FF5722", "#FFC107", "#4CAF50", "#3F51B5"],
  dietaryRestrictions: ["Kosher Friendly", "Halal", "Vegan", "Allergen Clear Labelling"],
  accessibilityNeeds: ["ASL Interpreters", "Sensory Break Tent", "Wheelchair Accessible Ramps"],
  culturalTraditions: ["Multicultural Parade", "Twilight Lantern Release Ceremony"],
  priorities: {
    venue: "medium",
    catering: "high",
    decor: "medium",
    photoVideo: "low",
    entertainment: "high",
  },
  additionalNotes:
    "Free admission community gathering celebrating diverse arts, folklore dancing, and culinary traditions with zero waste goals.",
  mode: "demo",
};

/**
 * Procedurally generates a fully personalized, structurally validated event plan.
 */
export function generateDemoPlan(
  prefs: EventPreferences,
  referenceDate: string = "2027-01-01T00:00:00.000Z"
): EventPlan {
  const now = referenceDate;
  const eventDate = prefs.date;
  const total = prefs.budget;

  // 1. Executive Overview tailored to inputs
  const overview: ExecutiveOverview = {
    eventConcept: `${prefs.title} is conceptualized as an immersive, highly personalized celebration designed for ${prefs.guestCount} guests in ${prefs.location}. The event embraces a ${prefs.themeStyle} aesthetic, emphasizing authentic guest hospitality, seamless pacing, and memorable sensory touches.`,
    recommendedAtmosphere: `Curated with a blend of refined warmth and modern energy. Visual styling focuses on colors ${prefs.colorPalette.length > 0 ? prefs.colorPalette.join(", ") : "warm metallics, emerald, and soft cream"}, supported by ambient lighting and acoustic zoning that allows both conversation and lively celebration.`,
    guestExperienceStrategy: `Guests are welcomed with clear navigation, accessible flow (${prefs.accessibilityNeeds.length > 0 ? prefs.accessibilityNeeds.join("; ") : "full universal access"}), diverse dietary offerings (${prefs.dietaryRestrictions.length > 0 ? prefs.dietaryRestrictions.join(", ") : "standard & dietary friendly"}), and structured micro-moments that keep the crowd engaged without feeling rushed.`,
    keyAssumptions: [
      `Guest attendance modeled at ~${prefs.guestCount} attendees with a 90% expected RSVP attendance rate.`,
      `Venue operates in a ${prefs.venueType} environment with power, staging, and sanitation provisions accounted for.`,
      `Contingency reserve of ~10% held back to absorb unanticipated price fluctuations or permit requirements.`,
      `All vendor quotes subject to final contract and walk-through verification.`,
    ],
    criticalRisksSummary: [
      prefs.venueType !== "indoor"
        ? "Outdoor weather vulnerability requiring standby tenting and rapid drainage mitigation."
        : "Indoor sound acoustics and elevator load capacity during peak guest arrivals.",
      "Catering rush and dietary cross-contamination prevention.",
      "Vendor delivery synchronization and loading dock schedule constraints.",
    ],
  };

  // 2. Budget Allocation based on Priorities and Category Percentages
  // Baseline percentages adjusted by priorities
  let venueWeight = prefs.priorities.venue === "high" ? 0.32 : prefs.priorities.venue === "low" ? 0.20 : 0.26;
  let cateringWeight = prefs.priorities.catering === "high" ? 0.34 : prefs.priorities.catering === "low" ? 0.22 : 0.28;
  let photoWeight = prefs.priorities.photoVideo === "high" ? 0.12 : prefs.priorities.photoVideo === "low" ? 0.06 : 0.09;
  let entertainmentWeight = prefs.priorities.entertainment === "high" ? 0.12 : prefs.priorities.entertainment === "low" ? 0.05 : 0.08;
  let decorWeight = prefs.priorities.decor === "high" ? 0.11 : prefs.priorities.decor === "low" ? 0.05 : 0.08;
  const contingencyWeight = 0.10; // Fixed 10% contingency

  // Normalize weights so total = 1.0 (with misc/stationery/transport absorbing rest)
  const sumWeights = venueWeight + cateringWeight + photoWeight + entertainmentWeight + decorWeight + contingencyWeight;
  const normFactor = 0.94 / sumWeights; // leaves 6% for stationery and transport/staff
  venueWeight = Math.round(venueWeight * normFactor * 100) / 100;
  cateringWeight = Math.round(cateringWeight * normFactor * 100) / 100;
  photoWeight = Math.round(photoWeight * normFactor * 100) / 100;
  entertainmentWeight = Math.round(entertainmentWeight * normFactor * 100) / 100;
  decorWeight = Math.round(decorWeight * normFactor * 100) / 100;

  const rawBudgetItems: BudgetItem[] = [
    {
      id: "b-venue-main",
      category: "venue_permits",
      name: "Primary Venue Rental & Facility Fee",
      description: `Site rental for ${prefs.durationHours} hours plus setup and teardown access at ${prefs.location}.`,
      estimatedCost: Math.round(total * venueWeight * 0.85),
      confirmedCost: null,
      isConfirmed: false,
      notes: "Pending venue contract signing and site walk.",
    },
    {
      id: "b-venue-permits",
      category: "venue_permits",
      name: "Municipal Event Permits & Sound Licensing",
      description: "Local assembly permit, noise variances, and park/facility insurance.",
      estimatedCost: Math.round(total * venueWeight * 0.15),
      confirmedCost: null,
      isConfirmed: false,
    },
    {
      id: "b-catering-food",
      category: "catering_beverages",
      name: "Food Service & Plated/Station Catering",
      description: `Course service tailored for ${prefs.guestCount} guests, including dietary accommodations (${prefs.dietaryRestrictions.join(", ") || "standard and vegetarian"}).`,
      estimatedCost: Math.round(total * cateringWeight * 0.70),
      confirmedCost: null,
      isConfirmed: false,
    },
    {
      id: "b-catering-drinks",
      category: "catering_beverages",
      name: "Beverage Program & Bar Service",
      description: "Artisan mocktails, wine, craft beers, mixers, and certified bartending staff.",
      estimatedCost: Math.round(total * cateringWeight * 0.30),
      confirmedCost: null,
      isConfirmed: false,
    },
    {
      id: "b-decor-florals",
      category: "decoration_flowers",
      name: "Thematic Decor, Florals & Centerpieces",
      description: `Floral installations and table vignettes themed around ${prefs.themeStyle}.`,
      estimatedCost: Math.round(total * decorWeight * 0.65),
      confirmedCost: null,
      isConfirmed: false,
    },
    {
      id: "b-decor-lighting",
      category: "decoration_flowers",
      name: "Architectural Lighting & Ambient Rigging",
      description: "Warm festoon lighting, uplights, and pathway lanterns for evening atmosphere.",
      estimatedCost: Math.round(total * decorWeight * 0.35),
      confirmedCost: null,
      isConfirmed: false,
    },
    {
      id: "b-photo-video",
      category: "photography_videography",
      name: "Professional Photography & Coverage",
      description: "Full event coverage, digital gallery with reproduction rights, and curated highlights.",
      estimatedCost: Math.round(total * photoWeight * 0.65),
      confirmedCost: null,
      isConfirmed: false,
    },
    {
      id: "b-video-cinematic",
      category: "photography_videography",
      name: "Cinematic Highlight Film & Drone Footage",
      description: "4K recap edit with aerial drone capture (weather and permit permitting).",
      estimatedCost: Math.round(total * photoWeight * 0.35),
      confirmedCost: null,
      isConfirmed: false,
    },
    {
      id: "b-entertainment-main",
      category: "entertainment",
      name: "Sound System, DJ & Master of Ceremonies",
      description: "Professional sound system, wireless microphones, curated playlists, and MC hosting.",
      estimatedCost: Math.round(total * entertainmentWeight * 0.75),
      confirmedCost: null,
      isConfirmed: false,
    },
    {
      id: "b-entertainment-extras",
      category: "entertainment",
      name: "Interactive Guest Entertainment & Live Feature",
      description: "Interactive photo experience, acoustic performer, or lawn games depending on schedule.",
      estimatedCost: Math.round(total * entertainmentWeight * 0.25),
      confirmedCost: null,
      isConfirmed: false,
    },
    {
      id: "b-invitations",
      category: "invitations_stationery",
      name: "Digital & Printed Invitations with Day-of Signage",
      description: "Custom digital RSVP portal, welcome easel, directional signs, and menu cards.",
      estimatedCost: Math.round(total * 0.03),
      confirmedCost: null,
      isConfirmed: false,
    },
    {
      id: "b-transport",
      category: "transport_accommodation",
      name: "Guest Shuttle & Reserved Parking Coordination",
      description: "Dedicated van shuttle loop and reserved handicap accessible parking stalls.",
      estimatedCost: Math.round(total * 0.03),
      confirmedCost: null,
      isConfirmed: false,
    },
    {
      id: "b-staff-misc",
      category: "staff_misc",
      name: "Event Day-of Coordinators & Service Crew",
      description: "Dedicated on-site logistics lead and assistant for schedule adherence and load-out.",
      estimatedCost: Math.round(total * 0.03),
      confirmedCost: null,
      isConfirmed: false,
    },
    {
      id: "b-contingency",
      category: "contingency_reserve",
      name: "Dedicated Contingency & Emergency Reserve",
      description: "Unforeseen weather adjustments, rush fees, replacement supplies, or overtime buffer.",
      estimatedCost: Math.round(total * contingencyWeight),
      confirmedCost: null,
      isConfirmed: false,
      isContingency: true,
      notes: "Held in reserve; released only upon signed organizer authorization.",
    },
  ];

  // Mathematically reconcile items so total sum matches user budget exactly
  const reconciledBudgetItems = reconcileBudgetItems(rawBudgetItems, total);
  const budgetSummary = calculateBudgetSummary(reconciledBudgetItems, total, prefs.currency);

  // 3. Dynamic Planning Timeline with dates calculated from eventDate
  const timeline: TimelineTask[] = [
    {
      id: "t-1",
      title: "Confirm Core Venue & Sign Rental Contract",
      description: "Review capacity limits, noise curfews, load-in guidelines, and secure dates with deposit.",
      phase: "6_months_plus",
      phaseLabel: PHASE_LABELS["6_months_plus"],
      targetDate: computePhaseDeadline(eventDate, "6_months_plus"),
      priority: "high",
      dependencies: [],
      status: "completed",
      isOverdue: false,
      category: "Venue",
      assignee: "Lead Organizer",
    },
    {
      id: "t-2",
      title: "Establish Guest List & Digital RSVP Hub",
      description: `Compile ${prefs.guestCount} guest addresses, dietary requirements, and accessibility notes.`,
      phase: "6_months_plus",
      phaseLabel: PHASE_LABELS["6_months_plus"],
      targetDate: computePhaseDeadline(eventDate, "6_months_plus"),
      priority: "high",
      dependencies: ["t-1"],
      status: "in_progress",
      isOverdue: false,
      category: "Guest Management",
      assignee: "Host",
    },
    {
      id: "t-3",
      title: "Book Lead Catering & Bar Vendor",
      description: `Schedule tasting menu; verify accommodations for ${prefs.dietaryRestrictions.join(", ") || "all dietary restrictions"}.`,
      phase: "3_to_6_months",
      phaseLabel: PHASE_LABELS["3_to_6_months"],
      targetDate: computePhaseDeadline(eventDate, "3_to_6_months"),
      priority: "high",
      dependencies: ["t-1"],
      status: "todo",
      isOverdue: false,
      category: "Catering",
      assignee: "Catering Lead",
    },
    {
      id: "t-4",
      title: "Contract Photography & Videography Team",
      description: "Review portfolio of low-light and outdoor work; agree upon must-capture shot list.",
      phase: "3_to_6_months",
      phaseLabel: PHASE_LABELS["3_to_6_months"],
      targetDate: computePhaseDeadline(eventDate, "3_to_6_months"),
      priority: "medium",
      dependencies: ["t-1"],
      status: "todo",
      isOverdue: false,
      category: "Media",
      assignee: "Organizer",
    },
    {
      id: "t-5",
      title: "Lock In Entertainment, Sound & Emcee",
      description: "Confirm AV power specs, wireless mic frequencies, and establish curated do-not-play list.",
      phase: "3_to_6_months",
      phaseLabel: PHASE_LABELS["3_to_6_months"],
      targetDate: computePhaseDeadline(eventDate, "3_to_6_months"),
      priority: "medium",
      dependencies: ["t-1"],
      status: "todo",
      isOverdue: false,
      category: "Entertainment",
      assignee: "Entertainment Coordinator",
    },
    {
      id: "t-6",
      title: "Design Thematic Decor & Floral Package",
      description: `Align floral mockups with color palette: ${prefs.colorPalette.join(", ") || "signature palette"}.`,
      phase: "1_to_2_months",
      phaseLabel: PHASE_LABELS["1_to_2_months"],
      targetDate: computePhaseDeadline(eventDate, "1_to_2_months"),
      priority: "medium",
      dependencies: ["t-1"],
      status: "todo",
      isOverdue: false,
      category: "Decor",
      assignee: "Stylist",
    },
    {
      id: "t-7",
      title: "Finalize RSVP Headcount & Dietary Roster",
      description: "Transmit final guaranteed guest counts and specific allergy table placements to caterer.",
      phase: "2_to_4_weeks",
      phaseLabel: PHASE_LABELS["2_to_4_weeks"],
      targetDate: computePhaseDeadline(eventDate, "2_to_4_weeks"),
      priority: "high",
      dependencies: ["t-2", "t-3"],
      status: "todo",
      isOverdue: false,
      category: "Guest Management",
      assignee: "Lead Organizer",
    },
    {
      id: "t-8",
      title: "Conduct On-Site Production Walkthrough",
      description: "Check electrical drops, verify accessibility routes, check emergency exits, and review layout.",
      phase: "event_week",
      phaseLabel: PHASE_LABELS["event_week"],
      targetDate: computePhaseDeadline(eventDate, "event_week"),
      priority: "high",
      dependencies: ["t-1"],
      status: "todo",
      isOverdue: false,
      category: "Operations",
      assignee: "Event Coordinator",
    },
    {
      id: "t-9",
      title: "Event Day Load-in & Master Execution",
      description: "Oversee vendor staging, soundcheck, guest arrival hospitality, and stage transitions.",
      phase: "event_day",
      phaseLabel: PHASE_LABELS["event_day"],
      targetDate: eventDate,
      priority: "high",
      dependencies: ["t-8"],
      status: "todo",
      isOverdue: false,
      category: "Execution",
      assignee: "All Staff",
    },
    {
      id: "t-10",
      title: "Post-Event Wrap-up, Rental Returns & Gratuities",
      description: "Distribute vendor tips, collect security deposits, return rental assets, and send thank you cards.",
      phase: "post_event",
      phaseLabel: PHASE_LABELS["post_event"],
      targetDate: computePhaseDeadline(eventDate, "post_event"),
      priority: "low",
      dependencies: ["t-9"],
      status: "todo",
      isOverdue: false,
      category: "Post-Event",
      assignee: "Lead Organizer",
    },
  ];

  // 4. Day-of-Event Itinerary with realistic time slots
  const itinerary: ItineraryItem[] = [
    {
      id: "it-1",
      time: "09:00 AM",
      endTime: "11:30 AM",
      activity: "Vendor Load-in, Floral Rigging & Audio Soundcheck",
      location: "Main Venue / Loading Bay",
      responsible: "Operations Lead & Venue Manager",
      notes: "Verify electrical power load and ensure ramp access remains unobstructed.",
    },
    {
      id: "it-2",
      time: "11:30 AM",
      endTime: "12:30 PM",
      activity: "Coordinator Walkthrough & Tabletop Signage Placement",
      location: "Guest Seating & Dining Area",
      responsible: "Day-of Coordinator",
      notes: `Confirm ${prefs.dietaryRestrictions.join(", ") || "dietary"} cards are placed at assigned seats.`,
    },
    {
      id: "it-3",
      time: "01:00 PM",
      endTime: "01:45 PM",
      activity: "Guest Welcome Hospitality & Welcome Drinks",
      location: "Foyer / Garden Terrace",
      responsible: "Hospitality Team",
      notes: "Acoustic background music active; signature greeting drinks poured.",
    },
    {
      id: "it-4",
      time: "02:00 PM",
      endTime: "02:45 PM",
      activity: `Main Program & Ceremonial Feature (${prefs.culturalTraditions[0] || "Opening Keynote / Ceremony"})`,
      location: "Center Stage / Pavilion",
      responsible: "Emcee & Celebrants",
      notes: "Microphones sound-balanced; live stream active if remote guests attending.",
    },
    {
      id: "it-5",
      time: "03:00 PM",
      endTime: "04:30 PM",
      activity: "Social Reception, Cocktail Hour & Photo Sessions",
      location: "Veranda & Lounge Areas",
      responsible: "Photographer & Catering Staff",
      notes: "Passed hors d'oeuvres; dedicated accessibility rest areas monitored.",
    },
    {
      id: "it-6",
      time: "05:00 PM",
      endTime: "07:00 PM",
      activity: "Gourmet Dinner Service & Heartfelt Speeches",
      location: "Dining Pavilion",
      responsible: "Executive Chef & Host",
      notes: "Dessert and tea/coffee stations opened towards the conclusion.",
    },
    {
      id: "it-7",
      time: "07:15 PM",
      endTime: "09:30 PM",
      activity: "Evening Entertainment, Live Music & Dancing",
      location: "Dance Floor & Patio",
      responsible: "DJ / Band & Lighting Tech",
      notes: "Lighting shifts to warm celebratory hues; late-night snack bites served.",
    },
    {
      id: "it-8",
      time: "09:30 PM",
      endTime: "10:00 PM",
      activity: "Grand Farewell & Departure Send-off",
      location: "Grand Portico / Exit Arch",
      responsible: "Event Coordinator",
      notes: "Shuttles staged at main portico; favors distributed to departing guests.",
    },
  ];

  // 5. Vendor Checklist with realistic costs, reminder dates, and questions to ask
  const vendors: VendorItem[] = [
    {
      id: "v-venue",
      category: "venue_permits",
      role: "Venue General Manager",
      description: "Facility operations, physical site safety, lighting control, and sound guidelines.",
      requirements: ["Certificate of Insurance (COI) $2M liability", "End of night broom-clean clause"],
      estimatedCost: Math.round(total * venueWeight * 0.85),
      confirmedCost: null,
      status: "quoted",
      contactName: "Sarah Jenkins",
      contactEmail: "events@vineyardestates.example",
      contactPhone: "+1 (555) 234-8890",
      depositAmount: Math.round(total * venueWeight * 0.85 * 0.25),
      depositDueDate: computePhaseDeadline(eventDate, "6_months_plus"),
      paymentReminder: "Final balance due 30 days prior to event date.",
      questionsToAsk: [
        "What are the precise amplified noise curfew hours?",
        "Are there restrictions on open flame candles or outdoor sparklers?",
        "What is the backup indoor space capacity if severe weather forces relocation?",
        "Where can guest shuttles park and stage safely?",
      ],
      alternativeOptions: ["Highland Manor Estate", "Meadowood Pavilion"],
      bookingConfirmed: false,
    },
    {
      id: "v-catering",
      category: "catering_beverages",
      role: "Executive Catering Director",
      description: "Full food service, kitchen equipment, serviceware, and licensed beverage staff.",
      requirements: ["Certified food handling license", "Separate allergen preparation station"],
      estimatedCost: Math.round(total * cateringWeight * 0.70),
      confirmedCost: null,
      status: "researching",
      contactName: "Chef Antoine Dupont",
      contactEmail: "inquiries@artisancatering.example",
      contactPhone: "+1 (555) 789-0123",
      depositAmount: Math.round(total * cateringWeight * 0.70 * 0.30),
      depositDueDate: computePhaseDeadline(eventDate, "3_to_6_months"),
      paymentReminder: "Final headcount lock due 14 days before event.",
      questionsToAsk: [
        "How do you prevent cross-contamination for gluten-free and allergen-free guests?",
        "What is the staff-to-guest ratio during seated dinner service?",
        "Are vendor meals included in the contract?",
        "Can leftover unopened prepared food be donated to local food recovery initiatives?",
      ],
      alternativeOptions: ["Farm-to-Table Gourmet", "Heritage Hearth Catering"],
      bookingConfirmed: false,
    },
    {
      id: "v-photo",
      category: "photography_videography",
      role: "Lead Documentary Photographer",
      description: "Capturing authentic candids, formal portraits, and documentary storytelling.",
      requirements: ["Two primary shooters for coverage", "Full resolution digital download gallery"],
      estimatedCost: Math.round(total * photoWeight * 0.65),
      confirmedCost: null,
      status: "contacted",
      contactName: "Maya Lin",
      contactEmail: "maya@linvisuals.example",
      contactPhone: "+1 (555) 456-7890",
      depositAmount: Math.round(total * photoWeight * 0.65 * 0.35),
      depositDueDate: computePhaseDeadline(eventDate, "3_to_6_months"),
      paymentReminder: "50% deposit upon booking, 50% one week before event.",
      questionsToAsk: [
        "Have you photographed events at this specific venue or similar lighting conditions?",
        "What is your typical turnaround timeline for sneak peek photos and the full gallery?",
        "What is your backup equipment redundancy protocol on the day?",
      ],
      alternativeOptions: ["Lumina Studio Co.", "Aura Fine Art Media"],
      bookingConfirmed: false,
    },
    {
      id: "v-entertainment",
      category: "entertainment",
      role: "Event DJ & Sound Engineer",
      description: "High-grade sound amplification, wireless ceremony mics, and dynamic dance sets.",
      requirements: ["Dedicated 20A electrical circuit", "Covered booth protection from direct sun/rain"],
      estimatedCost: Math.round(total * entertainmentWeight * 0.75),
      confirmedCost: null,
      status: "researching",
      contactName: "Marcus Cole",
      contactEmail: "booking@soundvibes.example",
      contactPhone: "+1 (555) 890-1234",
      depositAmount: Math.round(total * entertainmentWeight * 0.75 * 0.25),
      depositDueDate: computePhaseDeadline(eventDate, "3_to_6_months"),
      paymentReminder: "Balance due day of event prior to soundcheck.",
      questionsToAsk: [
        "Do you provide a second wireless microphone setup for ceremony and outdoor toasts?",
        "How do you handle guest song requests during the dance set?",
        "Can we provide a custom Spotify playlist for cocktail and dinner interludes?",
      ],
      alternativeOptions: ["Groove Theory Collective", "Sonic Horizon Audio"],
      bookingConfirmed: false,
    },
    {
      id: "v-florals",
      category: "decoration_flowers",
      role: "Lead Floral & Event Designer",
      description: "Custom table floral arrangements, focal arch, entrance installations, and lighting decor.",
      requirements: ["Biodegradable floral foam / sustainable foam-free mechanics"],
      estimatedCost: Math.round(total * decorWeight * 0.65),
      confirmedCost: null,
      status: "researching",
      contactName: "Chloe Rivera",
      contactEmail: "chloe@botanicaevents.example",
      contactPhone: "+1 (555) 321-6540",
      depositAmount: Math.round(total * decorWeight * 0.65 * 0.25),
      depositDueDate: computePhaseDeadline(eventDate, "1_to_2_months"),
      paymentReminder: "Final balance due 21 days prior to delivery.",
      questionsToAsk: [
        "Are in-season, locally sourced blooms prioritized to reduce environmental footprint?",
        "Do you handle breakdown and post-event floral donation or composting?",
        "Can centerpieces be repurposed from the ceremony to reception tables?",
      ],
      alternativeOptions: ["Wildflower & Vine", "Petals of Grace"],
      bookingConfirmed: false,
    },
  ];

  // 6. Personalized Ideas tailored to user preferences
  const ideas: PersonalizedIdeas = {
    themesAndDecor: [
      {
        title: "Textured Organic Minimalism with Botanical Accents",
        description: `Subtle textured linens in earthy neutrals paired with ${prefs.colorPalette[0] || "warm terracotta"} and ${prefs.colorPalette[1] || "sage green"} stoneware. Floating tea lights and low-profile asymmetrical florals maximize eye-level guest conversation across banquet tables.`,
        colorAccents: prefs.colorPalette.length > 0 ? prefs.colorPalette : ["#C97A63", "#60725C", "#E8D8C8"],
        visualStyle: "Architectural modernism blended with lush natural greenery and matte ceramics.",
      },
      {
        title: "Ambient Micro-Lighting & Overhead Canopy",
        description: "Bespoke warm filament bistro lighting hung in geometric canopies with suspended foliage clusters over key focal points (stage, sweetheart table, and dessert bar).",
        colorAccents: ["#F59E0B", "#FBBF24", "#78350F"],
        visualStyle: "Intimate, warm golden hour luminescence creating a glowing photographable ceiling.",
      },
    ],
    foodAndBeverage: [
      {
        title: "Interactive Seasonal Tasting Stations",
        description: `Chefs preparing made-to-order artisanal tapas with dedicated signage for ${prefs.dietaryRestrictions.join(", ") || "dietary preferences"}. Allows guests to graze casually while socializing.`,
        dietaryCompliance: prefs.dietaryRestrictions.length > 0 ? prefs.dietaryRestrictions : ["Vegetarian", "Gluten-Free", "Dairy-Free"],
        signatureItem: "Heirloom Smoked Polenta Cakes with Wild Foraged Mushrooms & Truffle Glaze",
      },
      {
        title: "Curated Zero-Proof Botanical Elixir Bar",
        description: "A beautifully styled bar offering craft zero-proof mocktails infused with rosemary, hibiscus, and cold-pressed yuzu, ensuring non-drinking guests feel fully indulged.",
        dietaryCompliance: ["Alcohol-Free", "Vegan", "Refined-Sugar-Free"],
        signatureItem: "Sparkling Lavender Yuzu Spritz with Dehydrated Citrus Rim",
      },
    ],
    activitiesAndEntertainment: [
      {
        title: "Audio Guestbook & Vintage Rotary Telephone Station",
        description: "Guests pick up an antique telephone to leave uninhibited, heartfelt audio voice messages and funny memories that are professionally compiled into a keepsake vinyl or sound file.",
        targetAudience: "All Ages",
        guestEngagementScore: "Very High",
      },
      {
        title: "Live Acoustic String Pop Fusion Trio",
        description: "Trio performing contemporary hits arranged for acoustic cello, violin, and Spanish guitar during guest arrival and cocktail hour.",
        targetAudience: "Lovers of diverse musical styles",
        guestEngagementScore: "High",
      },
    ],
    invitationConcepts: [
      {
        format: "Textured Letterpress Card with Digital RSVP QR Code",
        headline: `Join Us to Celebrate: ${prefs.title}`,
        wordingSample: `Together with their closest community, you are warmly invited to share in an evening of joy, connection, and celebration on the nineteenth of June.`,
        aestheticNote: "Printed on 100% recycled cotton seed paper embedded with wildflower seeds that guests can plant.",
      },
    ],
    sustainabilityAlternatives: [
      {
        standardApproach: "Cut exotic imported flowers shipped in refrigerated air cargo with floral foam.",
        ecoAlternative: "Locally grown in-season potted botanical plants and organic blooms in water basins.",
        impact: "Reduces floral carbon footprint by ~70% and potted plants can be gifted to guests or replanted.",
      },
      {
        standardApproach: "Individual single-use plastic water bottles and acrylic signage.",
        ecoAlternative: "Infused fruit water hydration dispensers and reusable wooden or chalkboard easels.",
        impact: "Eliminates ~400 single-use plastic bottles and petroleum-based acrylic landfill waste.",
      },
      {
        standardApproach: "Excess food surplus sent to landfill.",
        ecoAlternative: "Pre-contracted partnership with local food rescue charity for rapid food pickup.",
        impact: "Safely diverts hundreds of quality meals to local families experiencing food insecurity.",
      },
    ],
    weatherContingency: {
      primaryPlan: prefs.venueType === "outdoor"
        ? "Open-air lawn celebration under festoon lighting and ambient stars."
        : "Main grand hall with scenic natural window views and climate control.",
      backupPlan: "Clear-top heavy-gauge structural tenting with industrial silent radiant heaters and raised wood subflooring.",
      triggerCondition: "Forecast showing >40% chance of precipitation or wind gusts exceeding 25 mph at the 72-hour forecast checkpoint.",
      setupTimeline: "Tent vendor placed on standby 7 days prior; tent erection begins at 07:00 AM on the day prior if triggered.",
    },
  };

  // 7. Risk Management and Contingency Matrix
  const risks: RiskContingencyItem[] = [
    {
      id: "r-1",
      category: "weather",
      risk: "Sudden precipitation or extreme temperature shift on event day.",
      severity: prefs.venueType === "indoor" ? "low" : "high",
      likelihood: prefs.venueType === "indoor" ? "low" : "medium",
      prevention: "Secure 72-hour tent reservation option with clear sidewalls; rent portable forced-air blowers.",
      contingencyPlan: "Execute indoor pavilion or tented switch immediately upon reaching the 48-hour weather trigger window.",
      emergencyContact: "Venue Operations Duty Manager: +1 (555) 234-8890",
    },
    {
      id: "r-2",
      category: "vendor",
      risk: "Lead photographer or DJ illness / transportation breakdown on morning of event.",
      severity: "high",
      likelihood: "low",
      prevention: "Require contracted vendors to name explicit vetted backup operators in service agreement.",
      contingencyPlan: "Pre-screen emergency agency roster with instant dispatch numbers on speed-dial.",
      emergencyContact: "Emergency Vendor Dispatch Network: +1 (555) 999-HELP",
    },
    {
      id: "r-3",
      category: "budget",
      risk: "Unanticipated permit fees, power drops, or last-minute vendor overtime charges.",
      severity: "medium",
      likelihood: "medium",
      prevention: "Insist on all-inclusive quotes covering delivery, tax, and service charges prior to signing.",
      contingencyPlan: `Draw exclusively from the dedicated ${budgetSummary.currency} ${budgetSummary.contingencyAmount.toLocaleString()} Contingency Reserve.`,
      emergencyContact: "Financial Coordinator / Organizer: +1 (555) 444-1212",
    },
    {
      id: "r-4",
      category: "accessibility_dietary",
      risk: "Allergen cross-contamination or physical accessibility barrier for guests with limited mobility.",
      severity: "high",
      likelihood: "low",
      prevention: `Strictly audit caterer's allergy protocol; inspect ramps and pathways 4 hours before guest arrival.`,
      contingencyPlan: "Dedicated culinary chef prepares isolated sealed allergy plates; portable threshold ramps on hand.",
      emergencyContact: "Safety & Accessibility Steward: +1 (555) 555-SAFE",
    },
    {
      id: "r-5",
      category: "guest_count",
      risk: "Attendance surges 10% above final caterer guarantee.",
      severity: "medium",
      likelihood: "medium",
      prevention: "Strict RSVP deadline with telephone follow-up for unconfirmed invitees 3 weeks prior.",
      contingencyPlan: "Caterer contractually obligates 5% buffer seating and meal surplus on standby.",
      emergencyContact: "Host Welcome Desk: +1 (555) 123-HOST",
    },
  ];

  return {
    id: `plan-${prefs.eventType}-${prefs.budget}`,
    createdAt: now,
    updatedAt: now,
    isDemo: true,
    modelUsed: "Gatherly Curated Procedural Planning Engine v1.0",
    userPreferences: prefs,
    overview,
    budgetItems: reconciledBudgetItems,
    budgetSummary,
    timeline,
    itinerary,
    vendors,
    ideas,
    risks,
  };
}
