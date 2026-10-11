const menuToggle = document.querySelector('.menu-toggle');
const mainNav = document.querySelector('.main-nav');
const header = document.querySelector('.site-header');
const applicationForm = document.querySelector('.application-form');
const packageSelect = applicationForm?.querySelector('select[name="package"]');

if (packageSelect) {
  document.querySelectorAll('[data-package]').forEach((packageLink) => {
    packageLink.addEventListener('click', () => {
      packageSelect.value = packageLink.dataset.package;
    });
  });
}

const revealGroups = [
  { selector: '.hero-copy, .section-heading, .technology-copy, .about-grid > div, .faq-intro, .application-copy', style: 'up' },
  { selector: '.hero-art, .carrier-visual, .fleet-visual, .equipment-grid article, .ai-dashboard', style: 'scale' },
  { selector: '.pricing-card', style: 'up' },
  { selector: '.service-card, .process-step, .proof-strip-inner > span, .faq-list details, .final-cta-inner > div, .application-form, .careers-copy, .careers-contact-card', style: 'up' },
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

document.querySelectorAll('.faq-list details').forEach((details) => {
  const summary = details.querySelector('summary');
  const answer = details.querySelector('.faq-answer');
  if (!summary || !answer) return;

  summary.setAttribute('aria-expanded', String(details.open));
  answer.style.maxHeight = details.open ? `${answer.scrollHeight}px` : '0px';
  let closeTimer;
  let finishClose;

  summary.addEventListener('click', (event) => {
    event.preventDefault();

    if (answer.dataset.closing === 'true') {
      clearTimeout(closeTimer);
      answer.removeEventListener('transitionend', finishClose);
      finishClose = null;
      delete answer.dataset.closing;
      summary.setAttribute('aria-expanded', 'true');
      answer.style.maxHeight = `${answer.scrollHeight}px`;
      return;
    }

    if (details.open) {
      answer.style.maxHeight = `${answer.scrollHeight}px`;
      answer.offsetHeight;
      answer.dataset.closing = 'true';
      summary.setAttribute('aria-expanded', 'false');
      requestAnimationFrame(() => { answer.style.maxHeight = '0px'; });

      finishClose = (transitionEvent) => {
        if (transitionEvent && transitionEvent.propertyName !== 'max-height') return;
        clearTimeout(closeTimer);
        details.open = false;
        delete answer.dataset.closing;
        answer.removeEventListener('transitionend', finishClose);
        finishClose = null;
      };
      answer.addEventListener('transitionend', finishClose);
      closeTimer = setTimeout(() => finishClose(), 450);
      return;
    }

    details.open = true;
    answer.style.maxHeight = '0px';
    summary.setAttribute('aria-expanded', 'true');
    requestAnimationFrame(() => { answer.style.maxHeight = `${answer.scrollHeight}px`; });
  });

  answer.addEventListener('transitionend', (event) => {
    if (event.propertyName === 'max-height' && details.open && answer.dataset.closing !== 'true') {
      answer.style.maxHeight = `${answer.scrollHeight}px`;
    }
  });
});

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
