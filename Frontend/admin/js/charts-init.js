document.addEventListener("DOMContentLoaded", () => {
    initCharts();
});

function initCharts() {
    // Colors from Tailwind config
    const primary = '#a855f7';
    const critical = '#ff4d4d';
    const warning = '#ff9800';
    const minor = '#475569'; // slate-600

    // 1. Trend Chart (Area Line Chart)
    const trendCtx = document.getElementById('trendChart');
    let trendChartInstance = null;
    if (trendCtx) {
        trendChartInstance = new Chart(trendCtx, {
            type: 'line',
            data: {
                labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6', 'Week 7', 'Week 8'],
                datasets: [
                    {
                        label: 'New Detections',
                        data: [150, 230, 224, 218, 305, 310, 280, 420],
                        borderColor: primary,
                        backgroundColor: 'rgba(168, 85, 247, 0.15)',
                        borderWidth: 2,
                        tension: 0.4,
                        fill: true,
                        pointBackgroundColor: primary,
                        pointBorderColor: '#fff',
                        pointBorderWidth: 2,
                        pointRadius: 4,
                        pointHoverRadius: 6
                    },
                    {
                        label: 'Repaired',
                        data: [120, 150, 180, 190, 220, 260, 290, 310],
                        borderColor: '#4caf50',
                        backgroundColor: 'transparent',
                        borderWidth: 2,
                        borderDash: [5, 5],
                        tension: 0.4,
                        pointRadius: 0,
                        pointHoverRadius: 4
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false,
                        backgroundColor: 'rgba(26, 26, 46, 0.95)',
                        titleColor: '#f1f5f9',
                        bodyColor: '#94a3b8',
                        borderColor: 'rgba(255,255,255,0.1)',
                        borderWidth: 1,
                        padding: 10,
                        boxPadding: 4,
                        usePointStyle: true,
                    }
                },
                scales: {
                    x: {
                        grid: {
                            display: false,
                            drawBorder: false
                        },
                        ticks: {
                            color: '#9ca3af',
                            font: { size: 11 }
                        }
                    },
                    y: {
                        grid: {
                            color: 'rgba(255,255,255,0.05)',
                            drawBorder: false
                        },
                        ticks: {
                            color: '#9ca3af',
                            font: { size: 11 },
                            stepSize: 100
                        }
                    }
                },
                interaction: {
                    mode: 'nearest',
                    axis: 'x',
                    intersect: false
                }
            }
        });
    }

    // 2. Severity Distribution Chart (Donut)
    const severityCtx = document.getElementById('severityChart');
    let severityChartInstance = null;
    if (severityCtx) {
        severityChartInstance = new Chart(severityCtx, {
            type: 'doughnut',
            data: {
                labels: ['Critical', 'Major', 'Minor'],
                datasets: [{
                    data: [15, 35, 50],
                    backgroundColor: [critical, warning, minor],
                    borderWidth: 0,
                    hoverOffset: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '75%',
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return ` ${context.label}: ${context.raw}%`;
                            }
                        },
                        backgroundColor: 'rgba(26, 26, 46, 0.95)',
                        titleColor: '#f1f5f9',
                        bodyColor: '#94a3b8',
                        borderColor: 'rgba(255,255,255,0.1)',
                        borderWidth: 1,
                        padding: 10,
                        displayColors: true,
                        usePointStyle: true,
                    }
                }
            }
        });
    }

    // ─── Time Filter Logic ────────────────────────────────────
    const timeFilter = document.getElementById('timeRangeFilter');
    if (timeFilter && trendChartInstance) {
        timeFilter.addEventListener('change', (e) => {
            const val = e.target.value;
            let newLabels = [];
            let newData = [];
            
            if (val === 'today') {
                newLabels = ['9 AM', '12 PM', '3 PM', '6 PM', '9 PM'];
                newData = [12, 19, 15, 25, 22];
            } else if (val === '7days') {
                newLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
                newData = [45, 60, 55, 80, 70, 95, 85];
            } else if (val === '90days') {
                newLabels = ['Month 1', 'Month 2', 'Month 3'];
                newData = [500, 750, 620];
            } else if (val === 'this_year') {
                newLabels = ['Q1', 'Q2', 'Q3', 'Q4'];
                newData = [1200, 1500, 2100, 1800];
            } else if (val === 'all_time') {
                newLabels = ['2023', '2024', '2025', '2026'];
                newData = [2500, 3100, 4200, 4800];
            } else {
                // 30 days default
                newLabels = ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6', 'Week 7', 'Week 8'];
                newData = [150, 230, 224, 218, 305, 310, 280, 420];
            }
            
            // Update Trend Chart
            trendChartInstance.data.labels = newLabels;
            trendChartInstance.data.datasets[0].data = newData;
            
            // Generate some random repaired data that follows the trend loosely
            const repairedData = newData.map(v => Math.floor(v * (0.6 + Math.random() * 0.3)));
            trendChartInstance.data.datasets[1].data = repairedData;
            
            trendChartInstance.update();

            // Update Severity Chart to simulate change
            if (severityChartInstance) {
                const total = 100;
                const critical = Math.floor(Math.random() * 20) + 10;
                const major = Math.floor(Math.random() * 30) + 20;
                const minor = total - critical - major;
                severityChartInstance.data.datasets[0].data = [critical, major, minor];
                severityChartInstance.update();
            }

            if (typeof showToast === 'function') {
                showToast(`Data refreshed for ${e.target.options[e.target.selectedIndex].text}`, 'success');
            }
        });
    }
}

