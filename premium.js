/* ============================================================
   GUFC — Premium Experience Layer v1.0
   Additive: works on every page, degrades gracefully.
   ============================================================ */
(function () {
  'use strict';

  const doc = document.documentElement;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const lerp = (a, b, t) => a + (b - a) * t;
  const clamp = (v, a, b) => Math.min(Math.max(v, a), b);

  /* ═════════════ 1 · MIDNIGHT MODE ═════════════ */
  const THEME_KEY = 'gufc-theme';

  function luminance(rgb) {
    const m = rgb.match(/[\d.]+/g);
    if (!m) return 1;
    const [r, g, b] = m.map(Number);
    const a = m[3] !== undefined ? Number(m[3]) : 1;
    return { lum: (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255, alpha: a };
  }

  /* Tag sections that are *already* dark so they keep their original look */
  function tagDarkSections() {
    const seen = new Set();
    const walk = (el, depth) => {
      if (!el || depth > 3 || seen.has(el) || el.classList.contains('gx-ui')) return;
      seen.add(el);
      const cs = getComputedStyle(el);
      const res = luminance(cs.backgroundColor);
      if (res && res.alpha > 0.85 && res.lum < 0.3 && el.offsetHeight > 24) {
        el.classList.add('keep-dark');
        return; // children are restored with the parent
      }
      Array.from(el.children).forEach(c => walk(c, depth + 1));
    };
    Array.from(document.body.children).forEach(c => walk(c, 0));
  }

  function applyTheme(theme) {
    if (theme === 'dark') { tagDarkSections(); doc.setAttribute('data-theme', 'dark'); }
    else doc.removeAttribute('data-theme');
    const btn = document.querySelector('.gx-theme-toggle');
    if (btn) {
      btn.setAttribute('aria-pressed', theme === 'dark');
      btn.setAttribute('data-tip', theme === 'dark' ? 'Daylight mode' : 'Midnight mode');
    }
  }

  function buildThemeToggle() {
    const btn = document.createElement('button');
    btn.className = 'gx-theme-toggle gx-ui';
    btn.type = 'button';
    btn.setAttribute('aria-label', 'Toggle midnight mode');
    btn.setAttribute('data-tip', 'Midnight mode');
    btn.innerHTML =
      '<svg class="ico-sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true">' +
      '<circle cx="12" cy="12" r="4.2"/><path d="M12 2.5v2.2M12 19.3v2.2M2.5 12h2.2M19.3 12h2.2M5.3 5.3l1.6 1.6M17.1 17.1l1.6 1.6M5.3 18.7l1.6-1.6M17.1 6.9l1.6-1.6"/></svg>' +
      '<svg class="ico-moon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">' +
      '<path d="M20.4 14.6A8.6 8.6 0 0 1 9.4 3.6a.7.7 0 0 0-.9-.9A9.8 9.8 0 1 0 21.3 15.5a.7.7 0 0 0-.9-.9z"/></svg>';
    document.body.appendChild(btn);

    btn.addEventListener('click', e => {
      const next = doc.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      try { localStorage.setItem(THEME_KEY, next); } catch (_) {}

      if (!document.startViewTransition || reduced) { applyTheme(next); return; }
      const x = e.clientX || 40, y = e.clientY || innerHeight - 40;
      const r = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
      const t = document.startViewTransition(() => applyTheme(next));
      t.ready.then(() => {
        doc.animate(
          { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${r}px at ${x}px ${y}px)`] },
          { duration: 750, easing: 'cubic-bezier(.16,1,.3,1)', pseudoElement: '::view-transition-new(root)' }
        );
      }).catch(() => {});
    });
  }

  /* ═════════════ 2 · CUSTOM CURSOR REMOVED ═════════════ */
  function buildCursor() {}

  /* ═════════════ 3 · 3D TILT + MAGNETIC BUTTONS ═════════════ */
  function initTilt() {
    if (!finePointer || reduced) return;
    const sel = '.bc, .cert-tile, .factory-card, .mvv-card, .resp-card, .value-card, ' +
                '.career-card, .dist-card, .discover-card, .product-line-card, .brand-tile, [data-tilt]';
    document.querySelectorAll(sel).forEach(card => {
      card.classList.add('gx-tilt');
      if (getComputedStyle(card).position === 'static') card.style.position = 'relative';
      const glare = document.createElement('span');
      glare.className = 'gx-tilt-glare gx-ui';
      card.appendChild(glare);
      const max = card.classList.contains('bc') ? 7 : 5;

      card.addEventListener('mouseenter', () => card.classList.add('gx-tilting'));
      card.addEventListener('mousemove', e => {
        const r = card.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
        card.style.transform =
          `perspective(1000px) rotateX(${(0.5 - py) * max * 2}deg) rotateY(${(px - 0.5) * max * 2}deg) translateY(-8px) scale(1.012)`;
        card.style.setProperty('--gx-mx', px * 100 + '%');
        card.style.setProperty('--gx-my', py * 100 + '%');
      });
      card.addEventListener('mouseleave', () => {
        card.classList.remove('gx-tilting');
        card.style.transform = '';
      });
    });
  }

  function initMagnetic() {
    if (!finePointer || reduced) return;
    document.querySelectorAll('.pill, .gn__cta, .nav__cta, .btn, .btn-primary, .nav-cta').forEach(el => {
      el.classList.add('gx-magnetic');
      el.addEventListener('mousemove', e => {
        const r = el.getBoundingClientRect();
        const dx = (e.clientX - (r.left + r.width / 2)) * 0.28;
        const dy = (e.clientY - (r.top + r.height / 2)) * 0.4;
        el.style.translate = `${dx}px ${dy}px`;
      });
      el.addEventListener('mouseleave', () => { el.style.translate = ''; });
    });
  }

  /* ═════════════ 4 · CINEMATIC HERO ═════════════ */
  function initHero() {
    const hero = document.getElementById('hero');
    if (!hero || reduced) return;
    const copy = hero.querySelector('.hero__copy');

    /* scroll: hero recedes like a closing curtain */
    let ticking = false;
    const onScroll = () => {
      const p = clamp(window.scrollY / (hero.offsetHeight * 0.9), 0, 1);
      hero.style.transform = `scale(${1 - p * 0.055})`;
      hero.style.borderRadius = `0 0 ${p * 56}px ${p * 56}px`;
      if (copy) { copy.style.opacity = String(1 - p * 1.15); copy.style.translate = `0 ${-p * 60}px`; }
      ticking = false;
    };
    window.addEventListener('scroll', () => {
      if (!ticking) { ticking = true; requestAnimationFrame(onScroll); }
    }, { passive: true });
    onScroll();

    /* mouse: layered depth on the product stage */
    if (!finePointer) return;
    const layers = [
      ['#prod-main',   14, 10], ['#prod-left',  -26, -14], ['#prod-right', 30, 18],
      ['#prod-accent', -38, 22], ['#pstat-a',    22, -12], ['#pstat-b',   -20, 14],
      ['.hero__ghost', -18, -8], ['.hero__ambient--a', 34, 22], ['.hero__ambient--b', -28, -18]
    ].map(([s, x, y]) => ({ el: hero.querySelector(s), x, y, cx: 0, cy: 0 })).filter(l => l.el);

    let tx = 0, ty = 0, active = false;
    hero.addEventListener('mousemove', e => {
      const r = hero.getBoundingClientRect();
      tx = ((e.clientX - r.left) / r.width - 0.5) * 2;
      ty = ((e.clientY - r.top) / r.height - 0.5) * 2;
      active = true;
    });
    hero.addEventListener('mouseleave', () => { tx = 0; ty = 0; });
    (function loop() {
      if (active) {
        layers.forEach(l => {
          l.cx = lerp(l.cx, tx * l.x, 0.07); l.cy = lerp(l.cy, ty * l.y, 0.07);
          l.el.style.translate = `${l.cx.toFixed(2)}px ${l.cy.toFixed(2)}px`;
        });
      }
      requestAnimationFrame(loop);
    })();
  }

  /* ═════════════ 5 · PINNED HORIZONTAL BRAND SHOWCASE ═════════════ */
  function initPinnedBrands() {
    const taste = document.getElementById('taste');
    const car = document.getElementById('carousel');
    if (!taste || !car || reduced) return;

    const cards = car.querySelectorAll('.bc');
    cards.forEach(c => c.setAttribute('data-cursor', 'View'));

    const pin = document.createElement('div');
    pin.className = 'taste-pin';
    while (taste.firstChild) pin.appendChild(taste.firstChild);
    taste.appendChild(pin);

    const ui = document.createElement('div');
    ui.className = 'taste-progress gx-ui';
    ui.innerHTML = '<span class="taste-progress__count">01 / ' + String(cards.length).padStart(2, '0') +
      '</span><div class="taste-progress__bar"><i></i></div><span class="taste-progress__hint">Scroll</span>';
    pin.appendChild(ui);
    const bar = ui.querySelector('i'), count = ui.querySelector('.taste-progress__count');

    let maxX = 0, enabled = false, target = 0, current = 0;
    const mq = window.matchMedia('(min-width: 901px)');

    function layout() {
      if (!mq.matches) {
        taste.classList.remove('is-pinned');
        taste.style.height = '';
        enabled = false;
        return;
      }
      taste.classList.add('is-pinned');
      maxX = Math.max(car.scrollWidth - car.clientWidth, 0);
      enabled = maxX > 0;
      taste.style.height = enabled ? (window.innerHeight + maxX) + 'px' : '';
      update(true);
    }

    function update(snap) {
      if (!enabled) return;
      const rect = taste.getBoundingClientRect();
      const span = taste.offsetHeight - window.innerHeight;
      const p = clamp(-rect.top / span, 0, 1);
      target = p * maxX;
      if (snap) current = target;
      bar.style.transform = `scaleX(${p})`;
      const idx = clamp(Math.round(p * (cards.length - 1)) + 1, 1, cards.length);
      count.textContent = String(idx).padStart(2, '0') + ' / ' + String(cards.length).padStart(2, '0');
    }

    window.addEventListener('scroll', () => update(false), { passive: true });
    window.addEventListener('resize', layout);
    mq.addEventListener && mq.addEventListener('change', layout);

    (function loop() {
      if (enabled && !car.classList.contains('grab')) {
        current = lerp(current, target, 0.12);
        if (Math.abs(current - target) < 0.4) current = target;
        car.scrollLeft = current;
      } else if (car.classList.contains('grab')) {
        current = car.scrollLeft;
      }
      requestAnimationFrame(loop);
    })();

    layout();
    /* GSAP ScrollTrigger positions were measured before we re-parented — refresh them */
    setTimeout(() => { layout(); window.ScrollTrigger && window.ScrollTrigger.refresh(); }, 250);
    window.addEventListener('load', () => setTimeout(layout, 400));
  }

  /* ═════════════ BOOT ═════════════ */
  function boot() {
    let saved = null;
    try { saved = localStorage.getItem(THEME_KEY); } catch (_) {}
    buildThemeToggle();
    if (saved === 'dark') applyTheme('dark');
    buildCursor();
    initMagnetic();
    initTilt();
    initHero();
    /* wait for the page's own GSAP init (runs on window load) before re-parenting the carousel */
    if (document.readyState === 'complete') setTimeout(initPinnedBrands, 150);
    else window.addEventListener('load', () => setTimeout(initPinnedBrands, 150));
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
