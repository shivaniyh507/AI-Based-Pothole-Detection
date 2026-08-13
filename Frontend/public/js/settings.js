// =========================================================
// RoadSafe AI — settings.js
// JSON + localStorage Architecture
// Driver + Admin Settings
// =========================================================

document.addEventListener("DOMContentLoaded", () => {

    /* =========================================
       Authentication
    ========================================= */

    const isLoggedIn =
        localStorage.getItem("isLoggedIn");

    const role =
        localStorage.getItem("userRole") || "driver";

    let currentUser = JSON.parse(
        localStorage.getItem("currentUser") || "{}"
    );

    if (
        isLoggedIn !== "true" ||
        !currentUser.fullName
    ) {
        window.location.href = "../auth/login.html";
        return;
    }

    /* =========================================
       Load Settings
    ========================================= */

    const storage = RoadSafeData.getSettings();

    if (!storage.driver)
        storage.driver = {};

    if (!storage.admin)
        storage.admin = {};

    let settings = {
        ...storage[role]
    };

    /* =========================================
       Load Account Information
    ========================================= */

    function setText(id, value) {

        const element =
            document.getElementById(id);

        if (element) {
            element.textContent =
                value || "--";
        }

    }

    function loadAccountInfo() {

        setText(
          "accountType",
          role === "admin" ? "Administrator" : "Driver"
        );

        setText(
           "accountId",
            currentUser.adminId ||
            currentUser.driverId ||
            currentUser.userId ||
            currentUser.id ||
            "N/A"
        );

        setText(
            "accountEmail",
            currentUser.email
        );

        setText(
            "accountCreated",
            currentUser.createdAt
                ? new Date(
                    currentUser.createdAt
                ).toLocaleDateString()
                : "--"
        );

        setText(
            "lastLogin",
            currentUser.lastLogin
                ? new Date(
                    currentUser.lastLogin
                ).toLocaleString()
                : "Just Now"
        );

    }

    /* =========================================
       Elements
    ========================================= */

    const tabButtons =
        document.querySelectorAll(".menu-item");

    const panels =
        document.querySelectorAll(".settings-panel");

    const themeButtons =
        document.querySelectorAll(
            "[data-setting='theme']"
        );

    const accentButtons =
        document.querySelectorAll(
            "[data-setting='accentColor']"
        );

    const settingControls =
        document.querySelectorAll(
            "[data-setting]:not([data-setting='theme']):not([data-setting='accentColor'])"
        );

    const saveButtons =
        document.querySelectorAll(
            ".save-row .primary-btn, .button-row .primary-btn"
        );

    const resetButtons =
        document.querySelectorAll(
            ".save-row .secondary-btn, .button-row .secondary-btn"
        );

    const logoutButtons =
        document.querySelectorAll(
            ".logout-box button"
        );

    const resetZoneButton =
        document.querySelector(".danger-btn");

    const resetZoneInput =
        document.querySelector(".danger-input");


        /* =========================================
       Update Controls
    ========================================= */

    function updateControl(control, value) {

        const key = control.dataset.setting;

        if (!key) return;

        // Theme buttons
        if (
            control.matches("button") &&
            control.dataset.value
        ) {

            control.classList.toggle(
                "active",
                value === control.dataset.value
            );

            return;

        }

        // Toggle switches
        if (
            control.matches(
                "input[type='checkbox']"
            )
        ) {

            control.checked =
                Boolean(value);

            return;

        }

        // Text & Email Inputs
        if (
            control.matches(
                "input[type='text'], input[type='email']"
            )
        ) {

            control.value =
                value || "";

            return;

        }

        // Select
        if (
            control.matches("select")
        ) {

            control.value =
                value || "";

            return;

        }

        // Provider Cards
        if (
            control.classList.contains(
                "provider-card"
            )
        ) {

            control.classList.toggle(
                "active",
                value === control.dataset.value
            );

            return;

        }

        // Range Slider
        if (
            control.matches(
                "input[type='range']"
            )
        ) {

            control.value =
                value;

            const output =
                control
                    .closest(".setting-block")
                    ?.querySelector(".range-value");

            if (output) {

                output.textContent =
                    `${value}%`;

            }

        }

    }

    /* =========================================
       Load Settings
    ========================================= */

    function loadSettings() {

        themeButtons.forEach(btn =>

            updateControl(
                btn,
                settings.theme
            )

        );

        accentButtons.forEach(btn =>

            updateControl(
                btn,
                settings.accentColor
            )

        );

        settingControls.forEach(control => {

            const key =
                control.dataset.setting;

            if (
                key in settings
            ) {

                updateControl(
                    control,
                    settings[key]
                );

            }

        });

    }

        /* =========================================
       Save Settings
    ========================================= */

    function saveSettings() {

        const allSettings =
            RoadSafeData.getSettings();

        allSettings[role] =
            settings;

        RoadSafeData.saveSettings(
            allSettings
        );

        if (
            window.RoadSafeCommon &&
            typeof RoadSafeCommon.showToast === "function"
        ) {

            RoadSafeCommon.showToast(
                "Settings saved successfully."
            );

        }

    }

    /* =========================================
       Update Setting
    ========================================= */

    function setSetting(key, value) {

        settings[key] = value;

    }

    /* =========================================
       Tabs
    ========================================= */

    tabButtons.forEach(tab => {

        tab.addEventListener("click", () => {

            tabButtons.forEach(btn =>
                btn.classList.remove("active")
            );

            panels.forEach(panel =>
                panel.classList.remove("active")
            );

            tab.classList.add("active");

            document
                .getElementById(
                    tab.dataset.tab
                )
                ?.classList.add("active");

        });

    });

    /* =========================================
       Theme
    ========================================= */

    themeButtons.forEach(button => {

        button.addEventListener("click", () => {

            themeButtons.forEach(btn =>
                btn.classList.remove("active")
            );

            button.classList.add("active");

            const theme =
                button.dataset.value;

            setSetting(
                "theme",
                theme
            );

            if (
                window.RoadSafeCommon &&
                typeof RoadSafeCommon.setTheme === "function"
            ) {

                RoadSafeCommon.setTheme(
                    theme.toLowerCase()
                );

            }

        });

    });

    /* =========================================
       Accent Color
    ========================================= */

    accentButtons.forEach(button => {

        button.addEventListener("click", () => {

            accentButtons.forEach(btn =>
                btn.classList.remove("active")
            );

            button.classList.add("active");

            setSetting(
                "accentColor",
                button.dataset.value
            );

        });

    });

    /* =========================================
       Other Controls
    ========================================= */

    settingControls.forEach(control => {

        const key =
            control.dataset.setting;

        if (!key) return;

        if (
            control.matches(
                "input[type='checkbox']"
            )
        ) {

            control.addEventListener(
                "change",
                () => {

                    setSetting(
                        key,
                        control.checked
                    );

                }
            );

        }

        else if (
            control.matches("select")
        ) {

            control.addEventListener(
                "change",
                () => {

                    setSetting(
                        key,
                        control.value
                    );

                }
            );

        }

        else if (
            control.matches(
                "input[type='range']"
            )
        ) {

            control.addEventListener(
                "input",
                () => {

                    updateControl(
                        control,
                        control.value
                    );

                    setSetting(
                        key,
                        Number(control.value)
                    );

                }
            );

        }

        else if (
            control.classList.contains(
                "provider-card"
            )
        ) {

            control.addEventListener(
                "click",
                () => {

                    document
                        .querySelectorAll(
                            ".provider-card[data-setting='mapProvider']"
                        )
                        .forEach(card =>
                            card.classList.remove("active")
                        );

                    control.classList.add(
                        "active"
                    );

                    setSetting(
                        key,
                        control.dataset.value
                    );

                }
            );

        }

    });

        /* =========================================
       Save Buttons
    ========================================= */

    saveButtons.forEach(button => {

        button.addEventListener("click", (e) => {

            e.preventDefault();

            saveSettings();

        });

    });

    /* =========================================
       Reset Buttons
    ========================================= */

    resetButtons.forEach(button => {

        button.addEventListener("click", (e) => {

            e.preventDefault();

            loadSettings();

            if (
                window.RoadSafeCommon &&
                typeof RoadSafeCommon.showToast === "function"
            ) {

                RoadSafeCommon.showToast(
                    "Settings restored."
                );

            }

        });

    });

    /* =========================================
       Logout
    ========================================= */

    logoutButtons.forEach(button => {

        button.addEventListener("click", (e) => {

            e.preventDefault();

            if (
                confirm(
                    "Are you sure you want to log out?"
                )
            ) {

                RoadSafeData.logout();

            }

        });

    });

    /* =========================================
       Delete Account
    ========================================= */

    if (resetZoneButton && resetZoneInput) {

        resetZoneButton.addEventListener("click", (e) => {

            e.preventDefault();

            if (
                resetZoneInput.value.trim() !== "DELETE"
            ) {

                if (
                    window.RoadSafeCommon &&
                    typeof RoadSafeCommon.showToast === "function"
                ) {

                    RoadSafeCommon.showToast(
                        "Please type DELETE in exact capital letters to confirm.",
                        "error"
                    );

                }

                return;

            }

            if (
                confirm(
                    "This action will permanently delete your account. Continue?"
                )
            ) {

                RoadSafeData.deleteAccount();

            }

        });

    }

    /* =========================================
       Initial Load
    ========================================= */

    loadAccountInfo();

    loadSettings();

});