/**
 * RoadSafe AI - Route History Module
 * Member 3: Navigation & Maps
 */

const RouteHistoryManager = {
    trips: [],

    init() {
        if (typeof PotholeDataStore !== 'undefined') {
            this.trips = PotholeDataStore.routeHistory;
        }
        this.renderStats();
        this.renderTripCards();
        this.setupFilters();
    },

    renderStats() {
        const totalDist = this.trips.reduce((acc, t) => acc + t.distanceKm, 0);
        const totalAvoided = this.trips.reduce((acc, t) => acc + t.potholesAvoided, 0);
        const avgSafety = Math.round(this.trips.reduce((acc, t) => acc + t.safetyScore, 0) / (this.trips.length || 1));

        const distEl = document.getElementById("statTotalDistance");
        const avoidedEl = document.getElementById("statPotholesAvoided");
        const avgScoreEl = document.getElementById("statAvgSafetyScore");
        const countEl = document.getElementById("statTotalTrips");

        if (distEl) distEl.innerText = totalDist.toFixed(1) + " km";
        if (avoidedEl) avoidedEl.innerText = totalAvoided;
        if (avgScoreEl) avgScoreEl.innerText = avgSafety + "%";
        if (countEl) countEl.innerText = this.trips.length;
    },

    renderTripCards(filterTerm = '') {
        const container = document.getElementById("tripHistoryContainer");
        if (!container) return;

        const filtered = this.trips.filter(t => 
            t.from.toLowerCase().includes(filterTerm.toLowerCase()) || 
            t.to.toLowerCase().includes(filterTerm.toLowerCase()) ||
            t.id.toLowerCase().includes(filterTerm.toLowerCase())
        );

        if (filtered.length === 0) {
            container.innerHTML = `
                <div style="text-align: center; padding: 40px; color: #64748b; background: #fff; border-radius: 16px;">
                    <i class="fa-solid fa-route fa-3x" style="margin-bottom: 12px; opacity: 0.5;"></i>
                    <h4>No Route History Found</h4>
                    <p style="font-size: 13px;">No past trips match your search filter.</p>
                </div>
            `;
            return;
        }

        container.innerHTML = filtered.map(t => `
            <div class="trip-card">
                <div style="display: flex; align-items: center; gap: 16px;">
                    <div style="width: 50px; height: 50px; border-radius: 14px; background: #eff6ff; color: #2563eb; display: flex; align-items: center; justify-content: center; font-size: 20px; flex-shrink: 0;">
                        <i class="fa-solid fa-route"></i>
                    </div>
                    <div class="trip-main-info">
                        <h4>${t.from} <i class="fa-solid fa-arrow-right-long" style="font-size: 12px; color: #94a3b8; margin: 0 6px;"></i> ${t.to}</h4>
                        <p><i class="fa-regular fa-calendar" style="margin-right: 4px;"></i> ${t.date} at ${t.time} • <span class="badge-pill ${t.routeType === 'Safest Route' ? 'badge-success' : 'badge-info'}">${t.routeType}</span></p>
                    </div>
                </div>

                <div style="display: flex; align-items: center; gap: 24px;">
                    <div style="text-align: right;">
                        <div style="font-weight: 700; font-size: 16px;">${t.distanceKm} km</div>
                        <div style="font-size: 12px; color: #64748b;">${t.durationMin} mins</div>
                    </div>

                    <div style="text-align: right;">
                        <div style="font-weight: 700; font-size: 16px; color: ${t.safetyScore >= 90 ? '#16a34a' : '#d97706'};">
                            <i class="fa-solid fa-shield-halved"></i> ${t.safetyScore}%
                        </div>
                        <div style="font-size: 12px; color: #64748b;">${t.potholesAvoided} Potholes Avoided</div>
                    </div>

                    <div style="display: flex; gap: 8px;">
                        <button onclick="RouteHistoryManager.previewTripModal('${t.id}')" class="btn-secondary" style="padding: 8px 14px; font-size: 13px;">
                            <i class="fa-solid fa-eye"></i> Map Preview
                        </button>
                        <a href="route-planner3.html?from=${encodeURIComponent(t.from)}&to=${encodeURIComponent(t.to)}" class="btn-primary" style="padding: 8px 14px; font-size: 13px; text-decoration: none;">
                            <i class="fa-solid fa-rotate-right"></i> Re-Plan
                        </a>
                    </div>
                </div>
            </div>
        `).join('');
    },

    setupFilters() {
        const searchInput = document.getElementById("historySearchInput");
        if (searchInput) {
            searchInput.addEventListener("input", (e) => {
                this.renderTripCards(e.target.value);
            });
        }
    },

    previewTripModal(tripId) {
        const trip = this.trips.find(t => t.id === tripId);
        if (!trip) return;

        let modal = document.getElementById("tripPreviewModal");
        if (!modal) {
            modal = document.createElement("div");
            modal.id = "tripPreviewModal";
            modal.className = "modal-backdrop";
            document.body.appendChild(modal);
        }

        modal.innerHTML = `
            <div class="modal-content" style="max-width: 680px;">
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 16px;">
                    <div>
                        <span class="badge-pill badge-success">Safety Score ${trip.safetyScore}%</span>
                        <h3 style="font-size: 20px; font-weight: 700; margin-top: 6px;">Trip #${trip.id}</h3>
                        <p style="font-size: 13px; color: #64748b; margin: 0;">${trip.from} to ${trip.to}</p>
                    </div>
                    <button onclick="document.getElementById('tripPreviewModal').classList.remove('show')" style="background:none; border:none; font-size: 20px; cursor:pointer; color:#64748b;">
                        <i class="fa-solid fa-xmark"></i>
                    </button>
                </div>

                <div id="tripModalMap" style="width: 100%; height: 260px; border-radius: 14px; overflow: hidden; margin-bottom: 16px;"></div>

                <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 20px; font-size: 13px;">
                    <div style="background: #f8fafc; padding: 12px; border-radius: 10px; text-align: center;">
                        <span style="color: #64748b; display: block;">Total Distance</span>
                        <strong style="font-size: 16px;">${trip.distanceKm} km</strong>
                    </div>
                    <div style="background: #f8fafc; padding: 12px; border-radius: 10px; text-align: center;">
                        <span style="color: #64748b; display: block;">Duration</span>
                        <strong style="font-size: 16px;">${trip.durationMin} mins</strong>
                    </div>
                    <div style="background: #f8fafc; padding: 12px; border-radius: 10px; text-align: center;">
                        <span style="color: #64748b; display: block;">Potholes Avoided</span>
                        <strong style="font-size: 16px; color: #16a34a;">${trip.potholesAvoided} Bad Sections</strong>
                    </div>
                </div>

                <div style="display: flex; justify-content: flex-end; gap: 12px;">
                    <button onclick="document.getElementById('tripPreviewModal').classList.remove('show')" class="btn-secondary">Close</button>
                    <a href="route-planner3.html?from=${encodeURIComponent(trip.from)}&to=${encodeURIComponent(trip.to)}" class="btn-primary" style="text-decoration:none;">
                        Drive Again
                    </a>
                </div>
            </div>
        `;

        modal.classList.add("show");

        // Render preview map using Leaflet
        setTimeout(() => {
            if (typeof L !== 'undefined') {
                const map = L.map("tripModalMap", { attributionControl: false }).setView(trip.waypoints[0], 12);
                L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

                const poly = L.polyline(trip.waypoints, { color: '#2563eb', weight: 5 }).addTo(map);
                map.fitBounds(poly.getBounds(), { padding: [20, 20] });
            }
        }, 200);
    }
};

if (typeof module !== 'undefined') {
    module.exports = RouteHistoryManager;
}
