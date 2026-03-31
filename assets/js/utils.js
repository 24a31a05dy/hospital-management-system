// Utility helpers for HMS

const STORAGE_KEYS = {
    USERS: "hms_users",
    APPOINTMENTS: "hms_appointments",
    BILLING: "hms_billing",
    CURRENT_USER: "hms_current_user"
};

function generateId(prefix = "id") {
    const random = Math.random().toString(36).substring(2, 8);
    const timestamp = Date.now().toString(36);
    return `${prefix}_${timestamp}_${random}`;
}

function getFromStorage(key, defaultValue) {
    try {
        const raw = localStorage.getItem(key);
        if (!raw) return defaultValue;
        return JSON.parse(raw);
    } catch (e) {
        console.error("Failed to parse storage key", key, e);
        return defaultValue;
    }
}

function setInStorage(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
        console.error("Failed to set storage key", key, e);
    }
}

function getCurrentUser() {
    return getFromStorage(STORAGE_KEYS.CURRENT_USER, null);
}

function setCurrentUser(user) {
    if (user) {
        setInStorage(STORAGE_KEYS.CURRENT_USER, user);
    } else {
        localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    }
}

function formatDate(dateStr) {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    if (Number.isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric"
    });
}

function formatDateTime(dateStr, timeStr) {
    if (!dateStr) return "";
    const iso = timeStr ? `${dateStr}T${timeStr}` : dateStr;
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    return d.toLocaleString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit"
    });
}

function ensureArray(value) {
    if (!value) return [];
    if (Array.isArray(value)) return value;
    return [value];
}

// Basic HTML escaping to prevent XSS when injecting into innerHTML
function escapeHtml(str) {
    if (str === null || str === undefined) return "";
    return String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}

// Expose helpers to global scope for inline scripts
window.HMSUtils = {
    STORAGE_KEYS,
    generateId,
    getFromStorage,
    setInStorage,
    getCurrentUser,
    setCurrentUser,
    formatDate,
    formatDateTime,
    ensureArray,
    escapeHtml
};

