/**
 * RoadSafe AI — Central API Client
 * Connects Frontend views to the FastAPI Backend (http://localhost:8000/api)
 */

const API = (() => {
    // Configurable Backend API Base URL
    const BASE_URL = (window.ROADSAFE_API_URL || 'http://localhost:8000/api').replace(/\/$/, '');

    /**
     * Auth & LocalStorage Helpers
     */
    function getToken() {
        return localStorage.getItem('authToken') || localStorage.getItem('access_token') || '';
    }

    function setAuth(token, user) {
        if (token) {
            localStorage.setItem('authToken', token);
            localStorage.setItem('access_token', token);
            localStorage.setItem('isLoggedIn', 'true');
        }
        if (user) {
            localStorage.setItem('currentUser', JSON.stringify(user));
            if (user.role) {
                localStorage.setItem('userRole', user.role);
            }
        }
    }

    function clearAuth() {
        localStorage.removeItem('authToken');
        localStorage.removeItem('access_token');
        localStorage.removeItem('currentUser');
        localStorage.removeItem('userRole');
        localStorage.removeItem('isLoggedIn');
    }

    function getUser() {
        try {
            const raw = localStorage.getItem('currentUser');
            return raw ? JSON.parse(raw) : null;
        } catch {
            return null;
        }
    }

    function isLoggedIn() {
        return Boolean(getToken());
    }

    /**
     * Core Fetch Request Wrapper
     */
    async function request(endpoint, options = {}) {
        const url = endpoint.startsWith('http') ? endpoint : `${BASE_URL}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;
        
        const headers = { ...options.headers };

        // Attach Bearer token if available
        const token = getToken();
        if (token && !headers['Authorization']) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        // Default to JSON content type unless body is FormData
        if (!(options.body instanceof FormData) && !headers['Content-Type']) {
            headers['Content-Type'] = 'application/json';
        }

        const config = {
            ...options,
            headers
        };

        try {
            const response = await fetch(url, config);
            
            if (response.status === 401) {
                console.warn('[API] Token expired or unauthorized.');
                // Optionally clear auth if unauthorized
            }

            const contentType = response.headers.get('content-type');
            let data = {};
            if (contentType && contentType.includes('application/json')) {
                data = await response.json();
            } else {
                data = { success: response.ok, statusText: response.statusText };
            }

            if (!response.ok) {
                const errorMsg = data.detail || data.message || `HTTP ${response.status}: ${response.statusText}`;
                throw new Error(errorMsg);
            }

            return data;
        } catch (err) {
            console.error(`[API Error] ${options.method || 'GET'} ${url}:`, err.message);
            throw err;
        }
    }

    /**
     * HTTP Method Shortcuts
     */
    const get = (endpoint, params = {}) => {
        const queryString = new URLSearchParams(params).toString();
        const fullEndpoint = queryString ? `${endpoint}?${queryString}` : endpoint;
        return request(fullEndpoint, { method: 'GET' });
    };

    const post = (endpoint, body) => request(endpoint, {
        method: 'POST',
        body: body instanceof FormData ? body : JSON.stringify(body)
    });

    const put = (endpoint, body) => request(endpoint, {
        method: 'PUT',
        body: JSON.stringify(body)
    });

    const patch = (endpoint, body) => request(endpoint, {
        method: 'PATCH',
        body: JSON.stringify(body)
    });

    const del = (endpoint) => request(endpoint, { method: 'DELETE' });

    /**
     * Specific API Endpoint Methods
     */
    return {
        BASE_URL,
        getToken,
        setAuth,
        clearAuth,
        getUser,
        isLoggedIn,
        request,

        // Auth APIs
        login: async (email, password) => {
            const res = await post('/auth/login', { email, password });
            if (res.success && (res.token || res.access_token)) {
                setAuth(res.token || res.access_token, {
                    id: res._id || res.id,
                    name: res.name,
                    email: res.email,
                    role: res.role,
                    avatar: res.avatar
                });
            }
            return res;
        },

        register: async (name, email, password, role = 'driver') => {
            const res = await post('/auth/register', { name, email, password, role });
            if (res.success && (res.token || res.access_token)) {
                setAuth(res.token || res.access_token, res.user || { name, email, role });
            }
            return res;
        },

        getProfile: () => get('/auth/profile'),
        updateProfile: (data) => put('/auth/profile', data),

        // Map & Potholes APIs
        getPotholes: (filters = {}) => get('/map/potholes', filters),
        getNearbyPotholes: (lat, lng, radius = 5.0) => get('/map/nearby', { lat, lng, radius }),
        planRoute: (payload) => post('/map/plan-route', payload),

        // Reports APIs
        getReports: (filters = {}) => get('/reports', filters),
        getReportById: (id) => get(`/reports/${id}`),
        upvoteReport: (id) => post(`/reports/${id}/upvote`, {}),
        updateReportStatus: (id, status, notes = '') => patch(`/reports/${id}`, { status, notes }),

        // AI Scan & ML Upload API
        uploadScan: (fileOrFormData, lat = 26.4499, lng = 80.3319, locationName = 'Kanpur Road') => {
            let formData;
            if (fileOrFormData instanceof FormData) {
                formData = fileOrFormData;
            } else {
                formData = new FormData();
                formData.append('file', fileOrFormData);
                formData.append('latitude', lat);
                formData.append('longitude', lng);
                formData.append('location_name', locationName);
            }
            return post('/scan/upload', formData);
        },

        // Dashboard & Analytics APIs
        getDriverDashboard: () => get('/dashboard/driver'),
        getAdminDashboard: () => get('/dashboard/admin'),

        // History & Notifications APIs
        getRouteHistory: (params = {}) => get('/routes/history', params),
        createRouteHistory: (payload) => post('/routes/history', payload),
        getNotifications: () => get('/notifications'),
        markNotificationRead: (id) => patch(`/notifications/${id}/read`, {})
    };
})();

// Attach to window object for global availability in script tags
if (typeof window !== 'undefined') {
    window.API = API;
}
