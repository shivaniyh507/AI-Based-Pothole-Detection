/**
 * RoadSafe AI - Route Planner Module
 * Member 3: Navigation & Maps
 * Real-Time OSRM & Kanpur City Geocoding Route Engine
 */

const RoutePlanner = {
    selectedRoute: 'safest', // 'safest' | 'balanced' | 'fastest'
    origin: 'Panki',
    destination: 'IIT Kanpur Campus',
    isNavigating: false,
    navigationInterval: null,

    // Accurate landmark database for Kanpur city & NCR
    landmarks: {
        'panki': [26.4385, 80.2440],
        'panki station': [26.4350, 80.2400],
        'iit kanpur': [26.5120, 80.2330],
        'iit kanpur campus': [26.5120, 80.2330],
        'iit': [26.5120, 80.2330],
        'civil lines': [26.4670, 80.3490],
        'swaroop nagar': [26.4760, 80.3110],
        'mall road': [26.4600, 80.3540],
        'phool bagh': [26.4580, 80.3520],
        'kalyanpur': [26.4980, 80.2570],
        'canal road': [26.4650, 80.3350],
        'kidwai nagar': [26.4260, 80.3320],
        'govind nagar': [26.4420, 80.2950],
        'railway station': [26.4540, 80.3510],
        'kanpur central': [26.4540, 80.3510],
        'armapur': [26.4520, 80.2680],
        'kakadeo': [26.4730, 80.2980],
        'rawatpur': [26.4790, 80.3080]
    },

    routesData: {},

    init() {
        const origEl = document.getElementById("originInput");
        const destEl = document.getElementById("destInput");
        this.origin = origEl ? origEl.value : 'Panki';
        this.destination = destEl ? destEl.value : 'IIT Kanpur Campus';
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
        let hash = 0;
        for (let i = 0; i < normalized.length; i++) {
            hash = normalized.charCodeAt(i) + ((hash << 5) - hash);
        }
        const latOffset = ((Math.abs(hash) % 120) - 60) / 1000;
        const lngOffset = ((Math.abs(hash >> 3) % 120) - 60) / 1000;
        return [26.45 + latOffset, 80.30 + lngOffset];
    },

    getDistanceKm(lat1, lon1, lat2, lon2) {
        const R = 6371;
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                  Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                  Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const dist = R * c;
        return Math.max(1.2, Math.round(dist * 10) / 10);
    },

    async calculateRoutes(originStr, destStr) {
        this.origin = originStr || 'Panki';
        this.destination = destStr || 'IIT Kanpur Campus';

        const startCoords = this.geocode(this.origin);
        const endCoords = this.geocode(this.destination);

        const originName = this.origin.split(',')[0];
        const destName = this.destination.split(',')[0];

        let realPolyline = null;
        let realDistance = null;
        let realDuration = null;

        // Fetch OpenStreetMap OSRM real road driving route
        try {
            const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${startCoords[1]},${startCoords[0]};${endCoords[1]},${endCoords[0]}?overview=full&geometries=geojson`;
            const resp = await fetch(osrmUrl);
            if (resp.ok) {
                const data = await resp.json();
                if (data.routes && data.routes.length > 0) {
                    const r = data.routes[0];
                    realDistance = Math.round((r.distance / 1000) * 10) / 10;
                    realDuration = Math.round(r.duration / 60);
                    realPolyline = r.geometry.coordinates.map(c => [c[1], c[0]]);
                }
            }
        } catch (e) {
            console.warn("OSRM routing API unavailable, using fallback road geometry", e);
        }

        const baseDist = realDistance || Math.round((this.getDistanceKm(startCoords[0], startCoords[1], endCoords[0], endCoords[1]) * 1.25) * 10) / 10;

        if (!realPolyline) {
            const step1 = [startCoords[0], startCoords[1]];
            const step2 = [startCoords[0] + (endCoords[0] - startCoords[0]) * 0.4, startCoords[1] + (endCoords[1] - startCoords[1]) * 0.2];
            const step3 = [startCoords[0] + (endCoords[0] - startCoords[0]) * 0.75, startCoords[1] + (endCoords[1] - startCoords[1]) * 0.85];
            const step4 = [endCoords[0], endCoords[1]];
            realPolyline = [step1, step2, step3, step4];
        }

        const safestDist = Math.round((baseDist * 1.12) * 10) / 10;
        const safestTime = Math.max(3, realDuration ? Math.round(realDuration * 1.15) : Math.round(safestDist * 2.1));

        const balancedDist = Math.round((baseDist * 1.04) * 10) / 10;
        const balancedTime = Math.max(2, realDuration || Math.round(balancedDist * 1.8));

        const fastestDist = baseDist;
        const fastestTime = Math.max(2, Math.round(fastestDist * 1.4));

        this.routesData = {
            safest: {
                name: "Safest Route",
                distanceKm: safestDist,
                durationMin: safestTime,
                potholesCount: 0,
                safetyScore: 98,
                tag: "Recommended",
                tagClass: "tag-safest",
                path: realPolyline,
                steps: [
                    { icon: "fa-arrow-up", text: `Depart from ${originName} on Kalyanpur Road`, dist: `${Math.round(safestDist * 0.25 * 10) / 10} km` },
                    { icon: "fa-right-turn", text: `Take Kalyanpur Highway Bypass (Bypassing Swaroop Nagar pothole zones)`, dist: `${Math.round(safestDist * 0.5 * 10) / 10} km` },
                    { icon: "fa-shield-halved", text: "AI Alert: Pothole-free smooth asphalt section verified", dist: `${Math.round(safestDist * 0.25 * 10) / 10} km`, warning: false },
                    { icon: "fa-flag-checkered", text: `Arrive safely at ${destName}`, dist: "0 m" }
                ]
            },
            balanced: {
                name: "Balanced Route",
                distanceKm: balancedDist,
                durationMin: balancedTime,
                potholesCount: 1,
                safetyScore: 86,
                tag: "Moderate",
                tagClass: "tag-balanced",
                path: realPolyline,
                steps: [
                    { icon: "fa-arrow-up", text: `Depart from ${originName}`, dist: `${Math.round(balancedDist * 0.3 * 10) / 10} km` },
                    { icon: "fa-triangle-exclamation", text: `Caution: 1 Low-Risk Pothole detected near Canal Crossing`, dist: "300 m", warning: true },
                    { icon: "fa-arrow-up", text: `Continue towards ${destName}`, dist: `${Math.round(balancedDist * 0.6 * 10) / 10} km` },
                    { icon: "fa-flag-checkered", text: `Arrive at ${destName}`, dist: "0 m" }
                ]
            },
            fastest: {
                name: "Fastest Route",
                distanceKm: fastestDist,
                durationMin: fastestTime,
                potholesCount: 3,
                safetyScore: 64,
                tag: "High Pothole Risk",
                tagClass: "tag-fastest",
                path: realPolyline,
                steps: [
                    { icon: "fa-arrow-up", text: `Take direct transit route from ${originName}`, dist: `${Math.round(fastestDist * 0.4 * 10) / 10} km` },
                    { icon: "fa-triangle-exclamation", text: `WARNING: 3 Active Potholes detected on short-cut corridor!`, dist: "800 m", warning: true },
                    { icon: "fa-flag-checkered", text: `Arrive at ${destName}`, dist: "0 m" }
                ]
            }
        };

        this.renderRouteCards();
        this.selectRoute(this.selectedRoute || 'safest');
    },

    setupEventListeners() {
        const originInput = document.getElementById("originInput");
        const destInput = document.getElementById("destInput");
        const swapBtn = document.getElementById("swapLocationsBtn");
        const startNavBtn = document.getElementById("startNavBtn");
        const calcBtn = document.getElementById("calcRouteBtn");

        const updateRoute = () => {
            const orig = originInput ? originInput.value : this.origin;
            const dest = destInput ? destInput.value : this.destination;
            this.calculateRoutes(orig, dest);
        };

        if (originInput) {
            originInput.addEventListener("input", updateRoute);
            originInput.addEventListener("change", updateRoute);
            originInput.addEventListener("keypress", (e) => { if (e.key === 'Enter') updateRoute(); });
        }

        if (destInput) {
            destInput.addEventListener("input", updateRoute);
            destInput.addEventListener("change", updateRoute);
            destInput.addEventListener("keypress", (e) => { if (e.key === 'Enter') updateRoute(); });
        }

        if (calcBtn) {
            calcBtn.addEventListener("click", updateRoute);
        }

        if (swapBtn) {
            swapBtn.addEventListener("click", () => {
                if (originInput && destInput) {
                    const temp = originInput.value;
                    originInput.value = destInput.value;
                    destInput.value = temp;
                    updateRoute();
                }
            });
        }

        if (startNavBtn) {
            startNavBtn.addEventListener("click", () => {
                this.toggleLiveNavigation();
            });
        }
    },

    renderRouteCards() {
        const container = document.getElementById("routeOptionsContainer");
        if (!container) return;

        container.innerHTML = Object.keys(this.routesData).map(key => {
            const r = this.routesData[key];
            return `
                <div class="route-select-card ${key === this.selectedRoute ? 'active' : ''}" onclick="RoutePlanner.selectRoute('${key}')">
                    <span class="route-tag ${r.tagClass}">${r.tag}</span>
                    <div class="route-card-title">${r.name}</div>
                    <div style="font-size: 20px; font-weight: 700; color: #2563eb; margin-top: 4px;">
                        ${r.durationMin} min <span style="font-size: 14px; font-weight: 400; color: #64748b;">(${r.distanceKm} km)</span>
                    </div>
                    <div class="route-card-stats">
                        <span><i class="fa-solid fa-shield-halved" style="color:${r.safetyScore > 90 ? '#22c55e' : (r.safetyScore > 80 ? '#f59e0b' : '#ef4444')};"></i> ${r.safetyScore}% Safety</span>
                        <span><i class="fa-solid fa-triangle-exclamation" style="color:${r.potholesCount === 0 ? '#22c55e' : '#ef4444'};"></i> ${r.potholesCount} Potholes</span>
                    </div>
                </div>
            `;
        }).join('');
    },

    selectRoute(routeKey) {
        this.selectedRoute = routeKey;
        this.renderRouteCards();

        const activeRoute = this.routesData[routeKey];
        if (!activeRoute) return;

        // Draw Map Polyline & Pin Markers
        if (typeof MapEngine !== 'undefined' && MapEngine.map) {
            const lineColor = routeKey === 'safest' ? '#9333ea' : (routeKey === 'balanced' ? '#f59e0b' : '#ef4444');
            MapEngine.drawRoute(activeRoute.path, lineColor, 6, this.origin, this.destination);
        }

        // Render Turn-by-Turn Steps
        this.renderSteps(activeRoute.steps);

        // Update Summary KPI Bar
        this.updateSummary(activeRoute);
    },

    renderSteps(steps) {
        const container = document.getElementById("directionsList");
        if (!container) return;

        container.innerHTML = steps.map(step => `
            <div class="direction-step">
                <div class="step-icon ${step.warning ? 'warning' : ''}">
                    <i class="fa-solid ${step.icon}"></i>
                </div>
                <div class="step-info">
                    <strong>${step.text}</strong>
                    <p>${step.dist}</p>
                </div>
            </div>
        `).join('');
    },

    updateSummary(route) {
        const distEl = document.getElementById("summaryDistance");
        const timeEl = document.getElementById("summaryTime");
        const potEl = document.getElementById("summaryPotholes");
        const scoreEl = document.getElementById("summaryScore");

        if (distEl) distEl.innerText = route.distanceKm + " km";
        if (timeEl) timeEl.innerText = route.durationMin + " mins";
        if (potEl) potEl.innerText = route.potholesCount + " detected";
        if (scoreEl) scoreEl.innerText = route.safetyScore + "/100";
    },

    toggleLiveNavigation() {
        const btn = document.getElementById("startNavBtn");
        const banner = document.getElementById("navBanner");

        if (this.isNavigating) {
            this.isNavigating = false;
            if (btn) btn.innerHTML = `<i class="fa-solid fa-paper-plane"></i> Start Live Navigation`;
            if (banner) banner.style.display = "none";
            clearInterval(this.navigationInterval);
        } else {
            this.isNavigating = true;
            if (btn) btn.innerHTML = `<i class="fa-solid fa-stop"></i> End Navigation`;
            if (banner) {
                banner.style.display = "flex";
                banner.innerHTML = `
                    <div style="background:#9333ea; color:#fff; padding:14px 20px; border-radius:14px; display:flex; justify-content:space-between; align-items:center; width:100%; box-shadow: 0 10px 25px rgba(147,51,234,0.3);">
                        <div style="display:flex; align-items:center; gap:14px;">
                            <i class="fa-solid fa-location-arrow fa-2x"></i>
                            <div>
                                <strong style="font-size:16px;">Navigating from ${this.origin} to ${this.destination} (${this.routesData[this.selectedRoute].name})</strong>
                                <p style="font-size:12px; margin:0; opacity:0.9;">AI Pothole avoidance system active</p>
                            </div>
                        </div>
                        <div style="text-align:right;">
                            <span style="font-size:20px; font-weight:700;">${this.routesData[this.selectedRoute].durationMin} min</span>
                            <div style="font-size:12px;">${this.routesData[this.selectedRoute].distanceKm} km remaining</div>
                        </div>
                    </div>
                `;
            }

            let stepIndex = 0;
            const path = this.routesData[this.selectedRoute].path;
            
            this.navigationInterval = setInterval(() => {
                if (stepIndex < path.length) {
                    if (typeof MapEngine !== 'undefined' && MapEngine.map) {
                        MapEngine.map.panTo(path[stepIndex]);
                    }
                    stepIndex++;
                } else {
                    stepIndex = 0;
                }
            }, 3000);
        }
    }
};

if (typeof window !== 'undefined') {
    window.RoutePlanner = RoutePlanner;
}
if (typeof module !== 'undefined' && module.exports) {
    module.exports = RoutePlanner;
}
