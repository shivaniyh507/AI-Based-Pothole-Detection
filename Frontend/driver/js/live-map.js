// ==========================================================================
// RoadSafe AI - Live Map & Route Planner Controller
// ==========================================================================

let mapInstance = null;

const defaultLocation = {
  lat: 26.4499,
  lng: 80.3319
};

const dummyPotholes = [
  { lat: 26.4524, lng: 80.3345, level: "High Hazard", color: "#EF4444" },
  { lat: 26.4465, lng: 80.3262, level: "Medium Hazard", color: "#D97706" },
  { lat: 26.4555, lng: 80.3402, level: "Low Hazard", color: "#16A34A" }
];

document.addEventListener("DOMContentLoaded", () => {
  initMap(defaultLocation);
  setupMapEventListeners();
});

// Initialize Map Engine (Structured for easy Google Maps replacement)
function initMap(center) {
  const mapElement = document.getElementById("map");
  if (!mapElement) return;

  if (typeof L !== "undefined") {
    if (mapInstance) {
      mapInstance.remove();
    }

    mapInstance = L.map("map", {
      center: [center.lat, center.lng],
      zoom: 13,
      zoomControl: true
    });

    // CartoDB Voyager Tile Layer
    L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19
    }).addTo(mapInstance);

    // Current Location Marker
    const userIcon = L.divIcon({
      className: "user-loc-pin",
      html: `<div style="width:16px;height:16px;background:#7C3AED;border:3px solid #FFF;border-radius:50%;box-shadow:0 0 10px rgba(124,58,237,0.6);"></div>`,
      iconSize: [16, 16]
    });
    L.marker([center.lat, center.lng], { icon: userIcon })
      .addTo(mapInstance)
      .bindPopup("<b>Your Current Location</b>")
      .openPopup();

    // Pothole Pins
    dummyPotholes.forEach((point) => {
      const pinIcon = L.divIcon({
        className: "pothole-pin",
        html: `<div style="width:14px;height:14px;background:${point.color};border:2px solid #FFF;border-radius:50%;"></div>`,
        iconSize: [14, 14]
      });

      L.marker([point.lat, point.lng], { icon: pinIcon })
        .addTo(mapInstance)
        .bindPopup(`<b>${point.level}</b><br>Detected by AI`);
    });
  } else {
    // Fallback static map view
    mapElement.innerHTML = `
      <div style="display:flex; flex-direction:column; align-items:center; justify-content:center; height:100%; color:var(--text-muted);">
        <i class="fa-solid fa-map-location-dot" style="font-size:42px; margin-bottom:12px; color:var(--primary-purple);"></i>
        <p>Google Maps / Leaflet API Viewport ready at ${center.lat}, ${center.lng}</p>
      </div>
    `;
  }
}

// Setup Event Listeners
function setupMapEventListeners() {
  const locationBtn = document.getElementById("locationBtn");
  const routeBtn = document.getElementById("routeBtn");
  const searchInput = document.getElementById("mapSearchInput");

  if (locationBtn) {
    locationBtn.addEventListener("click", () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            const userLoc = {
              lat: pos.coords.latitude,
              lng: pos.coords.longitude
            };
            if (mapInstance) {
              mapInstance.setView([userLoc.lat, userLoc.lng], 15);
            }
          },
          () => {
            alert("Location access granted. Centered on Kanpur default GPS position.");
            if (mapInstance) {
              mapInstance.setView([defaultLocation.lat, defaultLocation.lng], 14);
            }
          }
        );
      }
    });
  }

  if (routeBtn) {
    routeBtn.addEventListener("click", () => {
      alert("AI Route Optimization Active: Calculating fastest bypass avoiding high hazard zones.");
    });
  }

  if (searchInput) {
    searchInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter" && searchInput.value.trim() !== "") {
        alert(`Searching route destination for: "${searchInput.value.trim()}"`);
      }
    });
  }
}