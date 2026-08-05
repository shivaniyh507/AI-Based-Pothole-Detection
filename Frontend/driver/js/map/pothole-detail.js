/**
 * RoadSafe AI - Pothole Detail Module
 * Member 3: Navigation & Maps
 * Interactive GPS Hazard Map & Road Analytics View
 */

const PotholeDetailView = {
    currentPothole: null,
    map: null,

    init() {
        const urlParams = new URLSearchParams(window.location.search);
        const potholeId = urlParams.get('id') || 'POT-101';

        if (typeof PotholeDataStore !== 'undefined') {
            this.currentPothole = PotholeDataStore.getPotholeById(potholeId);
        }

        if (this.currentPothole) {
            this.renderDetails();
            this.renderHazardMap();
        }
    },

    renderDetails() {
        const p = this.currentPothole;

        // Title and Header
        const titleEl = document.getElementById("potholeTitle");
        const addressEl = document.getElementById("potholeAddress");
        const severityBadge = document.getElementById("potholeSeverityBadge");
        const statusBadge = document.getElementById("potholeStatusBadge");

        if (titleEl) titleEl.innerText = `Pothole Analysis #${p.id}`;
        if (addressEl) addressEl.innerText = p.address;

        if (severityBadge && typeof PotholeDataStore !== 'undefined') {
            severityBadge.className = `badge-pill ${PotholeDataStore.getSeverityBadgeClass(p.severity)}`;
            severityBadge.innerText = `${p.severity} Hazard Level`;
        }

        if (statusBadge && typeof PotholeDataStore !== 'undefined') {
            statusBadge.className = `badge-pill ${PotholeDataStore.getStatusBadgeClass(p.status)}`;
            statusBadge.innerText = p.status;
        }

        // Metrics
        const depthEl = document.getElementById("metricDepth");
        const widthEl = document.getElementById("metricWidth");
        const confEl = document.getElementById("metricConfidence");
        const votesEl = document.getElementById("metricUpvotes");
        const dateEl = document.getElementById("metricDetectedAt");
        const coordsEl = document.getElementById("metricCoordinates");

        if (depthEl) depthEl.innerText = p.depthCm + " cm";
        if (widthEl) widthEl.innerText = p.widthCm + " cm";
        if (confEl) confEl.innerText = p.aiConfidence + "%";
        if (votesEl) votesEl.innerText = p.upvotes;
        if (dateEl) dateEl.innerText = p.detectedAt;
        if (coordsEl) coordsEl.innerText = `${p.lat.toFixed(4)}° N, ${p.lng.toFixed(4)}° E`;

        // Action links
        const rerouteBtn = document.getElementById("rerouteButton");
        if (rerouteBtn) {
            rerouteBtn.href = `route-planner.html?avoid=${p.id}`;
        }
    },

    renderHazardMap() {
        const p = this.currentPothole;
        const container = document.getElementById("detailHazardMap");
        if (!container || !p || typeof L === 'undefined') return;

        // Initialize Map centered on Pothole GPS
        this.map = L.map("detailHazardMap", {
            zoomControl: true,
            attributionControl: false
        }).setView([p.lat, p.lng], 16);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(this.map);

        // Marker & Danger Buffer Ring
        const iconClass = 'marker-' + p.severity.toLowerCase();
        const icon = L.divIcon({
            className: `custom-leaflet-marker ${iconClass}`,
            html: `<i class="fa-solid fa-triangle-exclamation"></i>`,
            iconSize: [40, 40],
            iconAnchor: [20, 20]
        });

        const marker = L.marker([p.lat, p.lng], { icon }).addTo(this.map);
        marker.bindPopup(`
            <div style="font-family:'Poppins',sans-serif;">
                <strong style="color:#ef4444;">${p.severity} Hazard Zone</strong><br>
                <span>${p.id} - ${p.address}</span>
            </div>
        `).openPopup();

        // Add 60-meter red caution circle buffer around the pothole
        L.circle([p.lat, p.lng], {
            color: p.severity === 'High' ? '#ef4444' : '#f59e0b',
            fillColor: p.severity === 'High' ? '#ef4444' : '#f59e0b',
            fillOpacity: 0.25,
            radius: 60
        }).addTo(this.map);

        // Add recommended detour path visualization line
        const detourCoords = [
            [p.lat - 0.003, p.lng - 0.004],
            [p.lat - 0.002, p.lng + 0.003],
            [p.lat + 0.003, p.lng + 0.004]
        ];

        L.polyline(detourCoords, {
            color: '#9333ea',
            weight: 5,
            dashArray: '8, 8',
            opacity: 0.85
        }).addTo(this.map).bindPopup("AI Safe Detour Bypass");
    },

    recenterMap() {
        if (this.map && this.currentPothole) {
            this.map.setView([this.currentPothole.lat, this.currentPothole.lng], 16);
        }
    },

    upvotePothole() {
        if (!this.currentPothole) return;
        this.currentPothole.upvotes++;
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
if (typeof module !== 'undefined') {
    module.exports = PotholeDetailView;
}
