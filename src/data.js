export const PINCODE_DATA = {
  "600001": { city: "Chennai", zone: "Anna Nagar", nfi: 72, reason: "Coastal flooding zone", lat: 13.09, lng: 80.21 },
  "600028": { city: "Chennai", zone: "Adyar", nfi: 81, reason: "High waterlogging risk", lat: 13.00, lng: 80.25 },
  "600017": { city: "Chennai", zone: "T. Nagar", nfi: 61, reason: "Dense urban, moderate flood", lat: 13.04, lng: 80.23 },
  "400053": { city: "Mumbai", zone: "Andheri East", nfi: 74, reason: "Low-lying industrial zone", lat: 19.11, lng: 72.87 },
  "400050": { city: "Mumbai", zone: "Bandra West", nfi: 28, reason: "Elevated, well-drained", lat: 19.06, lng: 72.83 },
  "400012": { city: "Mumbai", zone: "Dadar", nfi: 58, reason: "Flood-prone railway belt", lat: 19.02, lng: 72.84 },
  "110001": { city: "Delhi", zone: "Connaught Place", nfi: 65, reason: "High AQI exposure", lat: 28.63, lng: 77.22 },
  "110020": { city: "Delhi", zone: "Saket", nfi: 48, reason: "Moderate AQI, less flood", lat: 28.52, lng: 77.21 },
  "110092": { city: "Delhi", zone: "Shahdara", nfi: 77, reason: "Yamuna flood plain", lat: 28.67, lng: 77.29 },
  "560001": { city: "Bangalore", zone: "MG Road", nfi: 38, reason: "Moderate disruption history", lat: 12.97, lng: 77.61 },
  "560034": { city: "Bangalore", zone: "Koramangala", nfi: 55, reason: "Flood-prone low areas", lat: 12.93, lng: 77.62 },
  "500001": { city: "Hyderabad", zone: "Charminar", nfi: 69, reason: "Extreme heat stress zone", lat: 17.36, lng: 78.47 },
  "500072": { city: "Hyderabad", zone: "Gachibowli", nfi: 44, reason: "Tech corridor, moderate risk", lat: 17.44, lng: 78.35 },
  "302001": { city: "Jaipur", zone: "Pink City", nfi: 52, reason: "Heat + dust storm exposure", lat: 26.92, lng: 75.82 },
  "380001": { city: "Ahmedabad", zone: "Old City", nfi: 63, reason: "Extreme summer heat zone", lat: 23.02, lng: 72.58 },
};

export const DISRUPTION_FEED = [
  { id: 1, type: "rain", icon: "🌧", title: "Heavy Rainfall Alert", desc: "58mm in 2 hrs — threshold crossed", city: "Chennai", time: "2 min ago", severity: "high" },
  { id: 2, type: "heat", icon: "🌡", title: "Heat Stress Index", desc: "Feels-like 44°C — outdoor work unsafe", city: "Hyderabad", time: "8 min ago", severity: "high" },
  { id: 3, type: "aqi", icon: "💨", title: "Severe AQI Warning", desc: "AQI 387 — Very Poor air quality", city: "Delhi", time: "15 min ago", severity: "medium" },
  { id: 4, type: "flood", icon: "🌊", title: "Waterlogging Alert", desc: "Pin-code 600028 — Red alert issued", city: "Chennai", time: "22 min ago", severity: "high" },
  { id: 5, type: "platform", icon: "📵", title: "Platform Downtime", desc: "Swiggy outage detected — 95 min", city: "Mumbai", time: "31 min ago", severity: "medium" },
  { id: 6, type: "curfew", icon: "🚧", title: "Local Curfew", desc: "Section 144 — Shahdara zone", city: "Delhi", time: "45 min ago", severity: "high" },
];

export const TIERS = [
  { id: "basic", name: "Basic", base: 25, max: 500, color: "#4CAF82", bg: "#E8F5EE", coverage: ["Heavy rain", "Flooding"] },
  { id: "standard", name: "Standard", base: 45, max: 1000, color: "#F59E0B", bg: "#FEF3C7", coverage: ["Rain", "Flooding", "AQI", "Curfew"] },
  { id: "premium", name: "Premium", base: 70, max: 2000, color: "#EF4444", bg: "#FEE2E2", coverage: ["Rain", "Flooding", "AQI", "Curfew", "Heat Stress", "Platform outage"] },
];

export const CLAIMS_HISTORY = [
  { id: "CLM001", date: "Mar 12, 2025", trigger: "Heavy Rainfall", city: "Chennai", amount: 420, status: "paid" },
  { id: "CLM002", date: "Feb 28, 2025", trigger: "Heat Stress", city: "Hyderabad", amount: 310, status: "paid" },
  { id: "CLM003", date: "Feb 10, 2025", trigger: "AQI Warning", city: "Delhi", amount: 190, status: "paid" },
  { id: "CLM004", date: "Jan 22, 2025", trigger: "Platform Downtime", city: "Mumbai", amount: 250, status: "paid" },
  { id: "CLM005", date: "Jan 05, 2025", trigger: "Waterlogging", city: "Chennai", amount: 500, status: "paid" },
];

export const WHATSAPP_FLOW = [
  { from: "user", text: "Hi" },
  { from: "bot", text: "👋 Welcome to *GigShield*! Income protection for Zomato & Swiggy partners.\n\nReply with your name to get started." },
  { from: "user", text: "Ravi Kumar" },
  { from: "bot", text: "Hi Ravi! 🛵 Which platform do you ride for?\n\n1️⃣ Zomato\n2️⃣ Swiggy" },
  { from: "user", text: "1" },
  { from: "bot", text: "Got it — Zomato ✅\n\nShare your operating pin code so I can check your zone's risk score." },
  { from: "user", text: "600001" },
  { from: "bot", text: "📍 *Anna Nagar, Chennai* — NFI Risk Score: *72/100* (High)\n\nThis zone had 28 disruption days last year. Without coverage, you'd lose ~₹1,440/month.\n\nYour recommended plan: *Standard (₹54/week)*\n\nReply YES to activate 🔐" },
  { from: "user", text: "YES" },
  { from: "bot", text: "✅ *GigShield Standard activated!*\n\n• Weekly premium: ₹54 (debited every Monday)\n• Max payout: ₹1,000/week\n• Coverage: Rain · Flood · AQI · Curfew\n\nYou'll get alerts before disruptions and auto-payouts when triggers fire. Stay safe! 🛡️" },
];

export const INSURER_STATS = {
  totalWorkers: 12847, activePolicies: 9234,
  premiumThisWeek: 487980, claimsThisWeek: 312,
  claimsPaid: 284700, lossRatio: 58.3, fraudFlagged: 14,
};

export const ZONE_RISK_MAP = [
  { city: "Chennai", pin: "600028", nfi: 81, workers: 1420, activeClaims: 42 },
  { city: "Delhi", pin: "110092", nfi: 77, workers: 980, activeClaims: 28 },
  { city: "Mumbai", pin: "400053", nfi: 74, workers: 2100, activeClaims: 31 },
  { city: "Hyderabad", pin: "500001", nfi: 69, workers: 870, activeClaims: 19 },
  { city: "Delhi", pin: "110001", nfi: 65, workers: 1340, activeClaims: 22 },
  { city: "Chennai", pin: "600001", nfi: 72, workers: 1780, activeClaims: 38 },
  { city: "Jaipur", pin: "302001", nfi: 52, workers: 540, activeClaims: 8 },
  { city: "Bangalore", pin: "560034", nfi: 55, workers: 920, activeClaims: 11 },
  { city: "Bangalore", pin: "560001", nfi: 38, workers: 1100, activeClaims: 6 },
  { city: "Mumbai", pin: "400050", nfi: 28, workers: 890, activeClaims: 3 },
];

// City → OpenWeatherMap city name mapping
export const CITY_WEATHER_IDS = {
  "Chennai": "Chennai,IN",
  "Mumbai": "Mumbai,IN",
  "Delhi": "Delhi,IN",
  "Bangalore": "Bangalore,IN",
  "Hyderabad": "Hyderabad,IN",
  "Jaipur": "Jaipur,IN",
  "Ahmedabad": "Ahmedabad,IN",
};