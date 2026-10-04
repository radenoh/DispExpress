document.documentElement.classList.add('js-motion');

const menuToggle = document.querySelector('.menu-toggle');
const mainNav = document.querySelector('.main-nav');
const header = document.querySelector('.site-header');
const applicationForm = document.querySelector('.application-form');
const revealSelector = [
  '.hero-copy', '.hero-art', '.problem-grid', '.technology .section-heading',
  '.tech-intro', '.tech-card', '.human-note', '.services .section-heading',
  '.service-card', '.process-intro', '.step', '.carrier-copy', '.carrier-visual',
  '.fleet-visual', '.fleet-copy', '.vision-heading', '.vision-copy',
  '.why .section-heading', '.why-grid article', '.approach-grid > div',
  '.equipment-heading', '.equipment-grid article', '.difference-inner > *',
  '.cta-inner > div', '.about-grid > div', '.faq-intro', '.faq-list details',
  '.final-cta-inner > div', '.application-copy', '.application-form'
].join(', ');
const revealElements = document.querySelectorAll(revealSelector);
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

revealElements.forEach((element, index) => {
  let revealStyle = 'up';

  if (element.matches('.hero-art, .carrier-visual, .fleet-visual, .equipment-grid article')) revealStyle = 'scale';
  else if (element.matches('.problem-grid, .process-intro, .carrier-copy, .vision-heading, .faq-intro, .application-copy')) revealStyle = 'left';
  else if (element.matches('.problem-copy, .steps, .fleet-copy, .vision-copy, .faq-list, .application-form')) revealStyle = 'right';
  else if (element.matches('.difference-inner > *, .human-note')) revealStyle = 'blur';

  element.dataset.reveal = revealStyle;
  element.style.setProperty('--reveal-delay', `${(index % 4) * 65}ms`);
});

if (prefersReducedMotion || !('IntersectionObserver' in window)) {
  revealElements.forEach((element) => element.classList.add('is-visible'));
} else {
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -35px 0px' });

  revealElements.forEach((element) => revealObserver.observe(element));
}

const updateHeader = () => header.classList.toggle('is-scrolled', window.scrollY > 12);
updateHeader();
window.addEventListener('scroll', updateHeader, { passive: true });

menuToggle.addEventListener('click', () => {
  const isOpen = menuToggle.getAttribute('aria-expanded') === 'true';
  menuToggle.setAttribute('aria-expanded', String(!isOpen));
  mainNav.classList.toggle('is-open', !isOpen);
});

mainNav.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => {
    menuToggle.setAttribute('aria-expanded', 'false');
    mainNav.classList.remove('is-open');
  });
});

document.addEventListener('keydown', (event) => {
  if (event.key !== 'Escape' || menuToggle.getAttribute('aria-expanded') !== 'true') return;
  menuToggle.setAttribute('aria-expanded', 'false');
  mainNav.classList.remove('is-open');
  menuToggle.focus();
});

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

  const status = document.createElement('p');
  status.className = 'form-status';
  status.setAttribute('role', 'status');
  status.dataset.state = 'success';
  status.textContent = 'Your email app will open with your application details ready to send.';
  applicationForm.querySelector('.form-status')?.remove();
  applicationForm.querySelector('.form-submit').append(status);
});

document.getElementById('year').textContent = new Date().getFullYear();
