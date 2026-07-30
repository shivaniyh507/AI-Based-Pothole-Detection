/**
 * RoadSafe AI - Master Icons Dictionary
 * Centralized registry of all icons used across pages and views
 */

const AppIcons = {
    // Navigation & Sidebar Icons
    brand: { icon: "fa-road", label: "RoadSafe AI Logo", class: "fa-solid fa-road" },
    dashboard: { icon: "fa-gauge-high", label: "Dashboard", class: "fa-solid fa-gauge-high" },
    mapView: { icon: "fa-map-location-dot", label: "Map View", class: "fa-solid fa-map-location-dot" },
    routePlanner: { icon: "fa-route", label: "Route Planner", class: "fa-solid fa-route" },
    routeHistory: { icon: "fa-clock-rotate-left", label: "Route History", class: "fa-solid fa-clock-rotate-left" },
    potholeDetails: { icon: "fa-circle-info", label: "Pothole Details", class: "fa-solid fa-circle-info" },
    scanRoad: { icon: "fa-camera", label: "Scan Road", class: "fa-solid fa-camera" },
    myReports: { icon: "fa-file-lines", label: "My Reports", class: "fa-solid fa-file-lines" },
    notifications: { icon: "fa-bell", label: "Notifications", class: "fa-solid fa-bell" },
    logout: { icon: "fa-right-from-bracket", label: "Logout", class: "fa-solid fa-right-from-bracket" },

    // Route Planner & Directions Icons
    startLocation: { icon: "fa-location-dot", label: "Start Location", class: "fa-solid fa-location-dot" },
    destination: { icon: "fa-flag-checkered", label: "Destination Flag", class: "fa-solid fa-flag-checkered" },
    swap: { icon: "fa-right-left", label: "Swap Locations", class: "fa-solid fa-right-left" },
    calculate: { icon: "fa-calculator", label: "Calculate Route", class: "fa-solid fa-calculator" },
    startNav: { icon: "fa-paper-plane", label: "Start Navigation", class: "fa-solid fa-paper-plane" },
    endNav: { icon: "fa-stop", label: "End Navigation", class: "fa-solid fa-stop" },
    navArrow: { icon: "fa-location-arrow", label: "Live Navigation Arrow", class: "fa-solid fa-location-arrow" },
    safetyShield: { icon: "fa-shield-halved", label: "Safety Shield", class: "fa-solid fa-shield-halved" },
    potholeWarning: { icon: "fa-triangle-exclamation", label: "Pothole Warning", class: "fa-solid fa-triangle-exclamation" },
    goStraight: { icon: "fa-arrow-up", label: "Straight Turn", class: "fa-solid fa-arrow-up" },
    turnRight: { icon: "fa-right-turn", label: "Turn Right", class: "fa-solid fa-right-turn" },
    turnLeft: { icon: "fa-left-turn", label: "Turn Left", class: "fa-solid fa-left-turn" },
    directionsHeader: { icon: "fa-diamond-turn-right", label: "Directions", class: "fa-solid fa-diamond-turn-right" },

    // Map & Interactive Tools Icons
    search: { icon: "fa-magnifying-glass", label: "Search Map", class: "fa-solid fa-magnifying-glass" },
    myLocation: { icon: "fa-location-crosshairs", label: "My GPS Location", class: "fa-solid fa-location-crosshairs" },
    driverCar: { icon: "fa-car", label: "Driver Vehicle Marker", class: "fa-solid fa-car" },
    hazardAssessment: { icon: "fa-shield-cat", label: "Hazard Assessment", class: "fa-solid fa-shield-cat" },
    recenter: { icon: "fa-crosshairs", label: "Recenter Map", class: "fa-solid fa-crosshairs" },
    upvote: { icon: "fa-thumbs-up", label: "Confirm Vote", class: "fa-solid fa-thumbs-up" },
    confirmed: { icon: "fa-check", label: "Vote Confirmed", class: "fa-solid fa-check" },
    back: { icon: "fa-arrow-left", label: "Back to Map", class: "fa-solid fa-arrow-left" },
    close: { icon: "fa-xmark", label: "Close Modal", class: "fa-solid fa-xmark" }
};

if (typeof window !== 'undefined') {
    window.AppIcons = AppIcons;
}
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AppIcons;
}
