/**
 * RoadSafe AI — Route Planner Controller (route-planner2.js)
 */

const RoutePlanner = {
  selectedRoute: "safest",
  origin: "Panki Industrial Area",
  destination: "IIT Kanpur Campus",
  isNavigating: false,
  navigationInterval: null,

  landmarks: {
    "panki": [26.4385, 80.2440],
    "iit kanpur": [26.5120, 80.2330],
    "civil lines": [26.4670, 80.3490],
    "swaroop nagar": [26.4760, 80.3110],
    "mall road": [26.4600, 80.3540]
  },

  routesData: {},

  init() {
    const origEl = document.getElementById("originInput");
    const destEl = document.getElementById("destInput");
    this.origin = origEl ? origEl.value : "Panki Industrial Area";
    this.destination = destEl ? destEl.value : "IIT Kanpur Campus";
    this.calculateRoutes(this.origin, this.destination);
    this.setupEventListeners();
  },

  geocode(locationStr) {
    if (!locationStr) return [26.4385, 80.2440];
    const normalized = locationStr.toLowerCase().trim();
    for (const key in this.landmarks) {
      if (normalized.includes(key) || key.includes(normalized)) {
        return this.landmarks[key];
      }
    }
    return [26.45, 80.30];
  },

  async calculateRoutes(originStr, destStr) {
    this.origin = originStr || "Panki Industrial Area";
    this.destination = destStr || "IIT Kanpur Campus";

    const startCoords = this.geocode(this.origin);
    const endCoords = this.geocode(this.destination);

    const step1 = [startCoords[0], startCoords[1]];
    const step2 = [startCoords[0] + (endCoords[0] - startCoords[0]) * 0.5, startCoords[1] + (endCoords[1] - startCoords[1]) * 0.3];
    const step3 = [endCoords[0], endCoords[1]];
    const realPolyline = [step1, step2, step3];

    this.routesData = {
      safest: {
        name: "Safest Route",
        distanceKm: 12.4,
        durationMin: 24,
        potholesCount: 0,
        safetyScore: 98,
        tag: "Recommended",
        tagClass: "tag-safest",
        path: realPolyline
      },
      balanced: {
        name: "Balanced Route",
        distanceKm: 11.2,
        durationMin: 20,
        potholesCount: 1,
        safetyScore: 86,
        tag: "Moderate",
        tagClass: "tag-balanced",
        path: realPolyline
      },
      fastest: {
        name: "Fastest Route",
        distanceKm: 10.1,
        durationMin: 16,
        potholesCount: 3,
        safetyScore: 64,
        tag: "High Pothole Risk",
        tagClass: "tag-fastest",
        path: realPolyline
      }
    };

    this.renderRouteCards();
    this.selectRoute(this.selectedRoute || "safest");
  },

  setupEventListeners() {
    const originInput = document.getElementById("originInput");
    const destInput = document.getElementById("destInput");
    const calcBtn = document.getElementById("calcRouteBtn");

    const updateRoute = () => {
      const orig = originInput ? originInput.value : this.origin;
      const dest = destInput ? destInput.value : this.destination;
      this.calculateRoutes(orig, dest);
    };

    if (calcBtn) calcBtn.addEventListener("click", updateRoute);
  },

  renderRouteCards() {
    const container = document.getElementById("routeOptionsContainer");
    if (!container) return;

    container.innerHTML = Object.keys(this.routesData).map((key) => {
      const r = this.routesData[key];
      return `
        <div class="route-select-card ${key === this.selectedRoute ? "active" : ""}" onclick="RoutePlanner.selectRoute('${key}')">
          <span class="route-tag ${r.tagClass}">${r.tag}</span>
          <div class="route-card-title">${r.name}</div>
          <div style="font-size: 20px; font-weight: 700; color: var(--primary-purple); margin-top: 4px;">
            ${r.durationMin} min <span style="font-size: 14px; font-weight: 400; color: #64748b;">(${r.distanceKm} km)</span>
          </div>
        </div>
      `;
    }).join("");
  },

  selectRoute(routeKey) {
    this.selectedRoute = routeKey;
    this.renderRouteCards();

    const activeRoute = this.routesData[routeKey];
    if (!activeRoute) return;

    if (typeof MapEngine !== "undefined" && MapEngine.map) {
      const lineColor = routeKey === "safest" ? "#7c3aed" : (routeKey === "balanced" ? "#f59e0b" : "#ef4444");
      MapEngine.drawRoute(activeRoute.path, lineColor, 6, this.origin, this.destination);
    }
  }
};

if (typeof window !== "undefined") {
  window.RoutePlanner = RoutePlanner;
}
