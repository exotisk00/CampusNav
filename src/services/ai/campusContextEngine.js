import { campusLocations } from '../../data/locations.js';

/**
 * Normalizes query string for keyword comparisons
 */
function cleanText(str = '') {
  return str.toLowerCase().replace(/[^\w\s]/g, ' ').replace(/\s+/g, ' ').trim();
}

/**
 * Match user query to an LPU campus location
 */
function findMatchingLocation(query) {
  const q = cleanText(query);

  // Specific alias mappings for LPU campus locations
  const aliases = [
    { id: 'loc_003', keys: ['library', 'central library', 'books', 'study room', 'reading room'] },
    { id: 'loc_005', keys: ['food court', 'canteen', 'cafeteria', 'food', 'eat', 'lunch', 'dinner', 'breakfast', 'juice', 'snack'] },
    { id: 'loc_001', keys: ['academic block a', 'block a', 'cse', 'it department', 'computer lab', 'maths'] },
    { id: 'loc_002', keys: ['engineering block', 'eng block', 'mechanical', 'civil', 'electrical', 'workshop', 'project lab'] },
    { id: 'loc_004', keys: ['hostel', 'hostels', 'dorm', 'hostel a', 'hostel b', 'hostel c', 'mess', 'residence'] },
    { id: 'loc_006', keys: ['sports complex', 'sports', 'gym', 'basketball', 'cricket', 'swimming pool', 'badminton', 'tennis'] },
    { id: 'loc_007', keys: ['auditorium', 'audi', 'event hall', 'cultural hall'] },
    { id: 'loc_008', keys: ['medical centre', 'medical center', 'hospital', 'clinic', 'doctor', 'first aid', 'pharmacy', 'ambulance', 'health'] },
    { id: 'loc_009', keys: ['parking', 'parking area', 'car parking', 'bike parking', 'vehicle'] },
    { id: 'loc_010', keys: ['main gate', 'gate 1', 'entrance', 'security post', 'exit', 'auto stand'] },
  ];

  for (const item of aliases) {
    if (item.keys.some((k) => q.includes(k))) {
      return campusLocations.find((l) => l.id === item.id);
    }
  }

  // Fallback: direct name / shortName substring search
  for (const loc of campusLocations) {
    if (q.includes(loc.name.toLowerCase()) || q.includes(loc.shortName.toLowerCase())) {
      return loc;
    }
  }

  return null;
}

/**
 * Handle quick actions and specific campus queries
 */
export function generateLocalCampusResponse(userMessage, context = {}) {
  const q = cleanText(userMessage);
  const liveEvents = context.events || [];
  const liveLostFound = context.lostFoundItems || [];

  // ── 1. QUICK ACTION: "Find a place" / Directory listing ──
  if (q === 'find a place' || q.startsWith('find a place') || q === 'browse places') {
    const list = campusLocations
      .map((l) => `• **${l.name}** (${l.category}) — ${l.hours}`)
      .join('\n');
    return {
      text: `Here are key landmarks and buildings across the Lovely Professional University (LPU) campus:\n\n${list}\n\nType the name of any location (e.g., *"How do I reach the library?"*) to view walking directions on the real LPU map!`,
      action: {
        type: 'NAVIGATE',
        label: 'Explore Full Campus Map',
        url: '/map',
      },
      provider: 'Campus Context Engine',
    };
  }

  // ── 2. QUICK ACTION: "Navigate somewhere" / General navigation ──
  if (
    q === 'navigate somewhere' ||
    q === 'how does navigation work' ||
    q === 'navigation help'
  ) {
    return {
      text: `🗺️ **CampusNav Walking Navigation for LPU**\n\nOur interactive map is powered by OpenStreetMap and OSRM walking routes:\n\n1. **Current Location:** Tap the target icon on the map to detect your real GPS location on campus.\n2. **Destination:** Choose any academic block, hostel, library, or food court.\n3. **Walking Path:** See turn-by-turn walking directions, exact distance, and estimated travel time.\n\nTell me where you want to go (e.g. *"Directions to Engineering Block"* or *"Where is the food court?"*)!`,
      action: {
        type: 'NAVIGATE',
        label: 'Open Campus Map',
        url: '/map',
      },
      provider: 'Campus Context Engine',
    };
  }

  // ── 3. QUICK ACTION: "Today's events" / Events queries ──
  const isEventsQuery =
    q === "today s events" ||
    q === "today events" ||
    q.includes('upcoming event') ||
    q.includes('campus event') ||
    q.includes('hackathon') ||
    q.includes('workshop') ||
    q.includes('fest') ||
    q.includes('what s happening');

  if (isEventsQuery) {
    if (liveEvents.length === 0) {
      return {
        text: "There are currently no active events listed in the campus directory. Check back soon for upcoming hackathons, workshops, and fests!",
        action: {
          type: 'VIEW_EVENTS',
          label: 'Open Events Page',
          url: '/events',
        },
        provider: 'Campus Context Engine (Firestore)',
      };
    }

    // Filter relevant or show top upcoming events
    const topEvents = liveEvents.slice(0, 4);
    const eventSummaries = topEvents
      .map(
        (e, i) =>
          `${i + 1}. **${e.title}**\n   📅 Date: ${e.date} at ${e.time || 'TBA'}\n   📍 Location: ${e.location}\n   👥 Attendees: ${e.attendees || 0}${e.maxAttendees ? ` / ${e.maxAttendees}` : ''}`
      )
      .join('\n\n');

    return {
      text: `📅 **Upcoming Events on Campus (via Live Firestore):**\n\n${eventSummaries}\n\nYou can RSVP, check details, or add new events in the Events section.`,
      action: {
        type: 'VIEW_EVENTS',
        label: 'View All Campus Events',
        url: '/events',
      },
      provider: 'Campus Context Engine (Firestore)',
    };
  }

  // ── 4. QUICK ACTION: "Lost & Found" queries ──
  const lostFoundItemKeywords = [
    'earbuds',
    'earphones',
    'headphones',
    'watch',
    'bag',
    'backpack',
    'laptop',
    'id card',
    'identity card',
    'card',
    'keys',
    'phone',
    'bottle',
    'water bottle',
    'wallet',
    'umbrella',
  ];
  const matchedItemKeyword = lostFoundItemKeywords.find((k) => q.includes(k));

  const isLostFoundQuery =
    q === 'lost found' ||
    q === 'lost and found' ||
    q.includes('lost something') ||
    q.includes('found something') ||
    q.includes('lost my') ||
    q.includes('found a') ||
    q.includes('find my') ||
    q.includes('missing item') ||
    q.includes('lost item') ||
    q.includes('lost') ||
    q.includes('found') ||
    Boolean(matchedItemKeyword);

  if (isLostFoundQuery) {
    const matchedKeyword = matchedItemKeyword;

    let matchingItems = [];
    if (matchedKeyword) {
      matchingItems = liveLostFound.filter(
        (item) =>
          cleanText(item.title).includes(matchedKeyword) ||
          cleanText(item.description).includes(matchedKeyword) ||
          cleanText(item.category).includes(matchedKeyword)
      );
    }

    if (matchingItems.length > 0) {
      const itemList = matchingItems
        .map(
          (item) =>
            `• **[${item.type.toUpperCase()}] ${item.title}**\n  📍 Last seen: ${item.location} on ${item.date}\n  ℹ️ ${item.description}`
        )
        .join('\n\n');

      return {
        text: `🔍 **Matching Lost & Found Items (Live Database):**\n\n${itemList}\n\nVisit the Lost & Found section to contact the poster or report an item!`,
        action: {
          type: 'VIEW_LOST_FOUND',
          label: 'View in Lost & Found',
          url: '/lost-found',
        },
        provider: 'Campus Context Engine (Firestore)',
      };
    }

    const recentItems = liveLostFound
      .slice(0, 3)
      .map(
        (item) =>
          `• **[${item.type.toUpperCase()}] ${item.title}** (${item.location} • ${item.date})`
      )
      .join('\n');

    return {
      text: `🔍 **Campus Lost & Found (Live Database):**\n\nRecently posted items:\n${recentItems || 'No items currently posted.'}\n\nDid you lose or find something on campus? You can report an item with a photo, description, and location in the Lost & Found portal.`,
      action: {
        type: 'VIEW_LOST_FOUND',
        label: 'Open Lost & Found Portal',
        url: '/lost-found',
      },
      provider: 'Campus Context Engine (Firestore)',
    };
  }

  // ── 5. QUICK ACTION: "Campus help" ──
  if (q === 'campus help' || q === 'help' || q.includes('emergency contact') || q.includes('helpline')) {
    return {
      text: `🆘 **LPU Campus Support & Important Helplines:**\n\n• **Medical Centre:** Open 8:00 AM – 8:00 PM (Emergency 24/7). On-campus doctor, ambulance, and pharmacy.\n• **Security Checkpost:** Main Gate entrance (24/7 assistance and visitor verification).\n• **Wi-Fi Support:** Free high-speed student Wi-Fi across all academic blocks and hostels.\n• **Lost & Found Desk:** Security office near the Main Gate & online portal.\n• **Campus Map:** Interactive walking directions between all buildings.`,
      action: {
        type: 'NAVIGATE',
        label: 'View Medical Centre on Map',
        locationId: 'loc_008',
        url: '/map?location=loc_008&directions=1',
      },
      provider: 'Campus Context Engine',
    };
  }

  // ── 6. SPECIFIC LOCATION & NAVIGATION INQUIRIES ──
  // Check if user is asking where something is or how to reach it
  const matchedLoc = findMatchingLocation(q);
  const isNavIntent =
    q.includes('how to reach') ||
    q.includes('how do i reach') ||
    q.includes('how to get to') ||
    q.includes('where is') ||
    q.includes('directions to') ||
    q.includes('route to') ||
    q.includes('way to') ||
    q.includes('navigate') ||
    q.includes('location of') ||
    q.includes('where can i find') ||
    Boolean(matchedLoc);

  if (matchedLoc && isNavIntent) {
    const amenitiesStr = matchedLoc.amenities?.length ? matchedLoc.amenities.join(', ') : 'Standard facilities';
    const responseText = `📍 **${matchedLoc.name}** (${matchedLoc.category})\n\n${matchedLoc.description}\n\n• **Operating Hours:** ${matchedLoc.hours}\n• **Floors:** ${matchedLoc.floors} ${matchedLoc.floors === 1 ? 'Floor' : 'Floors'}\n• **Amenities:** ${amenitiesStr}\n• **Campus Coordinates:** ${matchedLoc.lat.toFixed(4)}° N, ${matchedLoc.lng.toFixed(4)}° E\n\nWould you like walking directions from your current location? Tap the button below to open it directly on the real LPU map!`;

    return {
      text: responseText,
      action: {
        type: 'NAVIGATE',
        label: `Navigate to ${matchedLoc.shortName || matchedLoc.name}`,
        locationId: matchedLoc.id,
        locationName: matchedLoc.name,
        lat: matchedLoc.lat,
        lng: matchedLoc.lng,
        url: `/map?location=${matchedLoc.id}&directions=1`,
      },
      provider: 'Campus Context Engine',
    };
  }

  // ── 7. GENERAL GREETINGS & CASUAL QUESTIONS ──
  if (
    q === 'hello' ||
    q === 'hi' ||
    q === 'hey' ||
    q === 'greetings' ||
    q.startsWith('hello') ||
    q.startsWith('hi ')
  ) {
    return {
      text: `Hello! 👋 I'm your **CampusNav AI Assistant** for Lovely Professional University (LPU).\n\nI can help you with:\n• **Walking directions** to any academic block, library, or food court\n• **Live events** and workshops on campus\n• **Lost & Found** searches and reporting\n• **Building timings** and campus facilities\n\nTry asking *"How do I reach the library?"* or select a quick action below!`,
      action: null,
      provider: 'Campus Context Engine',
    };
  }

  // ── 8. FALLBACK RESPONSE ──
  return {
    text: `I'm not completely sure about that, but I can help you with anything on the LPU campus! Here are great things you can ask me:\n\n• *"How do I reach the library?"* (Calculates walking route on real map)\n• *"Where is Academic Block A?"*\n• *"What are today's events?"* (Reads from live Firestore events)\n• *"Did anyone find blue earbuds?"* (Searches live Lost & Found)\n• *"Medical Centre timings"*\n\nFeel free to tap any of the suggested actions below!`,
    action: {
      type: 'NAVIGATE',
      label: 'Open Campus Map',
      url: '/map',
    },
    provider: 'Campus Context Engine',
  };
}

export const quickActions = [
  { id: 'find_place', label: '📍 Find a place', query: 'Find a place' },
  { id: 'navigate', label: '🧭 Navigate somewhere', query: 'How does navigation work?' },
  { id: 'events', label: "📅 Today's events", query: "Today's events" },
  { id: 'lost_found', label: '🔍 Lost & Found', query: 'I lost something on campus' },
  { id: 'help', label: '🆘 Campus help', query: 'Campus help' },
];

export const suggestedPrompts = [
  'How do I reach the library?',
  'Where is Academic Block A?',
  "Show me today's events",
  'I lost something on campus',
  'Food Court hours and location',
  'Where is the Medical Centre?',
];
