// Kanban Drag and Drop Logic
// Enhanced with status updates, color changes, and mock API calls

function allowDrop(ev) {
    ev.preventDefault();
    const column = ev.currentTarget;
    column.classList.add('drag-over');
    column.style.background = 'rgba(83, 74, 183, 0.05)';
}

function dragLeave(ev) {
    const column = ev.currentTarget;
    column.classList.remove('drag-over');
    column.style.background = '';
}

function drag(ev) {
    ev.dataTransfer.setData("text", ev.target.id);
    ev.target.classList.add('opacity-50', 'scale-95');
    // Store original column to check if it changed on drop
    ev.dataTransfer.setData("sourceCol", ev.target.closest('.kanban-column').id);
}

function drop(ev) {
    ev.preventDefault();
    const data = ev.dataTransfer.getData("text");
    const sourceColId = ev.dataTransfer.getData("sourceCol");
    const item = document.getElementById(data);
    const column = ev.currentTarget;
    
    item.classList.remove('opacity-50', 'scale-95');
    column.classList.remove('drag-over');
    column.style.background = '';
    
    // Only append if dropping on a kanban column and not the same column
    if(column.classList.contains('kanban-column') && sourceColId !== column.id) {
        column.appendChild(item);
        
        // Update visual state based on column
        updateCardState(item, column.id);
        
        // Update column counters
        updateCounters();
        
        // Trigger mock API call and show toast
        if (typeof showToast === 'function') {
            const potholeId = item.querySelector('.text-gray-400').textContent.trim();
            const statusMap = {
                'backlog': 'Backlog',
                'assigned': 'Assigned',
                'in-progress': 'In Progress',
                'completed': 'Completed'
            };
            
            showToast(`${potholeId} moved to ${statusMap[column.id]}`, 'success');
            
            // Mock API update
            if (typeof apiFetch === 'function') {
                const repairId = item.id.replace('task-', 'RPR-');
                apiFetch(`/api/repairs/${repairId}`, {
                    method: 'PATCH',
                    body: JSON.stringify({ status: column.id })
                });
            }
        }
    }
}

function updateCardState(item, columnId) {
    // Reset borders
    item.classList.remove('border-l-2', 'border-l-warning', 'border-l-primary', 'border-l-success', 'opacity-75');
    
    const severity = item.dataset.severity || 'Minor';
    const severityBadge = item.querySelector('span.uppercase');
    const bottomIcon = item.querySelector('.fa-image, .lucide-image, .lucide-check-circle, .fa-check-circle');
    
    // Extract info block (middle section)
    const infoBlocks = item.querySelectorAll('p');
    let infoText = infoBlocks.length > 0 ? infoBlocks[0] : null;

    if (columnId === 'backlog') {
        // Reset to default backlog state
        if (infoText) infoText.innerHTML = `<i data-icon="calendar" class="w-3 h-3 mr-1 inline-block"></i> Added just now`;
        if (bottomIcon) bottomIcon.outerHTML = `<i data-icon="image" class="w-4 h-4 text-gray-400 cursor-pointer hover:text-primary"></i>`;
        
    } else if (columnId === 'assigned') {
        item.classList.add('border-l-2', 'border-l-warning');
        
        // Assign crew if none assigned
        const crewNumber = Math.floor(Math.random() * 3) + 1;
        const eta = Math.floor(Math.random() * 45) + 15;
        
        if (infoText) infoText.innerHTML = `<i data-icon="truck" class="w-3 h-3 mr-1 inline-block"></i> Crew ${crewNumber === 1 ? 'Alpha' : (crewNumber === 2 ? 'Bravo' : 'Charlie')} (ETA: ${eta}m)`;
        
        // Ensure assignee avatar exists
        let assigneeContainer = item.querySelector('.flex.-space-x-2');
        if (assigneeContainer) {
            assigneeContainer.innerHTML = `<img class="w-6 h-6 rounded-full border border-white" src="../images/avatars/avatar-${Math.floor(Math.random() * 9) + 1}.jpg" alt="Assignee">`;
        }
        
    } else if (columnId === 'in-progress') {
        item.classList.add('border-l-2', 'border-l-primary');
        
        const crewName = infoText && infoText.textContent.includes('Crew') ? 
            infoText.textContent.split('(')[0].trim() : 'Crew Alpha';
            
        // Convert info to show working status + progress bar
        if (infoText) infoText.innerHTML = `<i data-icon="users" class="w-3 h-3 mr-1 inline-block"></i> ${crewName}`;
        
        // Add progress bar if it doesn't exist
        if (!item.querySelector('.bg-gray-100.rounded-full.h-1\\.5')) {
            const progressHtml = `
                <div class="mt-2 progress-bar-container">
                    <div class="flex justify-between text-[10px] font-medium text-gray-400 mb-1">
                        <span>Progress</span>
                        <span>0%</span>
                    </div>
                    <div class="w-full bg-gray-100 rounded-full h-1.5">
                        <div class="bg-primary h-1.5 rounded-full transition-all duration-500" style="width: 0%"></div>
                    </div>
                </div>
            `;
            infoText.insertAdjacentHTML('afterend', progressHtml);
            
            // Simulate progress filling
            setTimeout(() => {
                const bar = item.querySelector('.bg-primary.h-1\\.5');
                const text = item.querySelector('.text-\\[10px\\] > span:last-child');
                if (bar && text) {
                    bar.style.width = '35%';
                    text.textContent = '35%';
                }
            }, 500);
        }
        
    } else if (columnId === 'completed') {
        item.classList.add('border-l-2', 'border-l-success', 'opacity-75');
        
        // Update badge to Done
        if (severityBadge) {
            severityBadge.className = 'bg-success/10 text-success text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider border border-success/20';
            severityBadge.textContent = 'Done';
        }
        
        const crewName = infoText && infoText.textContent.includes('Crew') ? 
            infoText.textContent.split('(')[0].replace('Completed by ', '').trim() : 'Crew Alpha';
            
        // Remove progress bar if exists
        const progressBar = item.querySelector('.progress-bar-container');
        if (progressBar) progressBar.remove();
        
        if (infoText) infoText.innerHTML = `<i data-icon="check-circle" class="w-3 h-3 mr-1 inline-block"></i> Completed by ${crewName}`;
        
        // Add completion time if missing
        if (item.querySelectorAll('p').length < 2) {
            infoText.insertAdjacentHTML('afterend', `<p class="text-[10px] text-gray-400">Completed just now</p>`);
        } else {
            item.querySelectorAll('p')[1].textContent = 'Completed just now';
            item.querySelectorAll('p')[1].className = 'text-[10px] text-gray-400';
        }
        
        // Change bottom icon to check
        if (bottomIcon) bottomIcon.outerHTML = `<i data-icon="check-circle" class="w-4 h-4 text-success"></i>`;
    }
    
    // Re-initialize icons for newly injected HTML
    if (window.loadLocalIcons) {
        window.loadLocalIcons(item);
    }
}

// Reset styles if drag ends without dropping
document.addEventListener('dragend', function(ev) {
    if(ev.target.classList) {
        ev.target.classList.remove('opacity-50', 'scale-95');
    }
    
    // Remove drag-over from all columns
    document.querySelectorAll('.kanban-column').forEach(col => {
        col.classList.remove('drag-over');
        col.style.background = '';
    });
});

function updateCounters() {
    const columns = ['backlog', 'assigned', 'in-progress', 'completed'];
    columns.forEach(id => {
        const col = document.getElementById(id);
        if(col) {
            const count = col.querySelectorAll('.kanban-item').length;
            // Find the badge in the previous sibling (header)
            const headerBadge = col.previousElementSibling.querySelector('span.bg-slate-200');
            if(headerBadge) {
                headerBadge.textContent = count;
            }
        }
    });
}

// ─── Crew Assignment Logic ─────────────────────────────
document.addEventListener('click', (e) => {
    // Check if the user clicked the "Assign User" dashed circle
    const assignBtn = e.target.closest('[title="Assign User"]');
    
    // Close existing dropdowns if clicked outside
    if (!assignBtn && !e.target.closest('.crew-dropdown')) {
        document.querySelectorAll('.crew-dropdown').forEach(el => el.remove());
        return;
    }

    if (assignBtn) {
        // Remove existing dropdowns
        document.querySelectorAll('.crew-dropdown').forEach(el => el.remove());

        // Dynamically build dropdown from active crews
        const crewContainer = document.getElementById('crewListContainer');
        let dynamicButtonsHtml = '';
        if (crewContainer) {
            const rows = crewContainer.querySelectorAll('.flex.items-center.justify-between.p-3');
            rows.forEach(row => {
                const initials = row.querySelector('.w-8.h-8').textContent;
                const name = row.querySelector('h4').textContent;
                dynamicButtonsHtml += `
                    <button class="w-full text-left px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-primary hover:text-white transition flex items-center gap-2" onclick="assignCrewToCard(this, '${initials}')">
                        <span class="w-5 h-5 rounded bg-blue-100 text-blue-700 flex items-center justify-center text-[9px] font-bold">${initials}</span>
                        ${name}
                    </button>
                `;
            });
        }
        
        if (dynamicButtonsHtml === '') {
            dynamicButtonsHtml = '<div class="px-4 py-3 text-xs text-slate-500 text-center italic">No crews clocked in</div>';
        }

        const dropdownHtml = `
            <div class="crew-dropdown absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-200 z-[9999] overflow-hidden transform origin-top-right transition-all">
                <div class="px-3 py-2 bg-slate-50 border-b border-slate-100 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Assign Crew</div>
                ${dynamicButtonsHtml}
            </div>
        `;
        // Make the parent container relative so absolute positioning works nicely
        const parentContainer = assignBtn.parentElement;
        parentContainer.classList.add('relative');
        parentContainer.insertAdjacentHTML('beforeend', dropdownHtml);
        e.stopPropagation();
    }
});

window.assignCrewToCard = function(btn, crewId) {
    const card = btn.closest('.kanban-item');
    if (card) {
        // Move card to the 'assigned' column
        const assignedCol = document.getElementById('assigned');
        if (assignedCol && card.parentElement !== assignedCol) {
            assignedCol.appendChild(card);
            
            // Update the styling using existing kanban logic
            updateCardState(card, 'assigned');
        }
        
        // Find the specific button container in this card and replace it with a badge
        const assignBtn = card.querySelector('[title="Assign User"]');
        if (assignBtn) {
            assignBtn.outerHTML = `<div class="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 text-[10px] font-bold shadow-sm" title="Crew ${crewId}">${crewId}</div>`;
        }
        
        document.querySelectorAll('.crew-dropdown').forEach(el => el.remove());
        updateCounters();
        
        if (typeof showToast === 'function') {
            showToast(`Task assigned to Crew ${crewId}`, 'success');
        }
    }
};

// ─── Modal Logic for New Task ─────────────────────────────
(function initModalLogic() {
    const newBtn = document.getElementById('newTaskBtn');
    const modal = document.getElementById('newTaskModal');
    const closeBtn = document.getElementById('closeModalBtn');
    const cancelBtn = document.getElementById('cancelModalBtn');
    const submitBtn = document.getElementById('submitTaskBtn');

    if (!newBtn || !modal) return;

    function openModal() {
        modal.classList.remove('hidden');
        modal.classList.add('flex');
        // Small delay to allow display flex to apply before animating opacity
        setTimeout(() => {
            modal.classList.remove('opacity-0');
            modal.querySelector('div').classList.remove('scale-95');
        }, 10);
    }

    function closeModal() {
        modal.classList.add('opacity-0');
        modal.querySelector('div').classList.add('scale-95');
        setTimeout(() => {
            modal.classList.add('hidden');
            modal.classList.remove('flex');
            // Reset fields
            document.getElementById('newTaskLocation').value = '';
            document.getElementById('newTaskSeverity').value = 'Critical';
            document.getElementById('newTaskSize').value = 'Medium';
            document.getElementById('newTaskAssignee').value = 'Unassigned';
            document.getElementById('newTaskMaterial').value = 'HMA';
            document.getElementById('newTaskNotes').value = '';
        }, 300); // match transition duration
    }

    newBtn.addEventListener('click', openModal);
    closeBtn.addEventListener('click', closeModal);
    cancelBtn.addEventListener('click', closeModal);

    submitBtn.addEventListener('click', () => {
        const loc = document.getElementById('newTaskLocation').value.trim() || 'Unknown Location';
        const sev = document.getElementById('newTaskSeverity').value;
        const assignee = document.getElementById('newTaskAssignee').value;
        
        // Generate random ID
        const newId = 'PH-' + (Math.floor(Math.random() * 9000) + 1000);
        
        // Determine which column to append to
        let targetColId = 'backlog';
        if (assignee !== 'Unassigned') {
            targetColId = 'assigned';
        }
        
        const col = document.getElementById(targetColId);
        
        // Generate Card HTML matching the redesigned style
        const sevColor = sev === 'Critical' ? 'critical' : sev === 'Major' ? 'warning' : 'slate-500';
        const size = document.getElementById('newTaskSize').value;
        const material = document.getElementById('newTaskMaterial').value;
        const notes = document.getElementById('newTaskNotes').value;
        
        let avatarHtml = `<div class="w-7 h-7 rounded-full border border-dashed border-slate-300 flex items-center justify-center text-slate-400 hover:border-primary hover:text-primary hover:bg-primary/5 transition cursor-pointer" title="Assign User"><i data-icon="user-plus" class="w-3.5 h-3.5"></i></div>`;
        
        if (assignee !== 'Unassigned') {
            avatarHtml = `<div class="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 text-[10px] font-bold shadow-sm" title="Crew ${assignee}">${assignee}</div>`;
        }

        const cardHtml = `
            <div class="kanban-item bg-white border border-slate-200 rounded-xl p-4 shadow-sm hover:shadow-lg hover:-translate-y-1 hover:border-primary/30 transition-all cursor-grab active:cursor-grabbing group relative ${targetColId === 'assigned' ? 'overflow-hidden hover:border-warning/40' : ''}" draggable="true" ondragstart="drag(event)" id="task-${Math.floor(Math.random()*10000)}" data-severity="${sev}">
                ${targetColId === 'assigned' ? '<div class="absolute left-0 top-0 bottom-0 w-1 bg-warning/80"></div>' : ''}
                <div class="relative z-10 ${targetColId === 'assigned' ? 'pl-2' : ''}">
                    <div class="flex justify-between items-start mb-3">
                        <span class="bg-${sevColor}/10 text-${sevColor} text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">${sev}</span>
                        <span class="text-[11px] font-semibold text-slate-400 font-mono">#${newId}</span>
                    </div>
                    <h4 class="text-sm font-bold text-slate-800 mb-2 leading-snug group-hover:text-primary transition-colors">${loc}</h4>
                    
                    <div class="flex items-center gap-2 mb-3">
                        <span class="text-[9px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded border border-slate-200 uppercase">${size}</span>
                        <span class="text-[9px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded border border-slate-200 uppercase">${material}</span>
                        ${notes ? `<span title="${notes}"><i data-icon="file-text" class="w-3 h-3 text-slate-400"></i></span>` : ''}
                    </div>

                    <div class="flex items-center justify-between mt-4 border-t border-slate-100 pt-3">
                        <div class="flex items-center text-slate-400 text-[11px] font-semibold"><i data-icon="calendar" class="w-3.5 h-3.5 mr-1.5"></i> Just now</div>
                        ${avatarHtml}
                    </div>
                </div>
            </div>
        `;
        
        // Insert into column
        col.insertAdjacentHTML('afterbegin', cardHtml);
        
        // Load icons for new card
        if (window.loadLocalIcons) {
            window.loadLocalIcons(col.firstElementChild);
        }
        
        updateCounters();
        closeModal();
        
        if (typeof showToast === 'function') {
            showToast(`Task #${newId} created successfully`, 'success');
        }
    });
})();

// ─── Manage Crews Modal Logic ─────────────────────────────
(function initManageCrewsLogic() {
    const manageBtn = document.getElementById('manageCrewsBtn');
    const modal = document.getElementById('manageCrewsModal');
    const closeBtn = document.getElementById('closeManageCrewsBtn');

    if (!manageBtn || !modal) return;

    function openModal() {
        modal.classList.remove('hidden');
        modal.classList.add('flex');
        setTimeout(() => {
            modal.classList.remove('opacity-0');
            modal.querySelector('div').classList.remove('scale-95');
        }, 10);
    }

    function closeModal() {
        modal.classList.add('opacity-0');
        modal.querySelector('div').classList.add('scale-95');
        setTimeout(() => {
            modal.classList.add('hidden');
            modal.classList.remove('flex');
        }, 300);
    }

    manageBtn.addEventListener('click', openModal);
    closeBtn.addEventListener('click', closeModal);
    
    // Close when clicking backdrop
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });

    // Sync UI elements when crews change
    function syncCrewData() {
        const container = document.getElementById('crewListContainer');
        if (!container) return;
        
        const rows = container.querySelectorAll('.flex.items-center.justify-between.p-3');
        const count = rows.length;

        // 1. Update the "3 Crews Active" pill button
        const pillBtn = document.getElementById('manageCrewsBtn');
        if (pillBtn) {
            const span = pillBtn.querySelector('span');
            if (span) {
                span.textContent = `${count} Crew${count !== 1 ? 's' : ''} Active`;
            }
        }

        // 2. Update the "Assign To" select dropdown in the New Task Modal
        const select = document.getElementById('newTaskAssignee');
        if (select) {
            select.innerHTML = '<option value="Unassigned">Unassigned (Backlog)</option>';
            rows.forEach(row => {
                const initials = row.querySelector('.w-8.h-8').textContent;
                const name = row.querySelector('h4').textContent;
                select.innerHTML += `<option value="${initials}">${name}</option>`;
            });
        }
    }

    const addCrewBtn = document.getElementById('addCrewBtn');
    const newCrewInput = document.getElementById('newCrewInput');
    const crewListContainer = document.getElementById('crewListContainer');

    if (addCrewBtn && newCrewInput && crewListContainer) {
        // Handle clicking Add button
        addCrewBtn.addEventListener('click', addNewCrew);
        
        // Handle pressing Enter key
        newCrewInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') addNewCrew();
        });

        function addNewCrew() {
            const val = newCrewInput.value.trim();
            if (!val) return;

            // Generate initials (first letter of first two words, or just first two letters)
            const words = val.split(' ');
            let initials = '';
            if (words.length >= 2) {
                initials = (words[0][0] + words[1][0]).toUpperCase();
            } else {
                initials = val.substring(0, 2).toUpperCase();
            }
            if (initials.length === 0) initials = 'C';

            // Create HTML element
            const newCrewHtml = `
                <div class="flex items-center justify-between p-3 border border-slate-200 rounded-xl bg-slate-50">
                    <div class="flex items-center gap-3">
                        <div class="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 text-xs font-bold shadow-sm">${initials}</div>
                        <div>
                            <h4 class="text-sm font-bold text-slate-800 leading-tight">${val}</h4>
                            <p class="text-[11px] text-slate-500">0 Active Tasks</p>
                        </div>
                    </div>
                    <button class="end-shift-btn text-critical hover:bg-critical/10 p-1.5 rounded transition" title="End Shift"><i data-icon="log-out" class="w-4 h-4 pointer-events-none"></i></button>
                </div>
            `;
            
            // Append to DOM
            crewListContainer.insertAdjacentHTML('beforeend', newCrewHtml);
            
            // Re-render icons if needed
            if (window.loadLocalIcons) {
                window.loadLocalIcons(crewListContainer.lastElementChild);
            }

            // Clear input
            newCrewInput.value = '';
            
            // Sync UI
            syncCrewData();

            // Show toast
            if (typeof showToast === 'function') {
                showToast(`Clocked in ${val}`, 'success');
            }
        }
    }

    // End shift logic (Event Delegation)
    if (crewListContainer) {
        crewListContainer.addEventListener('click', (e) => {
            const btn = e.target.closest('.end-shift-btn');
            if (btn) {
                const row = btn.closest('.flex.items-center.justify-between.p-3');
                if (row) {
                    const crewName = row.querySelector('h4').textContent;
                    row.remove();
                    
                    // Sync UI
                    syncCrewData();

                    if (typeof showToast === 'function') {
                        showToast(`${crewName} shifted out`, 'info');
                    }
                }
            }
        });
    }

    // Run on initial load to make sure everything matches
    syncCrewData();

})();
