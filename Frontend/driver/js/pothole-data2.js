/**
 * RoadSafe AI — Shared Pothole Data Store (pothole-data2.js)
 */

const PotholeDataStore = {
  potholes: [
    {
      id: "POT-101",
      lat: 26.4524,
      lng: 80.3345,
      address: "Mall Road near Phool Bagh, Kanpur",
      severity: "High",
      riskScore: 88,
      detectedAt: "2026-07-20 14:32",
      image: "https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80",
      status: "Unrepaired",
      upvotes: 24,
      depthCm: 14.5,
      widthCm: 65,
      aiConfidence: 97.4,
      bbox: { x: 25, y: 35, width: 45, height: 30 }
    },
    {
      id: "POT-102",
      lat: 26.4465,
      lng: 80.3262,
      address: "GT Road Junction near Civil Lines, Kanpur",
      severity: "Medium",
      riskScore: 62,
      detectedAt: "2026-07-21 09:15",
      image: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=800&q=80",
      status: "Scheduled for Repair",
      upvotes: 12,
      depthCm: 8.0,
      widthCm: 42,
      aiConfidence: 91.2,
      bbox: { x: 30, y: 40, width: 35, height: 25 }
    },
    {
      id: "POT-103",
      lat: 26.4555,
      lng: 80.3402,
      address: "Birhana Road, Canal Crossing, Kanpur",
      severity: "Low",
      riskScore: 35,
      detectedAt: "2026-07-22 11:45",
      image: "https://images.unsplash.com/photo-1584467735815-f778f274e296?auto=format&fit=crop&w=800&q=80",
      status: "Under Inspection",
      upvotes: 5,
      depthCm: 4.2,
      widthCm: 25,
      aiConfidence: 89.6,
      bbox: { x: 40, y: 30, width: 25, height: 20 }
    },
    {
      id: "POT-104",
      lat: 26.4612,
      lng: 80.3210,
      address: "VIP Road near Swaroop Nagar, Kanpur",
      severity: "High",
      riskScore: 94,
      detectedAt: "2026-07-22 16:50",
      image: "https://images.unsplash.com/photo-1578991624414-276ef23a534f?auto=format&fit=crop&w=800&q=80",
      status: "Unrepaired",
      upvotes: 41,
      depthCm: 18.2,
      widthCm: 78,
      aiConfidence: 98.8,
      bbox: { x: 20, y: 25, width: 55, height: 40 }
    }
  ],

  routeHistory: [
    {
      id: "TRIP-801",
      date: "2026-07-22",
      time: "08:30 AM",
      from: "Civil Lines, Kanpur",
      to: "IIT Kanpur Campus",
      distanceKm: 12.4,
      durationMin: 24,
      potholesEncountered: 1,
      potholesAvoided: 5,
      safetyScore: 95,
      routeType: "Safest Route"
    },
    {
      id: "TRIP-802",
      date: "2026-07-21",
      time: "05:15 PM",
      from: "Kanpur Central Railway Station",
      to: "Swaroop Nagar",
      distanceKm: 6.8,
      durationMin: 16,
      potholesEncountered: 3,
      potholesAvoided: 2,
      safetyScore: 82,
      routeType: "Fastest Route"
    }
  ],

  getPotholeById(id) {
    return this.potholes.find((p) => p.id === id) || this.potholes[0];
  },

  getSeverityBadgeClass(severity) {
    switch (severity.toLowerCase()) {
      case "high": return "badge-danger-soft";
      case "medium": return "badge-warning-soft";
      case "low": return "badge-success-soft";
      default: return "badge-purple-soft";
    }
  },

  getStatusBadgeClass(status) {
    switch (status.toLowerCase()) {
      case "repaired": return "badge-success-soft";
      case "under inspection": return "badge-purple-soft";
      case "scheduled for repair": return "badge-warning-soft";
      default: return "badge-danger-soft";
    }
  }
};

if (typeof window !== "undefined") {
  window.PotholeDataStore = PotholeDataStore;
}
