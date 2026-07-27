/**
 * dashboard.js — Dashboard Page Interactivity
 * 
 * API Endpoints Expected:
 *   GET /api/potholes/stats   — dashboard KPI data
 *   GET /api/potholes/recent  — recent detections
 * 
 * Features:
 *   - Mini sparkline charts in KPI cards
 *   - Trend sparkline for Total Scanned
 *   - Bar sparkline for Repaired this Month
 */

document.addEventListener('DOMContentLoaded', () => {
    initDashboardCharts();
});

function initDashboardCharts() {
    // Chart.js defaults for sparklines
    const sparkDefaults = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            tooltip: {
                enabled: true,
                mode: 'index',
                intersect: false,
                backgroundColor: 'rgba(26,26,46,0.95)',
                titleColor: '#f1f5f9',
                bodyColor: '#94a3b8',
                borderColor: 'rgba(255,255,255,0.1)',
                borderWidth: 1,
                padding: 8,
                displayColors: false,
                callbacks: {
                    title: () => ''
                }
            }
        },
        scales: {
            x: { display: false },
            y: { display: false }
        },
        elements: {
            point: { radius: 0, hoverRadius: 4 }
        }
    };

    // ─── Sparkline 1: Total Scanned trend ────────────────────
    const scannedCtx = document.getElementById('scannedSparkline');
    if (scannedCtx) {
        new Chart(scannedCtx, {
            type: 'line',
            data: {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
                datasets: [{
                    data: [8200, 9100, 9800, 10200, 11100, 11800, 12450],
                    borderColor: '#a855f7',
                    backgroundColor: 'rgba(168, 85, 247, 0.15)',
                    borderWidth: 2,
                    tension: 0.4,
                    fill: true
                }]
            },
            options: { ...sparkDefaults }
        });
    }

    // ─── Sparkline 2: Critical Risk trend ────────────────────
    const criticalCtx = document.getElementById('criticalSparkline');
    if (criticalCtx) {
        new Chart(criticalCtx, {
            type: 'line',
            data: {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
                datasets: [{
                    data: [95, 110, 105, 120, 125, 135, 142],
                    borderColor: '#ff4d4d',
                    backgroundColor: 'rgba(255, 77, 77, 0.08)',
                    borderWidth: 2,
                    tension: 0.4,
                    fill: true
                }]
            },
            options: { ...sparkDefaults }
        });
    }

    // ─── Sparkline 3: Repaired bar chart ─────────────────────
    const repairedCtx = document.getElementById('repairedSparkline');
    if (repairedCtx) {
        new Chart(repairedCtx, {
            type: 'bar',
            data: {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
                datasets: [{
                    data: [450, 520, 610, 680, 720, 790, 856],
                    backgroundColor: [
                        'rgba(76, 175, 80, 0.2)',
                        'rgba(76, 175, 80, 0.25)',
                        'rgba(76, 175, 80, 0.3)',
                        'rgba(76, 175, 80, 0.35)',
                        'rgba(76, 175, 80, 0.4)',
                        'rgba(76, 175, 80, 0.5)',
                        'rgba(76, 175, 80, 0.7)'
                    ],
                    borderRadius: 4,
                    borderSkipped: false
                }]
            },
            options: {
                ...sparkDefaults,
                scales: {
                    x: { display: false },
                    y: { display: false, beginAtZero: true }
                }
            }
        });
    }
}
