/**
 * detection-log.js — Detection Log Page Interactivity
 * 
 * API Endpoints Expected:
 *   GET  /api/potholes          — list all potholes (with query params for filtering)
 *   GET  /api/potholes/:id      — single pothole detail
 * 
 * Features:
 *   - Live search with 300ms debounce
 *   - Severity & Status dropdown filtering
 *   - CSV export of filtered rows
 *   - Pagination info updates
 */

document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('searchInput');
    const severitySelect = document.getElementById('severityFilter');
    const statusSelect = document.getElementById('statusFilter');
    const filterBtn = document.getElementById('filterBtn');
    const tableBody = document.querySelector('#potholeTable tbody');
    const paginationInfo = document.getElementById('paginationInfo');

    if (!tableBody) return;

    // Store all rows for filtering
    const allRows = Array.from(tableBody.querySelectorAll('tr'));

    // ─── Filter Logic ────────────────────────────────────────
    function applyFilters() {
        const searchTerm = (searchInput?.value || '').toLowerCase().trim();
        const severity = severitySelect?.value || 'All Severities';
        const status = statusSelect?.value || 'All Statuses';

        let visibleCount = 0;

        allRows.forEach(row => {
            const cells = row.querySelectorAll('td');
            if (cells.length === 0) return; // skip header rows if any

            // Extract text from each cell
            const rowText = row.textContent.toLowerCase();
            const rowSeverity = cells[2]?.textContent.trim() || '';
            const rowStatus = cells[4]?.textContent.trim() || '';

            // Check all filter conditions
            let matchSearch = !searchTerm || rowText.includes(searchTerm);
            let matchSeverity = severity === 'All Severities' || rowSeverity === severity;
            let matchStatus = status === 'All Statuses' || rowStatus === status;

            if (matchSearch && matchSeverity && matchStatus) {
                row.style.display = '';
                visibleCount++;
            } else {
                row.style.display = 'none';
            }
        });

        // Update pagination info
        if (paginationInfo) {
            paginationInfo.textContent = `Showing ${visibleCount} of ${allRows.length} entries`;
        }

        // Also filter mobile cards if they exist
        filterMobileCards(searchTerm, severity, status);
    }

    // ─── Mobile Card Filtering ───────────────────────────────
    function filterMobileCards(searchTerm, severity, status) {
        const cards = document.querySelectorAll('.mobile-pothole-card');
        cards.forEach(card => {
            const cardText = card.textContent.toLowerCase();
            const cardSeverity = card.dataset.severity || '';
            const cardStatus = card.dataset.status || '';

            let match = true;
            if (searchTerm && !cardText.includes(searchTerm)) match = false;
            if (severity !== 'All Severities' && cardSeverity !== severity) match = false;
            if (status !== 'All Statuses' && cardStatus !== status) match = false;

            card.style.display = match ? '' : 'none';
        });
    }

    // ─── Event Listeners ─────────────────────────────────────
    // Live search with debounce
    if (searchInput) {
        searchInput.addEventListener('input', debounce(applyFilters, 300));
    }

    // Dropdown changes trigger filter
    if (severitySelect) {
        severitySelect.addEventListener('change', applyFilters);
    }
    if (statusSelect) {
        statusSelect.addEventListener('change', applyFilters);
    }

    // Filter button
    if (filterBtn) {
        filterBtn.addEventListener('click', applyFilters);
    }

    // ─── Enhanced CSV Export ─────────────────────────────────
    const exportBtn = document.getElementById('exportCsvBtn');
    if (exportBtn) {
        exportBtn.addEventListener('click', () => {
            const table = document.getElementById('potholeTable');
            if (!table) return;

            let csv = [];

            // Header row
            const headers = table.querySelectorAll('thead th');
            let headerRow = [];
            headers.forEach(th => {
                let text = th.textContent.replace(/(\r\n|\n|\r)/gm, ' ').trim();
                text = text.replace(/"/g, '""');
                headerRow.push('"' + text + '"');
            });
            csv.push(headerRow.join(','));

            // Only export visible (filtered) rows
            const rows = table.querySelectorAll('tbody tr');
            rows.forEach(tr => {
                if (tr.style.display === 'none') return; // skip filtered-out rows

                let row = [];
                const cols = tr.querySelectorAll('td');
                cols.forEach(td => {
                    let data = td.innerText.replace(/(\r\n|\n|\r)/gm, ' ').trim();
                    data = data.replace(/"/g, '""');
                    row.push('"' + data + '"');
                });
                csv.push(row.join(','));
            });

            // Generate file with date-stamped name
            const d = new Date();
            const dateStr = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
            const csvFile = new Blob([csv.join('\n')], { type: 'text/csv' });
            const downloadLink = document.createElement('a');
            downloadLink.download = `potholes-export-${dateStr}.csv`;
            downloadLink.href = window.URL.createObjectURL(csvFile);
            downloadLink.style.display = 'none';
            document.body.appendChild(downloadLink);
            downloadLink.click();
            document.body.removeChild(downloadLink);

            showToast('CSV exported successfully!', 'success');
        });
    }

    // ─── Build Mobile Card View ──────────────────────────────
    buildMobileCards();
});

function buildMobileCards() {
    const tableBody = document.querySelector('#potholeTable tbody');
    const tableContainer = document.querySelector('#potholeTable')?.closest('.overflow-x-auto');
    if (!tableBody || !tableContainer) return;

    // Create mobile card container
    const mobileContainer = document.createElement('div');
    mobileContainer.className = 'mobile-card';
    mobileContainer.id = 'mobileCardView';

    const rows = tableBody.querySelectorAll('tr');
    rows.forEach(row => {
        const cells = row.querySelectorAll('td');
        if (cells.length < 6) return;

        const id = cells[0]?.textContent.trim() || '';
        const location = cells[1]?.querySelector('.text-gray-800')?.textContent.trim() || '';
        const coords = cells[1]?.querySelector('.text-primary')?.textContent.trim() || '';
        const severity = cells[2]?.textContent.trim() || '';
        const confidence = cells[3]?.querySelector('.text-xs')?.textContent.trim() || '';
        const status = cells[4]?.textContent.trim() || '';

        // Severity badge colors
        const sevColors = {
            'Critical': 'bg-red-50 text-red-600 border-red-200',
            'Major': 'bg-orange-50 text-orange-600 border-orange-200',
            'Minor': 'bg-gray-50 text-gray-600 border-gray-200'
        };
        const sevClass = sevColors[severity] || sevColors['Minor'];

        const card = document.createElement('div');
        card.className = 'mobile-card-item mobile-pothole-card';
        card.dataset.severity = severity;
        card.dataset.status = status;

        card.innerHTML = `
            <div class="flex justify-between items-start mb-3">
                <div>
                    <span class="text-xs font-bold text-gray-500">${id}</span>
                    <h4 class="font-semibold text-gray-800 text-sm mt-0.5">${location}</h4>
                    <p class="text-xs text-primary mt-0.5">${coords}</p>
                </div>
                <span class="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold border ${sevClass}">${severity}</span>
            </div>
            <div class="flex justify-between items-center pt-3 border-t border-gray-100">
                <div class="flex items-center text-xs text-gray-500">
                    <span class="font-medium mr-2">Confidence:</span> ${confidence}
                </div>
                <span class="text-xs font-medium px-2 py-1 rounded-md bg-gray-100 text-gray-600">${status}</span>
            </div>
        `;

        mobileContainer.appendChild(card);
    });

    // Insert after the table wrapper
    tableContainer.parentNode.insertBefore(mobileContainer, tableContainer.nextSibling);

    // Add class for desktop-only visibility
    tableContainer.classList.add('desktop-table');
}
