/* global L, PotholeDataStore, MapEngine */

/**
 * RoadSafe AI - Unified Map Engine
 * Supports Leaflet.js (OpenStreetMap) with Start/End Markers & Route Bounds
 * Member 3: Navigation & Maps
 */

const MapEngine = {
    map: null,
    markers: [],
    routeLines: [],
    routeMarkers: [],
    currentPositionMarker: null,
    activeFilter: 'all',

    // Default map center (Kanpur City Center)
    defaultCenter: [26.4499, 80.3319],
    defaultZoom: 13,

    /**
     * Initialize Leaflet map in target element
     */
    init(elementId = "map", center = this.defaultCenter, zoom = this.defaultZoom) {
        const container = document.getElementById(elementId);
        if (!container) return null;

        if (typeof L !== 'undefined') {
            this.map = L.map(elementId, {
                zoomControl: true,
                attributionControl: false
            }).setView(center, zoom);

            // OpenStreetMap Tile Layer
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                maxZoom: 19,
            }).addTo(this.map);

            // Render pothole dataset (from live Backend API or PotholeDataStore fallback)
            this.loadAndRenderPotholes();

            return this.map;
        } else {
            console.warn("Leaflet Library not found!");
        }
    },

    async loadAndRenderPotholes() {
        if (typeof API !== 'undefined') {
            try {
                const res = await API.getPotholes();
                if (res && res.success && Array.isArray(res.markers) && res.markers.length > 0) {
                    this.renderPotholes(res.markers);
                    return;
                }
            } catch (err) {
                console.warn("[MapEngine] API fetch notice, loading fallback store:", err.message);
            }
        }
        if (typeof PotholeDataStore !== 'undefined') {
            this.renderPotholes(PotholeDataStore.potholes);
        }
    },

    /**
     * Render pothole markers on map
     */
    renderPotholes(potholesList) {
        if (!this.map || typeof L === 'undefined') return;

        this.clearMarkers();

        potholesList.forEach(pothole => {
            if (this.activeFilter !== 'all' && pothole.severity.toLowerCase() !== this.activeFilter.toLowerCase()) {
                return;
            }

            const severityClass = 'marker-' + pothole.severity.toLowerCase();

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
                    <div style="font-size: 11px; font-weight: 700; color: ${pothole.severity === 'High' ? '#dc2626' : (pothole.severity === 'Medium' ? '#d97706' : '#16a34a')}; text-transform: uppercase; margin-bottom: 2px;">
                        ${pothole.severity} Risk Pothole
                    </div>
                    <h4 style="font-size: 14px; font-weight: 600; margin: 0 0 6px 0; color: #0f172a;">${pothole.id}</h4>
                    <p style="font-size: 12px; color: #64748b; margin: 0 0 10px 0;">${pothole.address}</p>
                    <div style="display: flex; gap: 6px;">
                        <button onclick="window.MapEngine.openPotholeQuickView('${pothole.id}')" style="background:#9333ea; color:#fff; border:none; padding:6px 12px; border-radius:6px; font-size:12px; font-weight:600; cursor:pointer; flex:1;">
                            Details
                        </button>
                        <a href="route-planner3.html?avoid=${pothole.id}" style="background:#f3e8ff; color:#9333ea; border:1px solid #e9d5ff; padding:6px 10px; border-radius:6px; font-size:12px; font-weight:600; text-decoration:none; display:inline-block;">
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
        this.markers.forEach(m => this.map.removeLayer(m));
        this.markers = [];
    },

    setFilter(severity) {
        this.activeFilter = severity;
        if (typeof PotholeDataStore !== 'undefined') {
            this.renderPotholes(PotholeDataStore.potholes);
        }
    },

    /**
     * Draw polyline route with Start & Destination markers
     */
    drawRoute(coordinates, color = '#9333ea', weight = 5, originName = 'Start Location', destName = 'Destination') {
        if (!this.map || typeof L === 'undefined' || !coordinates || coordinates.length === 0) return;

        this.clearRoutes();

        const polyline = L.polyline(coordinates, {
            color: color,
            weight: weight,
            opacity: 0.9,
            lineJoin: 'round'
        }).addTo(this.map);

        this.routeLines.push(polyline);

        // Add Origin & Destination Pin Markers
        if (coordinates.length >= 2) {
            const startPoint = coordinates[0];
            const endPoint = coordinates[coordinates.length - 1];

            const startIcon = L.divIcon({
                className: 'custom-leaflet-marker marker-start',
                html: `<div style="background:#22c55e; color:#fff; border-radius:50%; width:34px; height:34px; display:flex; align-items:center; justify-content:center; box-shadow:0 4px 12px rgba(34,197,94,0.4); border:2px solid #fff; font-size:16px;"><i class="fa-solid fa-location-dot"></i></div>`,
                iconSize: [34, 34],
                iconAnchor: [17, 17]
            });

            const endIcon = L.divIcon({
                className: 'custom-leaflet-marker marker-end',
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

        // Auto zoom & pan map to fit the route polyline bounds
        this.map.fitBounds(polyline.getBounds(), { padding: [50, 50] });
    },

    clearRoutes() {
        this.routeLines.forEach(line => this.map.removeLayer(line));
        this.routeLines = [];
        this.routeMarkers.forEach(m => this.map.removeLayer(m));
        this.routeMarkers = [];
    },

    locateUser(callback) {
        if (!this.map || typeof L === 'undefined') return;

        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    const latlng = [pos.coords.latitude, pos.coords.longitude];
                    
                    if (this.currentPositionMarker) {
                        this.map.removeLayer(this.currentPositionMarker);
                    }

                    const driverIcon = L.divIcon({
                        className: 'custom-leaflet-marker marker-driver',
                        html: `<i class="fa-solid fa-car"></i>`,
                        iconSize: [36, 36],
                        iconAnchor: [18, 18]
                    });

                    this.currentPositionMarker = L.marker(latlng, { icon: driverIcon }).addTo(this.map);
                    this.currentPositionMarker.bindPopup("<b>You Are Here</b><br>Live GPS Location active").openPopup();
                    this.map.setView(latlng, 15);

                    if (callback) callback(latlng);
                },
                (err) => {
                    console.warn("GPS error: " + err.message);
                    alert("Could not acquire GPS position. Centering on Kanpur default location.");
                    this.map.setView(this.defaultCenter, 14);
                }
            );
        } else {
            alert("Geolocation service is not supported by your browser.");
        }
    },

    openPotholeQuickView(id) {
        if (typeof PotholeDataStore === 'undefined') return;
        const pothole = PotholeDataStore.getPotholeById(id);
        
        let modal = document.getElementById("potholeQuickModal");
        if (!modal) {
            modal = document.createElement("div");
            modal.id = "potholeQuickModal";
            modal.className = "modal-backdrop";
            document.body.appendChild(modal);
        }

        const badgeClass = PotholeDataStore.getSeverityBadgeClass(pothole.severity);
        const statusClass = PotholeDataStore.getStatusBadgeClass(pothole.status);

        modal.innerHTML = `
            <div class="modal-content">
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 16px;">
                    <div>
                        <span class="badge-pill ${badgeClass}">${pothole.severity} Severity</span>
                        <h3 style="font-size: 20px; font-weight: 700; margin-top: 6px;">Pothole #${pothole.id}</h3>
                    </div>
                    <button onclick="document.getElementById('potholeQuickModal').classList.remove('show')" style="background:none; border:none; font-size: 20px; cursor:pointer; color:#64748b;">
                        <i class="fa-solid fa-xmark"></i>
                    </button>
                </div>
                
                <div style="position:relative; width:100%; height:200px; border-radius:12px; overflow:hidden; margin-bottom:16px; background:#0f172a;">
                    <img src="${pothole.image}" style="width:100%; height:100%; object-fit:cover;" alt="Pothole detection image">
                    <div style="position:absolute; top:${pothole.bbox.y}%; left:${pothole.bbox.x}%; width:${pothole.bbox.width}%; height:${pothole.bbox.height}%; border:2px dashed #ef4444; background:rgba(239,68,68,0.25);">
                        <span style="position:absolute; top:-22px; left:0; background:#ef4444; color:#fff; font-size:10px; font-weight:700; padding:2px 6px; border-radius:4px;">
                            AI ${pothole.aiConfidence}%
                        </span>
                    </div>
                </div>

                <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px; margin-bottom:16px; font-size:13px;">
                    <div style="background:#f8fafc; padding:10px; border-radius:10px;">
                        <span style="color:#64748b; display:block;">Location</span>
                        <strong>${pothole.address}</strong>
                    </div>
                    <div style="background:#f8fafc; padding:10px; border-radius:10px;">
                        <span style="color:#64748b; display:block;">Status</span>
                        <span class="badge-pill ${statusClass}">${pothole.status}</span>
                    </div>
                    <div style="background:#f8fafc; padding:10px; border-radius:10px;">
                        <span style="color:#64748b; display:block;">Est. Depth & Width</span>
                        <strong>${pothole.depthCm} cm / ${pothole.widthCm} cm</strong>
                    </div>
                    <div style="background:#f8fafc; padding:10px; border-radius:10px;">
                        <span style="color:#64748b; display:block;">Community Votes</span>
                        <strong><i class="fa-solid fa-thumbs-up" style="color:#9333ea;"></i> ${pothole.upvotes} Confirmations</strong>
                    </div>
                </div>

                <div style="display:flex; gap:12px; margin-top:20px;">
                    <a href="pothole-detail3.html?id=${pothole.id}" class="btn-primary" style="flex:1; justify-content:center; text-decoration:none;">
                        Full AI Analysis
                    </a>
                    <a href="route-planner3.html?avoid=${pothole.id}" class="btn-secondary" style="flex:1; justify-content:center; text-decoration:none;">
                        <i class="fa-solid fa-shield-halved"></i> Avoid Route
                    </a>
                </div>
            </div>
        `;

        modal.classList.add("show");
    }
};

if (typeof window !== 'undefined') {
    window.MapEngine = MapEngine;
}
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MapEngine;
}
