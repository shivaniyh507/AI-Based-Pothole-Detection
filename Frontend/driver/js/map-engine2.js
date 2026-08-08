/* global L, PotholeDataStore */

/**
 * RoadSafe AI — Map Engine Controller (map-engine2.js)
 */

const MapEngine = {
  map: null,
  markers: [],
  routeLines: [],
  routeMarkers: [],
  currentPositionMarker: null,
  activeFilter: "all",

  defaultCenter: [26.4499, 80.3319],
  defaultZoom: 13,

  init(elementId = "map", center = this.defaultCenter, zoom = this.defaultZoom) {
    const container = document.getElementById(elementId);
    if (!container) return null;

    if (typeof L !== "undefined") {
      this.map = L.map(elementId, {
        zoomControl: true,
        attributionControl: false
      }).setView(center, zoom);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19
      }).addTo(this.map);

      if (typeof PotholeDataStore !== "undefined") {
        this.renderPotholes(PotholeDataStore.potholes);
      }

      return this.map;
    }
  },

  renderPotholes(potholesList) {
    if (!this.map || typeof L === "undefined") return;

    this.clearMarkers();

    potholesList.forEach((pothole) => {
      if (this.activeFilter !== "all" && pothole.severity.toLowerCase() !== this.activeFilter.toLowerCase()) {
        return;
      }

      const severityClass = "marker-" + pothole.severity.toLowerCase();

      const icon = L.divIcon({
        className: `custom-leaflet-marker ${severityClass}`,
        html: `<i class="fa-solid fa-triangle-exclamation"></i>`,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
        popupAnchor: [0, -18]
      });

      const marker = L.marker([pothole.lat, pothole.lng], { icon }).addTo(this.map);

      const popupHTML = `
        <div style="font-family:'Poppins',sans-serif; width: 220px;">
          <div style="font-size: 11px; font-weight: 700; color: ${pothole.severity === "High" ? "#dc2626" : (pothole.severity === "Medium" ? "#d97706" : "#16a34a")}; text-transform: uppercase; margin-bottom: 2px;">
            ${pothole.severity} Risk Pothole
          </div>
          <h4 style="font-size: 14px; font-weight: 600; margin: 0 0 6px 0; color: #0f172a;">${pothole.id}</h4>
          <p style="font-size: 12px; color: #64748b; margin: 0 0 10px 0;">${pothole.address}</p>
          <div style="display: flex; gap: 6px;">
            <a href="pothole-detail2.html?id=${pothole.id}" style="background:#7c3aed; color:#fff; padding:6px 12px; border-radius:6px; font-size:12px; font-weight:600; text-decoration:none; flex:1; text-align:center;">
              Details
            </a>
            <a href="route-planner2.html?avoid=${pothole.id}" style="background:#f3e8ff; color:#7c3aed; border:1px solid #e9d5ff; padding:6px 10px; border-radius:6px; font-size:12px; font-weight:600; text-decoration:none; display:inline-block;">
              Reroute
            </a>
          </div>
        </div>
      `;

      marker.bindPopup(popupHTML);
      this.markers.push(marker);
    });
  },

  clearMarkers() {
    this.markers.forEach((m) => this.map.removeLayer(m));
    this.markers = [];
  },

  drawRoute(coordinates, color = "#7c3aed", weight = 5, originName = "Start Location", destName = "Destination") {
    if (!this.map || typeof L === "undefined" || !coordinates || coordinates.length === 0) return;

    this.clearRoutes();

    const polyline = L.polyline(coordinates, {
      color: color,
      weight: weight,
      opacity: 0.9,
      lineJoin: "round"
    }).addTo(this.map);

    this.routeLines.push(polyline);

    if (coordinates.length >= 2) {
      const startPoint = coordinates[0];
      const endPoint = coordinates[coordinates.length - 1];

      const startIcon = L.divIcon({
        className: "custom-leaflet-marker marker-start",
        html: `<div style="background:#10b981; color:#fff; border-radius:50%; width:34px; height:34px; display:flex; align-items:center; justify-content:center; box-shadow:0 4px 12px rgba(16,185,129,0.4); border:2px solid #fff; font-size:16px;"><i class="fa-solid fa-location-dot"></i></div>`,
        iconSize: [34, 34],
        iconAnchor: [17, 17]
      });

      const endIcon = L.divIcon({
        className: "custom-leaflet-marker marker-end",
        html: `<div style="background:#ef4444; color:#fff; border-radius:50%; width:34px; height:34px; display:flex; align-items:center; justify-content:center; box-shadow:0 4px 12px rgba(239,68,68,0.4); border:2px solid #fff; font-size:16px;"><i class="fa-solid fa-flag-checkered"></i></div>`,
        iconSize: [34, 34],
        iconAnchor: [17, 17]
      });

      const mStart = L.marker(startPoint, { icon: startIcon }).addTo(this.map);
      const mEnd = L.marker(endPoint, { icon: endIcon }).addTo(this.map);

      mStart.bindPopup(`<b>Start</b><br>${originName}`);
      mEnd.bindPopup(`<b>Destination</b><br>${destName}`);

      this.routeMarkers.push(mStart);
      this.routeMarkers.push(mEnd);
    }

    this.map.fitBounds(polyline.getBounds(), { padding: [50, 50] });
  },

  clearRoutes() {
    this.routeLines.forEach((line) => this.map.removeLayer(line));
    this.routeLines = [];
    this.routeMarkers.forEach((m) => this.map.removeLayer(m));
    this.routeMarkers = [];
  }
};

if (typeof window !== "undefined") {
  window.MapEngine = MapEngine;
}
