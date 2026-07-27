document.addEventListener("DOMContentLoaded", () => {
    console.log("RoadSafe AI Admin Panel Initialized");

    // Add staggered fade-in animations to cards
    const cards = document.querySelectorAll('.fade-in-target');
    cards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.animation = `fadeIn 0.5s ease-out ${index * 0.1}s forwards`;
    });

    // ─── Mobile Sidebar Toggle ──────────────────────────────
    const toggleBtn = document.getElementById('sidebar-toggle');
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebarOverlay');

    if (toggleBtn && sidebar && overlay) {
        function toggleSidebar() {
            sidebar.classList.toggle('open');
            overlay.classList.toggle('active');
            
            // Prevent body scrolling when sidebar is open
            if (sidebar.classList.contains('open')) {
                document.body.style.overflow = 'hidden';
            } else {
                document.body.style.overflow = '';
            }
        }

        toggleBtn.addEventListener('click', toggleSidebar);
        overlay.addEventListener('click', toggleSidebar);

        // Close sidebar on window resize if moving to desktop width
        window.addEventListener('resize', () => {
            if (window.innerWidth > 1024 && sidebar.classList.contains('open')) {
                sidebar.classList.remove('open');
                overlay.classList.remove('active');
                document.body.style.overflow = '';
            }
        });

        // Swipe gesture to close sidebar on mobile
        let touchStartX = 0;
        let touchEndX = 0;
        
        document.addEventListener('touchstart', e => {
            touchStartX = e.changedTouches[0].screenX;
        }, { passive: true });

        document.addEventListener('touchend', e => {
            touchEndX = e.changedTouches[0].screenX;
            handleSwipe();
        }, { passive: true });

        function handleSwipe() {
            // Swipe left to close
            if (touchStartX - touchEndX > 50 && sidebar.classList.contains('open')) {
                toggleSidebar();
            }
        }
    }

    // ─── Profile Dropdown Toggle ──────────────────────────────
    const profileBtn = document.getElementById('profileDropdownBtn');
    const profileMenu = document.getElementById('profileDropdownMenu');

    if (profileBtn && profileMenu) {
        profileBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const isOpen = profileMenu.classList.contains('opacity-100');
            
            if (isOpen) {
                profileMenu.classList.remove('opacity-100', 'pointer-events-auto', 'translate-y-0', 'scale-100');
                profileMenu.classList.add('opacity-0', 'pointer-events-none', 'translate-y-2', 'scale-95');
                profileBtn.classList.remove('border-primary');
                profileBtn.classList.add('border-transparent');
            } else {
                profileMenu.classList.remove('opacity-0', 'pointer-events-none', 'translate-y-2', 'scale-95');
                profileMenu.classList.add('opacity-100', 'pointer-events-auto', 'translate-y-0', 'scale-100');
                profileBtn.classList.remove('border-transparent');
                profileBtn.classList.add('border-primary');
            }
        });

        // Close when clicking outside
        document.addEventListener('click', (e) => {
            if (!profileBtn.contains(e.target) && !profileMenu.contains(e.target)) {
                profileMenu.classList.remove('opacity-100', 'pointer-events-auto', 'translate-y-0', 'scale-100');
                profileMenu.classList.add('opacity-0', 'pointer-events-none', 'translate-y-2', 'scale-95');
                profileBtn.classList.remove('border-primary');
                profileBtn.classList.add('border-transparent');
            }
        });
    }

    // ─── Local SVG Icon Loader ──────────────────────────────
    window.loadLocalIcons = function(container = document) {
        const replaceIcon = (el, svgText) => {
            const wrapper = document.createElement('div');
            wrapper.innerHTML = svgText;
            const svgEl = wrapper.firstElementChild;
            if (el.className) {
                svgEl.setAttribute('class', (svgEl.getAttribute('class') || '') + ' ' + el.className);
            }
            el.replaceWith(svgEl);
        };

        container.querySelectorAll('i[data-icon]').forEach(async (el) => {
            const iconName = el.getAttribute('data-icon');
            try {
                const response = await fetch(`../../driver/images/icons/${iconName}.svg`);
                if (!response.ok) throw new Error("Local fetch failed");
                const svgText = await response.text();
                replaceIcon(el, svgText);
            } catch (error) {
                // Fallback to CDN for file:/// protocol
                try {
                    const cdnResponse = await fetch(`https://unpkg.com/lucide-static@0.321.0/icons/${iconName}.svg`);
                    if (cdnResponse.ok) {
                        const svgText = await cdnResponse.text();
                        replaceIcon(el, svgText);
                    } else {
                        console.error(`Failed to load icon from CDN: ${iconName}`);
                    }
                } catch (cdnError) {
                    console.error(`Failed to load icon: ${iconName}`, cdnError);
                }
            }
        });
    };

    // Load initial icons
    window.loadLocalIcons();

    // Note: CSV Export logic was moved to detection-log.js to handle filtering
});
