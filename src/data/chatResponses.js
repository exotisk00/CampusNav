const responses = {
  greetings: [
    'Hello! 👋 I\'m your CampusNav Assistant. I can help you navigate the campus, find events, locate facilities, and more. What can I help you with?',
    'Hi there! Ready to help you explore the campus. Ask me about locations, events, schedules, or anything campus-related!',
  ],
  library: [
    'The **Central Library** is open Mon–Sun from 7:00 AM to 11:00 PM. This week, hours are extended until midnight for mid-sem prep! It\'s located at the centre of campus — just head north from the Main Gate and take a left after Academic Block A. 📚',
  ],
  food: [
    'The **Food Court** is open daily from 7:30 AM to 10:00 PM. It has 8 outlets including South Indian, Chinese, pizza, and juice bars. It\'s located near the Hostels. Want me to show you directions? 🍕',
  ],
  hostel: [
    'We have **3 Hostels** (A, B, and C) on the east side of campus, accommodating 1,200 students. Each has common rooms, laundry, mess, and gym facilities. They\'re open 24/7. 🏠',
  ],
  events: [
    'Here are some upcoming events:\n\n1. **TechFest 2026 Hackathon** — Sep 20, Auditorium\n2. **Fresher\'s Night** — Sep 15, Auditorium\n3. **AI/ML Workshop** — Sep 18, Block A\n4. **Basketball Tournament** — Sep 25, Sports Complex\n\nWant details about any specific event? 🎉',
  ],
  directions: [
    'I can help with directions! Just tell me where you want to go. For example: "How do I get to the Library?" or "Directions to Food Court". You can also use the **Campus Map** tab for visual navigation. 🗺️',
  ],
  sports: [
    'The **Sports Complex** has basketball courts, tennis courts, a cricket ground, indoor badminton, gym, and swimming pool. Open daily from 6:00 AM to 9:00 PM. It\'s on the south-west side of campus. 🏀',
  ],
  medical: [
    'The **Medical Centre** is on the east side, open Mon–Sat 8 AM – 8 PM, with 24/7 emergency services. It has a doctor, nurse, pharmacy, and ambulance. For emergencies, call the campus helpline. 🏥',
  ],
  parking: [
    'The **Parking Area** is near the Main Gate (west side). There are separate zones for two-wheelers and four-wheelers. CCTV monitored, open 24/7. Visitor parking is available too. 🅿️',
  ],
  lost: [
    'You can report lost or found items through the **Lost & Found** section. Just go to Lost & Found in the navigation and tap "Report Item". Include a photo and description for the best chance of finding your item! 🔍',
  ],
  fallback: [
    'I\'m not sure about that, but I can help you with:\n\n• **Campus locations** — Library, Food Court, Hostels, etc.\n• **Directions** — How to get somewhere on campus\n• **Events** — Upcoming campus events\n• **Lost & Found** — Report or find items\n• **Facilities** — Sports, Medical, Parking info\n\nTry asking about any of these! 😊',
  ],
};

const keywordMap = {
  library: 'library',
  book: 'library',
  study: 'library',
  read: 'library',
  food: 'food',
  eat: 'food',
  canteen: 'food',
  restaurant: 'food',
  hungry: 'food',
  lunch: 'food',
  dinner: 'food',
  breakfast: 'food',
  coffee: 'food',
  hostel: 'hostel',
  dorm: 'hostel',
  room: 'hostel',
  accommodation: 'hostel',
  event: 'events',
  fest: 'events',
  hackathon: 'events',
  concert: 'events',
  workshop: 'events',
  cultural: 'events',
  fresher: 'events',
  direction: 'directions',
  navigate: 'directions',
  route: 'directions',
  'how to get': 'directions',
  'where is': 'directions',
  map: 'directions',
  sport: 'sports',
  gym: 'sports',
  basketball: 'sports',
  cricket: 'sports',
  swim: 'sports',
  pool: 'sports',
  tennis: 'sports',
  medical: 'medical',
  doctor: 'medical',
  hospital: 'medical',
  health: 'medical',
  pharmacy: 'medical',
  emergency: 'medical',
  ambulance: 'medical',
  parking: 'parking',
  car: 'parking',
  bike: 'parking',
  vehicle: 'parking',
  lost: 'lost',
  found: 'lost',
  missing: 'lost',
  hello: 'greetings',
  hi: 'greetings',
  hey: 'greetings',
  help: 'greetings',
  start: 'greetings',
};

export function getAssistantResponse(userMessage) {
  const lower = userMessage.toLowerCase().trim();

  for (const [keyword, category] of Object.entries(keywordMap)) {
    if (lower.includes(keyword)) {
      const categoryResponses = responses[category];
      return categoryResponses[Math.floor(Math.random() * categoryResponses.length)];
    }
  }

  return responses.fallback[0];
}

export const suggestedPrompts = [
  'Where is the Library?',
  'Show me upcoming events',
  'How do I get to the Food Court?',
  'Is the Sports Complex open?',
  'I lost something on campus',
  'Where can I park my bike?',
];
