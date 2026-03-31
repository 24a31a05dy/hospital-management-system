// Simple role-based access control for dashboards

function requireRole(allowedRoles) {
    const { getCurrentUser } = window.HMSUtils;
    const user = getCurrentUser();
    const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

    if (!user || !roles.includes(user.role)) {
        // Not logged in or wrong role
        window.location.href = "../login.html";
        // Return a sentinel object to avoid null dereferences in caller code
        return { id: null, name: "", email: "", role: "unauthorized" };
    }

    // Fill basic profile UI if present
    const nameEl = document.getElementById("profileName");
    const roleEl = document.getElementById("profileRole");
    if (nameEl) nameEl.textContent = user.name;
    if (roleEl) roleEl.textContent = user.role.charAt(0).toUpperCase() + user.role.slice(1);

    return user;
}

window.HMSRole = {
    requireRole
};

