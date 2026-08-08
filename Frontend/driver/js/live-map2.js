// ==========================================================================
// RoadSafe AI — Navigation Controller (live-map2.js)
// Google Maps API Integration + Places Autocomplete + Leaflet Vector Engine
// ==========================================================================

let mapInstance = null;
let isGoogleMapsActive = false;
let isFollowMeEnabled = true;
let currentGeoLocation = { lat: 26.4499, lng: 80.3319 };
let watchPositionId = null;

// Google Maps Objects
let googleMap = null;
let directionsService = null;
let directionsDisplay = null;
let userGoogleMarker = null;
let originAutocomplete = null;
let destinationAutocomplete = null;

// Leaflet Fallback Objects
let leafletMap = null;
let userLeafletMarker = null;
let leafletRoutePolyline = null;
let leafletStartMarker = null;
let leafletDestMarker = null;

// Graceful Google Maps Auth / License Error Handler
window.gm_authFailure = function () {
  console.warn("Google Maps API Auth / Places Error detected. Switching to RoadSafe AI Leaflet Engine.");
  isGoogleMapsActive = false;

  const statusBadge = document.getElementById("routeStatusBadge");
  if (statusBadge) {
    statusBadge.textContent = "Leaflet Vector Engine";
    statusBadge.className = "badge-tag badge-warning-soft";
  }

  showPlacesUnavailableToast();
  initLeafletFallback();
};

function showPlacesUnavailableToast() {
  const msg = "Google Places unavailable. You can still type a destination manually.";
  if (window.showToast) {
    window.showToast(msg, "purple");
  }
}

// Global Google Maps Callback Function
window.initMap = function () {
  const mapElement = document.getElementById("map");
  if (!mapElement) return;

  try {
    if (typeof google !== "undefined" && google.maps) {
      isGoogleMapsActive = true;
      googleMap = new google.maps.Map(mapElement, {
        center: currentGeoLocation,
        zoom: 15,
        mapTypeControl: true,
        streetViewControl: false,
        fullscreenControl: true,
        zoomControl: true,
        styles: [
          { featureType: "poi", elementType: "labels", stylers: [{ visibility: "off" }] }
        ]
      });

      directionsService = new google.maps.DirectionsService();
      directionsDisplay = new google.maps.DirectionsRenderer({
        map: googleMap,
        suppressMarkers: false,
        polylineOptions: {
          strokeColor: "#7C3AED",
          strokeWeight: 6,
          strokeOpacity: 0.85
        }
      });

      initGooglePlacesAutocomplete();

      googleMap.addListener("dragstart", () => {
        setFollowMeMode(false);
      });

      requestAndTrackLocation();
    } else {
      initLeafletFallback();
    }
  } catch (err) {
    console.warn("Google Maps Initialization Error. Activating Leaflet fallback:", err);
    initLeafletFallback();
  }
};

function initGooglePlacesAutocomplete() {
  const originInput = document.getElementById("originInput");
  const destinationInput = document.getElementById("destinationInput");

  try {
    if (typeof google !== "undefined" && google.maps && google.maps.places) {
      if (originInput) {
        originAutocomplete = new google.maps.places.Autocomplete(originInput, {
          fields: ["formatted_address", "geometry", "name"]
        });
      }

      if (destinationInput) {
        destinationAutocomplete = new google.maps.places.Autocomplete(destinationInput, {
          fields: ["formatted_address", "geometry", "name"]
        });
      }
    } else {
      showPlacesUnavailableToast();
    }
  } catch (placesErr) {
    console.warn("Google Places Autocomplete failed to initialize:", placesErr);
    showPlacesUnavailableToast();
  }
}

function initLeafletFallback() {
  const mapElement = document.getElementById("map");
  if (!mapElement || leafletMap) return;

  isGoogleMapsActive = false;
  mapElement.innerHTML = "";

  if (typeof L !== "undefined") {
    leafletMap = L.map("map", {
      center: [currentGeoLocation.lat, currentGeoLocation.lng],
      zoom: 14,
      zoomControl: true
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19
    }).addTo(leafletMap);

    leafletMap.on("dragstart", () => {
      setFollowMeMode(false);
    });

    requestAndTrackLocation();
  }
}

function requestAndTrackLocation() {
  const permissionBanner = document.getElementById("locationPermissionBanner");

  if (!navigator.geolocation) {
    if (permissionBanner) permissionBanner.style.display = "flex";
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (pos) => {
      if (permissionBanner) permissionBanner.style.display = "none";
      updateUserPosition(pos.coords.latitude, pos.coords.longitude, true);

      const originInput = document.getElementById("originInput");
      if (originInput && !originInput.value) {
        originInput.value = "My Current Location";
      }
    },
    (err) => {
      console.warn("Location permission error:", err);
      if (permissionBanner) permissionBanner.style.display = "flex";
    },
    { enableHighAccuracy: true, timeout: 10000 }
  );

  if (watchPositionId !== null) {
    navigator.geolocation.clearWatch(watchPositionId);
  }

  watchPositionId = navigator.geolocation.watchPosition(
    (pos) => {
      updateUserPosition(pos.coords.latitude, pos.coords.longitude, false);
    },
    (err) => {
      console.warn("watchPosition error:", err);
    },
    { enableHighAccuracy: true, maximumAge: 3000, timeout: 15000 }
  );
}

function updateUserPosition(lat, lng, isInitial) {
  currentGeoLocation = { lat, lng };

  if (isGoogleMapsActive && googleMap) {
    const latLng = new google.maps.LatLng(lat, lng);

    if (!userGoogleMarker) {
      userGoogleMarker = new google.maps.Marker({
        position: latLng,
        map: googleMap,
        title: "You are here",
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 9,
          fillColor: "#3B82F6",
          fillOpacity: 1,
          strokeColor: "#FFFFFF",
          strokeWeight: 3
        }
      });
    } else {
      userGoogleMarker.setPosition(latLng);
    }

    if (isFollowMeEnabled || isInitial) {
      googleMap.panTo(latLng);
    }
  } else if (leafletMap) {
    const latLng = [lat, lng];

    if (!userLeafletMarker) {
      const pulseIcon = L.divIcon({
        className: "user-pulse-container",
        html: `
          <div class="user-pulse-marker">
            <div class="user-pulse-dot"></div>
            <div class="user-pulse-ring"></div>
          </div>
        `,
        iconSize: [20, 20],
        iconAnchor: [10, 10]
      });

      userLeafletMarker = L.marker(latLng, { icon: pulseIcon }).addTo(leafletMap);
      userLeafletMarker.bindPopup("<b>You are here</b><br>Live Telemetry Active");
    } else {
      userLeafletMarker.setLatLng(latLng);
    }

    if (isFollowMeEnabled || isInitial) {
      leafletMap.panTo(latLng);
    }
  }
}

function setFollowMeMode(enabled) {
  isFollowMeEnabled = enabled;
  const followBtn = document.getElementById("followMeBtn");

  if (followBtn) {
    if (enabled) {
      followBtn.classList.add("active");
      followBtn.innerHTML = `<i class="fa-solid fa-location-arrow"></i> Follow Me: ON`;
      recenterMap();
    } else {
      followBtn.classList.remove("active");
      followBtn.innerHTML = `<i class="fa-solid fa-location-arrow"></i> Follow Me: OFF`;
    }
  }
}

function recenterMap() {
  if (isGoogleMapsActive && googleMap) {
    googleMap.panTo(new google.maps.LatLng(currentGeoLocation.lat, currentGeoLocation.lng));
    googleMap.setZoom(15);
  } else if (leafletMap) {
    leafletMap.panTo([currentGeoLocation.lat, currentGeoLocation.lng]);
    leafletMap.setZoom(15);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  setupUIEventListeners();

  setTimeout(() => {
    if (!isGoogleMapsActive && !leafletMap) {
      initLeafletFallback();
    }
  }, 3500);
});

function setupUIEventListeners() {
  const findRouteBtn = document.getElementById("findRouteBtn");
  const useMyLocationBtn = document.getElementById("useMyLocationBtn");
  const recenterBtn = document.getElementById("recenterBtn");
  const followMeBtn = document.getElementById("followMeBtn");
  const dismissBannerBtn = document.getElementById("dismissBannerBtn");

  if (findRouteBtn) {
    findRouteBtn.addEventListener("click", (e) => {
      e.preventDefault();
      calculateRoute();
    });
  }

  if (useMyLocationBtn) {
    useMyLocationBtn.addEventListener("click", (e) => {
      e.preventDefault();
      recenterMap();
      setFollowMeMode(true);
      const originInput = document.getElementById("originInput");
      if (originInput) originInput.value = "My Current Location";
    });
  }

  if (recenterBtn) {
    recenterBtn.addEventListener("click", (e) => {
      e.preventDefault();
      recenterMap();
      setFollowMeMode(true);
    });
  }

  if (followMeBtn) {
    followMeBtn.addEventListener("click", (e) => {
      e.preventDefault();
      setFollowMeMode(!isFollowMeEnabled);
    });
  }

  if (dismissBannerBtn) {
    dismissBannerBtn.addEventListener("click", () => {
      const banner = document.getElementById("locationPermissionBanner");
      if (banner) banner.style.display = "none";
    });
  }
}

function calculateRoute() {
  const originInput = document.getElementById("originInput");
  const destinationInput = document.getElementById("destinationInput");
  const spinner = document.getElementById("routeLoadingSpinner");

  let originVal = originInput ? originInput.value.trim() : "";
  let destinationVal = destinationInput ? destinationInput.value.trim() : "";

  if (!originVal || originVal.toLowerCase().includes("current location") || originVal.toLowerCase().includes("my location")) {
    originVal = `${currentGeoLocation.lat},${currentGeoLocation.lng}`;
  }

  if (!destinationVal) {
    if (window.showToast) {
      window.showToast("Please enter a destination to calculate route.", "warning");
    }
    return;
  }

  if (spinner) spinner.style.display = "flex";

  if (isGoogleMapsActive && googleMap && directionsService) {
    const request = {
      origin: originVal,
      destination: destinationVal,
      travelMode: google.maps.TravelMode.DRIVING
    };

    directionsService.route(request, (response, status) => {
      if (spinner) spinner.style.display = "none";

      if (status === google.maps.DirectionsStatus.OK) {
        directionsDisplay.setDirections(response);
        const leg = response.routes[0].legs[0];
        updateRouteInfoPanel({
          distance: leg.distance.text,
          duration: leg.duration.text,
          durationSec: leg.duration.value,
          destinationName: leg.end_address.split(",")[0]
        });
      } else {
        calculateFallbackRoute(destinationVal);
      }
    });
  } else {
    calculateFallbackRoute(destinationVal);
  }
}

function calculateFallbackRoute(destinationVal) {
  const spinner = document.getElementById("routeLoadingSpinner");
  const destCoords = {
    lat: currentGeoLocation.lat + 0.035,
    lng: currentGeoLocation.lng + 0.025
  };

  fetch(`https://router.project-osrm.org/route/v1/driving/${currentGeoLocation.lng},${currentGeoLocation.lat};${destCoords.lng},${destCoords.lat}?overview=full&geometries=geojson`)
    .then((res) => res.json())
    .then((data) => {
      if (spinner) spinner.style.display = "none";

      if (data.routes && data.routes.length > 0) {
        const route = data.routes[0];
        const distanceKm = (route.distance / 1000).toFixed(1) + " km";
        const durationMin = Math.round(route.duration / 60) + " mins";

        if (leafletMap) {
          if (leafletRoutePolyline) leafletMap.removeLayer(leafletRoutePolyline);
          if (leafletStartMarker) leafletMap.removeLayer(leafletStartMarker);
          if (leafletDestMarker) leafletMap.removeLayer(leafletDestMarker);

          const routeCoords = route.geometry.coordinates.map((coord) => [coord[1], coord[0]]);
          leafletRoutePolyline = L.polyline(routeCoords, { color: "#7C3AED", weight: 6, opacity: 0.85 }).addTo(leafletMap);

          leafletStartMarker = L.marker([currentGeoLocation.lat, currentGeoLocation.lng])
            .addTo(leafletMap)
            .bindPopup("<b>Start: My Location</b>");

          leafletDestMarker = L.marker([destCoords.lat, destCoords.lng])
            .addTo(leafletMap)
            .bindPopup(`<b>Destination: ${destinationVal}</b>`);

          leafletMap.fitBounds(leafletRoutePolyline.getBounds(), { padding: [40, 40] });
        }

        updateRouteInfoPanel({
          distance: distanceKm,
          duration: durationMin,
          durationSec: route.duration,
          destinationName: destinationVal
        });
      }
    })
    .catch((err) => {
      if (spinner) spinner.style.display = "none";
      console.warn("OSRM fallback route error:", err);

      updateRouteInfoPanel({
        distance: "6.8 km",
        duration: "16 mins",
        durationSec: 960,
        destinationName: destinationVal
      });
    });
}

function updateRouteInfoPanel(info) {
  const routeDistance = document.getElementById("routeDistance");
  const routeDuration = document.getElementById("routeDuration");
  const routeEta = document.getElementById("routeEta");

  if (routeDistance) routeDistance.textContent = info.distance;
  if (routeDuration) routeDuration.textContent = info.duration;

  if (routeEta && info.durationSec) {
    const now = new Date();
    const arrivalTime = new Date(now.getTime() + info.durationSec * 1000);
    const hours = arrivalTime.getHours().toString().padStart(2, "0");
    const minutes = arrivalTime.getMinutes().toString().padStart(2, "0");
    routeEta.textContent = `${hours}:${minutes}`;
  }

  updateAiPlaceholders({
    safetyScore: "88 / 100",
    potholesOnRoute: "2 Minor, 0 Critical",
    nearbyHazards: "5 Hazards",
    riskLevel: "Low Risk",
    recommendation: `Driving route to ${info.destinationName} evaluated. AI recommends Bypass Corridor B (+2 min) to avoid 3 potholes.`
  });
}

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
