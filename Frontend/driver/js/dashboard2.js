/**
 * RoadSafe AI — Dashboard Controller (dashboard2.js)
 */

document.addEventListener("DOMContentLoaded", () => {
  initDashboardMap();
  animateCounterValues();
});

/* Initialize Leaflet Dashboard Overview Map */
function initDashboardMap() {
  const mapContainer = document.getElementById("dashboardMap");
  if (!mapContainer || typeof L === "undefined") return;

  const map = L.map("dashboardMap", {
    zoomControl: true,
    attributionControl: false
  }).setView([26.4499, 80.3319], 13); // Kanpur Center

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19
  }).addTo(map);

  // Sample hazards
  const hazards = [
    { lat: 26.4524, lng: 80.3345, severity: "High", title: "Pothole #POT-101 (Mall Road)" },
    { lat: 26.4465, lng: 80.3262, severity: "Medium", title: "Pothole #POT-102 (GT Road)" },
    { lat: 26.4612, lng: 80.3210, severity: "High", title: "Pothole #POT-104 (VIP Road)" }
  ];

  hazards.forEach((h) => {
    const color = h.severity === "High" ? "#EF4444" : "#F59E0B";
    const marker = L.circleMarker([h.lat, h.lng], {
      radius: 8,
      fillColor: color,
      color: "#FFFFFF",
      weight: 2,
      opacity: 1,
      fillOpacity: 0.9
    }).addTo(map);

    marker.bindPopup(`<b>${h.title}</b><br>Severity: ${h.severity}`);
  });
}

/* Animate numerical counter metrics on load */
function animateCounterValues() {
  const counters = document.querySelectorAll(".stat-info strong");
  counters.forEach((counter) => {
    const targetText = counter.innerText;
    const targetNum = parseInt(targetText.replace(/\D/g, ""), 10);

    if (isNaN(targetNum)) return;

    let current = 0;
    const increment = Math.ceil(targetNum / 25);
    const timer = setInterval(() => {
      current += increment;
      if (current >= targetNum) {
        counter.innerText = targetText;
        clearInterval(timer);
      } else {
        if (targetText.includes("km")) {
          counter.innerText = current + " km";
        } else if (targetText.includes("%")) {
          counter.innerText = current + "%";
        } else {
          counter.innerText = current;
        }
      }
    }, 40);
  });
}
