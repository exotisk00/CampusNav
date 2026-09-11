import { GEMINI_API_KEY } from './aiConfig.js';
import { campusLocations } from '../../data/locations.js';

/**
 * Calls Gemini REST API when VITE_GEMINI_API_KEY is configured.
 * Embeds LPU campus directory, live Firestore events, and live lost & found items.
 */
export async function queryGeminiApi(userMessage, context = {}) {
  if (!GEMINI_API_KEY) return null;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000);

  const liveEvents = (context.events || []).slice(0, 5).map((e) => ({
    title: e.title,
    date: e.date,
    time: e.time,
    location: e.location,
    category: e.category,
    attendees: e.attendees,
  }));

  const liveLostFound = (context.lostFoundItems || []).slice(0, 5).map((i) => ({
    type: i.type,
    title: i.title,
    description: i.description,
    location: i.location,
    date: i.date,
    category: i.category,
  }));

  const systemInstruction = `You are CampusNav AI, the helpful campus assistant for Lovely Professional University (LPU) in Phagwara, Punjab, India.
You have real-time access to the following campus data:

CAMPUS DIRECTORY (Real LPU landmarks and coordinates):
${JSON.stringify(campusLocations.map((l) => ({ id: l.id, name: l.name, category: l.category, hours: l.hours, lat: l.lat, lng: l.lng, amenities: l.amenities })))}

LIVE FIRESTORE EVENTS:
${JSON.stringify(liveEvents)}

LIVE FIRESTORE LOST & FOUND:
${JSON.stringify(liveLostFound)}

GUIDELINES:
1. Provide concise, friendly, and accurate information about LPU campus buildings, navigation, events, and lost & found.
2. If the user asks for directions or where a building is, state that walking navigation is available on the interactive campus map.
3. Keep responses under 4-5 sentences when possible unless the user asks for comprehensive details.
4. Do not invent non-existent campus landmarks. Ground all responses in the real LPU data above.`;

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;
    const payload = {
      contents: [
        {
          role: 'user',
          parts: [
            { text: `${systemInstruction}\n\nUser Question: ${userMessage}` },
          ],
        },
      ],
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: 600,
      },
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errBody = await response.text();
      console.warn('Gemini API HTTP Error:', response.status, errBody);
      return null; // Triggers fallback to local context engine
    }

    const data = await response.json();
    const candidateText =
      data?.candidates?.[0]?.content?.parts?.[0]?.text || '';

    if (!candidateText) return null;

    // Detect if a known campus location was discussed for navigation
    const lowerUser = userMessage.toLowerCase();
    const matchedLoc = campusLocations.find(
      (l) =>
        lowerUser.includes(l.name.toLowerCase()) ||
        lowerUser.includes(l.shortName.toLowerCase()) ||
        (l.id === 'loc_003' && lowerUser.includes('library')) ||
        (l.id === 'loc_005' && (lowerUser.includes('food') || lowerUser.includes('canteen'))) ||
        (l.id === 'loc_006' && lowerUser.includes('sports'))
    );

    let action = null;
    if (matchedLoc) {
      action = {
        type: 'NAVIGATE',
        label: `Navigate to ${matchedLoc.shortName || matchedLoc.name}`,
        locationId: matchedLoc.id,
        locationName: matchedLoc.name,
        url: `/map?location=${matchedLoc.id}&directions=1`,
      };
    } else if (lowerUser.includes('event')) {
      action = {
        type: 'VIEW_EVENTS',
        label: 'View Events Calendar',
        url: '/events',
      };
    } else if (lowerUser.includes('lost') || lowerUser.includes('found')) {
      action = {
        type: 'VIEW_LOST_FOUND',
        label: 'Open Lost & Found',
        url: '/lost-found',
      };
    }

    return {
      text: candidateText.trim(),
      action,
      provider: 'Google Gemini 1.5 Flash',
    };
  } catch (err) {
    clearTimeout(timeoutId);
    console.warn('Gemini API request failed or timed out, falling back to local engine:', err?.message);
    return null;
  }
}
