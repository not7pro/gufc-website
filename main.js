/* ============================================================
   GUFC — Main JavaScript v3.0 (Light Theme)
   ============================================================ */

/* ── Nav: add scrolled class & shadow ── */
(function () {
  const nav = document.getElementById('nav');
  if (!nav) return;
  const update = () => nav.classList.toggle('scrolled', window.scrollY > 30);
  window.addEventListener('scroll', update, { passive: true });
  update();
})();

/* ── Mobile menu toggle ── */
(function () {
  const btn = document.getElementById('navToggle');
  const panel = document.getElementById('mobileNav');
  if (!btn || !panel) return;

  btn.addEventListener('click', () => {
    const open = btn.classList.toggle('open');
    panel.classList.toggle('open', open);
    btn.setAttribute('aria-expanded', String(open));
    panel.setAttribute('aria-hidden', String(!open));
    document.body.style.overflow = open ? 'hidden' : '';
  });

  panel.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      btn.classList.remove('open');
      panel.classList.remove('open');
      btn.setAttribute('aria-expanded', 'false');
      panel.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    });
  });
})();

/* ── Scroll reveal — IntersectionObserver ── */
(function () {
  const els = document.querySelectorAll(
    '.reveal, .reveal-left, .reveal-right, .reveal-scale'
  );
  if (!els.length) return;

  const io = new IntersectionObserver(
    entries => entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('is-visible');
        io.unobserve(e.target);
      }
    }),
    { threshold: 0.12, rootMargin: '0px 0px -50px 0px' }
  );

  els.forEach(el => io.observe(el));
})();

/* ── Count-up numbers ── */
(function () {
  const counters = document.querySelectorAll('.count-up');
  if (!counters.length) return;

  const ease = t => 1 - Math.pow(1 - t, 3);

  const animate = el => {
    const target = parseInt(el.dataset.target, 10);
    const dur    = 2200;
    const t0     = performance.now();
    const step   = now => {
      const p = Math.min((now - t0) / dur, 1);
      el.textContent = Math.round(ease(p) * target).toLocaleString();
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  const io = new IntersectionObserver(
    entries => entries.forEach(e => {
      if (e.isIntersecting) { animate(e.target); io.unobserve(e.target); }
    }),
    { threshold: 0.5 }
  );

  counters.forEach(el => io.observe(el));
})();

/* ── Active nav link highlighting ── */
(function () {
  const path = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav__link').forEach(a => {
    const href = a.getAttribute('href') || '';
    if (href && href !== '#' && path.startsWith(href.split('#')[0])) {
      a.classList.add('active');
    }
  });
})();

/* ── Smooth anchor scrolling (accounts for nav + subnav height) ── */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const id = a.getAttribute('href');
    if (!id || id === '#') return;
    const target = document.querySelector(id);
    if (!target) return;
    e.preventDefault();
    const navEl  = document.getElementById('nav');
    const subEl  = document.getElementById('product-lines-nav') ||
                   document.getElementById('brand-tabs');
    const offset = (navEl ? navEl.offsetHeight : 80) +
                   (subEl ? subEl.offsetHeight : 0) + 16;
    window.scrollTo({
      top: target.getBoundingClientRect().top + window.scrollY - offset,
      behavior: 'smooth'
    });
  });
});

/* ── Gentle hero image parallax ── */
(function () {
  const visual = document.querySelector('.hero__visual');
  if (!visual) return;
  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        const y = window.scrollY;
        visual.style.transform = `translateY(${y * 0.08}px)`;
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });
})();

/* ── Stagger brand tile float animation offsets ── */
(function () {
  document.querySelectorAll('.brand-tile').forEach((tile, i) => {
    const img = tile.querySelector('.brand-tile__product');
    if (img) img.style.animationDelay = `${i * 1.1}s`;
  });
})();

/* ── Timeline item scroll-triggered dot pulse ── */
(function () {
  const items = document.querySelectorAll('.timeline-item');
  if (!items.length) return;
  const io = new IntersectionObserver(
    entries => entries.forEach(e => e.target.classList.toggle('is-visible', e.isIntersecting)),
    { threshold: 0.4 }
  );
  items.forEach(el => io.observe(el));
})();

/* ── Newsletter submit handler ── */
function handleNewsletterSubmit(e) {
  e.preventDefault();
  const input = e.target.querySelector('input[type="email"]');
  const btn   = e.target.querySelector('button[type="submit"]');
  if (!input || !btn) return;
  const orig = btn.textContent;
  btn.textContent  = '✓ Subscribed';
  btn.style.background = '#1A8B5A';
  input.value    = '';
  input.disabled = true;
  btn.disabled   = true;
  setTimeout(() => {
    btn.textContent  = orig;
    btn.style.background = '';
    input.disabled = false;
    btn.disabled   = false;
  }, 4000);
}

/* ── Accessible: close mobile nav on outside click ── */
document.addEventListener('click', e => {
  const btn   = document.getElementById('navToggle');
  const panel = document.getElementById('mobileNav');
  if (!btn || !panel) return;
  if (!btn.contains(e.target) && !panel.contains(e.target) && panel.classList.contains('open')) {
    btn.classList.remove('open');
    panel.classList.remove('open');
    btn.setAttribute('aria-expanded', 'false');
    panel.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }
});
