/* ==========================================================================
   ABRAMOV ARCHITECTURE — interactions
   ========================================================================== */
(() => {
  'use strict';

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ---------- Loaded class for hero entrance ----------
  requestAnimationFrame(() => document.body.classList.add('is-loaded'));

  // ---------- Nav: scroll state + mobile toggle ----------
  const nav = document.querySelector('.nav');
  const toggle = nav.querySelector('.nav__toggle');
  const menu = nav.querySelector('.nav__menu');

  const onScroll = () => {
    nav.classList.toggle('is-scrolled', window.scrollY > 24);
    // progress bar
    const h = document.documentElement.scrollHeight - window.innerHeight;
    const p = Math.max(0, Math.min(1, window.scrollY / Math.max(1, h)));
    document.querySelector('.scroll-progress').style.width = (p * 100).toFixed(2) + '%';
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  toggle.addEventListener('click', () => {
    const isOpen = nav.classList.toggle('is-open');
    toggle.setAttribute('aria-expanded', String(isOpen));
    document.body.style.overflow = isOpen ? 'hidden' : '';
  });
  // close menu when a link is tapped (mobile)
  menu.addEventListener('click', (e) => {
    if (e.target.closest('a') && nav.classList.contains('is-open')) {
      nav.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    }
  });

  // ---------- Parallax on hero blueprint ----------
  const bp = document.querySelector('.hero__blueprint');
  if (bp && !reduce) {
    let raf = 0;
    const update = () => {
      raf = 0;
      const y = Math.min(window.scrollY, 800);
      bp.style.setProperty('--py', (y * 0.18) + 'px');
    };
    window.addEventListener('scroll', () => {
      if (!raf) raf = requestAnimationFrame(update);
    }, { passive: true });
  }

  // ---------- Reveal on scroll ----------
  const revealEls = document.querySelectorAll('.section [data-reveal]');
  if ('IntersectionObserver' in window && !reduce) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add('is-in');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -10% 0px' });
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add('is-in'));
  }

  // ---------- Tilt cards (services) ----------
  const tiltEls = document.querySelectorAll('[data-tilt]');
  if (!reduce && matchMedia('(hover: hover) and (pointer: fine)').matches) {
    tiltEls.forEach((el) => {
      el.addEventListener('mousemove', (e) => {
        const r = el.getBoundingClientRect();
        const cx = (e.clientX - r.left) / r.width - 0.5;
        const cy = (e.clientY - r.top) / r.height - 0.5;
        el.style.setProperty('--ry', (cx * 6).toFixed(2) + 'deg');
        el.style.setProperty('--rx', (-cy * 6).toFixed(2) + 'deg');
      });
      el.addEventListener('mouseleave', () => {
        el.style.setProperty('--rx', '0deg');
        el.style.setProperty('--ry', '0deg');
      });
    });
  }

  // ---------- Stat counters ----------
  const counters = document.querySelectorAll('[data-count]');
  if (counters.length && 'IntersectionObserver' in window && !reduce) {
    const cio = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        const el = e.target;
        const target = parseInt(el.dataset.count, 10) || 0;
        const dur = 1400;
        const t0 = performance.now();
        const tick = (now) => {
          const t = Math.min(1, (now - t0) / dur);
          const eased = 1 - Math.pow(1 - t, 3);
          el.textContent = Math.round(target * eased).toLocaleString('he-IL');
          if (t < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
        cio.unobserve(el);
      });
    }, { threshold: 0.4 });
    counters.forEach((c) => cio.observe(c));
  }

  // ---------- Testimonials carousel ----------
  const stage = document.querySelector('[data-voices]');
  if (stage) {
    const voices = stage.querySelectorAll('.voice');
    const tabs = document.querySelectorAll('.voices__nav button');
    let idx = 0;
    let timer = 0;

    const go = (n) => {
      idx = (n + voices.length) % voices.length;
      voices.forEach((v, i) => v.classList.toggle('voice--active', i === idx));
      tabs.forEach((t, i) => t.setAttribute('aria-selected', i === idx ? 'true' : 'false'));
    };
    tabs.forEach((t) => t.addEventListener('click', () => {
      go(parseInt(t.dataset.go, 10));
      restart();
    }));
    const restart = () => {
      clearInterval(timer);
      if (!reduce) timer = setInterval(() => go(idx + 1), 6500);
    };
    restart();

    // pause on hover/focus
    stage.addEventListener('mouseenter', () => clearInterval(timer));
    stage.addEventListener('mouseleave', restart);
    stage.addEventListener('focusin', () => clearInterval(timer));
    stage.addEventListener('focusout', restart);
  }

  // ---------- Form: graceful "submit" → WhatsApp handoff ----------
  const form = document.querySelector('.contact__form');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const data = new FormData(form);
      const name = (data.get('name') || '').toString().trim();
      const phone = (data.get('phone') || '').toString().trim();
      const email = (data.get('email') || '').toString().trim();
      const type = (data.get('type') || '').toString().trim();
      const msg = (data.get('message') || '').toString().trim();

      if (!name || !phone) {
        const target = !name ? form.querySelector('#f-name') : form.querySelector('#f-phone');
        target.focus();
        target.style.borderBottomColor = '#C99F5C';
        return;
      }

      const lines = [
        'שלום, אשמח להצעת מחיר.',
        `שם: ${name}`,
        `טלפון: ${phone}`,
        email && `דוא״ל: ${email}`,
        type && `סוג פרויקט: ${type}`,
        msg && `פרטים: ${msg}`,
      ].filter(Boolean);

      const url = 'https://wa.me/972545864250?text=' + encodeURIComponent(lines.join('\n'));
      window.open(url, '_blank', 'noopener');
    });
  }
})();
