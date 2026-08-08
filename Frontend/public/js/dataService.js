/* =========================================================
   RoadSafe AI
   Data Service
   JSON + localStorage
========================================================= */

const RoadSafeData = (() => {

    const STORAGE_KEYS = {

        USERS: "roadsafe_users",
        ADMINS: "roadsafe_admins",
        SETTINGS: "roadsafe_settings",
        NOTIFICATIONS: "roadsafe_notifications"

    };

    /* =========================================
       LocalStorage Helpers
    ========================================= */

    function getData(key, fallback = []) {

        const data = localStorage.getItem(key);

        if (!data) return fallback;

        try {

            return JSON.parse(data);

        }

        catch {

            return fallback;

        }

    }

    function saveData(key, value) {

        localStorage.setItem(
            key,
            JSON.stringify(value)
        );

    }

    /* =========================================
       Current User Helpers
    ========================================= */

    function getCurrentUser() {

        return JSON.parse(

            localStorage.getItem("currentUser") || "{}"

        );

    }

    function saveCurrentUser(user) {

        localStorage.setItem(

            "currentUser",

            JSON.stringify(user)

        );

    }

    function getRole() {

        return localStorage.getItem("userRole") || "driver";

    }

    function isLoggedIn() {

        return localStorage.getItem("isLoggedIn") === "true";

    }

    /* =========================================
       Logout
    ========================================= */

    function logout() {

        localStorage.removeItem("currentUser");

        localStorage.removeItem("userRole");

        localStorage.removeItem("isLoggedIn");

        window.location.href = "../auth/login.html";

    }

    /* =========================================
       Delete Account
    ========================================= */

    function deleteAccount() {

        const role = getRole();

        const currentUser = getCurrentUser();

        if (!currentUser.email) return;

        if (role === "driver") {

            let users = getUsers();

            users = users.filter(user =>
                user.email !== currentUser.email
            );

            saveUsers(users);

        }

        else {

            let admins = getAdmins();

            admins = admins.filter(admin =>
                admin.email !== currentUser.email
            );

            saveAdmins(admins);

        }

        logout();

    }

        /* =========================================
       Users
    ========================================= */

    function getUsers() {

        return getData(
            STORAGE_KEYS.USERS,
            []
        );

    }

    function saveUsers(users) {

        saveData(
            STORAGE_KEYS.USERS,
            users
        );

    }

    /* =========================================
       Admins
    ========================================= */

    function getAdmins() {

        return getData(
            STORAGE_KEYS.ADMINS,
            []
        );

    }

    function saveAdmins(admins) {

        saveData(
            STORAGE_KEYS.ADMINS,
            admins
        );

    }

    /* =========================================
       Settings
    ========================================= */

    function getSettings() {

        return getData(
            STORAGE_KEYS.SETTINGS,
            {

                driver: {},

                admin: {}

            }

        );

    }

    function saveSettings(settings) {

        saveData(
            STORAGE_KEYS.SETTINGS,
            settings
        );

    }

    /* =========================================
       Notifications
    ========================================= */

    function getNotifications() {

        return getData(
            STORAGE_KEYS.NOTIFICATIONS,
            {

                driver: [],

                admin: []

            }

        );

    }

    function saveNotifications(notifications) {

        saveData(
            STORAGE_KEYS.NOTIFICATIONS,
            notifications
        );

    }

    /* =========================================
       Update Current User
    ========================================= */

    function updateCurrentUser(updatedUser) {

        saveCurrentUser(updatedUser);

        const role = getRole();

        if (role === "driver") {

            const users = getUsers();

            const index = users.findIndex(user =>
                user.email === updatedUser.email
            );

            if (index !== -1) {

                users[index] = updatedUser;

                saveUsers(users);

            }

        }

        else {

            const admins = getAdmins();

            const index = admins.findIndex(admin =>
                admin.email === updatedUser.email
            );

            if (index !== -1) {

                admins[index] = updatedUser;

                saveAdmins(admins);

            }

        }

    }

        /* =========================================
       Initialize LocalStorage
    ========================================= */

    async function initializeData() {

        try {

            // Users

            if (!localStorage.getItem(STORAGE_KEYS.USERS)) {

                const users = await fetch("../../data/users.json")
                    .then(res => res.json());

                saveUsers(users);

            }

            // Admins

            if (!localStorage.getItem(STORAGE_KEYS.ADMINS)) {

                const admins = await fetch("../../data/admins.json")
                    .then(res => res.json());

                saveAdmins(admins);

            }

            // Settings

            if (!localStorage.getItem(STORAGE_KEYS.SETTINGS)) {

                const settings = await fetch("../../data/settings.json")
                    .then(res => res.json());

                saveSettings(settings);

            }

            // Notifications

            if (!localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS)) {

                const notifications = await fetch("../../data/notifications.json")
                    .then(res => res.json());

                saveNotifications(notifications);

            }

        }

        catch (error) {

            console.error(
                "RoadSafeData Initialization Error:",
                error
            );

        }

    }

    initializeData();

    /* =========================================
       Public API
    ========================================= */

    return {

        // Auth

        isLoggedIn,
        getRole,
        logout,
        deleteAccount,

        // Current User

        getCurrentUser,
        saveCurrentUser,
        updateCurrentUser,

        // Users

        getUsers,
        saveUsers,

        // Admins

        getAdmins,
        saveAdmins,

        // Settings

        getSettings,
        saveSettings,

        // Notifications

        getNotifications,
        saveNotifications

    };

})();

window.RoadSafeData = RoadSafeData;