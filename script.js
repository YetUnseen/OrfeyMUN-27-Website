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
                <path d="M10 9v9"></path>
                <path d="M14 9v9"></path>
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
                    <a href="committees/" class="btn btn-outline" style="width: 100%;">Enter Realm</a>
                `;
                committeeGrid.appendChild(article);
            });
        }
    }
    renderCommittees(committeesJSON);

    // Filter Logic
    const filterBtns = document.querySelectorAll('.filter-btn');
    filterBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            filterBtns.forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            
            const filterValue = e.target.getAttribute('data-filter');
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
                    top: '100%', left: '0', width: '100%', background: 'var(--bg-primary)',
                    padding: '2rem', borderBottom: '1px solid var(--border-color)',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.9)'
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

    // --- 4. Underworld Embers (Particle Engine) ---
    const canvas = document.getElementById('ambient-canvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        let width, height;
        let particles = [];
        let lightningFlash = 0;
        let lightningX = 0;
        let lightningHeight = 0;
        let lightningBranches = [];
        let rainDrops = [];

        function resizeCanvas() {
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
        }
        window.addEventListener('resize', resizeCanvas);
        resizeCanvas();

        class Particle {
            constructor() {
                this.x = Math.random() * width;
                this.y = Math.random() * height;
                this.size = Math.random() * 2.5 + 0.5; // Ember size
                this.speedX = Math.random() * 1 - 0.5; // Drift left/right
                this.speedY = Math.random() * -1.5 - 0.5; // FLOAT UPWARDS (Underworld effect)
                this.opacity = Math.random() * 0.8 + 0.2;
                this.sinValue = Math.random() * Math.PI * 2; 
            }

            update() {
                this.sinValue += 0.02;
                this.x += this.speedX + Math.sin(this.sinValue) * 0.3;
                this.y += this.speedY; // Moving up

                // Loop particles back to bottom when they float off the top
                if (this.x > width) this.x = 0;
                if (this.x < 0) this.x = width;
                if (this.y < 0) {
                    this.y = height;
                    this.x = Math.random() * width;
                }
            }

            draw() {
                // Embers: Mixing Gold (#d4af37) and Fire Amber (#f59e0b)
                const isGold = Math.random() > 0.5;
                ctx.fillStyle = isGold ? `rgba(212, 175, 55, ${this.opacity})` : `rgba(245, 158, 11, ${this.opacity})`;
                
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fill();
                
                // Add a slight glow to larger embers
                if(this.size > 2) {
                    ctx.shadowBlur = 10;
                    ctx.shadowColor = "rgba(245, 158, 11, 0.8)";
                } else {
                    ctx.shadowBlur = 0;
                }
            }
        }

        function initParticles() {
            particles = [];
            rainDrops = [];
            // Optimize count for mobile performance
            const particleArea = width < 768 ? 9000 : 6000;
            const particleCount = Math.floor((width * height) / particleArea);
            for (let i = 0; i < particleCount; i++) {
                particles.push(new Particle());
            }

            const rainCount = width < 768 ? 45 : 90;
            for (let i = 0; i < rainCount; i++) {
                rainDrops.push({
                    x: Math.random() * width,
                    y: Math.random() * height,
                    length: Math.random() * 14 + 8,
                    speed: Math.random() * 5 + 7,
                    opacity: Math.random() * 0.18 + 0.08
                });
            }
        }
        initParticles();
        window.addEventListener('resize', initParticles);

        function triggerLightning() {
            lightningFlash = 1.4;
            lightningX = width * (Math.random() * 0.7 + 0.15);
            lightningHeight = height * (Math.random() * 0.28 + 0.2);
            lightningBranches = [];

            let branchX = lightningX;
            let branchY = 0;
            const segmentCount = 7;

            for (let index = 0; index < segmentCount; index++) {
                branchX += (Math.random() - 0.5) * width * 0.035;
                branchY += lightningHeight / segmentCount;
                lightningBranches.push({ x: branchX, y: branchY });
            }
        }

        window.addEventListener('pointerdown', event => {
            if (event.pointerType === 'touch') triggerLightning();
        }, { passive: true });

        function animateParticles() {
            ctx.clearRect(0, 0, width, height);
            particles.forEach(p => {
                p.update();
                p.draw();
            });

            ctx.lineWidth = 1;
            rainDrops.forEach(drop => {
                drop.y += drop.speed;
                drop.x -= 0.8;
                if (drop.y > height) {
                    drop.y = -drop.length;
                    drop.x = Math.random() * width;
                }

                ctx.strokeStyle = `rgba(180, 190, 205, ${drop.opacity})`;
                ctx.beginPath();
                ctx.moveTo(drop.x, drop.y);
                ctx.lineTo(drop.x - 2, drop.y + drop.length);
                ctx.stroke();
            });

            if (lightningFlash > 0) {
                const flashOpacity = Math.min(lightningFlash, 1) * 0.28;

                ctx.strokeStyle = `rgba(245, 220, 145, ${flashOpacity})`;
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(lightningX, 0);
                lightningBranches.forEach(point => ctx.lineTo(point.x, point.y));
                ctx.stroke();

                lightningBranches.forEach((point, index) => {
                    if (index < 2 || index > lightningBranches.length - 2) return;

                    ctx.beginPath();
                    ctx.moveTo(point.x, point.y);
                    ctx.lineTo(point.x + (Math.random() - 0.5) * width * 0.06, point.y + lightningHeight * 0.12);
                    ctx.stroke();
                });

                ctx.fillStyle = `rgba(245, 220, 145, ${flashOpacity * 0.18})`;
                ctx.fillRect(0, 0, width, height);
                lightningFlash -= 0.12;
            }

            requestAnimationFrame(animateParticles);
        }
        animateParticles();
    }
});