/* =========================================================
   RoadSafe AI — notifications.js
   Dynamic notification center for Driver & Admin
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {
    const currentUser = window.RoadSafeData
    ? window.RoadSafeData.getCurrentUser()
    : JSON.parse(localStorage.getItem("currentUser") || "{}");
    
    const role = window.RoadSafeData
    ? window.RoadSafeData.getRole()
    : (localStorage.getItem("userRole") || "driver");

    const loadingState = document.getElementById("loadingState");
    const emptyState = document.getElementById("emptyState");
    const notificationsList = document.getElementById("notificationsList");
    const unreadCount = document.getElementById("unreadCount");
    const refreshBtn = document.getElementById("refreshBtn");
    const markAllBtn = document.getElementById("markAllBtn");
    const clearAllBtn = document.getElementById("clearAllBtn");
    const tabButtons = document.querySelectorAll(".tab-btn");

    let activeTab = "all";
    let allNotifications = window.RoadSafeData ? window.RoadSafeData.getNotifications() : {};
    let notifications = allNotifications[role] || [];

    function saveAndSync() {
        allNotifications[role] = notifications;
        if (window.RoadSafeData) {
            window.RoadSafeData.saveNotifications(allNotifications);
        } else {
            localStorage.setItem("roadsafe_notifications", JSON.stringify(allNotifications));
        }
        if (typeof window.initTopbar === "function") {
            window.initTopbar();
        }
    }

    function renderNotifications() {
        if (!notificationsList) return;
        notificationsList.innerHTML = "";

        let filtered = notifications;
        if (activeTab !== "all") {
            filtered = notifications.filter(item => item.category === activeTab);
        }

        updateCounts();

        if (loadingState) loadingState.classList.add("hidden");

        if (!filtered || filtered.length === 0) {
            if (notificationsList) notificationsList.classList.add("hidden");
            if (emptyState) emptyState.classList.remove("hidden");
            return;
        }

        if (emptyState) emptyState.classList.add("hidden");
        if (notificationsList) notificationsList.classList.remove("hidden");

        filtered.forEach(notification => {
            notificationsList.appendChild(createCard(notification));
        });
    }

    function updateCounts() {
        const unread = notifications.filter(n => !n.read).length;
        if (unreadCount) unreadCount.textContent = `${unread} Unread`;

        const allCountEl = document.getElementById("allCount");
        const alertCountEl = document.getElementById("alertCount");
        const reportCountEl = document.getElementById("reportCount");
        const systemCountEl = document.getElementById("systemCount");

        if (allCountEl) allCountEl.textContent = notifications.length;
        if (alertCountEl) alertCountEl.textContent = notifications.filter(n => n.category === "alert").length;
        if (reportCountEl) reportCountEl.textContent = notifications.filter(n => n.category === "report").length;
        if (systemCountEl) systemCountEl.textContent = notifications.filter(n => n.category === "system").length;
    }

    function createCard(notification) {
        const card = document.createElement("div");
        card.className = notification.read ? "notification-card" : "notification-card unread";
        card.dataset.category = notification.category;

        let icon = "fa-bell";
        if (notification.category === "alert") icon = "fa-triangle-exclamation";
        else if (notification.category === "report") icon = "fa-file-lines";
        else if (notification.category === "system") icon = "fa-gear";

        card.innerHTML = `
            <div class="notification-icon ${notification.category}">
                <i class="fa-solid ${icon}"></i>
            </div>
            <div class="notification-content">
                <div class="notification-top">
                    <div>
                        <h4>
                            ${notification.title}
                            ${notification.read ? "" : '<span class="unread-dot"></span>'}
                        </h4>
                        <p>${notification.message}</p>
                        <span class="time">${notification.time}</span>
                    </div>
                    <div class="notification-actions">
                        ${notification.read ? "" : `<button class="mark-read-btn" data-id="${notification.id}">Mark Read</button>`}
                        <button class="delete-btn" data-id="${notification.id}"><i class="fa-solid fa-trash"></i></button>
                    </div>
                </div>
                <span class="notification-tag ${notification.category}">
                    ${notification.category.toUpperCase()}
                </span>
            </div>
        `;

        // Mark read click
        const readBtn = card.querySelector(".mark-read-btn");
        if (readBtn) {
            readBtn.addEventListener("click", () => {
                markRead(notification.id);
            });
        }

        // Delete click
        const deleteBtn = card.querySelector(".delete-btn");
        if (deleteBtn) {
            deleteBtn.addEventListener("click", () => {
                deleteNotification(notification.id);
            });
        }

        return card;
    }

    function markRead(id) {
        notifications = notifications.map(item => {
            if (item.id === id) item.read = true;
            return item;
        });
        saveAndSync();
        renderNotifications();
    }

    function deleteNotification(id) {
        notifications = notifications.filter(item => item.id !== id);
        saveAndSync();
        renderNotifications();
    }

    if (markAllBtn) {
        markAllBtn.addEventListener("click", () => {
            notifications.forEach(item => { item.read = true; });
            saveAndSync();
            renderNotifications();
        });
    }

    if (clearAllBtn) {
        clearAllBtn.addEventListener("click", () => {
            if (!confirm("Clear all notifications?")) return;
            notifications = [];
            saveAndSync();
            renderNotifications();
        });
    }

    if (refreshBtn) {
        refreshBtn.addEventListener("click", () => {
            if (loadingState) loadingState.classList.remove("hidden");
            if (notificationsList) notificationsList.classList.add("hidden");
            if (emptyState) emptyState.classList.add("hidden");
            setTimeout(() => {
                renderNotifications();
            }, 400);
        });
    }

    tabButtons.forEach(btn => {
        btn.addEventListener("click", () => {
            tabButtons.forEach(t => t.classList.remove("active"));
            btn.classList.add("active");
            activeTab = btn.dataset.tab;
            renderNotifications();
        });
    });

    renderNotifications();
});