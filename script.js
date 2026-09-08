document.addEventListener('DOMContentLoaded', () => {

    const pageTransition = document.createElement('div');
    pageTransition.className = 'page-transition';
    pageTransition.innerHTML = `
        <div class="transition-door transition-door-left"></div>
        <div class="transition-door transition-door-right"></div>
        <div class="transition-lyre" aria-hidden="true">
            <svg class="transition-lyre-art" viewBox="0 0 24 28" fill="none" stroke="currentColor" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round">
                <path d="M5 4c-3 3-2.5 12 1 16 1.2 1.4 2.7 2.2 5 2.8"></path>
                <path d="M19 4c3 3 2.5 12-1 16-1.2 1.4-2.7 2.2-5 2.8"></path>
                <path d="M5 4c0-1.5 1.3-2.5 2.6-2.1 1.1.3 1.7 1.5 1.1 2.5-.5.9-1.8 1.1-2.6.4"></path>
                <path d="M19 4c0-1.5-1.3-2.5-2.6-2.1-1.1.3-1.7 1.5-1.1 2.5.5.9 1.8 1.1 2.6.4"></path>
                <path d="M4 7h16"></path>
                <path d="M8 22c0-2 1.5-3 4-3s4 1 4 3v3H8z"></path>
                <path d="M9 25h6"></path>
                <g stroke-width="0.5">
                    <path d="M9.5 7v15"></path>
                    <path d="M10.75 7v15"></path>
                    <path d="M12 7v15"></path>
                    <path d="M13.25 7v15"></path>
                    <path d="M14.5 7v15"></path>
                </g>
            </svg>
        </div>
    `;
    document.body.appendChild(pageTransition);
    const isScrollDestination = ['#about', '#faq'].includes(window.location.hash.toLowerCase());
    const skipInitialOpening = isScrollDestination;

    if (skipInitialOpening) {
        pageTransition.classList.add('is-hidden', 'no-transition');
    } else {
        pageTransition.classList.add('initial-opening');
        requestAnimationFrame(() => {
            requestAnimationFrame(() => pageTransition.classList.add('is-hidden'));
        });
        setTimeout(() => pageTransition.classList.remove('initial-opening'), 800);
    }

    const scrollToTarget = (target, updateHistory = true) => {
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            target.scrollIntoView();
            return;
        }

        const startPosition = window.scrollY;
        const targetPosition = target.getBoundingClientRect().top + startPosition - 100;
        const distance = targetPosition - startPosition;
        const duration = 275;
        let startTime;

        document.body.classList.add('is-anchor-scrolling');

        function animateScroll(timestamp) {
            if (!startTime) startTime = timestamp;

            const progress = Math.min((timestamp - startTime) / duration, 1);
            const easedProgress = progress < 0.5
                ? 2 * progress * progress
                : 1 - Math.pow(-2 * progress + 2, 2) / 2;

            window.scrollTo(0, startPosition + distance * easedProgress);

            if (progress < 1) {
                requestAnimationFrame(animateScroll);
            } else {
                document.body.classList.remove('is-anchor-scrolling');
            }
        }

        requestAnimationFrame(animateScroll);

        if (updateHistory) {
            history.pushState(null, '', `#${target.id}`);
        }
    };

    // Use a consistent, slower animation for in-page navigation.
    document.querySelectorAll('a[href^="#"]').forEach(link => {
        link.addEventListener('click', event => {
            const targetId = link.getAttribute('href');
            if (targetId === '#') return;

            const target = document.querySelector(targetId);

            if (!target) return;

            event.preventDefault();
            scrollToTarget(target);
        });
    });

    // Add touch feedback without affecting normal text selection.
    document.addEventListener('pointerdown', event => {
        const control = event.target.closest('a, button');
        if (!control || event.pointerType !== 'touch') return;

        control.classList.add('touch-pressed');
        if (navigator.vibrate) navigator.vibrate(75);
    });

    ['pointerup', 'pointercancel', 'pointerleave'].forEach(eventName => {
        document.addEventListener(eventName, event => {
            const control = event.target.closest('a, button');
            if (control) control.classList.remove('touch-pressed');
        });
    });

    document.addEventListener('contextmenu', event => {
        if (event.target.closest('.btn, .nav-link, .filter-btn, .mobile-toggle')) {
            event.preventDefault();
        }
    });

    // A restrained gold-dust layer for atmosphere; no lightning or rain.
    const canvas = document.getElementById('ambient-canvas');
    if (canvas) {
        const context = canvas.getContext('2d');
        let canvasWidth;
        let canvasHeight;
        let dust = [];

        function resizeDustCanvas() {
            canvasWidth = canvas.width = window.innerWidth;
            canvasHeight = canvas.height = window.innerHeight;
        }

        function createDust() {
            const dustCount = window.innerWidth < 768 ? 36 : 70;
            dust = Array.from({ length: dustCount }, () => ({
                x: Math.random() * canvasWidth,
                y: Math.random() * canvasHeight,
                radius: Math.random() * 1.4 + 0.45,
                speed: Math.random() * 0.35 + 0.12,
                drift: Math.random() * 0.35 - 0.175,
                opacity: Math.random() * 0.38 + 0.18
            }));
        }

        function animateDust() {
            context.clearRect(0, 0, canvasWidth, canvasHeight);

            dust.forEach(particle => {
                particle.y -= particle.speed;
                particle.x += particle.drift;

                if (particle.y < -4) {
                    particle.y = canvasHeight + 4;
                    particle.x = Math.random() * canvasWidth;
                }
                if (particle.x < -4) particle.x = canvasWidth + 4;
                if (particle.x > canvasWidth + 4) particle.x = -4;

                context.fillStyle = `rgba(212, 175, 55, ${particle.opacity})`;
                context.beginPath();
                context.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
                context.fill();
            });

            requestAnimationFrame(animateDust);
        }

        resizeDustCanvas();
        createDust();
        window.addEventListener('resize', () => {
            resizeDustCanvas();
            createDust();
        });
        animateDust();
    }

    // Apply the same scroll motion when arriving through a page link or browser history.
    if (window.location.hash) {
        const initialTarget = document.querySelector(window.location.hash);
        if (initialTarget) {
            window.scrollTo(0, 0);
            requestAnimationFrame(() => scrollToTarget(initialTarget, false));
        }
    }

    window.addEventListener('popstate', () => {
        if (window.location.hash) {
            const target = document.querySelector(window.location.hash);
            if (target) scrollToTarget(target, false);
        } else {
            scrollToTarget(document.body, false);
        }
    });

    document.addEventListener('click', event => {
        const link = event.target.closest('a[href$=".html"], a[href*=".html#"], a[href$="/"]');
        if (!link) return;

        const destination = new URL(link.href, window.location.href);
        if (
            destination.origin !== window.location.origin ||
            destination.pathname === window.location.pathname ||
            ['#about', '#faq'].includes(destination.hash.toLowerCase())
        ) return;

        event.preventDefault();
        pageTransition.classList.remove('is-hidden');
        pageTransition.classList.add('is-visible');
        setTimeout(() => { window.location.href = destination.href; }, 1000);
    });
    
    // --- 1. Opaque Navbar Scroll Logic ---
    const navbar = document.getElementById('navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // --- 2. Committee Section Setup & Filter Logic ---
    const committeeGrid = document.getElementById('committeeGrid');
    
    // Inject the 'Enter Committees' CTA button just before the filters, if the grid exists
    if (committeeGrid && !document.querySelector('.committee-cta')) {
        const committeeCta = document.createElement('a');
        committeeCta.href = 'committees/';
        committeeCta.className = 'btn btn-primary btn-lg committee-cta';
        committeeCta.textContent = 'Enter Committees';
        const filterGroup = committeeGrid.parentElement.querySelector('.filter-group');
        if (filterGroup) {
            filterGroup.parentElement.insertBefore(committeeCta, filterGroup);
        }
    }

    // Filter Logic for HTML-rendered cards
    const filterBtns = document.querySelectorAll('.filter-btn');
    filterBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const selectedButton = e.currentTarget;
            filterBtns.forEach(b => b.classList.remove('active'));
            selectedButton.classList.add('active');
            
            const filterValue = selectedButton.getAttribute('data-filter');
            const newlyRenderedCards = document.querySelectorAll('.committee-card');
            
            newlyRenderedCards.forEach(card => {
                const category = card.getAttribute('data-category');
                
                // Show 'all' or exactly the category clicked
                if (filterValue === 'all' || filterValue === category) {
                    card.style.display = 'flex';
                    setTimeout(() => {
                        card.style.opacity = '1';
                        card.style.transform = 'translateY(0)';
                    }, 10);
                } else {
                    card.style.opacity = '0';
                    card.style.transform = 'translateY(10px)';
                    setTimeout(() => { card.style.display = 'none'; }, 300);
                }
            });
        });
    });

    // --- 3. Mobile Menu Toggle ---
    const mobileToggle = document.querySelector('.mobile-toggle');
    const navLinks = document.querySelector('.nav-links');
    
    if (mobileToggle) {
        let isExpanded = false;
        mobileToggle.addEventListener('click', () => {
            // Haptic feedback (crisp 50ms vibration)
            if (navigator.vibrate) navigator.vibrate(50);
            
            isExpanded = !isExpanded;
            if (isExpanded) {
                mobileToggle.innerHTML = '<i class="ph ph-x"></i>';
                navLinks.classList.add('mobile-active');
            } else {
                mobileToggle.innerHTML = '<i class="ph ph-list"></i>';
                navLinks.classList.remove('mobile-active');
            }
        });

        // Close menu with a slick fade out when clicking a link
        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                if (window.innerWidth <= 768) {
                    isExpanded = false;
                    mobileToggle.innerHTML = '<i class="ph ph-list"></i>';
                    navLinks.classList.remove('mobile-active');
                }
            });
        });
    }

});