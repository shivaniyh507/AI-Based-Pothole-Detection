// ===============================
// RoadSafe AI - register.js
// ===============================

document.addEventListener("DOMContentLoaded", () => {
    const registerForm = document.getElementById("registerForm");
    const fullName = document.getElementById("fullName");
    const email = document.getElementById("email");
    const phone = document.getElementById("phone");
    const password = document.getElementById("password");
    const confirmPassword = document.getElementById("confirmPassword");
    const togglePassword = document.getElementById("togglePassword");
    const toggleConfirmPassword = document.getElementById("toggleConfirmPassword");

    const registerBtn = document.getElementById("registerBtn");
    const registerText = document.getElementById("registerText");
    const errorBox = document.getElementById("errorBox");
    const errorMessage = document.getElementById("errorMessage");
    const successModal = document.getElementById("successModal");
    const countdown = document.getElementById("countdown");

    if (!registerForm) return;

    function toggleEye(input, button) {
        if (input.type === "password") {
            input.type = "text";
            button.innerHTML = '<i class="fa-solid fa-eye-slash"></i>';
        } else {
            input.type = "password";
            button.innerHTML = '<i class="fa-solid fa-eye"></i>';
        }
    }

    if (togglePassword && password) {
        togglePassword.addEventListener("click", () => toggleEye(password, togglePassword));
    }
    if (toggleConfirmPassword && confirmPassword) {
        toggleConfirmPassword.addEventListener("click", () => toggleEye(confirmPassword, toggleConfirmPassword));
    }

    function showError(msg) {
        if (errorMessage && errorBox) {
            errorMessage.textContent = msg;
            errorBox.classList.add("show");
        } else {
            alert(msg);
        }
    }

    function hideError() {
        if (errorBox) errorBox.classList.remove("show");
    }

        registerForm.addEventListener("submit", async function (e) {
        e.preventDefault();
        hideError();

        const nameVal = fullName ? fullName.value.trim() : "";
        const emailVal = email ? email.value.trim() : "";
        const phoneVal = phone ? phone.value.trim() : "";
        const passVal = password ? password.value.trim() : "";
        const confirmVal = confirmPassword ? confirmPassword.value.trim() : "";

        if (!nameVal || !emailVal || !phoneVal || !passVal || !confirmVal) {
            showError("Please fill in all required fields.");
            return;
        }

        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(emailVal)) {
            showError("Enter a valid email address.");
            return;
        }

        if (passVal.length < 8) {
            showError("Password must be at least 8 characters long.");
            return;
        }

        if (passVal !== confirmVal) {
            showError("Passwords do not match.");
            return;
        }

        registerBtn.disabled = true;
        if (registerText) {
            registerText.innerHTML = `
                <span class="loading">
                    <i class="fa-solid fa-spinner fa-spin"></i>
                    Creating account...
                </span>
            `;
        }

        try {
            let apiRegistered = false;
            if (typeof API !== 'undefined') {
                try {
                    const res = await API.register(nameVal, emailVal, passVal, 'driver');
                    if (res && res.success) {
                        apiRegistered = true;
                    }
                } catch (apiErr) {
                    console.warn("[Register] API register notice:", apiErr.message);
                }
            }

            if (!apiRegistered && window.RoadSafeData && typeof window.RoadSafeData.registerDriver === 'function') {
                const res = window.RoadSafeData.registerDriver(nameVal, emailVal, phoneVal, passVal);
                if (!res.success) {
                    showError(res.message || "Registration failed.");
                    registerBtn.disabled = false;
                    if (registerText) registerText.innerHTML = "Register Account";
                    return;
                }
            }

            if (successModal) {
                successModal.classList.add("show");
                let seconds = 2;
                if (countdown) countdown.textContent = seconds;
                const timer = setInterval(() => {
                    seconds--;
                    if (countdown) countdown.textContent = seconds;
                    if (seconds <= 0) {
                        clearInterval(timer);
                        window.location.href = "login.html";
                    }
                }, 1000);
            } else {
                alert("Registration successful! Please sign in.");
                window.location.href = "login.html";
            }
        } catch (err) {
            showError("Registration failed: " + err.message);
            registerBtn.disabled = false;
            if (registerText) registerText.innerHTML = "Register Account";
        }
    });

    document.querySelectorAll("input").forEach(input => {
        input.addEventListener("input", hideError);
    });
});