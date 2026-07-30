// ==========================================================================
// RoadSafe AI - My Reports Controller
// ==========================================================================

document.addEventListener("DOMContentLoaded", () => {
  const searchInput = document.getElementById("searchInput") || document.getElementById("searchReport");
  const statusFilter = document.getElementById("statusFilter");
  const reportTable = document.getElementById("reportTable");
  const exportCsvBtn = document.getElementById("exportCsvBtn");

  // Search Filter
  if (searchInput && reportTable) {
    searchInput.addEventListener("keyup", () => {
      const query = searchInput.value.toLowerCase();
      const rows = reportTable.querySelectorAll("tbody tr");

      rows.forEach((row) => {
        const text = row.innerText.toLowerCase();
        row.style.display = text.includes(query) ? "" : "none";
      });
    });
  }

  // Status Dropdown Filter
  if (statusFilter && reportTable) {
    statusFilter.addEventListener("change", () => {
      const selected = statusFilter.value;
      const rows = reportTable.querySelectorAll("tbody tr");

      rows.forEach((row) => {
        if (selected === "All") {
          row.style.display = "";
          return;
        }
        const text = row.innerText;
        row.style.display = text.includes(selected) ? "" : "none";
      });
    });
  }

  // Bind View & Delete Actions
  bindTableActions();
  updateStats();

  // Export CSV
  if (exportCsvBtn) {
    exportCsvBtn.addEventListener("click", exportCSV);
  }
});

// Bind View and Delete Click Events
function bindTableActions() {
  const reportTable = document.getElementById("reportTable");
  if (!reportTable) return;

  // Delete Buttons
  reportTable.querySelectorAll(".deleteBtn").forEach((btn) => {
    btn.onclick = null; // Clear inline fallback
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      if (confirm("Are you sure you want to delete this pothole report?")) {
        btn.closest("tr").remove();
        updateStats();
      }
    });
  });

  // View Buttons
  reportTable.querySelectorAll(".viewBtn").forEach((btn) => {
    btn.onclick = null;
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const row = btn.closest("tr");
      const reportId = row.cells[0].innerText;
      const location = row.cells[1].innerText;
      const severity = row.cells[2].innerText;
      const status = row.cells[3].innerText;
      const date = row.cells[4].innerText;

      alert(
        `RoadSafe AI Pothole Report Details\n\nReport ID: ${reportId}\nLocation: ${location}\nSeverity: ${severity}\nStatus: ${status}\nDate Submitted: ${date}\n\nAI Vision Confidence: 96%`
      );
    });
  });
}

// Update Overview Stats Count
function updateStats() {
  const reportTable = document.getElementById("reportTable");
  if (!reportTable) return;

  const rows = [...reportTable.querySelectorAll("tbody tr")];
  const total = document.getElementById("totalReports");
  const pending = document.getElementById("pendingReports");
  const verified = document.getElementById("verifiedReports");
  const resolved = document.getElementById("resolvedReports");

  if (total) total.textContent = rows.length;
  if (pending) pending.textContent = rows.filter((r) => r.innerText.includes("Pending")).length;
  if (verified) verified.textContent = rows.filter((r) => r.innerText.includes("Verified")).length;
  if (resolved) resolved.textContent = rows.filter((r) => r.innerText.includes("Resolved")).length;
}

// Export CSV Feature
function exportCSV() {
  const table = document.getElementById("reportTable");
  if (!table) return;

  let csv = [];
  table.querySelectorAll("tr").forEach((row) => {
    let cols = row.querySelectorAll("th, td");
    let data = [];
    cols.forEach((col, index) => {
      // Exclude Actions column (index 5)
      if (index < 5) {
        data.push(`"${col.innerText.trim()}"`);
      }
    });
    csv.push(data.join(","));
  });

  const blob = new Blob([csv.join("\n")], { type: "text/csv" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "RoadSafeAI_Driver_Reports.csv";
  link.click();
}