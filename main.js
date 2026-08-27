/* ============================================================
   GUFC — Main JavaScript
   Handles: Nav, Reveal animations, Count-up, Mobile menu
   ============================================================ */

/* ── Nav scroll behaviour ── */
(function () {
  const nav = document.getElementById('nav');
  if (!nav) return;
  const onScroll = () => {
    nav.classList.toggle('scrolled', window.scrollY > 40);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
})();

/* ── Mobile menu toggle ── */
(function () {
  const toggle = document.getElementById('navToggle');
  const mobileNav = document.getElementById('mobileNav');
  if (!toggle || !mobileNav) return;

  toggle.addEventListener('click', () => {
    const isOpen = toggle.classList.toggle('open');
    mobileNav.classList.toggle('open', isOpen);
    toggle.setAttribute('aria-expanded', String(isOpen));
    mobileNav.setAttribute('aria-hidden', String(!isOpen));
    document.body.style.overflow = isOpen ? 'hidden' : '';
  });

  // Close when clicking a link
  mobileNav.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      toggle.classList.remove('open');
      mobileNav.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
      mobileNav.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    });
  });
})();

/* ── Intersection Observer — scroll reveal ── */
(function () {
  const selectors = [
    '.reveal',
    '.reveal-left',
    '.reveal-right',
    '.reveal-scale',
  ].join(', ');

  const elements = document.querySelectorAll(selectors);
  if (!elements.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target); // fire only once
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -60px 0px' }
  );

  elements.forEach((el) => observer.observe(el));
})();

/* ── Count-up numbers ── */
(function () {
  const counters = document.querySelectorAll('.count-up');
  if (!counters.length) return;

  const easeOut = (t) => 1 - Math.pow(1 - t, 3); // cubic ease

  const animateCounter = (el) => {
    const target = parseInt(el.getAttribute('data-target'), 10);
    const duration = 2000; // ms
    const start = performance.now();

    const step = (now) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const value = Math.round(easeOut(progress) * target);
      el.textContent = value.toLocaleString();
      if (progress < 1) requestAnimationFrame(step);
    };

    requestAnimationFrame(step);
  };

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.5 }
  );

  counters.forEach((el) => observer.observe(el));
})();

/* ── Active nav link based on current page ── */
(function () {
  const links = document.querySelectorAll('.nav__link');
  const path = window.location.pathname.split('/').pop() || 'index.html';
  links.forEach((link) => {
    const href = link.getAttribute('href') || '';
    if (href && path && href.includes(path.replace('.html', ''))) {
      link.classList.add('active');
    }
  });
})();

/* ── Active product sub-nav tab on scroll ── */
(function () {
  const tabs = document.querySelectorAll('.product-subnav__tab');
  if (!tabs.length) return;

  const sections = Array.from(tabs)
    .map((tab) => {
      const href = tab.getAttribute('href');
      return href ? document.querySelector(href) : null;
    })
    .filter(Boolean);

  if (!sections.length) return;

  const onScroll = () => {
    let current = sections[0];
    sections.forEach((sec) => {
      if (window.scrollY + 160 >= sec.offsetTop) current = sec;
    });
    tabs.forEach((tab) => {
      tab.classList.toggle(
        'active',
        tab.getAttribute('href') === '#' + current.id
      );
    });
  };

  window.addEventListener('scroll', onScroll, { passive: true });
})();

/* ── Newsletter submit handler ── */
function handleNewsletterSubmit(e) {
  e.preventDefault();
  const input = e.target.querySelector('input[type="email"]');
  const btn   = e.target.querySelector('button');
  if (!input || !btn) return;

  const orig = btn.textContent;
  btn.textContent = 'Subscribed ✓';
  btn.style.background = '#4caf50';
  input.value = '';
  input.disabled = true;
  btn.disabled = true;

  setTimeout(() => {
    btn.textContent = orig;
    btn.style.background = '';
    input.disabled = false;
    btn.disabled = false;
  }, 4000);
}

/* ── Smooth anchor scrolling ── */
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener('click', function (e) {
    const target = document.querySelector(this.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    const navH = parseInt(
      getComputedStyle(document.documentElement).getPropertyValue('--nav-h') || '80',
      10
    );
    const top = target.getBoundingClientRect().top + window.scrollY - navH - 20;
    window.scrollTo({ top, behavior: 'smooth' });
  });
});

/* ── Parallax hero orbs (lightweight) ── */
(function () {
  const orbs = document.querySelectorAll('.hero__orb');
  if (!orbs.length) return;

  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        const sy = window.scrollY;
        orbs.forEach((orb, i) => {
          const speed = (i + 1) * 0.15;
          orb.style.transform = `translateY(${sy * speed}px)`;
        });
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });
})();

/* ── Brand card stagger animation on hover (portfolio grid) ── */
(function () {
  const grid = document.querySelector('.portfolio__grid');
  if (!grid) return;

  const cards = grid.querySelectorAll('.brand-card');
  cards.forEach((card, i) => {
    card.style.setProperty('--card-index', i);
    // Stagger float animation offset per card
    const img = card.querySelector('.brand-card__img');
    if (img) img.style.animationDelay = `${i * 0.9}s`;
  });
})();
