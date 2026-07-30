// ==========================================================================
// ROADIES (Road Optimization And Detection Intelligent Evaluation System)
// Driver Dashboard Controller (dashboard.js)
// Enterprise AI Command Center Architecture
// Prepared for FastAPI & PostgreSQL API Integration
// ==========================================================================

// Centralized Data Model (Populated dynamically via API fetch or default fallback)
const dashboardData = {
  driver: {
    name: "shhio",
    role: "Driver / Member 3",
    score: "95%"
  },
  pothole: {
    id: "#POT-101",
    rawId: "POT-101",
    title: "Pothole Analysis",
    location: "Mall Road near Phool Bagh, Kanpur",
    hazardLevel: "High Hazard Level",
    repairStatus: "Unrepaired",
    depth: "14.5 cm",
    diameter: "65 cm",
    confidence: "97.4%",
    detectedAt: "2026-07-20 14:32",
    gps: {
      lat: 26.4524,
      lng: 80.3345,
      formatted: "26.4524° N, 80.3345° E"
    },
    confirmations: 24,
    isConfirmed: false
  },
  stats: {
    nearby: 12,
    reports: 8,
    routes: "94%",
    score: "95%"
  }
};

let mapInstance = null;

// Initialize Dashboard Application
document.addEventListener("DOMContentLoaded", () => {
  loadDashboardData();
  setupEventListeners();
});

// Async API Readiness Hook for FastAPI backend integration
async function loadDashboardData() {
  try {
    // Backend API Integration Point (Uncomment when FastAPI endpoint is live):
    // const response = await fetch('/api/v1/driver/dashboard');
    // const apiData = await response.json();
    // Object.assign(dashboardData, apiData);

    renderDashboardUI(dashboardData);
    initMapEngine(dashboardData.pothole);
  } catch (error) {
    console.warn("FastAPI backend offline, utilizing local ROADIES state model:", error);
    renderDashboardUI(dashboardData);
    initMapEngine(dashboardData.pothole);
  }
}

// Render UI Elements dynamically from Data Model
function renderDashboardUI(data) {
  const p = data.pothole;
  const d = data.driver;
  const s = data.stats;

  // Header & User info
  setTextContent("potholeTitle", `${p.title} ${p.id}`);
  setTextContent("potholeLocation", p.location);
  setTextContent("userName", d.name);
  setTextContent("userRole", d.role);

  // Metrics & Badges
  setTextContent("hazardBadge", p.hazardLevel);
  setTextContent("statusBadge", p.repairStatus);
  setTextContent("potholeDepth", p.depth);
  setTextContent("potholeDiameter", p.diameter);
  setTextContent("aiConfidence", p.confidence);
  setTextContent("detectedTime", p.detectedAt);
  setTextContent("gpsCoordinates", p.gps.formatted);
  setTextContent("confirmCount", p.confirmations);

  // Quick Stats
  setTextContent("statNearby", s.nearby);
  setTextContent("statReports", s.reports);
  setTextContent("statRoutes", s.routes);
  setTextContent("statScore", s.score);
}

// Map Engine Initialization (Leaflet / Google Maps API ready)
function initMapEngine(pothole) {
  const mapElement = document.getElementById("map");
  if (!mapElement) return;

  const lat = pothole.gps.lat;
  const lng = pothole.gps.lng;

  if (typeof L !== "undefined") {
    if (mapInstance) {
      mapInstance.remove();
    }

    mapInstance = L.map("map", {
      center: [lat, lng],
      zoom: 14,
      zoomControl: true
    });

    // CartoDB Voyager tiles
    L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19
    }).addTo(mapInstance);

    // Custom Pothole Pin Marker
    const customIcon = L.divIcon({
      className: "custom-leaflet-marker",
      html: `<div class="pothole-custom-pin"></div>`,
      iconSize: [24, 24],
      iconAnchor: [12, 12]
    });

    const marker = L.marker([lat, lng], { icon: customIcon }).addTo(mapInstance);

    // Custom Callout Popup
    const popupHTML = `
      <div class="map-popup-callout">
        <span class="map-popup-badge">${pothole.hazardLevel.replace(' Level', '')} Zone</span>
        <div class="map-popup-text">${pothole.rawId} - ${pothole.location}</div>
      </div>
    `;

    marker.bindPopup(popupHTML, { closeButton: true, autoClose: false }).openPopup();
  } else {
    // Fallback static map view (Prepared for Google Maps JS API script injection)
    mapElement.innerHTML = `
      <div style="display:flex; flex-direction:column; align-items:center; justify-content:center; height:100%; color:var(--text-muted);">
        <i class="fa-solid fa-map-location-dot" style="font-size:36px; margin-bottom:10px; color:var(--primary-purple);"></i>
        <p>Google Maps / Leaflet API Viewport centered at ${pothole.gps.formatted}</p>
      </div>
    `;
  }
}

// Setup Event Listeners (No inline JS)
function setupEventListeners() {
  // Confirm Vote Button Handler
  const confirmBtn = document.getElementById("confirmVoteBtn");
  if (confirmBtn) {
    confirmBtn.addEventListener("click", () => {
      const p = dashboardData.pothole;
      if (!p.isConfirmed) {
        p.confirmations += 1;
        p.isConfirmed = true;
        confirmBtn.classList.add("btn-confirmed");
      } else {
        p.confirmations -= 1;
        p.isConfirmed = false;
        confirmBtn.classList.remove("btn-confirmed");
      }
      setTextContent("confirmCount", p.confirmations);
    });
  }

  // Avoid in Route Planner Button Handler
  const avoidBtn = document.getElementById("avoidRouteBtn");
  if (avoidBtn) {
    avoidBtn.addEventListener("click", () => {
      alert(`Pothole ${dashboardData.pothole.id} added to route planner avoidance filter.`);
    });
  }

  // Recenter Map Button Handler
  const recenterBtn = document.getElementById("recenterMapBtn");
  if (recenterBtn) {
    recenterBtn.addEventListener("click", () => {
      if (mapInstance) {
        mapInstance.setView([dashboardData.pothole.gps.lat, dashboardData.pothole.gps.lng], 14, {
          animate: true
        });
      }
    });
  }

  // Action Buttons
  const startScanHeaderBtn = document.getElementById("startScanHeaderBtn");
  const planRouteHeaderBtn = document.getElementById("planRouteHeaderBtn");
  const dashboardSearch = document.getElementById("dashboardSearch");

  if (startScanHeaderBtn) {
    startScanHeaderBtn.addEventListener("click", () => {
      window.location.href = "scan-road.html";
    });
  }

  if (planRouteHeaderBtn) {
    planRouteHeaderBtn.addEventListener("click", () => {
      window.location.href = "live-map.html";
    });
  }

  if (dashboardSearch) {
    dashboardSearch.addEventListener("keypress", (e) => {
      if (e.key === "Enter" && dashboardSearch.value.trim() !== "") {
        alert(`Searching ROADIES database for: "${dashboardSearch.value.trim()}"`);
      }
    });
  }
}

// Helper Utility
function setTextContent(elementId, value) {
  const elem = document.getElementById(elementId);
  if (elem) {
    elem.textContent = value;
  }
}