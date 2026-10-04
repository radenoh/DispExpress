const menuToggle = document.querySelector('.menu-toggle');
const mainNav = document.querySelector('.main-nav');
const header = document.querySelector('.site-header');
const applicationForm = document.querySelector('.application-form');

const revealGroups = [
  { selector: '.hero-copy, .section-heading, .technology-copy, .about-grid > div, .faq-intro, .application-copy', style: 'up' },
  { selector: '.hero-art, .carrier-visual, .fleet-visual, .equipment-grid article, .ai-dashboard', style: 'scale' },
  { selector: '.service-card, .process-step, .proof-strip-inner > span, .faq-list details, .final-cta-inner > div, .application-form', style: 'up' },
  { selector: '.carrier-copy, .fleet-copy', style: 'left' }
];
const revealElements = revealGroups.flatMap(({ selector }) => [...document.querySelectorAll(selector)]);
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (revealElements.length && !prefersReducedMotion && 'IntersectionObserver' in window) {
  document.documentElement.classList.add('js-motion');

  revealElements.forEach((element, index) => {
    const group = revealGroups.find(({ selector }) => element.matches(selector));
    element.dataset.reveal = group?.style ?? 'up';
    element.style.setProperty('--reveal-delay', `${(index % 4) * 65}ms`);
  });

  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -35px 0px' });

  revealElements.forEach((element) => revealObserver.observe(element));
}

if (header) {
  const updateHeader = () => header.classList.toggle('is-scrolled', window.scrollY > 12);
  updateHeader();
  window.addEventListener('scroll', updateHeader, { passive: true });
}

if (menuToggle && mainNav) {
  const closeMenu = () => {
    menuToggle.setAttribute('aria-expanded', 'false');
    mainNav.classList.remove('is-open');
  };

  menuToggle.addEventListener('click', () => {
    const isOpen = menuToggle.getAttribute('aria-expanded') === 'true';
    menuToggle.setAttribute('aria-expanded', String(!isOpen));
    mainNav.classList.toggle('is-open', !isOpen);
  });

  mainNav.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeMenu));
  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape' || menuToggle.getAttribute('aria-expanded') !== 'true') return;
    closeMenu();
    menuToggle.focus();
  });
}

if (applicationForm) {
  applicationForm.addEventListener('invalid', () => {
    applicationForm.classList.add('is-invalid');
  }, true);

  applicationForm.addEventListener('input', () => {
    if (applicationForm.checkValidity()) applicationForm.classList.remove('is-invalid');
  });

  applicationForm.addEventListener('submit', (event) => {
    if (!applicationForm.checkValidity()) {
      event.preventDefault();
      applicationForm.classList.add('is-invalid');
      return;
    }

    const submitArea = applicationForm.querySelector('.form-submit');
    if (!submitArea) return;

    applicationForm.querySelector('.form-status')?.remove();
    const status = document.createElement('p');
    status.className = 'form-status';
    status.setAttribute('role', 'status');
    status.dataset.state = 'success';
    status.textContent = 'Your email app will open with your application details ready to send.';
    submitArea.append(status);
  });
}

const year = document.getElementById('year');
if (year) year.textContent = new Date().getFullYear();
