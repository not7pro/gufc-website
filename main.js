/* ============================================================
   GUFC — Gulf Union Foods Co. | Main JavaScript
   ============================================================ */

(function () {
  'use strict';

  /* ==================== NAVBAR ==================== */
  const navbar = document.querySelector('.navbar');
  const hamburger = document.querySelector('.hamburger');
  const mobileMenu = document.querySelector('.mobile-menu');
  const mobileOverlay = document.querySelector('.mobile-overlay');

  // Scroll-aware navbar
  function updateNav() {
    if (!navbar) return;
    const isTransparent = navbar.classList.contains('transparent');
    if (isTransparent) {
      if (window.scrollY > 60) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }
    } else {
      if (window.scrollY > 20) {
        navbar.classList.add('scrolled');
      }
    }
  }

  window.addEventListener('scroll', updateNav, { passive: true });
  updateNav();

  // Mobile hamburger
  if (hamburger) {
    hamburger.addEventListener('click', () => {
      const isOpen = hamburger.classList.toggle('open');
      mobileMenu?.classList.toggle('open', isOpen);
      mobileOverlay?.classList.toggle('open', isOpen);
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });
  }

  if (mobileOverlay) {
    mobileOverlay.addEventListener('click', closeMobileMenu);
  }

  function closeMobileMenu() {
    hamburger?.classList.remove('open');
    mobileMenu?.classList.remove('open');
    mobileOverlay?.classList.remove('open');
    document.body.style.overflow = '';
  }

  // Active nav link
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-link, .mobile-nav-link').forEach(link => {
    const href = link.getAttribute('href');
    if (href && href.includes(currentPage)) {
      link.classList.add('active');
    }
  });

  /* ==================== LANGUAGE TOGGLE ==================== */
  const langBtn = document.querySelector('.lang-toggle');
  const AR_CONTENT = {
    'hero-title-1': 'مرحباً بكم في شركة خليج الاتحاد للأغذية',
    'hero-desc-1':  'حيث الجودة تلتقي بالشغف والطعم يلتقي بالابتكار',
  };

  if (langBtn) {
    langBtn.addEventListener('click', () => {
      const html = document.documentElement;
      const isAR = html.getAttribute('lang') === 'ar';

      if (isAR) {
        html.setAttribute('lang', 'en');
        html.setAttribute('dir', 'ltr');
        langBtn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg> عربي`;
        document.querySelectorAll('[data-en]').forEach(el => {
          el.textContent = el.getAttribute('data-en');
        });
      } else {
        html.setAttribute('lang', 'ar');
        html.setAttribute('dir', 'rtl');
        langBtn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg> English`;
        document.querySelectorAll('[data-ar]').forEach(el => {
          el.textContent = el.getAttribute('data-ar');
        });
      }
    });
  }

  /* ==================== HERO SLIDER ==================== */
  const slides = document.querySelectorAll('.slide');
  const dots = document.querySelectorAll('.slider-dot');
  const prevBtn = document.querySelector('.slider-prev');
  const nextBtn = document.querySelector('.slider-next');

  let currentSlide = 0;
  let sliderInterval;

  function goToSlide(n) {
    slides.forEach(s => s.classList.remove('active'));
    dots.forEach(d => d.classList.remove('active'));
    currentSlide = (n + slides.length) % slides.length;
    if (slides[currentSlide]) slides[currentSlide].classList.add('active');
    if (dots[currentSlide]) dots[currentSlide].classList.add('active');
  }

  function nextSlide() { goToSlide(currentSlide + 1); }
  function prevSlide() { goToSlide(currentSlide - 1); }

  function startSlider() {
    if (slides.length < 2) return;
    sliderInterval = setInterval(nextSlide, 5500);
  }

  function resetSlider() {
    clearInterval(sliderInterval);
    startSlider();
  }

  if (slides.length > 0) {
    goToSlide(0);
    startSlider();

    dots.forEach((dot, i) => {
      dot.addEventListener('click', () => { goToSlide(i); resetSlider(); });
    });

    prevBtn?.addEventListener('click', () => { prevSlide(); resetSlider(); });
    nextBtn?.addEventListener('click', () => { nextSlide(); resetSlider(); });

    // Keyboard nav
    document.addEventListener('keydown', e => {
      if (e.key === 'ArrowLeft') { prevSlide(); resetSlider(); }
      if (e.key === 'ArrowRight') { nextSlide(); resetSlider(); }
    });

    // Touch swipe
    let touchStart = 0;
    const heroSlider = document.querySelector('.hero-slider');
    if (heroSlider) {
      heroSlider.addEventListener('touchstart', e => { touchStart = e.touches[0].clientX; }, { passive: true });
      heroSlider.addEventListener('touchend', e => {
        const diff = touchStart - e.changedTouches[0].clientX;
        if (Math.abs(diff) > 50) {
          diff > 0 ? nextSlide() : prevSlide();
          resetSlider();
        }
      });
    }
  }

  /* ==================== SCROLL REVEAL ==================== */
  const revealEls = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale');

  if (revealEls.length > 0) {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });

    revealEls.forEach(el => revealObserver.observe(el));
  }

  /* ==================== COUNTER ANIMATION ==================== */
  function easeOutQuart(t) {
    return 1 - Math.pow(1 - t, 4);
  }

  function animateCounter(el, target, duration = 2200, suffix = '') {
    const start = performance.now();
    const startVal = 0;

    function update(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = easeOutQuart(progress);
      const current = Math.floor(startVal + (target - startVal) * eased);
      el.textContent = current.toLocaleString() + suffix;
      if (progress < 1) requestAnimationFrame(update);
    }

    requestAnimationFrame(update);
  }

  const counterEls = document.querySelectorAll('[data-counter]');
  if (counterEls.length > 0) {
    const counterObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !entry.target.dataset.animated) {
          entry.target.dataset.animated = 'true';
          const target = parseInt(entry.target.dataset.counter, 10);
          const suffix = entry.target.dataset.suffix || '';
          const duration = parseInt(entry.target.dataset.duration || '2200', 10);
          animateCounter(entry.target, target, duration, suffix);
          counterObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });

    counterEls.forEach(el => counterObserver.observe(el));
  }

  /* ==================== BRAND TABS (brands page) ==================== */
  const brandTabs = document.querySelectorAll('.brand-tab');
  brandTabs.forEach(tab => {
    tab.addEventListener('click', (e) => {
      const target = tab.getAttribute('data-target');
      if (target) {
        e.preventDefault();
        const section = document.getElementById(target);
        if (section) {
          const offset = 140;
          const top = section.getBoundingClientRect().top + window.scrollY - offset;
          window.scrollTo({ top, behavior: 'smooth' });
        }
      }
    });
  });

  // Update active tab on scroll
  const brandSections = document.querySelectorAll('.brand-section[id]');
  if (brandSections.length > 0 && brandTabs.length > 0) {
    const tabScrollObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.id;
          brandTabs.forEach(t => {
            t.classList.toggle('active', t.getAttribute('data-target') === id);
          });
        }
      });
    }, { threshold: 0.3 });

    brandSections.forEach(s => tabScrollObserver.observe(s));
  }

  /* ==================== PARALLAX (subtle) ==================== */
  const parallaxEls = document.querySelectorAll('[data-parallax]');
  if (parallaxEls.length > 0 && window.matchMedia('(prefers-reduced-motion: no-preference)').matches) {
    window.addEventListener('scroll', () => {
      const scrollY = window.scrollY;
      parallaxEls.forEach(el => {
        const speed = parseFloat(el.dataset.parallax) || 0.3;
        el.style.transform = `translateY(${scrollY * speed}px)`;
      });
    }, { passive: true });
  }

  /* ==================== CONTACT FORM ==================== */
  const contactForm = document.getElementById('contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const btn = contactForm.querySelector('button[type="submit"]');
      const originalText = btn.textContent;

      btn.textContent = 'Sending...';
      btn.disabled = true;

      setTimeout(() => {
        btn.textContent = '✓ Message Sent!';
        btn.style.background = '#10b981';
        contactForm.reset();

        setTimeout(() => {
          btn.textContent = originalText;
          btn.disabled = false;
          btn.style.background = '';
        }, 3000);
      }, 1500);
    });
  }

  const distributorForm = document.getElementById('distributor-form');
  if (distributorForm) {
    distributorForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const btn = distributorForm.querySelector('button[type="submit"]');
      btn.textContent = '✓ Inquiry Sent!';
      btn.style.background = '#10b981';
      distributorForm.reset();
      setTimeout(() => {
        btn.textContent = 'Submit Inquiry';
        btn.style.background = '';
      }, 3000);
    });
  }

  /* ==================== SMOOTH SCROLL for anchor links ==================== */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', e => {
      const targetId = anchor.getAttribute('href');
      if (targetId === '#') return;
      const targetEl = document.querySelector(targetId);
      if (targetEl) {
        e.preventDefault();
        const offset = 100;
        window.scrollTo({
          top: targetEl.getBoundingClientRect().top + window.scrollY - offset,
          behavior: 'smooth'
        });
      }
    });
  });

  /* ==================== EVOLUTION TIMELINE drag scroll ==================== */
  const evolutionTrackWrap = document.querySelector('.evolution-track-wrap');
  if (evolutionTrackWrap) {
    let isDown = false;
    let startX;
    let scrollLeft;

    evolutionTrackWrap.addEventListener('mousedown', e => {
      isDown = true;
      evolutionTrackWrap.style.cursor = 'grabbing';
      startX = e.pageX - evolutionTrackWrap.offsetLeft;
      scrollLeft = evolutionTrackWrap.scrollLeft;
    });

    evolutionTrackWrap.addEventListener('mouseleave', () => { isDown = false; evolutionTrackWrap.style.cursor = 'grab'; });
    evolutionTrackWrap.addEventListener('mouseup', () => { isDown = false; evolutionTrackWrap.style.cursor = 'grab'; });
    evolutionTrackWrap.addEventListener('mousemove', e => {
      if (!isDown) return;
      e.preventDefault();
      const x = e.pageX - evolutionTrackWrap.offsetLeft;
      const walk = (x - startX) * 2;
      evolutionTrackWrap.scrollLeft = scrollLeft - walk;
    });

    evolutionTrackWrap.style.cursor = 'grab';
  }

  /* ==================== Back to Top ==================== */
  const totop = document.createElement('button');
  totop.id = 'back-to-top';
  totop.innerHTML = '↑';
  totop.setAttribute('aria-label', 'Back to top');
  totop.style.cssText = `
    position: fixed; bottom: 28px; right: 28px; z-index: 500;
    width: 48px; height: 48px; border-radius: 50%;
    background: var(--c-blue); color: #fff; font-size: 1.2rem;
    display: flex; align-items: center; justify-content: center;
    box-shadow: 0 4px 20px rgba(26,28,117,0.4); border: none;
    cursor: pointer; opacity: 0; transform: translateY(20px);
    transition: opacity 0.3s ease, transform 0.3s ease;
  `;

  document.body.appendChild(totop);

  window.addEventListener('scroll', () => {
    if (window.scrollY > 500) {
      totop.style.opacity = '1';
      totop.style.transform = 'translateY(0)';
    } else {
      totop.style.opacity = '0';
      totop.style.transform = 'translateY(20px)';
    }
  }, { passive: true });

  totop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

})();
