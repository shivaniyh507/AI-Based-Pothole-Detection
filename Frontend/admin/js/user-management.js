/**
 * user-management.js — User Management Page Interactivity
 * 
 * API Endpoints Expected:
 *   GET   /api/users         — list all users
 *   PATCH /api/users/:id     — approve/reject user
 *   POST  /api/users         — create new user
 * 
 * Features:
 *   - Calendar-style activity heatmap with tooltips
 *   - Approve/Reject pending users (optimistic UI)
 *   - Add User modal with form validation
 */

document.addEventListener('DOMContentLoaded', () => {
    initCalendarHeatmap();
    initPendingApprovals();
    initAddUserModal();
    initUserCardActions();
});

function initUserCardActions() {
    document.querySelectorAll('#personnelGrid > div').forEach(card => {
        const nameEl = card.querySelector('h4');
        if (!nameEl) return;
        const name = nameEl.textContent.trim();
        
        const actionButtons = card.querySelectorAll('.mt-4 button');


    // Setup delete buttons
    document.querySelectorAll('.delete-user-btn').forEach(btn => {
        // Prevent multiple bindings
        if (btn.dataset.bound) return;
        btn.dataset.bound = true;
        btn.onclick = (e) => {
            const card = e.currentTarget.closest('.glass');
            const name = card.querySelector('h4').textContent;
            if (confirm(`Are you sure you want to remove ${name}?`)) {
                card.style.animation = 'fadeOut 0.3s ease-out forwards';
                setTimeout(() => card.remove(), 300);
                showToast(`${name} removed`, 'success');
            }
        };
    });

        if (actionButtons.length >= 3) {
            // Mail button
            actionButtons[0].onclick = () => showToast(`Emailing ${name}...`, 'success');
            // Phone button
            actionButtons[1].onclick = () => showToast(`Calling ${name}...`, 'success');
            // Settings button
            actionButtons[2].onclick = () => showToast(`Opening settings for ${name}...`, 'success');
        }
    });
}

// ═══════════════════════════════════════════════════════════
// 1. CALENDAR ACTIVITY HEATMAP
// ═══════════════════════════════════════════════════════════

function initCalendarHeatmap() {
    const grid = document.getElementById('heatmapGrid');
    if (!grid) return;

    // Clear existing content (remove inline-script generated cells)
    grid.innerHTML = '';

    // Mock activity data: 7 days × 24 hours
    // activityLevel: 0=none, 1=low, 2=medium, 3=high, 4=very high
    const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const activityData = generateMockHeatmapData();

    // Create tooltip element
    const tooltip = document.createElement('div');
    tooltip.className = 'heatmap-tooltip';
    document.body.appendChild(tooltip);

    // CSS color classes for each level
    const levelColors = [
        'bg-gray-100',      // 0 - No activity
        'bg-primary/20',    // 1 - Low
        'bg-primary/40',    // 2 - Medium
        'bg-primary/70',    // 3 - High
        'bg-primary',       // 4 - Very High
    ];

    const levelLabels = ['No activity', 'Low activity', 'Medium activity', 'High activity', 'Very high activity'];

    // Render cells: iterate rows (days) then cols (hours)
    for (let day = 0; day < 7; day++) {
        for (let hour = 0; hour < 24; hour++) {
            const level = activityData[day][hour];
            const cell = document.createElement('div');
            cell.className = `rounded-sm heatmap-cell cursor-pointer transition-all duration-200 hover:ring-2 hover:ring-primary/30 ${levelColors[level]}`;
            cell.dataset.day = dayNames[day];
            cell.dataset.hour = hour;
            cell.dataset.level = level;
            cell.style.minHeight = '8px';

            // Tooltip on hover
            cell.addEventListener('mouseenter', (e) => {
                const rect = e.target.getBoundingClientRect();
                const hourLabel = `${hour.toString().padStart(2, '0')}:00`;
                tooltip.textContent = `${dayNames[day]} ${hourLabel} — ${levelLabels[level]} (${level * 25}%)`;
                tooltip.style.left = `${rect.left + rect.width / 2}px`;
                tooltip.style.top = `${rect.top}px`;
                tooltip.classList.add('visible');
            });

            cell.addEventListener('mouseleave', () => {
                tooltip.classList.remove('visible');
            });

            grid.appendChild(cell);
        }
    }
}

function generateMockHeatmapData() {
    // Generate realistic-looking activity data
    // Work hours (8-18) on weekdays have higher activity
    const data = [];
    for (let day = 0; day < 7; day++) {
        const dayData = [];
        const isWeekend = day >= 5;
        for (let hour = 0; hour < 24; hour++) {
            let maxLevel = 1;
            if (!isWeekend && hour >= 8 && hour <= 18) {
                maxLevel = 4; // Peak hours on weekdays
            } else if (!isWeekend && (hour >= 6 && hour < 8 || hour > 18 && hour <= 20)) {
                maxLevel = 3; // Moderate hours
            } else if (isWeekend && hour >= 10 && hour <= 16) {
                maxLevel = 2; // Light weekend activity
            }
            dayData.push(Math.floor(Math.random() * (maxLevel + 1)));
        }
        data.push(dayData);
    }
    return data;
}

// ═══════════════════════════════════════════════════════════
// 2. PENDING APPROVALS
// ═══════════════════════════════════════════════════════════

function initPendingApprovals() {
    const approvalContainer = document.getElementById('pendingApprovals');
    if (!approvalContainer) return;

    // Delegate events to container
    approvalContainer.addEventListener('click', async (e) => {
        const btn = e.target.closest('button');
        if (!btn) return;

        const card = btn.closest('.approval-card');
        if (!card) return;

        const userId = card.dataset.userId;
        const userName = card.dataset.userName;
        const isApprove = btn.classList.contains('approve-btn');

        // Disable buttons immediately
        const buttons = card.querySelectorAll('button');
        buttons.forEach(b => b.disabled = true);

        // Animate card out
        card.style.transition = 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)';
        card.style.transform = `translateX(${isApprove ? '' : '-'}100%)`;
        card.style.opacity = '0';
        card.style.maxHeight = card.offsetHeight + 'px';

        setTimeout(() => {
            card.style.maxHeight = '0';
            card.style.padding = '0';
            card.style.margin = '0';
            card.style.border = 'none';
        }, 300);

        setTimeout(() => {
            card.remove();
            updatePendingBadge();
        }, 600);

        // API call (optimistic)
        const action = isApprove ? 'approved' : 'rejected';
        await apiFetch(`/api/users/${userId}`, {
            method: 'PATCH',
            body: JSON.stringify({ status: action })
        });

        showToast(
            `${userName} has been ${action}`,
            isApprove ? 'success' : 'warning'
        );

        // If approved, add to personnel directory
        if (isApprove) {
            addToPersonnelGrid(card);
        }
    });
}

function updatePendingBadge() {
    const container = document.getElementById('pendingApprovals');
    const badge = document.getElementById('pendingBadge');
    if (!container || !badge) return;

    const remaining = container.querySelectorAll('.approval-card').length;
    badge.textContent = remaining;

    if (remaining === 0) {
        badge.style.display = 'none';
        // Show empty state
        container.innerHTML = `
            <div class="flex flex-col items-center justify-center py-8 text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                <p class="mt-2 text-sm font-medium">All caught up!</p>
            </div>
        `;
    }
}

function addToPersonnelGrid(card) {
    const grid = document.getElementById('personnelGrid');
    if (!grid) return;

    const name = card.dataset.userName;
    const role = card.dataset.userRole;
    const avatar = card.dataset.userAvatar;
    const email = name.toLowerCase().replace(/\s+/g, '.') + '@roadsafe.ai';

    const newCard = document.createElement('div');
    newCard.className = 'glass rounded-xl p-5 relative group overflow-hidden border border-gray-100 hover:shadow-md transition';
    newCard.style.animation = 'fadeIn 0.5s ease-out forwards';

    newCard.innerHTML = `
        <div class="absolute top-3 right-3 flex items-center space-x-2">
            <div class="w-2.5 h-2.5 bg-success rounded-full border border-white" title="Online"></div>
            <button class="delete-user-btn text-gray-400 hover:text-red-500 transition-colors opacity-100 bg-red-50 hover:bg-red-100 rounded text-red-400 p-1" title="Remove User">
                <i data-icon="trash-2" class="w-4 h-4"></i>
            </button>
        </div>
        <div class="flex flex-col items-center text-center">
            <div class="w-16 h-16 rounded-full bg-gray-200 mb-3 overflow-hidden border-2 border-white shadow-sm flex items-center justify-center">
                <img src="${avatar}" alt="avatar" class="w-full h-full object-cover">
            </div>
            <h4 class="font-semibold text-gray-800">${name}</h4>
            <p class="text-xs text-gray-600 bg-gray-100 px-2 py-0.5 rounded mt-1">${role}</p>
            <p class="text-xs text-gray-500 mt-2 truncate w-full">${email}</p>
        </div>
        <div class="mt-4 pt-4 border-t border-gray-100 flex justify-center space-x-4">
            <button onclick="showToast('Emailing ${name}...', 'success')" class="text-gray-400 hover:text-primary transition"><i data-icon="mail" class="w-4 h-4"></i></button>
            <button onclick="showToast('Calling ${name}...', 'success')" class="text-gray-400 hover:text-primary transition"><i data-icon="phone" class="w-4 h-4"></i></button>
            <button onclick="showToast('Opening settings for ${name}...', 'success')" class="text-gray-400 hover:text-primary transition"><i data-icon="settings" class="w-4 h-4"></i></button>
        </div>
    `;

    grid.appendChild(newCard);
    
    // Attach event listeners for the new card
    if (window.loadLocalIcons) {
        window.loadLocalIcons(newCard);
    }
    initUserCardActions(); // Re-bind delete buttons
}

// ═══════════════════════════════════════════════════════════
// 3. ADD USER MODAL
// ═══════════════════════════════════════════════════════════

function initAddUserModal() {
    const openBtn = document.getElementById('addUserBtn');
    const modal = document.getElementById('addUserModal');
    const closeBtn = document.getElementById('closeAddUserModal');
    const cancelBtn = document.getElementById('cancelAddUser');
    const form = document.getElementById('addUserForm');

    if (!openBtn || !modal) return;

    // Open modal
    openBtn.addEventListener('click', () => {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
        // Focus first input
        setTimeout(() => {
            const firstInput = form?.querySelector('input');
            if (firstInput) firstInput.focus();
        }, 300);
    });

    // Close modal
    function closeModal() {
        modal.classList.remove('active');
        document.body.style.overflow = '';
        if (form) form.reset();
    }

    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    if (cancelBtn) cancelBtn.addEventListener('click', closeModal);

    // Close on backdrop click
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('active')) {
            closeModal();
        }
    });

    // Form submit
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            const name = document.getElementById('newUserName')?.value.trim();
            const email = document.getElementById('newUserEmail')?.value.trim();
            const role = document.getElementById('newUserRole')?.value;
            const phone = document.getElementById('newUserPhone')?.value.trim() || 'No phone provided';
            const photoInput = document.getElementById('newUserPhoto');

            // Validation
            if (!name || !email || !role) {
                showToast('Please fill in all required fields', 'error');
                return;
            }

            // Generate avatar from uploaded photo or fallback to random
            let avatar = `../../driver/images/avatars/avatar-${Math.floor(Math.random() * 9) + 1}.jpg`;
            if (photoInput && photoInput.files && photoInput.files[0]) {
                avatar = URL.createObjectURL(photoInput.files[0]);
            }

            // Add to grid
            const grid = document.getElementById('personnelGrid');
            if (grid) {
                const newCard = document.createElement('div');
                newCard.className = 'glass rounded-xl p-5 relative group overflow-hidden border border-gray-100 hover:shadow-md transition';
                newCard.style.animation = 'fadeIn 0.5s ease-out forwards';

                const roleClass = role === 'Crew Leader' ?
                    'text-primary bg-primary/10' : 'text-gray-600 bg-gray-100';

                newCard.innerHTML = `
                    <div class="absolute top-3 right-3 flex items-center space-x-2">
        <div class="w-2.5 h-2.5 bg-gray-300 rounded-full border border-white" title="Offline"></div>
        <button class="delete-user-btn text-gray-400 hover:text-red-500 transition-colors opacity-100 bg-red-50 hover:bg-red-100 rounded text-red-400 p-1" title="Remove User"><i data-icon="trash-2" class="w-4 h-4"></i></button>
    </div>
                    <div class="flex flex-col items-center text-center">
                        <div class="w-16 h-16 rounded-full bg-gray-200 mb-3 overflow-hidden border-2 border-white shadow-sm flex items-center justify-center">
                            <img src="${avatar}" alt="avatar" class="w-full h-full object-cover">
                        </div>
                        <h4 class="font-semibold text-gray-800">${name}</h4>
                        <p class="text-xs ${roleClass} px-2 py-0.5 rounded mt-1">${role}</p>
                        <p class="text-xs text-gray-500 mt-2 truncate w-full">${email}</p>
                    </div>
                    <div class="mt-4 pt-4 border-t border-gray-100 flex justify-center space-x-4">
                        <button onclick="showToast('Emailing ${name}...', 'success')" class="text-gray-400 hover:text-primary transition"><i data-icon="mail" class="w-4 h-4"></i></button>
                        <button onclick="showToast('Calling ${name} at ${phone}...', 'success')" class="text-gray-400 hover:text-primary transition"><i data-icon="phone" class="w-4 h-4"></i></button>
                        <button onclick="showToast('Opening settings for ${name}...', 'success')" class="text-gray-400 hover:text-primary transition"><i data-icon="settings" class="w-4 h-4"></i></button>
                    </div>
                `;

                grid.appendChild(newCard);
                if (window.loadLocalIcons) {
                    window.loadLocalIcons(newCard);
                }
                initUserCardActions(); // Re-bind delete buttons
            }

            // API call
            await apiFetch('/api/users', {
                method: 'POST',
                body: JSON.stringify({ name, email, role })
            });

            showToast(`${name} has been added successfully!`, 'success');
            closeModal();
        });
    }
}
