// ==========================================================================
// ROADIES (Road Optimization And Detection Intelligent Evaluation System)
// Live Map & Google Maps Navigation Controller (live-map.js)
// Google Maps API Integration: Places Autocomplete, DirectionsService & DirectionsRenderer
// ==========================================================================

let map = null;
let directionsService = null;
let directionsDisplay = null;
let originAutocomplete = null;
let destinationAutocomplete = null;
let currentGeoLocation = null;

// Default Map Center: Kanpur, India (ROADIES Evaluation Corridor)
const KANPUR_CENTER = { lat: 26.4499, lng: 80.3319 };

// Global callback function invoked by Google Maps API script tag
window.initMap = function() {
  const mapElement = document.getElementById("map");
  if (!mapElement) return;

  // 1. Initialize Google Map Viewport
  map = new google.maps.Map(mapElement, {
    center: KANPUR_CENTER,
    zoom: 13,
    mapTypeControl: true,
    streetViewControl: false,
    fullscreenControl: true,
    zoomControl: true,
    styles: [
      { featureType: "poi", elementType: "labels", stylers: [{ visibility: "off" }] }
    ]
  });

  // 2. Initialize Directions Service & Renderer
  directionsService = new google.maps.DirectionsService();
  directionsDisplay = new google.maps.DirectionsRenderer({
    map: map,
    suppressMarkers: false,
    polylineOptions: {
      strokeColor: "#7C3AED",
      strokeWeight: 6,
      strokeOpacity: 0.85
    }
  });

  // 3. Initialize Google Places Autocomplete on Origin & Destination Inputs
  initPlacesAutocomplete();

  // 4. Setup Event Listeners
  setupMapEventListeners();
};

// Initialize Places Autocomplete Widgets
function initPlacesAutocomplete() {
  const originInput = document.getElementById("originInput");
  const destinationInput = document.getElementById("destinationInput");

  if (originInput && typeof google !== "undefined" && google.maps && google.maps.places) {
    originAutocomplete = new google.maps.places.Autocomplete(originInput, {
      fields: ["formatted_address", "geometry", "name"]
    });
  }

  if (destinationInput && typeof google !== "undefined" && google.maps && google.maps.places) {
    destinationAutocomplete = new google.maps.places.Autocomplete(destinationInput, {
      fields: ["formatted_address", "geometry", "name"]
    });
  }
}

// Setup Event Listeners
function setupMapEventListeners() {
  const findRouteBtn = document.getElementById("findRouteBtn");
  const useMyLocationBtn = document.getElementById("useMyLocationBtn");
  const originInput = document.getElementById("originInput");
  const destinationInput = document.getElementById("destinationInput");

  if (findRouteBtn) {
    findRouteBtn.addEventListener("click", (e) => {
      e.preventDefault();
      calculateRoute();
    });
  }

  if (useMyLocationBtn) {
    useMyLocationBtn.addEventListener("click", (e) => {
      e.preventDefault();
      useCurrentLocation();
    });
  }

  // Handle Enter key on input boxes
  [originInput, destinationInput].forEach((input) => {
    if (input) {
      input.addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          calculateRoute();
        }
      });
    }
  });
}

// Calculate driving route using Google Maps DirectionsService
function calculateRoute() {
  const originInput = document.getElementById("originInput");
  const destinationInput = document.getElementById("destinationInput");
  const spinner = document.getElementById("routeLoadingSpinner");

  let origin = originInput ? originInput.value.trim() : "";
  let destination = destinationInput ? destinationInput.value.trim() : "";

  // If origin is empty but GPS location is available
  if (!origin && currentGeoLocation) {
    origin = new google.maps.LatLng(currentGeoLocation.lat, currentGeoLocation.lng);
  }

  if (!origin || !destination) {
    alert("Please enter both a Current Location (Origin) and a Destination to calculate a route.");
    return;
  }

  // Show loading spinner animation
  if (spinner) spinner.style.display = "flex";

  const request = {
    origin: origin,
    destination: destination,
    travelMode: google.maps.TravelMode.DRIVING,
    provideRouteAlternatives: true
  };

  directionsService.route(request, (response, status) => {
    if (spinner) spinner.style.display = "none";

    if (status === google.maps.DirectionsStatus.OK) {
      directionsDisplay.setDirections(response);

      const leg = response.routes[0].legs[0];
      updateRouteMetrics(leg);
    } else {
      console.warn("Directions request failed due to: " + status);
      alert("Could not calculate driving route for the selected locations. Please check the addresses and try again.");
    }
  });
}

// Update UI metrics for distance, travel duration, ETA, and backend placeholders
function updateRouteMetrics(leg) {
  const routeDistance = document.getElementById("routeDistance");
  const routeDuration = document.getElementById("routeDuration");
  const routeEta = document.getElementById("routeEta");

  if (routeDistance) routeDistance.textContent = leg.distance.text;
  if (routeDuration) routeDuration.textContent = leg.duration.text;

  // Calculate estimated arrival time
  if (routeEta && leg.duration && leg.duration.value) {
    const now = new Date();
    const arrivalTime = new Date(now.getTime() + leg.duration.value * 1000);
    const hours = arrivalTime.getHours().toString().padStart(2, '0');
    const minutes = arrivalTime.getMinutes().toString().padStart(2, '0');
    routeEta.textContent = `${hours}:${minutes}`;
  }

  // ==========================================================================
  // AI & BACKEND INTEGRATION PLACEHOLDERS
  // ==========================================================================
  // Future FastAPI Endpoint: POST /api/v1/route/evaluate-hazards
  // Payload: { origin: leg.start_location, destination: leg.end_location, route_polyline: leg.overview_polyline }
  // Response expected from PostgreSQL & YOLO database:
  // {
  //   "safety_score": 88,
  //   "pothole_count_minor": 2,
  //   "pothole_count_critical": 0,
  //   "nearby_hazards": 5,
  //   "risk_level": "Low Risk",
  //   "ai_recommendation": "Take Bypass Corridor B to save 4 mins & avoid 3 potholes."
  // }
  updateAiPlaceholders({
    safetyScore: "88 / 100",
    potholesOnRoute: "2 Minor, 0 Critical",
    nearbyHazards: "5 Hazards",
    riskLevel: "Low Risk",
    recommendation: `Route via ${leg.end_address.split(',')[0]} evaluated. AI recommends maintaining standard speed limit.`
  });
}

// Update AI Placeholder Cards
function updateAiPlaceholders(data) {
  const safetyScoreValue = document.getElementById("safetyScoreValue");
  const potholesOnRoute = document.getElementById("potholesOnRoute");
  const nearbyHazardsValue = document.getElementById("nearbyHazardsValue");
  const estimatedRiskLevel = document.getElementById("estimatedRiskLevel");
  const aiRecommendationText = document.getElementById("aiRecommendationText");

  if (safetyScoreValue) safetyScoreValue.textContent = data.safetyScore;
  if (potholesOnRoute) potholesOnRoute.textContent = data.potholesOnRoute;
  if (nearbyHazardsValue) nearbyHazardsValue.textContent = data.nearbyHazards;
  if (estimatedRiskLevel) estimatedRiskLevel.textContent = data.riskLevel;
  if (aiRecommendationText) aiRecommendationText.textContent = data.recommendation;
}

// Obtain user's live GPS coordinates using navigator.geolocation
function useCurrentLocation() {
  const originInput = document.getElementById("originInput");

  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        currentGeoLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };

        const latLng = new google.maps.LatLng(currentGeoLocation.lat, currentGeoLocation.lng);
        if (map) map.setCenter(latLng);

        // Reverse Geocode coordinates to readable address string
        const geocoder = new google.maps.Geocoder();
        geocoder.geocode({ location: latLng }, (results, status) => {
          if (status === "OK" && results[0]) {
            if (originInput) originInput.value = results[0].formatted_address;
          } else {
            if (originInput) originInput.value = `${currentGeoLocation.lat.toFixed(4)}, ${currentGeoLocation.lng.toFixed(4)}`;
          }
        });
      },
      (error) => {
        console.warn("Geolocation permission denied or failed:", error);
        alert("Unable to fetch live GPS location. Using default Kanpur position.");
        currentGeoLocation = KANPUR_CENTER;
        if (originInput) originInput.value = "Kanpur, Uttar Pradesh, India";
      }
    );
  } else {
    alert("Geolocation is not supported by your browser.");
  }
}
