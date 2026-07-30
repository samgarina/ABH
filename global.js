/* ==========================================================================
   GLOBAL.JS — shared across every page
   1. Injects the navbar fragment
   2. Highlights the active nav link (accessible aria-current)
   3. Wires the mobile hamburger menu
   4. Adds a shrink/glass state to the navbar on scroll
   5. Real scroll-triggered fade-ins (IntersectionObserver, not instant reveal)
   6. Lightweight lightbox for any .gallery-item / .act-item image
   7. Count-up animation for elements with [data-count-to]
   8. Safety-net lazy-loading for any <img> missing the attribute
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

    /* ---------- 1 & 2 & 3. Navbar injection + active link + mobile menu ---------- */
    const navSlot = document.getElementById('global-navbar');

    if (navSlot) {
        fetch('./navbar.html')
            .then(res => {
                if (!res.ok) throw new Error('Status code: ' + res.status);
                return res.text();
            })
            .then(markup => {
                navSlot.innerHTML = markup;
                initNavbar();
            })
            .catch(err => console.error('Error fetching global navbar:', err));
    } else {
        // Navbar already inline in the page (legacy pages)
        initNavbar();
    }

    function initNavbar() {
        const navbar = document.getElementById('site-navbar') || document.querySelector('.navbar');
        const toggle = document.getElementById('nav-toggle');
        const linksWrap = document.getElementById('nav-links-wrap');
        const links = document.querySelectorAll('.nav-links a');

        // Active page highlighting — compares each link's href to the current URL
        const currentPage = (location.pathname.split('/').pop() || 'home.html').toLowerCase();
        links.forEach(link => {
            const linkPage = (link.getAttribute('href') || '').toLowerCase();
            if (linkPage === currentPage) {
                link.setAttribute('aria-current', 'page');
            }
        });

        // Mobile hamburger toggle
        if (toggle && linksWrap) {
            toggle.addEventListener('click', () => {
                const isOpen = linksWrap.classList.toggle('is-open');
                toggle.setAttribute('aria-expanded', String(isOpen));
                toggle.setAttribute('aria-label', isOpen ? 'Close menu' : 'Open menu');
                document.body.style.overflow = isOpen ? 'hidden' : '';
            });

            // Close menu when a link is tapped (mobile)
            links.forEach(link => {
                link.addEventListener('click', () => {
                    linksWrap.classList.remove('is-open');
                    toggle.setAttribute('aria-expanded', 'false');
                    document.body.style.overflow = '';
                });
            });
        }

        // Shrink / deepen navbar on scroll
        if (navbar) {
            const onScroll = () => {
                navbar.classList.toggle('is-scrolled', window.scrollY > 40);
            };
            onScroll();
            window.addEventListener('scroll', onScroll, { passive: true });
        }
    }

    /* ---------- 5. Real scroll-triggered fade-ins ---------- */
    const fadeEls = document.querySelectorAll('.fade-in-element');
    if ('IntersectionObserver' in window && fadeEls.length) {
        const io = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('active');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });

        fadeEls.forEach(el => io.observe(el));
    } else {
        // Fallback: reveal everything immediately (older browsers / no JS observer support)
        fadeEls.forEach(el => el.classList.add('active'));
    }

    /* ---------- 6. Lightweight accessible lightbox ---------- */
    const lightboxTargets = document.querySelectorAll(
        '.gallery-item img, .act-item img, .gallery-grid img'
    );

    if (lightboxTargets.length) {
        const overlay = document.createElement('div');
        overlay.className = 'lightbox-overlay';
        overlay.setAttribute('role', 'dialog');
        overlay.setAttribute('aria-modal', 'true');
        overlay.setAttribute('aria-label', 'Image preview');
        overlay.innerHTML = `
            <button class="lightbox-close" aria-label="Close image preview">&times;</button>
            <img class="lightbox-image" src="" alt="">
        `;
        document.body.appendChild(overlay);

        const lbImage = overlay.querySelector('.lightbox-image');
        const lbClose = overlay.querySelector('.lightbox-close');
        let lastFocused = null;

        function openLightbox(imgEl) {
            lastFocused = document.activeElement;
            lbImage.src = imgEl.currentSrc || imgEl.src;
            lbImage.alt = imgEl.alt || '';
            overlay.classList.add('is-open');
            document.body.style.overflow = 'hidden';
            lbClose.focus();
        }

        function closeLightbox() {
            overlay.classList.remove('is-open');
            document.body.style.overflow = '';
            lbImage.src = '';
            if (lastFocused) lastFocused.focus();
        }

        lightboxTargets.forEach(img => {
            img.style.cursor = 'zoom-in';
            img.setAttribute('tabindex', '0');
            img.setAttribute('role', 'button');
            img.setAttribute('aria-label', 'Open image: ' + (img.alt || 'photo'));
            img.addEventListener('click', () => openLightbox(img));
            img.addEventListener('keydown', e => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    openLightbox(img);
                }
            });
        });

        lbClose.addEventListener('click', closeLightbox);
        overlay.addEventListener('click', e => {
            if (e.target === overlay) closeLightbox();
        });
        document.addEventListener('keydown', e => {
            if (e.key === 'Escape' && overlay.classList.contains('is-open')) closeLightbox();
        });
    }

    /* ---------- 7. Count-up statistics ---------- */
    const counters = document.querySelectorAll('[data-count-to]');
    if (counters.length && 'IntersectionObserver' in window) {
        const countIo = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (!entry.isIntersecting) return;
                const el = entry.target;
                const target = parseInt(el.getAttribute('data-count-to'), 10) || 0;
                const duration = 1400;
                const start = performance.now();

                function tick(now) {
                    const progress = Math.min((now - start) / duration, 1);
                    const eased = 1 - Math.pow(1 - progress, 3);
                    el.textContent = Math.round(eased * target).toLocaleString();
                    if (progress < 1) requestAnimationFrame(tick);
                }
                requestAnimationFrame(tick);
                observer.unobserve(el);
            });
        }, { threshold: 0.4 });

        counters.forEach(el => countIo.observe(el));
    }

    /* ---------- 8. Lazy-load safety net ---------- */
    document.querySelectorAll('img:not([loading])').forEach(img => {
        img.setAttribute('loading', 'lazy');
    });

    /* ---------- Subtle parallax on hero media ---------- */
    const heroMedia = document.querySelector('.hero-video');
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (heroMedia && !prefersReducedMotion) {
        let ticking = false;
        const applyParallax = () => {
            const offset = Math.min(window.scrollY * 0.25, 120);
            heroMedia.style.transform = `translateY(${offset}px) scale(1.08)`;
            ticking = false;
        };
        window.addEventListener('scroll', () => {
            if (!ticking) {
                requestAnimationFrame(applyParallax);
                ticking = true;
            }
        }, { passive: true });
    }

    /* ---------- Floating contact button + sticky mobile Book Now ---------- */
    const fab = document.querySelector('.floating-contact');
    if (fab) {
        const onFabScroll = () => {
            fab.classList.toggle('is-visible', window.scrollY > 300);
        };
        onFabScroll();
        window.addEventListener('scroll', onFabScroll, { passive: true });
    }
});
