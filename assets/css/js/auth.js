// ===============================
// Hospital Management Auth System
// ===============================

// Get users from localStorage
function getUsers() {
    return JSON.parse(localStorage.getItem("users")) || [];
}

// Save users to localStorage
function saveUsers(users) {
    localStorage.setItem("users", JSON.stringify(users));
}

// ===============================
// REGISTER LOGIC
// ===============================

const registerForm = document.getElementById("registerForm");

if (registerForm) {
    registerForm.addEventListener("submit", function (e) {
        e.preventDefault();

        // Get values
        const name = document.getElementById("name").value.trim();
        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value;
        const confirmPassword = document.getElementById("confirmPassword").value;
        const role = document.getElementById("role").value;

        // Error elements
        const nameError = document.getElementById("nameError");
        const emailError = document.getElementById("emailError");
        const passwordError = document.getElementById("passwordError");
        const confirmPasswordError = document.getElementById("confirmPasswordError");
        const roleError = document.getElementById("roleError");
        const successMessage = document.getElementById("successMessage");

        // Clear previous errors
        nameError.textContent = "";
        emailError.textContent = "";
        passwordError.textContent = "";
        confirmPasswordError.textContent = "";
        roleError.textContent = "";
        successMessage.textContent = "";

        let isValid = true;

        // Validation
        if (name === "") {
            nameError.textContent = "Name is required";
            isValid = false;
        }

        if (email === "") {
            emailError.textContent = "Email is required";
            isValid = false;
        }

        if (password.length < 8) {
            passwordError.textContent = "Password must be at least 8 characters";
            isValid = false;
        }

        if (password !== confirmPassword) {
            confirmPasswordError.textContent = "Passwords do not match";
            isValid = false;
        }

        if (role === "") {
            roleError.textContent = "Please select a role";
            isValid = false;
        }

        if (!isValid) return;

        // Check duplicate email
        let users = getUsers();
        const userExists = users.find(user => user.email === email);

        if (userExists) {
            emailError.textContent = "Email already registered";
            return;
        }

        // Create new user object
        const newUser = {
            name,
            email,
            password,
            role
        };

        users.push(newUser);
        saveUsers(users);

        successMessage.textContent = "Registration successful! You can now login.";

        registerForm.reset();
    });
}

// ===============================
// LOGIN LOGIC
// ===============================

const loginForm = document.getElementById("loginForm");

if (loginForm) {
    loginForm.addEventListener("submit", function (e) {
        e.preventDefault();

        const email = document.getElementById("loginEmail").value.trim();
        const password = document.getElementById("loginPassword").value;

        const emailError = document.getElementById("loginEmailError");
        const passwordError = document.getElementById("loginPasswordError");

        emailError.textContent = "";
        passwordError.textContent = "";

        let users = getUsers();

        const user = users.find(user => user.email === email);

        if (!user) {
            emailError.textContent = "Email not found";
            return;
        }

        if (user.password !== password) {
            passwordError.textContent = "Incorrect password";
            return;
        }

        // Save current user session
        localStorage.setItem("currentUser", JSON.stringify(user));

        // Role-based redirect
        switch (user.role) {
            case "admin":
                window.location.href = "admin-dashboard.html";
                break;
            case "doctor":
                window.location.href = "doctor-dashboard.html";
                break;
            case "patient":
                window.location.href = "patient-dashboard.html";
                break;
            case "receptionist":
                window.location.href = "receptionist-dashboard.html";
                break;
            default:
                window.location.href = "login.html";
        }
    });
}

// ===============================
// FORGOT PASSWORD LOGIC
// ===============================

const forgotForm = document.getElementById("forgotForm");

if (forgotForm) {
    forgotForm.addEventListener("submit", function (e) {
        e.preventDefault();

        const email = document.getElementById("forgotEmail").value.trim();
        const forgotMessage = document.getElementById("forgotMessage");

        forgotMessage.textContent = "";

        let users = getUsers();
        const user = users.find(user => user.email === email);

        if (!user) {
            forgotMessage.textContent = "Email not found";
            forgotMessage.style.color = "red";
            return;
        }

        forgotMessage.textContent = "Password reset link sent (simulation)";
        forgotMessage.style.color = "green";
    });
}