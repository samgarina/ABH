/* ==========================================================================
   EXPLORE IMAGE SLIDESHOW — vanilla JS, no dependencies
   Scoped entirely to #exploreSlideshow. Safe to include on any page:
   it simply does nothing if that element isn't present.
   ========================================================================== */

(function () {
    const wrapper = document.getElementById('exploreSlideshow');
    if (!wrapper) return;

    const slides  = Array.from(wrapper.querySelectorAll('.explore-slide'));
    const dots    = Array.from(wrapper.querySelectorAll('.explore-dot'));
    const prevBtn = wrapper.querySelector('.explore-arrow--prev');
    const nextBtn = wrapper.querySelector('.explore-arrow--next');

    if (slides.length < 2) return; // nothing to rotate

    const AUTOPLAY_MS = 2500; // switch every 2.5s (within the requested 2–3s range)
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let current = Math.max(0, slides.findIndex(s => s.classList.contains('is-active')));
    let timer = null;
    let isPaused = false;

    function setActive(index) {
        slides[current].classList.remove('is-active');
        if (dots[current]) {
            dots[current].classList.remove('is-active');
            dots[current].setAttribute('aria-selected', 'false');
        }

        current = (index + slides.length) % slides.length;

        slides[current].classList.add('is-active');
        if (dots[current]) {
            dots[current].classList.add('is-active');
            dots[current].setAttribute('aria-selected', 'true');
        }
    }

    function goNext() { setActive(current + 1); }
    function goPrev() { setActive(current - 1); }

    function startAutoplay() {
        if (prefersReducedMotion) return; // respect the user's motion preference
        stopAutoplay();
        timer = setInterval(() => {
            if (!isPaused) goNext();
        }, AUTOPLAY_MS);
    }

    function stopAutoplay() {
        if (timer) clearInterval(timer);
        timer = null;
    }

    function restartAutoplay() {
        stopAutoplay();
        startAutoplay();
    }

    /* ---------- Preload every slide before turning the slideshow on,
       so the very first automatic transition is never janky. ---------- */
    function preloadAll() {
        const loaders = slides.map(img => {
            if (img.complete) return Promise.resolve();
            return new Promise(resolve => {
                img.addEventListener('load', resolve, { once: true });
                img.addEventListener('error', resolve, { once: true });
            });
        });
        return Promise.all(loaders);
    }

    /* ---------- Controls ---------- */
    dots.forEach((dot, i) => {
        dot.addEventListener('click', () => {
            setActive(i);
            restartAutoplay();
        });
    });

    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            goNext();
            restartAutoplay();
        });
    }
    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            goPrev();
            restartAutoplay();
        });
    }

    /* ---------- Pause on hover, resume on mouse leave ---------- */
    wrapper.addEventListener('mouseenter', () => { isPaused = true; });
    wrapper.addEventListener('mouseleave', () => { isPaused = false; });

    /* Pause while a control has keyboard focus (accessibility) */
    wrapper.addEventListener('focusin', () => { isPaused = true; });
    wrapper.addEventListener('focusout', () => { isPaused = false; });

    /* ---------- Init ---------- */
    preloadAll().then(startAutoplay);
})();

/*review section */

(function () {
  const wrapper = document.getElementById('reviewSlideshow');
  if (!wrapper) return;

  const slides = Array.from(wrapper.querySelectorAll('.review-slide'));
  if (slides.length < 2) return;

  const AUTOPLAY_MS = 6000;
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let current = Math.max(0, slides.findIndex(s => s.classList.contains('is-active')));
  let timer = null;

  function setActive(index) {
    slides[current].classList.remove('is-active');
    current = (index + slides.length) % slides.length;
    slides[current].classList.add('is-active');
  }

  function goNext() { 
    setActive(current + 1); 
  }

  function startAutoplay() {
    if (prefersReducedMotion) return;
    stopAutoplay();
    timer = setInterval(goNext, AUTOPLAY_MS);
  }

  function stopAutoplay() {
    if (timer) clearInterval(timer);
    timer = null;
  }

  // Initialize carousel directly
  setActive(current);
  startAutoplay();
})();