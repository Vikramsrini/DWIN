/**
 * API Client — Fetch wrapper for all backend endpoints
 */
const API = {
    BASE: '/api',

    async request(path, options = {}) {
        const url = `${this.BASE}${path}`;
        const config = {
            headers: { 'Content-Type': 'application/json' },
            ...options
        };

        if (config.body && typeof config.body === 'object') {
            config.body = JSON.stringify(config.body);
        }

        const res = await fetch(url, config);

        if (res.status === 204) return null;

        const data = await res.json();

        if (!res.ok) {
            const error = new Error(data.message || data.error || 'Request failed');
            error.status = res.status;
            error.details = data.details;
            throw error;
        }

        return data;
    },

    // Users
    login(email, password) {
        return this.request('/users/login', { method: 'POST', body: { email, password } });
    },

    getUsers() {
        return this.request('/users');
    },

    getUser(id) {
        return this.request(`/users/${id}`);
    },

    createUser(data) {
        return this.request('/users', { method: 'POST', body: data });
    },

    // Activities
    getActivities(userId, params = {}) {
        const query = new URLSearchParams(params).toString();
        const qs = query ? `?${query}` : '';
        return this.request(`/users/${userId}/activities${qs}`);
    },

    createActivity(userId, data) {
        return this.request(`/users/${userId}/activities`, { method: 'POST', body: data });
    },

    updateActivity(userId, activityId, data) {
        return this.request(`/users/${userId}/activities/${activityId}`, { method: 'PUT', body: data });
    },

    deleteActivity(userId, activityId) {
        return this.request(`/users/${userId}/activities/${activityId}`, { method: 'DELETE' });
    },

    // Twin Status
    getTwinStatus(userId, date) {
        const qs = date ? `?date=${date}` : '';
        return this.request(`/users/${userId}/twin-status${qs}`);
    }
};
