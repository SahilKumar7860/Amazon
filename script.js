'use strict';

/* =====================================================================
   DEALSVAULT — SCRIPT
   Structure:
   1. Utilities              8. Rating Stars          13. Back To Top
   2. Preloader              9. 3D Tilt Effect        15. Footer Year
   3. Navbar Scroll         10. Button Glow           16. Init
   4. Mobile Menu           11. Hero Parallax
   5. Search & Filtering    12. Ripple Effect
   6. Smooth Scroll
   ===================================================================== */

/* =====================================================================
   1. UTILITIES
   ===================================================================== */
function throttle(fn, wait) {
  let lastTime = 0;
  let timeoutId = null;
  return function throttled(...args) {
    const now = Date.now();
    const remaining = wait - (now - lastTime);
    if (remaining <= 0) {
      clearTimeout(timeoutId);
      lastTime = now;
      fn.apply(this, args);
    } else {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        lastTime = Date.now();
        fn.apply(this, args);
      }, remaining);
    }
  };
}

function debounce(fn, wait) {
  let timeoutId;
  return function debounced(...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn.apply(this, args), wait);
  };
}

function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function hasFinePointer() {
  return window.matchMedia('(hover: hover) and (pointer: fine)').matches;
}

/* =====================================================================
   2. PRELOADER
   ===================================================================== */
function initPreloader() {
  const preloader = document.getElementById('preloader');
  if (!preloader) return;

  const hidePreloader = () => {
    preloader.classList.add('preloader--hidden');
  };

  window.addEventListener('load', () => {
    setTimeout(hidePreloader, 400);
  });

  // Safety net in case the load event never fires for some reason.
  setTimeout(hidePreloader, 2500);
}

/* =====================================================================
   3. NAVBAR SCROLL
   ===================================================================== */
function initNavbarScroll() {
  const navbar = document.getElementById('navbar');
  if (!navbar) return;

  const onScroll = () => {
    navbar.classList.toggle('navbar--scrolled', window.scrollY > 40);
  };

  onScroll();
  window.addEventListener('scroll', throttle(onScroll, 100), { passive: true });
}

/* =====================================================================
   4. MOBILE MENU
   ===================================================================== */
function closeMobileMenu() {
  const hamburger = document.getElementById('hamburger');
  const nav = document.getElementById('navbarNav');
  const scrim = document.getElementById('navScrim');
  if (!hamburger || !nav) return;

  hamburger.classList.remove('is-active');
  nav.classList.remove('is-open');
  hamburger.setAttribute('aria-expanded', 'false');
  if (scrim) scrim.classList.remove('is-active');
  document.body.classList.remove('no-scroll');
}

function openMobileMenu() {
  const hamburger = document.getElementById('hamburger');
  const nav = document.getElementById('navbarNav');
  const scrim = document.getElementById('navScrim');
  if (!hamburger || !nav) return;

  closeSearchOverlay();
  hamburger.classList.add('is-active');
  nav.classList.add('is-open');
  hamburger.setAttribute('aria-expanded', 'true');
  if (scrim) scrim.classList.add('is-active');
  document.body.classList.add('no-scroll');
}

function initMobileMenu() {
  const hamburger = document.getElementById('hamburger');
  const nav = document.getElementById('navbarNav');
  const scrim = document.getElementById('navScrim');
  if (!hamburger || !nav) return;

  hamburger.addEventListener('click', () => {
    const isOpen = nav.classList.contains('is-open');
    if (isOpen) closeMobileMenu();
    else openMobileMenu();
  });

  nav.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', closeMobileMenu);
  });

  if (scrim) scrim.addEventListener('click', closeMobileMenu);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && nav.classList.contains('is-open')) closeMobileMenu();
  });

  window.addEventListener('resize', debounce(() => {
    if (window.innerWidth >= 1024) closeMobileMenu();
  }, 200));
}

/* =====================================================================
   5. SEARCH & FILTERING
   ===================================================================== */
const CATEGORY_NAMES = {
  electronics: 'Electronics',
  'home-kitchen': 'Home & Kitchen',
  fashion: 'Fashion',
  fitness: 'Fitness',
  beauty: 'Beauty',
  gaming: 'Gaming',
};

function toggleEmptyState(visibleCount) {
  const emptyState = document.getElementById('productsEmptyState');
  if (emptyState) emptyState.hidden = visibleCount !== 0;
}

function updateActiveFilterChip(category) {
  const chip = document.getElementById('filterChip');
  const label = document.getElementById('filterChipLabel');
  if (!chip || !label) return;

  if (!category || category === 'all') {
    chip.hidden = true;
  } else {
    label.textContent = `Showing: ${CATEGORY_NAMES[category] || category}`;
    chip.hidden = false;
  }
}

function filterProductsByCategory(category) {
  const cards = document.querySelectorAll('.product-card');
  let visibleCount = 0;

  cards.forEach((card) => {
    const matches = category === 'all' || card.getAttribute('data-category') === category;
    card.style.display = matches ? '' : 'none';
    if (matches) visibleCount += 1;
  });

  toggleEmptyState(visibleCount);
  updateActiveFilterChip(category);
}

function filterProductsByText(query) {
  const cards = document.querySelectorAll('.product-card');
  const normalized = query.trim().toLowerCase();
  let visibleCount = 0;

  cards.forEach((card) => {
    const title = (card.getAttribute('data-title') || '').toLowerCase();
    const matches = normalized === '' || title.includes(normalized);
    card.style.display = matches ? '' : 'none';
    if (matches) visibleCount += 1;
  });

  toggleEmptyState(visibleCount);
}

function initCategoryFilter() {
  const categoryCards = document.querySelectorAll('[data-category-filter]');
  const productsSection = document.getElementById('products');
  const navbar = document.getElementById('navbar');

  categoryCards.forEach((card) => {
    card.addEventListener('click', () => {
      const category = card.getAttribute('data-category-filter');
      filterProductsByCategory(category);

      if (productsSection) {
        const navbarHeight = navbar ? navbar.offsetHeight : 0;
        const top = productsSection.getBoundingClientRect().top + window.scrollY - navbarHeight + 1;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });

  const clearBtn = document.getElementById('filterChipClear');
  if (clearBtn) {
    clearBtn.addEventListener('click', () => filterProductsByCategory('all'));
  }
}

function closeSearchOverlay() {
  const toggle = document.getElementById('searchToggle');
  const overlay = document.getElementById('searchOverlay');
  if (!toggle || !overlay) return;
  overlay.classList.remove('is-active');
  toggle.setAttribute('aria-expanded', 'false');
}

function openSearchOverlay() {
  const toggle = document.getElementById('searchToggle');
  const overlay = document.getElementById('searchOverlay');
  const input = document.getElementById('searchInput');
  if (!toggle || !overlay || !input) return;
  closeMobileMenu();
  overlay.classList.add('is-active');
  toggle.setAttribute('aria-expanded', 'true');
  filterProductsByCategory('all');
  setTimeout(() => input.focus(), 350);
}

function initSearch() {
  const toggle = document.getElementById('searchToggle');
  const overlay = document.getElementById('searchOverlay');
  const closeBtn = document.getElementById('searchClose');
  const input = document.getElementById('searchInput');
  if (!toggle || !overlay || !input) return;

  toggle.addEventListener('click', () => {
    const isActive = overlay.classList.contains('is-active');
    if (isActive) closeSearchOverlay();
    else openSearchOverlay();
  });

  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      closeSearchOverlay();
      input.value = '';
      filterProductsByText('');
    });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && overlay.classList.contains('is-active')) {
      closeSearchOverlay();
      input.value = '';
      filterProductsByText('');
    }
  });

  input.addEventListener('input', debounce((e) => {
    filterProductsByText(e.target.value);
  }, 200));
}

/* =====================================================================
   6. SMOOTH SCROLL
   ===================================================================== */
function initSmoothScroll() {
  const links = document.querySelectorAll('a[href^="#"]');
  const navbar = document.getElementById('navbar');

  links.forEach((link) => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      if (!href || href === '#') {
        e.preventDefault();
        return;
      }

      const target = document.querySelector(href);
      if (!target) return;

      e.preventDefault();
      const navbarHeight = navbar ? navbar.offsetHeight : 0;
      const top = target.getBoundingClientRect().top + window.scrollY - navbarHeight + 1;
      window.scrollTo({ top, behavior: 'smooth' });

      closeMobileMenu();
    });
  });
}

/* =====================================================================
   7. SCROLL REVEAL
   ===================================================================== */
function initScrollReveal() {
  const groups = document.querySelectorAll('[data-reveal-group]');
  groups.forEach((group) => {
    const items = group.querySelectorAll('[data-reveal]');
    items.forEach((item, index) => {
      item.style.transitionDelay = `${(index % 4) * 90}ms`;
    });
  });

  const revealEls = document.querySelectorAll('[data-reveal]');
  if (revealEls.length === 0) return;

  if (!('IntersectionObserver' in window) || prefersReducedMotion()) {
    revealEls.forEach((el) => el.classList.add('is-visible'));
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

  revealEls.forEach((el) => observer.observe(el));
}

/* =====================================================================
   9. RATING STARS
   ===================================================================== */
function initRatingStars() {
  const ratings = document.querySelectorAll('.rating[data-rating]');
  ratings.forEach((el) => {
    const value = parseFloat(el.getAttribute('data-rating')) || 0;
    const fill = el.querySelector('.rating__stars-fill');
    if (fill) {
      const percent = Math.max(0, Math.min(value / 5, 1)) * 100;
      fill.style.width = `${percent}%`;
    }
  });
}

/* =====================================================================
   10. 3D TILT EFFECT
   ===================================================================== */
function initTilt() {
  if (!hasFinePointer() || prefersReducedMotion()) return;

  const tiltEls = document.querySelectorAll('[data-tilt]');
  const MAX_TILT = 9;

  tiltEls.forEach((el) => {
    el.addEventListener('mousemove', (e) => {
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const px = x / rect.width - 0.5;
      const py = y / rect.height - 0.5;
      const rotateY = px * MAX_TILT * 2;
      const rotateX = py * -MAX_TILT * 2;

      el.style.transform = `perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-6px) scale(1.02)`;

      const glare = el.querySelector('.tilt-glare');
      if (glare) {
        glare.style.background = `radial-gradient(circle at ${x}px ${y}px, rgba(255,255,255,0.35), transparent 60%)`;
      }
    });

    el.addEventListener('mouseleave', () => {
      el.style.transform = '';
      const glare = el.querySelector('.tilt-glare');
      if (glare) glare.style.background = 'transparent';
    });
  });
}

/* =====================================================================
   11. BUTTON GLOW
   ===================================================================== */
function initButtonGlow() {
  if (!hasFinePointer()) return;

  const buttons = document.querySelectorAll('.btn');
  buttons.forEach((btn) => {
    btn.addEventListener('mousemove', (e) => {
      const rect = btn.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      btn.style.setProperty('--x', `${x}%`);
      btn.style.setProperty('--y', `${y}%`);
    });
  });
}

/* =====================================================================
   12. HERO PARALLAX
   ===================================================================== */
function initHeroParallax() {
  const hero = document.querySelector('.hero');
  const visual = document.getElementById('heroVisual');
  if (!hero || !visual || prefersReducedMotion() || !hasFinePointer()) return;

  hero.addEventListener('mousemove', (e) => {
    const rect = hero.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    visual.style.transform = `rotateX(${py * -6}deg) rotateY(${px * 10}deg)`;
  });

  hero.addEventListener('mouseleave', () => {
    visual.style.transform = '';
  });
}

function initScrollParallax() {
  if (prefersReducedMotion()) return;

  const parallaxEls = document.querySelectorAll('[data-parallax-speed]');
  if (parallaxEls.length === 0) return;

  const onScroll = () => {
    const scrollY = window.scrollY;
    parallaxEls.forEach((el) => {
      const speed = parseFloat(el.getAttribute('data-parallax-speed')) || 0.15;
      el.style.transform = `translateY(${scrollY * speed}px)`;
    });
  };

  window.addEventListener('scroll', throttle(onScroll, 16), { passive: true });
}

/* =====================================================================
   13. RIPPLE EFFECT
   ===================================================================== */
function createRipple(e) {
  const btn = e.currentTarget;
  const rect = btn.getBoundingClientRect();
  const size = Math.max(rect.width, rect.height);

  const ripple = document.createElement('span');
  ripple.className = 'ripple';
  ripple.style.width = `${size}px`;
  ripple.style.height = `${size}px`;
  ripple.style.left = `${e.clientX - rect.left - size / 2}px`;
  ripple.style.top = `${e.clientY - rect.top - size / 2}px`;

  btn.appendChild(ripple);
  ripple.addEventListener('animationend', () => ripple.remove());
}

function initRipple() {
  document.querySelectorAll('.btn, .icon-btn').forEach((btn) => {
    btn.addEventListener('click', createRipple);
  });
}

/* =====================================================================
   14. BACK TO TOP
   ===================================================================== */
function initBackToTop() {
  const btn = document.getElementById('backToTop');
  if (!btn) return;

  const toggleVisibility = () => {
    btn.classList.toggle('is-visible', window.scrollY > 500);
  };

  toggleVisibility();
  window.addEventListener('scroll', throttle(toggleVisibility, 150), { passive: true });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

/* =====================================================================
   16. FOOTER YEAR
   ===================================================================== */
function initFooterYear() {
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();
}

/* =====================================================================
   17. INIT
   ===================================================================== */
document.addEventListener('DOMContentLoaded', () => {
  initPreloader();
  initNavbarScroll();
  initMobileMenu();
  initSearch();
  initCategoryFilter();
  initSmoothScroll();
  initScrollReveal();
  initRatingStars();
  initTilt();
  initButtonGlow();
  initHeroParallax();
  initScrollParallax();
  initRipple();
  initBackToTop();
  initFooterYear();
});
