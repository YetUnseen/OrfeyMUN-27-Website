document.addEventListener('DOMContentLoaded', () => {

    const pageTransition = document.createElement('div');
    pageTransition.className = 'page-transition';
    pageTransition.innerHTML = `
        <div class="transition-door transition-door-left"></div>
        <div class="transition-door transition-door-right"></div>
        <div class="transition-lyre" aria-hidden="true">
            <svg class="transition-lyre-art" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round">
                <path d="M6 3v12a6 6 0 0 0 12 0V3"></path>
                <path d="M6 3c0 4 3 6 6 6s6-2 6-6"></path>
                <g stroke-width="0.55">
                    <path d="M9.2 9v9"></path>
                    <path d="M10.15 9v9"></path>
                    <path d="M11.1 9v9"></path>
                    <path d="M12.05 9v9"></path>
                    <path d="M13 9v9"></path>
                    <path d="M13.95 9v9"></path>
                    <path d="M14.8 9v9"></path>
                </g>
                <path d="M9 21h6"></path>
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
        if (navigator.vibrate) navigator.vibrate(25);
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


   const committeesJSON = [
        { id: 1, title: "Committee I", category: "ga", icon: "ph-shield-check" },
        { id: 2, title: "Committee II", category: "ga", icon: "ph-scales" },
        { id: 3, title: "Committee III", category: "ga", icon: "ph-globe-hemisphere-east" },
        { id: 4, title: "Committee IV", category: "specialized", icon: "ph-lightning" },
        { id: 5, title: "Committee V", category: "crisis", icon: "ph-sword" },
        { id: 6, title: "Committee VI", category: "crisis", icon: "ph-skull" },
    ];

    const committeeGrid = document.getElementById('committeeGrid');
    function renderCommittees(data) {
        if(committeeGrid) {
            committeeGrid.innerHTML = '';
            data.forEach(committee => {
                const article = document.createElement('article');
                article.className = 'committee-card glass-panel';
                article.setAttribute('data-category', committee.category);
                article.innerHTML = `
                    <div class="card-icon"><i class="ph ${committee.icon}"></i></div>
                    <span class="tba-badge">Topic TBA</span>
                    <h3 style="margin: 0.5rem 0;">${committee.title}</h3>
                    <p style="margin-bottom: 1.5rem; flex-grow: 1;">The architects are currently crafting the study guide for this realm. Details will be revealed soon.</p>
                `;
                committeeGrid.appendChild(article);
            });

            const committeeCta = document.createElement('a');
            committeeCta.href = 'committees/';
            committeeCta.className = 'btn btn-primary btn-lg committee-cta';
            committeeCta.textContent = 'Enter Committees';
            const filterGroup = committeeGrid.parentElement.querySelector('.filter-group');
            filterGroup.parentElement.insertBefore(committeeCta, filterGroup);
        }
    }
    renderCommittees(committeesJSON);

    // Filter Logic
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
            isExpanded = !isExpanded;
            if (isExpanded) {
                mobileToggle.innerHTML = '<i class="ph ph-x"></i>';
                Object.assign(navLinks.style, {
                    display: 'flex', flexDirection: 'column', position: 'absolute',
                    top: '100%', left: '0', width: '100%', background: 'rgba(8, 8, 12, 0.58)',
                    padding: '2rem', borderBottom: '1px solid var(--border-color)',
                    backdropFilter: 'blur(16px) saturate(145%)',
                    WebkitBackdropFilter: 'blur(16px) saturate(145%)'
                });
            } else {
                mobileToggle.innerHTML = '<i class="ph ph-list"></i>';
                navLinks.style.display = 'none';
            }
        });

        // Close menu when clicking a link
        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                if (window.innerWidth <= 768) {
                    isExpanded = false;
                    mobileToggle.innerHTML = '<i class="ph ph-list"></i>';
                    navLinks.style.display = 'none';
                }
            });
        });
    }

});