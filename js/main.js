/* ============================================
   BALICAKE - Site Scripts
   Carousel · Cookies · Animations · UI
============================================ */

(() => {
  'use strict';

  /* ---------- Helpers (safe DOM) ---------- */
  const el = (tag, attrs = {}, ...children) => {
    const node = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs)) {
      if (k === 'class') node.className = v;
      else if (k === 'dataset') Object.assign(node.dataset, v);
      else if (k.startsWith('on') && typeof v === 'function') node.addEventListener(k.slice(2).toLowerCase(), v);
      else if (v !== null && v !== undefined) node.setAttribute(k, v);
    }
    for (const c of children) {
      if (c == null) continue;
      node.appendChild(typeof c === 'string' ? document.createTextNode(c) : c);
    }
    return node;
  };
  const svgNS = 'http://www.w3.org/2000/svg';
  const svg = (attrs, ...paths) => {
    const s = document.createElementNS(svgNS, 'svg');
    for (const [k, v] of Object.entries(attrs)) s.setAttribute(k, v);
    paths.forEach(d => {
      const p = document.createElementNS(svgNS, 'path');
      p.setAttribute('d', d);
      s.appendChild(p);
    });
    return s;
  };

  /* ---------- Header scroll state ---------- */
  const header = document.querySelector('.site-header');
  if (header) {
    const onScroll = () => {
      header.classList.toggle('scrolled', window.scrollY > 30);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* ---------- Mobile menu ---------- */
  const menuToggle = document.querySelector('.menu-toggle');
  const mobileNav = document.querySelector('.mobile-nav');
  if (menuToggle && mobileNav) {
    menuToggle.addEventListener('click', () => {
      const open = mobileNav.classList.toggle('open');
      menuToggle.classList.toggle('open', open);
      document.body.classList.toggle('no-scroll', open);
    });
    mobileNav.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        mobileNav.classList.remove('open');
        menuToggle.classList.remove('open');
        document.body.classList.remove('no-scroll');
      });
    });
  }

  /* ---------- Hero Carousel ---------- */
  const carousel = document.querySelector('.hero-slides');
  if (carousel) {
    const slides = carousel.querySelectorAll('.hero-slide');
    const pagination = document.querySelector('.hero-pagination');
    let current = 0;
    const total = slides.length;
    let timer = null;
    const INTERVAL = 6000;

    if (pagination && total > 1) {
      while (pagination.firstChild) pagination.removeChild(pagination.firstChild);
      slides.forEach((_, i) => {
        const btn = document.createElement('button');
        btn.setAttribute('aria-label', `מעבר לשקופית ${i + 1}`);
        if (i === 0) btn.classList.add('active');
        btn.addEventListener('click', () => goTo(i));
        pagination.appendChild(btn);
      });
    }

    const setSlide = (idx) => {
      slides.forEach((s, i) => s.classList.toggle('active', i === idx));
      if (pagination) {
        pagination.querySelectorAll('button').forEach((b, i) =>
          b.classList.toggle('active', i === idx)
        );
      }
      current = idx;
    };

    const next = () => setSlide((current + 1) % total);
    const goTo = (i) => {
      setSlide(i);
      restart();
    };
    const start = () => {
      if (total > 1) timer = setInterval(next, INTERVAL);
    };
    const restart = () => {
      clearInterval(timer);
      start();
    };

    start();

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) clearInterval(timer);
      else restart();
    });
  }

  /* ---------- Reveal on scroll ---------- */
  const reveals = document.querySelectorAll('.reveal, .reveal-scale');
  if (reveals.length && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });
    reveals.forEach((node, i) => {
      if (!node.style.getPropertyValue('--delay')) {
        node.style.setProperty('--delay', `${(i % 4) * 0.08}s`);
      }
      io.observe(node);
    });
  } else {
    reveals.forEach(node => node.classList.add('in-view'));
  }

  /* ---------- FAQ accordion ---------- */
  document.querySelectorAll('.faq-question').forEach(q => {
    q.addEventListener('click', () => {
      const item = q.closest('.faq-item');
      const answer = item.querySelector('.faq-answer');
      const isOpen = item.classList.contains('open');

      item.parentElement.querySelectorAll('.faq-item.open').forEach(open => {
        if (open !== item) {
          open.classList.remove('open');
          open.querySelector('.faq-answer').style.maxHeight = null;
        }
      });

      if (isOpen) {
        item.classList.remove('open');
        answer.style.maxHeight = null;
      } else {
        item.classList.add('open');
        answer.style.maxHeight = answer.scrollHeight + 'px';
      }
    });
  });

  /* ---------- Catalog filter ---------- */
  const filterBtns = document.querySelectorAll('.catalog-filter button');
  const productItems = document.querySelectorAll('[data-category]');
  if (filterBtns.length && productItems.length) {
    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const cat = btn.dataset.filter;
        productItems.forEach(item => {
          const show = cat === 'all' || item.dataset.category === cat;
          item.style.display = show ? '' : 'none';
        });
      });
    });
  }

  /* ---------- Lightbox (Gallery) ---------- */
  const galleryItems = document.querySelectorAll('.gallery-item');
  if (galleryItems.length) {
    const lb = el('div', { class: 'lightbox', role: 'dialog', 'aria-label': 'תצוגת תמונה' });
    const closeBtn = el('button', { class: 'lightbox-close', 'aria-label': 'סגור' });
    closeBtn.appendChild(svg(
      { width: '20', height: '20', viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2' },
      'M18 6L6 18M6 6l12 12'
    ));
    const lbImg = el('img', { alt: '' });
    lb.appendChild(closeBtn);
    lb.appendChild(lbImg);
    document.body.appendChild(lb);

    galleryItems.forEach(item => {
      item.addEventListener('click', () => {
        const img = item.querySelector('img');
        if (img) {
          lbImg.src = img.src;
          lbImg.alt = img.alt || '';
          lb.classList.add('active');
          document.body.classList.add('no-scroll');
        }
      });
    });
    const close = () => {
      lb.classList.remove('active');
      document.body.classList.remove('no-scroll');
    };
    closeBtn.addEventListener('click', close);
    lb.addEventListener('click', (e) => { if (e.target === lb) close(); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });
  }

  /* ---------- Cookie consent (GDPR + Israeli Privacy Law) ---------- */
  const CONSENT_KEY = 'balicake-cookie-consent';
  const CONSENT_VERSION = 1;
  const readConsent = () => {
    try {
      const raw = localStorage.getItem(CONSENT_KEY);
      if (!raw) return null;
      const data = JSON.parse(raw);
      if (data.version !== CONSENT_VERSION) return null;
      return data;
    } catch { return null; }
  };
  const writeConsent = (categories) => {
    const data = {
      categories: { essential: true, analytics: !!categories.analytics, marketing: !!categories.marketing },
      decidedAt: new Date().toISOString(),
      version: CONSENT_VERSION,
    };
    try { localStorage.setItem(CONSENT_KEY, JSON.stringify(data)); } catch {}
    if (typeof window.gtag === 'function') {
      window.gtag('consent', 'update', {
        ad_storage: data.categories.marketing ? 'granted' : 'denied',
        ad_user_data: data.categories.marketing ? 'granted' : 'denied',
        ad_personalization: data.categories.marketing ? 'granted' : 'denied',
        analytics_storage: data.categories.analytics ? 'granted' : 'denied',
      });
    }
    return data;
  };

  let bannerEl = null;
  const showBanner = () => {
    if (bannerEl) return;
    bannerEl = el('div', { class: 'cookie-banner', role: 'dialog', 'aria-live': 'polite', 'aria-label': 'הסכמה לעוגיות' });
    const head = el('div', { class: 'cookie-banner-head' });
    head.appendChild(el('span', { class: 'cookie-icon', 'aria-hidden': 'true' }, '🍪'));
    head.appendChild(el('h4', {}, 'אנחנו משתמשים בעוגיות'));
    bannerEl.appendChild(head);
    const p = el('p', {},
      'אנו משתמשים בעוגיות הכרחיות להפעלת האתר, וכן בעוגיות אנליטיקה ושיווק (בכפוף להסכמה) כדי לשפר את החוויה. '
    );
    const link = el('a', { href: 'privacy.html' }, 'מדיניות הפרטיות שלנו');
    p.appendChild(link);
    p.appendChild(document.createTextNode('.'));
    bannerEl.appendChild(p);
    const actions = el('div', { class: 'cookie-actions' });
    const settingsBtn = el('button', { type: 'button', class: 'cookie-settings-btn' }, 'הגדרות');
    const declineBtn = el('button', { type: 'button', class: 'cookie-decline' }, 'דחיית הכל');
    const acceptBtn = el('button', { type: 'button', class: 'cookie-accept' }, 'אישור הכל');
    actions.appendChild(settingsBtn);
    actions.appendChild(declineBtn);
    actions.appendChild(acceptBtn);
    bannerEl.appendChild(actions);
    document.body.appendChild(bannerEl);
    requestAnimationFrame(() => setTimeout(() => bannerEl && bannerEl.classList.add('show'), 800));
    settingsBtn.addEventListener('click', () => openSettings());
    acceptBtn.addEventListener('click', () => { writeConsent({ analytics: true, marketing: true }); hideBanner(); });
    declineBtn.addEventListener('click', () => { writeConsent({ analytics: false, marketing: false }); hideBanner(); });
  };
  const hideBanner = () => {
    if (!bannerEl) return;
    bannerEl.classList.remove('show');
    const node = bannerEl;
    bannerEl = null;
    setTimeout(() => node.remove(), 600);
  };

  let modalEl = null;
  const openSettings = () => {
    const current = readConsent() || { categories: { essential: true, analytics: false, marketing: false } };
    if (modalEl) { modalEl.classList.add('show'); return; }
    const state = { analytics: !!current.categories.analytics, marketing: !!current.categories.marketing };
    modalEl = el('div', { class: 'cookie-modal-backdrop', role: 'dialog', 'aria-modal': 'true', 'aria-label': 'הגדרות עוגיות' });
    const modal = el('div', { class: 'cookie-modal' });
    const head = el('div', { class: 'cookie-modal-head' });
    head.appendChild(el('h3', {}, 'הגדרות עוגיות'));
    const closeBtn = el('button', { type: 'button', class: 'cookie-modal-close', 'aria-label': 'סגירה' }, '✕');
    head.appendChild(closeBtn);
    modal.appendChild(head);
    modal.appendChild(el('p', { class: 'cookie-modal-intro' },
      'בחרו אילו סוגי עוגיות אתם מאשרים. ניתן לחזור בכם מההסכמה בכל עת דרך הקישור "ניהול עוגיות" בתחתית האתר.'
    ));

    const makeCat = (key, icon, title, desc, locked) => {
      const cat = el('div', { class: 'cookie-cat' });
      const row = el('div', { class: 'cookie-cat-row' });
      const info = el('div', { class: 'cookie-cat-info' });
      info.appendChild(el('span', { class: 'ico', 'aria-hidden': 'true' }, icon));
      info.appendChild(el('h5', {}, title));
      const toggle = el('button', { type: 'button', class: 'cookie-toggle' + (locked || state[key] ? ' on' : '') + (locked ? ' locked' : ''), role: 'switch', 'aria-checked': locked ? 'true' : (state[key] ? 'true' : 'false'), 'aria-label': title });
      if (!locked) {
        toggle.addEventListener('click', () => {
          state[key] = !state[key];
          toggle.classList.toggle('on', state[key]);
          toggle.setAttribute('aria-checked', state[key] ? 'true' : 'false');
        });
      }
      row.appendChild(info);
      row.appendChild(toggle);
      cat.appendChild(row);
      cat.appendChild(el('p', {}, desc));
      return cat;
    };

    modal.appendChild(makeCat('essential', '🛡️', 'עוגיות הכרחיות',
      'נדרשות להפעלת האתר — שמירת בחירות בסיסיות, אבטחה וטעינה תקינה. לא ניתן לבטל.', true));
    modal.appendChild(makeCat('analytics', '📊', 'עוגיות אנליטיות',
      'עוזרות לנו להבין איך משתמשים באתר (Google Analytics, באופן אנונימי) כדי לשפר את החוויה.'));
    modal.appendChild(makeCat('marketing', '📣', 'עוגיות שיווק',
      'משמשות להצגת מודעות רלוונטיות ולמדידת קמפיינים פרסומיים מחוץ לאתר.'));

    const actions = el('div', { class: 'cookie-modal-actions' });
    const reject = el('button', { type: 'button' }, 'דחיית הכל');
    const save = el('button', { type: 'button' }, 'שמירת בחירה');
    const acceptAll = el('button', { type: 'button', class: 'primary' }, 'אישור הכל');
    actions.appendChild(reject);
    actions.appendChild(save);
    actions.appendChild(acceptAll);
    modal.appendChild(actions);
    modalEl.appendChild(modal);
    document.body.appendChild(modalEl);
    requestAnimationFrame(() => modalEl.classList.add('show'));

    const closeModal = () => {
      if (!modalEl) return;
      modalEl.classList.remove('show');
      const node = modalEl;
      modalEl = null;
      setTimeout(() => node.remove(), 350);
    };
    closeBtn.addEventListener('click', closeModal);
    modalEl.addEventListener('click', (e) => { if (e.target === modalEl) closeModal(); });
    document.addEventListener('keydown', function onEsc(e) {
      if (e.key === 'Escape' && modalEl) { closeModal(); document.removeEventListener('keydown', onEsc); }
    });
    reject.addEventListener('click', () => { writeConsent({ analytics: false, marketing: false }); hideBanner(); closeModal(); });
    save.addEventListener('click', () => { writeConsent(state); hideBanner(); closeModal(); });
    acceptAll.addEventListener('click', () => { writeConsent({ analytics: true, marketing: true }); hideBanner(); closeModal(); });
  };

  if (!readConsent()) showBanner();

  document.querySelectorAll('.cookie-settings-link').forEach(btn => {
    btn.addEventListener('click', (e) => { e.preventDefault(); openSettings(); });
  });
  window.addEventListener('open-cookie-settings', () => openSettings());

  /* ---------- Smooth anchor scroll ---------- */
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', (e) => {
      const target = a.getAttribute('href');
      if (target.length > 1) {
        const node = document.querySelector(target);
        if (node) {
          e.preventDefault();
          node.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
    });
  });

  /* ---------- Order: cake weight calculator ---------- */
  const guestsInput = document.getElementById('guests');
  const weightOutput = document.getElementById('cake-weight');
  if (guestsInput && weightOutput) {
    const update = () => {
      const g = parseInt(guestsInput.value, 10);
      if (!g || g < 1) { weightOutput.textContent = '—'; return; }
      const min = (g * 100 / 1000).toFixed(2);
      const max = (g * 120 / 1000).toFixed(2);
      weightOutput.textContent = `${min}–${max} ק״ג`;
    };
    guestsInput.addEventListener('input', update);
    update();
  }

  /* ---------- Forms ---------- */
  document.querySelectorAll('form[data-form]').forEach(form => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const btn = form.querySelector('button[type="submit"]');
      const original = btn.textContent;
      btn.disabled = true;
      btn.textContent = 'שולח...';
      setTimeout(() => {
        btn.textContent = '✓ נשלח בהצלחה';
        btn.style.background = '#2D8B5F';
        setTimeout(() => {
          btn.disabled = false;
          btn.textContent = original;
          btn.style.background = '';
          form.reset();
        }, 2500);
      }, 800);
    });
  });

  /* ---------- Newsletter ---------- */
  document.querySelectorAll('.newsletter form').forEach(form => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const input = form.querySelector('input');
      const btn = form.querySelector('button');
      if (!input.value) return;
      btn.textContent = '✓';
      input.value = '';
      input.placeholder = 'תודה! נוסיף אותך לרשימה.';
      setTimeout(() => {
        btn.textContent = '';
        btn.appendChild(svg(
          { width: '18', height: '18', viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '1.5' },
          'M19 12H5M12 5l-7 7 7 7'
        ));
        input.placeholder = 'האימייל שלך';
      }, 3500);
    });
  });

  /* ---------- Scroll progress bar ---------- */
  const progress = el('div', { class: 'scroll-progress', 'aria-hidden': 'true' });
  document.body.appendChild(progress);
  const updateProgress = () => {
    const h = document.documentElement;
    const scrolled = h.scrollTop / (h.scrollHeight - h.clientHeight);
    progress.style.width = `${Math.min(100, Math.max(0, scrolled * 100))}%`;
  };
  window.addEventListener('scroll', updateProgress, { passive: true });
  updateProgress();

  /* ---------- Hero title word-wrap for stagger animation ---------- */
  const heroH1 = document.querySelector('.hero-text h1');
  if (heroH1 && !heroH1.dataset.wrapped) {
    const wrapTextNode = (node) => {
      const text = node.nodeValue || '';
      const frag = document.createDocumentFragment();
      const parts = text.split(/(\s+)/);
      parts.forEach(part => {
        if (!part) return;
        if (/^\s+$/.test(part)) {
          frag.appendChild(document.createTextNode(part));
        } else {
          const span = document.createElement('span');
          span.className = 'word';
          span.textContent = part;
          frag.appendChild(span);
        }
      });
      node.parentNode.replaceChild(frag, node);
    };
    Array.from(heroH1.childNodes).forEach(child => {
      if (child.nodeType === Node.TEXT_NODE) wrapTextNode(child);
    });
    heroH1.dataset.wrapped = '1';
  }

  /* ---------- Counter animation for stats ---------- */
  const counters = document.querySelectorAll('.stat .num');
  if (counters.length && 'IntersectionObserver' in window) {
    const counterIO = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const node = entry.target;
        const raw = (node.textContent || '').trim();
        const m = raw.match(/^([0-9,]+)(.*)$/);
        if (!m) { counterIO.unobserve(node); return; }
        const target = parseInt(m[1].replace(/,/g, ''), 10);
        const suffix = m[2];
        if (!Number.isFinite(target) || target === 0) { counterIO.unobserve(node); return; }
        const dur = 1400;
        const start = performance.now();
        const tick = (t) => {
          const p = Math.min(1, (t - start) / dur);
          const eased = 1 - Math.pow(1 - p, 3);
          const v = Math.floor(eased * target);
          node.textContent = v.toLocaleString('en-US') + suffix;
          if (p < 1) requestAnimationFrame(tick);
          else node.classList.add('counted');
        };
        requestAnimationFrame(tick);
        counterIO.unobserve(node);
      });
    }, { threshold: 0.4 });
    counters.forEach(c => counterIO.observe(c));
  }

  /* ---------- Mouse-tracked glow for category cards ---------- */
  document.querySelectorAll('.cat-card').forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      card.style.setProperty('--mx', `${x}%`);
      card.style.setProperty('--my', `${y}%`);
    });
  });

  /* ============================================
     Accessibility widget — תקן ישראלי 5568 / WCAG AA
  ============================================ */
  (() => {
    const STORAGE_KEY = 'balicake_a11y';

    // Skip-to-content link
    if (!document.querySelector('.skip-link')) {
      const skip = el('a', { class: 'skip-link', href: '#main-content' }, 'דלג לתוכן הראשי');
      document.body.insertBefore(skip, document.body.firstChild);
    }
    // Mark main landmark if missing — prefer existing <main>, then first content section after header
    if (!document.getElementById('main-content')) {
      const existingMain = document.querySelector('main');
      if (existingMain) {
        existingMain.id = 'main-content';
      } else {
        // Pick the first section that ISN'T the decorative hero carousel
        const sections = Array.from(document.querySelectorAll('section'));
        const target = sections.find(s => !s.classList.contains('hero')) || sections[0];
        if (target) target.id = 'main-content';
      }
    }

    // Trigger button
    const trigger = el('button', {
      class: 'a11y-trigger',
      'aria-label': 'פתיחת תפריט נגישות',
      'aria-haspopup': 'dialog',
      'aria-expanded': 'false'
    });
    trigger.appendChild(svg(
      { viewBox: '0 0 24 24', fill: 'currentColor' },
      'M12 2a2 2 0 110 4 2 2 0 010-4zm9 7h-6v13h-2v-6h-2v6H9V9H3V7h18v2z'
    ));
    document.body.appendChild(trigger);

    // Panel
    const panel = el('div', {
      class: 'a11y-panel',
      role: 'dialog',
      'aria-label': 'תפריט נגישות',
      'aria-modal': 'true',
      tabindex: '-1'
    });

    const head = el('div', { class: 'a11y-panel-head' });
    head.appendChild(el('h3', {}, 'אפשרויות נגישות'));
    const closeBtn = el('button', { class: 'a11y-close', 'aria-label': 'סגור תפריט נגישות' }, '✕');
    head.appendChild(closeBtn);
    panel.appendChild(head);

    const grid = el('div', { class: 'a11y-grid' });

    const features = [
      { key: 'a11y-text-lg',           single: 'text-size', label: 'הגדל טקסט',     icon: 'M5 4v3h5v12h3V7h5V4zM3 9h3v10H3z' },
      { key: 'a11y-text-xl',           single: 'text-size', label: 'הגדל יותר',     icon: 'M5 4v3h5v12h3V7h5V4z' },
      { key: 'a11y-text-xxl',          single: 'text-size', label: 'גודל מקסימלי',  icon: 'M3 4h18v3H3z M5 9h14v3H5z M7 14h10v3H7z' },
      { key: 'a11y-spacing',           label: 'מרווחים',                            icon: 'M4 6h16v2H4zm0 5h16v2H4zm0 5h16v2H4z' },
      { key: 'a11y-readable',          label: 'גופן קריא',                          icon: 'M5 4v3h5v12h3V7h5V4z' },
      { key: 'a11y-links',             label: 'הדגשת קישורים',                      icon: 'M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7a5 5 0 100 10h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1S18.71 15.1 17 15.1h-4V17h4a5 5 0 000-10z' },
      { key: 'a11y-highlight-headings', label: 'הדגשת כותרות',                      icon: 'M5 4h2v6h4V4h2v16h-2v-6H7v6H5z M16 4h3v16h-3z' },
      { key: 'a11y-no-motion',         label: 'עצור הנפשות',                        icon: 'M6 6h12v12H6z' },
      { key: 'a11y-contrast',          single: 'theme', label: 'ניגודיות גבוהה',    icon: 'M12 2a10 10 0 100 20 10 10 0 000-20zm0 18V4a8 8 0 010 16z' },
      { key: 'a11y-light',             single: 'theme', label: 'תצוגה בהירה',       icon: 'M12 7a5 5 0 100 10 5 5 0 000-10zm0 8a3 3 0 110-6 3 3 0 010 6zM12 1v3 M12 20v3 M4.22 4.22l2.12 2.12 M17.66 17.66l2.12 2.12 M1 12h3 M20 12h3 M4.22 19.78l2.12-2.12 M17.66 6.34l2.12-2.12' },
      { key: 'a11y-focus',             label: 'הדגשת פוקוס',                        icon: 'M12 2v4 M12 18v4 M2 12h4 M18 12h4 M12 7a5 5 0 100 10 5 5 0 000-10z' },
      { key: 'a11y-cursor',            label: 'סמן גדול',                           icon: 'M5 3l22 13-9 2 5 11-3 1-5-11-7 6z' }
    ];

    const buttons = [];
    features.forEach(f => {
      const btn = el('button', { class: 'a11y-btn', 'aria-pressed': 'false', type: 'button' });
      const i = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      i.setAttribute('viewBox', '0 0 24 24');
      i.setAttribute('fill', 'none');
      i.setAttribute('stroke', 'currentColor');
      i.setAttribute('stroke-width', '1.6');
      i.setAttribute('stroke-linecap', 'round');
      i.setAttribute('stroke-linejoin', 'round');
      const p = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      p.setAttribute('d', f.icon);
      i.appendChild(p);
      btn.appendChild(i);
      btn.appendChild(el('span', {}, f.label));
      btn.dataset.key = f.key;
      if (f.single) btn.dataset.single = f.single;
      grid.appendChild(btn);
      buttons.push(btn);
    });
    panel.appendChild(grid);

    const reset = el('button', { class: 'a11y-reset', type: 'button' }, 'איפוס הגדרות נגישות');
    panel.appendChild(reset);
    panel.appendChild(el('a', { class: 'a11y-statement', href: 'accessibility.html' }, 'הצהרת נגישות'));

    document.body.appendChild(panel);

    // State management
    const loadState = () => {
      try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); } catch { return []; }
    };
    const saveState = (state) => {
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch {}
    };
    const applyState = (active) => {
      buttons.forEach(b => {
        const on = active.includes(b.dataset.key);
        b.classList.toggle('active', on);
        b.setAttribute('aria-pressed', on ? 'true' : 'false');
      });
      // Strip all a11y- classes from html
      document.documentElement.className = document.documentElement.className
        .split(' ')
        .filter(c => !c.startsWith('a11y-'))
        .join(' ');
      active.forEach(key => document.documentElement.classList.add(key));
    };

    let active = loadState();
    applyState(active);

    buttons.forEach(b => {
      b.addEventListener('click', () => {
        const key = b.dataset.key;
        const single = b.dataset.single;
        if (active.includes(key)) {
          active = active.filter(k => k !== key);
        } else {
          if (single) {
            // Remove others in same single-group
            active = active.filter(k => {
              const peer = buttons.find(x => x.dataset.key === k);
              return !peer || peer.dataset.single !== single;
            });
          }
          active.push(key);
        }
        saveState(active);
        applyState(active);
      });
    });

    reset.addEventListener('click', () => {
      active = [];
      saveState(active);
      applyState(active);
    });

    // Open / close panel + focus trap
    let lastFocused = null;
    const getFocusables = () => Array.from(panel.querySelectorAll(
      'button, a[href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )).filter(el => !el.disabled && el.offsetParent !== null);

    const openPanel = () => {
      lastFocused = document.activeElement;
      panel.classList.add('open');
      trigger.setAttribute('aria-expanded', 'true');
      const focusables = getFocusables();
      if (focusables.length) focusables[0].focus();
    };
    const closePanel = () => {
      panel.classList.remove('open');
      trigger.setAttribute('aria-expanded', 'false');
      if (lastFocused && typeof lastFocused.focus === 'function') lastFocused.focus();
    };
    trigger.addEventListener('click', () => {
      panel.classList.contains('open') ? closePanel() : openPanel();
    });
    closeBtn.addEventListener('click', closePanel);
    document.addEventListener('keydown', (e) => {
      if (!panel.classList.contains('open')) return;
      if (e.key === 'Escape') { closePanel(); return; }
      if (e.key === 'Tab') {
        const f = getFocusables();
        if (!f.length) return;
        const first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    });
    document.addEventListener('click', (e) => {
      if (panel.classList.contains('open') && !panel.contains(e.target) && e.target !== trigger && !trigger.contains(e.target)) {
        closePanel();
      }
    });
  })();

})();
