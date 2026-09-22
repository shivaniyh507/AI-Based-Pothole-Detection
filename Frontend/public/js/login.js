// ===============================
// RoadSafe AI - login.js
// JSON + localStorage Architecture
// ===============================

document.addEventListener("DOMContentLoaded", () => {

    // -------------------------------
    // Elements
    // -------------------------------

    const loginForm = document.getElementById("loginForm");

    const emailInput =
        document.getElementById("email") ||
        document.getElementById("emailId");

    const passwordInput =
        document.getElementById("password");

    const togglePassword =
        document.getElementById("togglePassword");

    const loginBtn =
        document.getElementById("loginBtn");

    const loginText =
        document.getElementById("loginText");

    const errorBox =
        document.getElementById("errorBox");

    const errorMessage =
        document.getElementById("errorMessage");

    if (!loginForm) return;

    // -------------------------------
    // Password Toggle
    // -------------------------------

    if (togglePassword && passwordInput) {

        togglePassword.addEventListener("click", () => {

            const isHidden = passwordInput.type === "password";

            passwordInput.type = isHidden ? "text" : "password";

            togglePassword.innerHTML = isHidden
                ? '<i class="fa-solid fa-eye-slash"></i>'
                : '<i class="fa-solid fa-eye"></i>';
        });

    }

    // -------------------------------
    // Error Functions
    // -------------------------------

    function showError(message) {

        if (errorBox && errorMessage) {

            errorMessage.textContent = message;
            errorBox.classList.add("show");

        } else {

            alert(message);

        }

    }

    function hideError() {

        if (errorBox) {

            errorBox.classList.remove("show");

        }

    }

    // -------------------------------
    // Loading State
    // -------------------------------

    function setLoading(isLoading) {

        loginBtn.disabled = isLoading;

        if (!loginText) return;

        if (isLoading) {

            loginText.innerHTML = `
                <span class="loading">
                    <i class="fa-solid fa-spinner fa-spin"></i>
                    Signing in...
                </span>
            `;

        } else {

            loginText.textContent = "Sign In";

        }

    }

    // -------------------------------
    // Fetch JSON Helper
    // -------------------------------

    async function loadJSON(path) {

        const response = await fetch(path);

        if (!response.ok) {

            throw new Error(`Unable to load ${path}`);

        }

        return await response.json();

    }

    // -------------------------------
    // Save Session
    // -------------------------------

    function saveSession(role, user) {

        localStorage.setItem("isLoggedIn", "true");

        localStorage.setItem("userRole", role);

        localStorage.setItem(
            "currentUser",
            JSON.stringify(user)
        );

    }

        // -------------------------------
    // Login Submit
    // -------------------------------

    loginForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        hideError();

        const username = emailInput.value.trim();
        const password = passwordInput.value.trim();

        if (!username || !password) {
            showError("Please fill in all required fields.");
            return;
        }

        setLoading(true);

        try {
            // -------------------------------
            // 1. Attempt Live Backend API Login
            // -------------------------------
            if (typeof API !== 'undefined') {
                try {
                    const res = await API.login(username, password);
                    if (res && res.success) {
                        const targetRole = res.role || 'driver';
                        if (targetRole === 'admin') {
                            window.location.href = "../admin/dashboard.html";
                        } else {
                            window.location.href = "../driver/dashboard.html";
                        }
                        return;
                    }
                } catch (apiErr) {
                    console.warn("Backend API login attempt notice:", apiErr.message);
                }
            }

            // -------------------------------
            // 2. Fallback: Load JSON Data
            // -------------------------------
            const users = await loadJSON("../../data/users.json").catch(() => []);
            const admins = await loadJSON("../../data/admins.json").catch(() => []);

            const driver = users.find(user => 
                (user.email.toLowerCase() === username.toLowerCase() || (user.driverId && user.driverId.toLowerCase() === username.toLowerCase()))
                && user.password === password
            );

            if (driver) {
                saveSession("driver", driver);
                window.location.href = "../driver/dashboard.html";
                return;
            }

            const admin = admins.find(user => 
                (user.email.toLowerCase() === username.toLowerCase() || (user.employeeId && user.employeeId.toLowerCase() === username.toLowerCase()))
                && user.password === password
            );

            if (admin) {
                saveSession("admin", admin);
                window.location.href = "../admin/dashboard.html";
                return;
            }

            showError("Invalid Email / ID or Password.");
            setLoading(false);

        } catch (error) {
            console.error("Login Error:", error);
            showError("Unable to connect to user database. Please try again.");
            setLoading(false);
        }
    });

    // -------------------------------
    // Hide Error While Typing
    // -------------------------------

    if (emailInput) {

        emailInput.addEventListener("input", hideError);

    }

    if (passwordInput) {

        passwordInput.addEventListener("input", hideError);

    }

    // -------------------------------
    // Auto Login Check
    // -------------------------------

    const isLoggedIn = localStorage.getItem("isLoggedIn");
    const role = localStorage.getItem("userRole");

    if (isLoggedIn === "true") {

        if (role === "admin") {

            window.location.href = "../admin/dashboard.html";

        } else if (role === "driver") {

            window.location.href = "../driver/dashboard.html";

        }

    }

});