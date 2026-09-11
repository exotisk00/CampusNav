// ─────────────────────────────────────────────────────────────
// Campus Locations
// ─────────────────────────────────────────────────────────────
// COORDINATES: Demo campus centred near Whitefield, Bangalore
// (~12.9698° N, 77.7500° E).  Replace lat/lng values with your
// real campus coordinates when available.
// ─────────────────────────────────────────────────────────────

export const CAMPUS_CENTER = { lat: 31.2533133, lng: 75.7032788 }; // LPU campus center (approx.) via OSM Nominatim

export const campusLocations = [
  {
    id: 'loc_001',
    name: 'Academic Block A',
    shortName: 'Block A',
    category: 'Academic',
    description:
      'Main academic building housing CSE, IT, and Mathematics departments. Features smart classrooms and computer labs.',
    hours: 'Mon–Sat: 8:00 AM – 8:00 PM',
    status: 'open',
    amenities: ['Wi-Fi', 'Computer Lab', 'Smart Classrooms', 'Elevator'],
    floors: 4,
    // Real map coordinates (replace with actual values)
    lat: 31.2550,
    lng: 75.7045,
    position: { x: 35, y: 30 }, // Approx. Academic Block A
    icon: 'GraduationCap',
  },
  {
    id: 'loc_002',
    name: 'Engineering Block',
    shortName: 'Eng Block',
    category: 'Academic',
    description:
      'Houses Mechanical, Civil, and Electrical engineering departments with workshops and project labs.',
    hours: 'Mon–Sat: 8:00 AM – 7:00 PM',
    status: 'open',
    amenities: ['Wi-Fi', 'Workshop', 'Project Labs', 'Seminar Hall'],
    floors: 3,
    lat: 31.2545,
    lng: 75.7060,
    position: { x: 55, y: 25 }, // Approx. Engineering Block
    icon: 'Wrench',
  },
  {
    id: 'loc_003',
    name: 'Central Library',
    shortName: 'Library',
    category: 'Academic',
    description:
      'State-of-the-art library with over 50,000 books, digital resources, silent study zones, and group discussion rooms.',
    hours: 'Mon–Sun: 7:00 AM – 11:00 PM',
    status: 'open',
    amenities: ['Wi-Fi', 'Study Rooms', 'Digital Resources', 'Printing', 'AC'],
    floors: 3,
    lat: 31.2538,
    lng: 75.7035,
    position: { x: 45, y: 45 }, // Approx. Central Library
    icon: 'BookOpen',
  },
  {
    id: 'loc_004',
    name: 'Hostels (A, B, C)',
    shortName: 'Hostels',
    category: 'Residential',
    description:
      'Three residential blocks accommodating 1,200 students. Each hostel has common rooms, laundry, and mess facilities.',
    hours: 'Open 24/7',
    status: 'open',
    amenities: ['Wi-Fi', 'Laundry', 'Common Room', 'Mess', 'Gym'],
    floors: 5,
    lat: 31.2540,
    lng: 75.7020,
    position: { x: 75, y: 60 }, // Approx. Hostels
    icon: 'Home',
  },
  {
    id: 'loc_005',
    name: 'Food Court',
    shortName: 'Food Court',
    category: 'Dining',
    description:
      'Multi-cuisine food court with 8 outlets — from South Indian to Chinese, pizza, and fresh juices. Outdoor seating available.',
    hours: 'Mon–Sun: 7:30 AM – 10:00 PM',
    status: 'open',
    amenities: ['Outdoor Seating', 'Veg & Non-Veg', 'UPI Accepted'],
    floors: 1,
    lat: 31.2532,
    lng: 75.7040,
    position: { x: 60, y: 50 }, // Approx. Food Court
    icon: 'UtensilsCrossed',
  },
  {
    id: 'loc_006',
    name: 'Sports Complex',
    shortName: 'Sports',
    category: 'Recreation',
    description:
      'Full-size basketball and tennis courts, cricket ground, indoor badminton, gym, and swimming pool.',
    hours: 'Mon–Sun: 6:00 AM – 9:00 PM',
    status: 'open',
    amenities: ['Basketball', 'Cricket', 'Swimming Pool', 'Gym', 'Changing Rooms'],
    floors: 2,
    lat: 31.2555,
    lng: 75.7025,
    position: { x: 25, y: 65 }, // Approx. Sports Complex
    icon: 'Dumbbell',
  },
  {
    id: 'loc_007',
    name: 'Auditorium',
    shortName: 'Auditorium',
    category: 'Events',
    description:
      'A 1,200-seat auditorium with modern AV equipment, green rooms, and staging area for cultural and technical events.',
    hours: 'Event-based',
    status: 'open',
    amenities: ['AV System', 'Green Room', 'AC', '1200 Seats', 'Parking'],
    floors: 2,
    lat: 31.2525,
    lng: 75.7038,
    position: { x: 40, y: 70 }, // Approx. Auditorium
    icon: 'Theater',
  },
  {
    id: 'loc_008',
    name: 'Medical Centre',
    shortName: 'Medical',
    category: 'Health',
    description:
      'On-campus health centre with a doctor, nurse, and pharmacy. Handles minor emergencies and routine check-ups.',
    hours: 'Mon–Sat: 8:00 AM – 8:00 PM (Emergency 24/7)',
    status: 'open',
    amenities: ['Doctor', 'Pharmacy', 'First Aid', 'Ambulance'],
    floors: 1,
    lat: 31.2552,
    lng: 75.7050,
    position: { x: 70, y: 35 }, // Approx. Medical Centre
    icon: 'Cross',
  },
  {
    id: 'loc_009',
    name: 'Parking Area',
    shortName: 'Parking',
    category: 'Facilities',
    description:
      'Designated parking for students, faculty, and visitors. Separate zones for two-wheelers and four-wheelers.',
    hours: 'Open 24/7',
    status: 'open',
    amenities: ['CCTV', 'Two-Wheeler', 'Four-Wheeler', 'Visitor Parking'],
    floors: 1,
    lat: 31.2510,
    lng: 75.6980,
    position: { x: 15, y: 40 }, // Approx. Parking Area
    icon: 'Car',
  },
  {
    id: 'loc_010',
    name: 'Main Gate',
    shortName: 'Main Gate',
    category: 'Facilities',
    description:
      'Primary campus entry and exit point. Security check post with visitor registration and ID verification.',
    hours: 'Open 24/7',
    status: 'open',
    amenities: ['Security', 'Visitor Registration', 'Auto Stand'],
    floors: 1,
    lat: 31.2505,
    lng: 75.6965,
    position: { x: 10, y: 85 }, // Approx. Main Gate
    icon: 'DoorOpen',
  },
];

export const locationCategories = [
  'All',
  'Academic',
  'Residential',
  'Dining',
  'Recreation',
  'Events',
  'Health',
  'Facilities',
];

// Kept for any legacy/fallback usage; real routing uses OSRM now
export const mockDirections = {
  from: 'Main Gate',
  to: 'Central Library',
  distance: '0.4 km',
  duration: '6 min walk',
  steps: [
    { instruction: 'Start at Main Gate, head north on Main Road', distance: '120m', icon: 'ArrowUp' },
    { instruction: 'Turn right at the fountain circle', distance: '80m', icon: 'ArrowRight' },
    { instruction: 'Continue past Academic Block A on your left', distance: '100m', icon: 'ArrowUp' },
    { instruction: 'Turn left after the parking area', distance: '60m', icon: 'ArrowLeft' },
    { instruction: 'Central Library is on your right', distance: '40m', icon: 'MapPin' },
  ],
};
