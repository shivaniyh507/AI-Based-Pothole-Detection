/**
 * utils.js — Shared Utilities for RoadSafe AI Admin Panel
 * 
 * API Endpoints Expected:
 *   GET  /api/potholes      — list all potholes
 *   GET  /api/users         — list all users
 *   GET  /api/repairs       — list all repairs
 *   PATCH /api/users/:id    — update user status
 *   POST  /api/users        — create new user
 *   PATCH /api/repairs/:id  — update repair status
 */

// ─── Debounce ────────────────────────────────────────────────
// Delays execution of fn until after `delay` ms of inactivity
function debounce(fn, delay = 300) {
    let timer;
    return function (...args) {
        clearTimeout(timer);
        timer = setTimeout(() => fn.apply(this, args), delay);
    };
}

// ─── API Fetch Wrapper ──────────────────────────────────────
// Wraps fetch() with JSON parsing, error handling, and
// falls back to local mock data when no backend is available
async function apiFetch(url, options = {}) {
    // Map API endpoints to local mock JSON files
    const mockMap = {
        '/api/potholes': '../../driver/data/mock-potholes.json',
        '/api/users': '../../driver/data/mock-users.json',
        '/api/repairs': '../../driver/data/mock-repairs.json'
    };

    try {
        const response = await fetch(url, {
            headers: { 'Content-Type': 'application/json' },
            ...options
        });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return await response.json();
    } catch (err) {
        // Fallback: try loading mock data for GET requests
        const mockUrl = mockMap[url];
        if (mockUrl && (!options.method || options.method === 'GET')) {
            console.warn(`[API] Backend unavailable for ${url}, loading mock data`);
            try {
                const mockResp = await fetch(mockUrl);
                return await mockResp.json();
            } catch (mockErr) {
                console.error(`[API] Mock data also failed:`, mockErr);
                return [];
            }
        }
        // For non-GET requests, just log and return success (optimistic)
        console.warn(`[API] ${options.method || 'GET'} ${url} failed, using optimistic response`);
        return { success: true, mock: true };
    }
}

// ─── Toast Notifications ────────────────────────────────────
// Shows a brief notification at the top-right of the screen
function showToast(message, type = 'success') {
    // Remove existing toasts
    const existing = document.querySelectorAll('.rs-toast');
    existing.forEach(t => t.remove());

    const toast = document.createElement('div');
    toast.className = 'rs-toast';

    // Color based on type
    const colors = {
        success: { bg: '#4caf50', icon: '✓' },
        error: { bg: '#ff4d4d', icon: '✕' },
        warning: { bg: '#ff9800', icon: '⚠' },
        info: { bg: '#a855f7', icon: 'ℹ' }
    };
    const config = colors[type] || colors.info;

    toast.innerHTML = `
        <span style="
            display:inline-flex; align-items:center; justify-content:center;
            width:22px; height:22px; border-radius:50%;
            background:${config.bg}; color:#fff; font-size:12px; margin-right:10px;
            flex-shrink:0;
        ">${config.icon}</span>
        <span>${message}</span>
    `;

    Object.assign(toast.style, {
        position: 'fixed',
        top: '24px',
        right: '24px',
        zIndex: '10000',
        background: '#1a1a2e',
        color: '#f1f5f9',
        padding: '14px 22px',
        borderRadius: '12px',
        boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
        display: 'flex',
        alignItems: 'center',
        fontSize: '14px',
        fontFamily: "'Inter', sans-serif",
        fontWeight: '500',
        maxWidth: '400px',
        transform: 'translateX(120%)',
        transition: 'transform 0.4s cubic-bezier(0.16,1,0.3,1)',
        border: `1px solid rgba(255, 255, 255, 0.1)`
    });

    document.body.appendChild(toast);

    // Slide in
    requestAnimationFrame(() => {
        toast.style.transform = 'translateX(0)';
    });

    // Auto-dismiss after 3 seconds
    setTimeout(() => {
        toast.style.transform = 'translateX(120%)';
        setTimeout(() => toast.remove(), 400);
    }, 3000);
}

// ─── Date Formatting ────────────────────────────────────────
function formatDate(dateStr) {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', {
        month: 'short', day: 'numeric', year: 'numeric'
    });
}

function formatDateForCSV() {
    const d = new Date();
    return d.toISOString().split('T')[0]; // YYYY-MM-DD
}

// ─── Time Ago ───────────────────────────────────────────────
function timeAgo(dateStr) {
    const now = new Date();
    const d = new Date(dateStr);
    const diffMs = now - d;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHrs = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHrs / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
    if (diffHrs < 24) return `${diffHrs} hr${diffHrs > 1 ? 's' : ''} ago`;
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
}
