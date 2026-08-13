/**
 * RoadSafe AI — My Reports Module Controller (reports2.js)
 */

document.addEventListener("DOMContentLoaded", () => {
  renderReportsTable();
  setupReportsEventListeners();
});

const sampleReports = [
  { id: "REP-104", location: "Mall Road near Phool Bagh, Kanpur", severity: "High", status: "Unrepaired", date: "2026-07-20" },
  { id: "REP-103", location: "GT Road Junction, Civil Lines, Kanpur", severity: "Medium", status: "Scheduled for Repair", date: "2026-07-21" },
  { id: "REP-102", location: "Birhana Road Canal Crossing, Kanpur", severity: "Low", status: "Under Inspection", date: "2026-07-22" },
  { id: "REP-101", location: "VIP Road, Swaroop Nagar, Kanpur", severity: "High", status: "Unrepaired", date: "2026-07-22" }
];

function renderReportsTable(filterStatus = "all") {
  const tbody = document.getElementById("reportsTableBody");
  if (!tbody) return;

  const localSaved = JSON.parse(localStorage.getItem("roadsafe_reports") || "[]");
  const combined = [...localSaved, ...sampleReports];

  const filtered = combined.filter((r) => {
    if (filterStatus === "all") return true;
    return r.status.toLowerCase().includes(filterStatus.toLowerCase());
  });

  if (filtered.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="5" style="text-align:center; padding:30px; color:#6B7280;">
          No pothole reports found.
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = filtered.map((r) => {
    let sevBadge = "badge-danger-soft";
    if (r.severity === "Medium") sevBadge = "badge-warning-soft";
    if (r.severity === "Low") sevBadge = "badge-success-soft";

    let statBadge = "badge-purple-soft";
    if (r.status === "Unrepaired") statBadge = "badge-danger-soft";
    if (r.status === "Scheduled for Repair") statBadge = "badge-warning-soft";

    return `
      <tr>
        <td class="report-id-cell">#${r.id}</td>
        <td>${r.location}</td>
        <td><span class="badge-tag ${sevBadge}">${r.severity}</span></td>
        <td><span class="badge-tag ${statBadge}">${r.status}</span></td>
        <td>${r.date}</td>
      </tr>
    `;
  }).join("");
}

function setupReportsEventListeners() {
  const tabs = document.querySelectorAll(".report-tab");
  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      tabs.forEach((t) => t.classList.remove("active"));
      tab.classList.add("active");
      const status = tab.getAttribute("data-status");
      renderReportsTable(status);
    });
  });

  const exportBtn = document.getElementById("exportCsvBtn");
  if (exportBtn) {
    exportBtn.addEventListener("click", () => {
      if (window.showToast) window.showToast("Exporting Pothole Reports CSV...", "purple");
    });
  }
}
