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
  const mapElement = document.getElementById("liveMapViewport");
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
  const mapElement = document.getElementById("liveMapViewport");

  if (!mapElement) {
    console.error("RoadSafe AI: liveMapViewport not found.");
    return;
  }

  if (leafletMap) {
    console.log("RoadSafe AI: Leaflet map already initialized.");
    return;
  }

  if (typeof L === "undefined") {
    console.error("RoadSafe AI: Leaflet library is not loaded.");
    return;
  }

  try {
    isGoogleMapsActive = false;

    leafletMap = L.map(mapElement, {
      center: [
        currentGeoLocation.lat,
        currentGeoLocation.lng
      ],
      zoom: 14,
      zoomControl: true
    });

    L.tileLayer(
      "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
      {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">' +
          "OpenStreetMap</a>",
        maxZoom: 19
      }
    ).addTo(leafletMap);

    leafletMap.on("dragstart", () => {
      setFollowMeMode(false);
    });

    console.log(
      "RoadSafe AI: Leaflet map initialized successfully."
    );

    requestAndTrackLocation();

  } catch (error) {
    console.error(
      "RoadSafe AI: Leaflet initialization failed:",
      error
    );
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

      // const originInput = document.getElementById("originInput");
      // if (originInput && !originInput.value) {
      //   originInput.value = "My Current Location";
      // }
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
  const destinationVal = destinationInput
    ? destinationInput.value.trim()
    : "";

  if (!originVal ||
      originVal.toLowerCase().includes("current location") ||
      originVal.toLowerCase().includes("my location")) {

    originVal = `${currentGeoLocation.lat},${currentGeoLocation.lng}`;
  }

  if (!destinationVal) {
    if (window.showToast) {
      window.showToast(
        "Please enter a destination to calculate route.",
        "warning"
      );
    }
    return;
  }

  if (spinner) {
    spinner.style.display = "flex";
  }

  // RoadSafe AI uses:
  // OSRM -> route calculation
  // Leaflet -> route visualization
  //
  // Google Directions is intentionally not used here.
  calculateFallbackRoute(
    originVal,
    destinationVal
  );
}

function calculateFallbackRoute(originVal, destinationVal) {
  const spinner = document.getElementById("routeLoadingSpinner");

  if (spinner) {
    spinner.style.display = "flex";
  }

  // -----------------------------------------------------
  // Send the actual user-entered origin and destination
  // to the FastAPI backend.
  // -----------------------------------------------------

  const url =
    `http://127.0.0.1:8000/api/map/plan-route` +
    `?origin=${encodeURIComponent(originVal)}` +
    `&destination=${encodeURIComponent(destinationVal)}`;

  console.log("RoadSafe AI Route Request:");
  console.log("Origin:", originVal);
  console.log("Destination:", destinationVal);
  console.log("API URL:", url);

  fetch(url)
    .then((res) => {
      if (!res.ok) {
        throw new Error(
          `Route API returned ${res.status}`
        );
      }

      return res.json();
    })

    .then((data) => {

      if (!data.success ||
          !data.routes ||
          !data.routes.fastest) {

        throw new Error(
          "Invalid route response from backend"
        );
      }

      const route = data.routes.fastest;

      console.log("RoadSafe AI Backend Response:", data);
      console.log("Fastest Route:", route);

      // -----------------------------------------------------
      // Backend route information
      // -----------------------------------------------------

      const distanceKm = `${route.distanceKm.toFixed(2)} km`;
      const durationMin = `${route.durationMin} mins`;

      const potholesCount =
        Number(route.potholesCount || 0);

      const safetyScore =
        route.safetyScore !== null &&
        route.safetyScore !== undefined
          ? Number(route.safetyScore)
          : null;

      const hazards =
        Array.isArray(route.hazards)
          ? route.hazards
          : [];

      // -----------------------------------------------------
      // Calculate route risk level
      // -----------------------------------------------------

      const highRiskHazards = hazards.filter(
        (hazard) =>
          hazard.severity === "High" ||
          hazard.severity === "Critical"
      ).length;

      let riskLevel = "Low Risk";

      if (highRiskHazards >= 3) {
        riskLevel = "High Risk";
      } else if (highRiskHazards >= 1) {
        riskLevel = "Moderate Risk";
      }

      // -----------------------------------------------------
      // Draw REAL OSRM road route on Leaflet
      // -----------------------------------------------------

      if (
        leafletMap &&
        route.path &&
        route.path.length > 0
      ) {

        // Remove previous route
        if (leafletRoutePolyline) {
          leafletMap.removeLayer(
            leafletRoutePolyline
          );
        }

        // Remove previous start marker
        if (leafletStartMarker) {
          leafletMap.removeLayer(
            leafletStartMarker
          );
        }

        // Remove previous destination marker
        if (leafletDestMarker) {
          leafletMap.removeLayer(
            leafletDestMarker
          );
        }

        // Backend converts OSRM coordinates
        // into [latitude, longitude].
        const routeCoords = route.path;

        leafletRoutePolyline = L.polyline(
          routeCoords,
          {
            color: "#7C3AED",
            weight: 6,
            opacity: 0.85
          }
        ).addTo(leafletMap);

        // -------------------------------------------------
        // Start marker
        // -------------------------------------------------

        leafletStartMarker = L.marker([
          data.originCoords.lat,
          data.originCoords.lng
        ])
          .addTo(leafletMap)
          .bindPopup(
            `<b>Start</b><br>${originVal}`
          );

        // -------------------------------------------------
        // Destination marker
        // -------------------------------------------------

        leafletDestMarker = L.marker([
          data.destCoords.lat,
          data.destCoords.lng
        ])
          .addTo(leafletMap)
          .bindPopup(
            `<b>Destination</b><br>${destinationVal}`
          );

        // -------------------------------------------------
        // Fit complete route inside map
        // -------------------------------------------------

        leafletMap.fitBounds(
          leafletRoutePolyline.getBounds(),
          {
            padding: [40, 40]
          }
        );
      }

      // -----------------------------------------------------
      // Update ALL route summary information
      // -----------------------------------------------------

      updateRouteInfoPanel({

        distance: distanceKm,

        duration: durationMin,

        durationSec:
          Number(route.durationMin || 0) * 60,

        destinationName:
          destinationVal,

        safetyScore:
          safetyScore,

        potholesCount:
          potholesCount,

        hazardCount:
          hazards.length,

        riskLevel:
          riskLevel

      });

      // -----------------------------------------------------
      // Update AI Route Intelligence
      // -----------------------------------------------------

      updateAiPlaceholders({

        safetyScore:
          safetyScore !== null
            ? `${safetyScore} / 100`
            : "N/A",

        potholesOnRoute:
          `${potholesCount} Potholes`,

        nearbyHazards:
          `${hazards.length} Hazards`,

        riskLevel:
          riskLevel,

        recommendation:
          `Actual road route to ${destinationVal} calculated. ` +
          `${route.distanceKm.toFixed(2)} km and approximately ` +
          `${route.durationMin} minutes driving time.`
      });

      // -----------------------------------------------------
      // Hide loading spinner AFTER successful response
      // -----------------------------------------------------

      if (spinner) {
        spinner.style.display = "none";
      }

    })

    .catch((err) => {

      if (spinner) {
        spinner.style.display = "none";
      }

      console.error(
        "RoadSafe AI route API error:",
        err
      );

      if (window.showToast) {
        window.showToast(
          "Unable to calculate route. Please try again.",
          "warning"
        );
      }
    });
}
function updateRouteInfoPanel(info) {
  // -----------------------------------------------------
  // Existing / backend-connected route values
  // -----------------------------------------------------
  const routeDistance = document.getElementById("routeDistance");
  const routeDuration = document.getElementById("routeDuration");
  const routeEta = document.getElementById("routeEta");

  if (routeDistance) {
    routeDistance.textContent = info.distance;
  }

  if (routeDuration) {
    routeDuration.textContent = info.duration;
  }

  // Calculate arrival ETA
  if (routeEta && info.durationSec) {
    const now = new Date();

    const arrivalTime = new Date(
      now.getTime() + info.durationSec * 1000
    );

    const hours = arrivalTime
      .getHours()
      .toString()
      .padStart(2, "0");

    const minutes = arrivalTime
      .getMinutes()
      .toString()
      .padStart(2, "0");

    routeEta.textContent = `${hours}:${minutes}`;
  }

  // -----------------------------------------------------
  // Live Map HTML summary cards
  // -----------------------------------------------------
  const tripDistance = document.getElementById("tripDistance");
  const tripEta = document.getElementById("tripEta");
  const tripSafetyScore = document.getElementById("tripSafetyScore");
  const tripHazards = document.getElementById("tripHazards");

  if (tripDistance) {
    tripDistance.textContent = info.distance;
  }

  if (tripEta) {
    tripEta.textContent = info.duration;
  }

  if (tripSafetyScore && info.safetyScore !== undefined) {
    tripSafetyScore.textContent = `${info.safetyScore}/100`;
  }

  if (tripHazards && info.potholesCount !== undefined) {
    tripHazards.textContent =
      `${info.potholesCount} Potholes`;
  }

  // -----------------------------------------------------
  // AI Route Intelligence
  // -----------------------------------------------------
  updateAiPlaceholders({
    safetyScore:
      info.safetyScore !== undefined
        ? `${info.safetyScore} / 100`
        : "N/A",

    potholesOnRoute:
      info.potholesCount !== undefined
        ? `${info.potholesCount} Potholes`
        : "N/A",

    nearbyHazards:
      info.hazardCount !== undefined
        ? `${info.hazardCount} Hazards`
        : "N/A",

    riskLevel:
      info.riskLevel || "Route Evaluated",

    recommendation:
      `Actual road route to ${info.destinationName} calculated. ` +
      `${info.distance} and approximately ${info.duration} driving time.`
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


// ==========================================================================
// Live Map HTML Compatibility API
// ==========================================================================

window.LiveNavigationMap = {
  init: function () {
    if (!leafletMap && !isGoogleMapsActive) {
      initLeafletFallback();
    }
  },

  requestLocationPermission: function () {
    requestAndTrackLocation();
  },

  recenterGPS: function () {
    recenterMap();
    setFollowMeMode(true);
  },

  showAlternateRoutes: function () {
    calculateRoute();
  }
};