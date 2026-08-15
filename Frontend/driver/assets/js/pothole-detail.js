/**
 * RoadSafe AI - Pothole Detail Module
 * Member 3: Navigation & Maps
 * Interactive GPS Hazard Map & Road Analytics View
 */

const PotholeDetailView = {
    currentPothole: null,
    map: null,
    defaultPothole: {
        id: "POT-101",
        lat: 26.4524,
        lng: 80.3345,
        address: "Mall Road near Phool Bagh, Kanpur",
        severity: "High",
        riskScore: 88,
        detectedAt: "2026-07-20 14:32",
        image: "https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80",
        status: "Unrepaired",
        upvotes: 24,
        depthCm: 14.5,
        widthCm: 65,
        aiConfidence: 97.4,
        bbox: { x: 25, y: 35, width: 45, height: 30 }
    },

    init() {
        const urlParams = new URLSearchParams(window.location.search);
        const potholeId = urlParams.get('id') || 'POT-101';

        if (typeof PotholeDataStore !== 'undefined') {
            this.currentPothole = PotholeDataStore.getPotholeById(potholeId);
        }

        if (!this.currentPothole) {
            this.currentPothole = this.defaultPothole;
        }

        this.renderDetails();
        this.renderHazardMap();
    },

    renderDetails() {
        const p = this.currentPothole || this.defaultPothole;

        // Title and Header
        const titleEl = document.getElementById("potholeTitle");
        const addressEl = document.getElementById("potholeAddress");
        const severityBadge = document.getElementById("potholeSeverityBadge");
        const statusBadge = document.getElementById("potholeStatusBadge");

        if (titleEl) titleEl.innerText = `Pothole Analysis #${p.id}`;
        if (addressEl) addressEl.innerText = p.address;

        if (severityBadge) {
            const badgeClass = (typeof PotholeDataStore !== 'undefined')
                ? PotholeDataStore.getSeverityBadgeClass(p.severity)
                : (p.severity === 'High' ? 'badge-danger' : (p.severity === 'Medium' ? 'badge-warning' : 'badge-success'));
            severityBadge.className = `badge-pill ${badgeClass}`;
            severityBadge.innerText = `${p.severity} Hazard Level`;
        }

        if (statusBadge) {
            const statusClass = (typeof PotholeDataStore !== 'undefined')
                ? PotholeDataStore.getStatusBadgeClass(p.status)
                : (p.status === 'Repaired' ? 'badge-success' : 'badge-danger');
            statusBadge.className = `badge-pill ${statusClass}`;
            statusBadge.innerText = p.status;
        }

        // Metrics
        const depthEl = document.getElementById("metricDepth");
        const widthEl = document.getElementById("metricWidth");
        const confEl = document.getElementById("metricConfidence");
        const votesEl = document.getElementById("metricUpvotes");
        const dateEl = document.getElementById("metricDetectedAt");
        const coordsEl = document.getElementById("metricCoordinates");

        if (depthEl) depthEl.innerText = (p.depthCm || 14.5) + " cm";
        if (widthEl) widthEl.innerText = (p.widthCm || 65) + " cm";
        if (confEl) confEl.innerText = (p.aiConfidence || 97.4) + "%";
        if (votesEl) votesEl.innerText = p.upvotes || 24;
        if (dateEl) dateEl.innerText = p.detectedAt || "2026-07-20 14:32";
        if (coordsEl && p.lat && p.lng) {
            coordsEl.innerText = `${p.lat.toFixed(4)}° N, ${p.lng.toFixed(4)}° E`;
        }

        // Action links
        const rerouteBtn = document.getElementById("rerouteButton");
        if (rerouteBtn) {
            rerouteBtn.href = `route-planner3.html?avoid=${p.id}`;
        }

        // Optional AI Detection Image Preview
        const imgContainer = document.getElementById("potholeImageContainer");
        const imgEl = document.getElementById("potholeImage");
        if (imgEl && p.image) {
            imgEl.src = p.image;
        }
    },

    renderHazardMap() {
        const p = this.currentPothole || this.defaultPothole;
        const container = document.getElementById("detailHazardMap");
        if (!container || !p || typeof L === 'undefined') return;

        // Reset existing map instance if any
        if (this.map) {
            this.map.remove();
            this.map = null;
        }

        // Initialize Map centered on Pothole GPS
        this.map = L.map("detailHazardMap", {
            zoomControl: true,
            attributionControl: false
        }).setView([p.lat, p.lng], 16);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19
        }).addTo(this.map);

        // Custom Leaflet Marker
        const iconClass = 'marker-' + (p.severity ? p.severity.toLowerCase() : 'high');
        const icon = L.divIcon({
            className: `custom-leaflet-marker ${iconClass}`,
            html: `<i class="fa-solid fa-triangle-exclamation"></i>`,
            iconSize: [42, 42],
            iconAnchor: [21, 21]
        });

        const marker = L.marker([p.lat, p.lng], { icon }).addTo(this.map);
        marker.bindPopup(`
            <div style="font-family:'Poppins',sans-serif; padding: 4px;">
                <strong style="color:#ef4444; font-size:14px;">${p.severity || 'High'} Hazard Zone</strong><br>
                <span style="color:#475569; font-size:12px;">${p.id} — ${p.address}</span>
            </div>
        `).openPopup();

        // 60-meter caution circle buffer around pothole
        L.circle([p.lat, p.lng], {
            color: p.severity === 'High' ? '#ef4444' : '#f59e0b',
            fillColor: p.severity === 'High' ? '#ef4444' : '#f59e0b',
            fillOpacity: 0.25,
            radius: 60
        }).addTo(this.map);

        // AI Detour Bypass path line
        const detourCoords = [
            [p.lat - 0.003, p.lng - 0.004],
            [p.lat - 0.002, p.lng + 0.003],
            [p.lat + 0.003, p.lng + 0.004]
        ];

        L.polyline(detourCoords, {
            color: '#a855f7',
            weight: 5,
            dashArray: '8, 8',
            opacity: 0.85
        }).addTo(this.map).bindPopup("AI Recommended Detour Bypass");

        // Force Leaflet to recalculate size after DOM layout is complete
        setTimeout(() => {
            if (this.map) {
                this.map.invalidateSize();
            }
        }, 200);
    },

    recenterMap() {
        const p = this.currentPothole || this.defaultPothole;
        if (this.map && p) {
            this.map.setView([p.lat, p.lng], 16);
            this.map.invalidateSize();
        }
    },

    upvotePothole() {
        if (!this.currentPothole) this.currentPothole = this.defaultPothole;
        this.currentPothole.upvotes = (this.currentPothole.upvotes || 0) + 1;
        const votesEl = document.getElementById("metricUpvotes");
        if (votesEl) votesEl.innerText = this.currentPothole.upvotes;

        const btn = document.getElementById("upvoteBtn");
        if (btn) {
            btn.innerHTML = `<i class="fa-solid fa-check"></i> Confirmed (${this.currentPothole.upvotes})`;
            btn.disabled = true;
            btn.style.opacity = 0.75;
        }
    }
};

if (typeof window !== 'undefined') {
    window.PotholeDetailView = PotholeDetailView;
}
