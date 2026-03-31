// Authentication & registration logic using localStorage

// Ensure default non-patient users exist
function seedDefaultUsers() {
    const { STORAGE_KEYS, getFromStorage, setInStorage, generateId } = window.HMSUtils;
    let users = getFromStorage(STORAGE_KEYS.USERS, []);

    const defaults = [
        {
            name: "System Admin",
            email: "admin@hospital.com",
            password: "admin123",
            role: "admin"
        },
        {
            name: "Dr. John Carter",
            email: "doctor@hospital.com",
            password: "doctor123",
            role: "doctor"
        },
        {
            name: "Front Desk",
            email: "reception@hospital.com",
            password: "reception123",
            role: "receptionist"
        }
    ];

    let changed = false;
    defaults.forEach(def => {
        const exists = users.some(u => u.email === def.email);
        if (!exists) {
            users.push({
                id: generateId("user"),
                ...def
            });
            changed = true;
        }
    });

    if (changed) {
        setInStorage(STORAGE_KEYS.USERS, users);
    }
}

function handleRegisterSubmit(event) {
    event.preventDefault();
    const { STORAGE_KEYS, getFromStorage, setInStorage, generateId } = window.HMSUtils;

    const name = document.getElementById("fullName").value.trim();
    const email = document.getElementById("email").value.trim().toLowerCase();
    const password = document.getElementById("password").value;
    const phone = document.getElementById("phone").value.trim();
    const gender = document.getElementById("gender").value;
    const age = document.getElementById("age").value.trim();
    const errorEl = document.getElementById("registerError");
    const successEl = document.getElementById("registerSuccess");

    errorEl.textContent = "";
    successEl.textContent = "";

    if (!name || !email || !password || !phone || !gender || !age) {
        errorEl.textContent = "Please fill in all fields.";
        return;
    }

    let users = getFromStorage(STORAGE_KEYS.USERS, []);
    const exists = users.some(u => u.email === email);
    if (exists) {
        errorEl.textContent = "An account with this email already exists.";
        return;
    }

    const newUser = {
        id: window.HMSUtils.generateId("user"),
        name,
        email,
        password,
        phone,
        gender,
        age: Number(age),
        role: "patient"
    };

    users.push(newUser);
    setInStorage(STORAGE_KEYS.USERS, users);
    successEl.textContent = "Registration successful! You can now log in.";
    (event.target.reset && event.target.reset());
}

function redirectByRole(role) {
    switch (role) {
        case "admin":
            window.location.href = "dashboard/admin-dashboard.html";
            break;
        case "doctor":
            window.location.href = "dashboard/doctor-dashboard.html";
            break;
        case "receptionist":
            window.location.href = "dashboard/reception-dashboard.html";
            break;
        case "patient":
        default:
            window.location.href = "dashboard/patient-dashboard.html";
            break;
    }
}

function handleLoginSubmit(event) {
    event.preventDefault();
    const { STORAGE_KEYS, getFromStorage, setCurrentUser } = window.HMSUtils;

    const email = document.getElementById("loginEmail").value.trim().toLowerCase();
    const password = document.getElementById("loginPassword").value;
    const errorEl = document.getElementById("loginError");

    errorEl.textContent = "";

    let users = getFromStorage(STORAGE_KEYS.USERS, []);
    if (!users || !users.length) {
        seedDefaultUsers();
        users = getFromStorage(STORAGE_KEYS.USERS, []);
    }

    const user = users.find(u => u.email === email && u.password === password);
    if (!user) {
        errorEl.textContent = "Invalid email or password.";
        return;
    }

    setCurrentUser({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
    });

    redirectByRole(user.role);
}

function handleForgotPasswordSubmit(event) {
    event.preventDefault();
    const email = document.getElementById("forgotEmail").value.trim().toLowerCase();
    const messageEl = document.getElementById("forgotMessage");
    messageEl.textContent = "";

    if (!email) {
        messageEl.textContent = "Please enter your registered email.";
        return;
    }

    messageEl.textContent = "If an account exists for this email, a reset link would be sent (demo only).";
}

// Global logout helper usable from any page
function logout() {
    // Clear both the project key and a generic key for safety
    try {
        localStorage.removeItem(window.HMSUtils?.STORAGE_KEYS?.CURRENT_USER || "hms_current_user");
        localStorage.removeItem("currentUser");
    } catch (e) {
        console.error("Failed to clear current user", e);
    }

    const path = window.location.pathname || "";
    if (path.includes("/dashboard/") || path.includes("/modules/")) {
        window.location.href = "../login.html";
    } else {
        window.location.href = "login.html";
    }
}

document.addEventListener("DOMContentLoaded", () => {
    // Seed defaults on any auth page load
    seedDefaultUsers();

    const registerForm = document.getElementById("registerForm");
    if (registerForm) {
        registerForm.addEventListener("submit", handleRegisterSubmit);
    }

    const loginForm = document.getElementById("loginForm");
    if (loginForm) {
        loginForm.addEventListener("submit", handleLoginSubmit);
    }

    const forgotForm = document.getElementById("forgotForm");
    if (forgotForm) {
        forgotForm.addEventListener("submit", handleForgotPasswordSubmit);
    }

    const logoutBtn = document.getElementById("logoutBtn");
    if (logoutBtn) {
        logoutBtn.addEventListener("click", logout);
    }
});

