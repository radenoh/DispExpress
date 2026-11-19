/* DispExpress — small, dependency-free interactions */
(() => {
  const header = document.querySelector('.site-header');
  const toggle = document.querySelector('.nav-toggle');
  const panel = document.getElementById('nav-panel');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Header: solid background once scrolled ---------- */
  const onScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 24);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* ---------- Mobile menu ---------- */
  const setMenu = (open) => {
    header.classList.toggle('menu-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    document.body.style.overflow = open ? 'hidden' : '';
  };
  toggle.addEventListener('click', () => setMenu(!header.classList.contains('menu-open')));
  panel.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => setMenu(false)));
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && header.classList.contains('menu-open')) {
      setMenu(false);
      toggle.focus();
    }
  });
  window.matchMedia('(min-width: 1025px)').addEventListener('change', (mq) => { if (mq.matches) setMenu(false); });

  /* ---------- Active nav link while scrolling ---------- */
  const navLinks = [...document.querySelectorAll('.nav-links a[href^="#"]')];
  const sections = navLinks.map((link) => document.querySelector(link.getAttribute('href'))).filter(Boolean);
  if ('IntersectionObserver' in window && sections.length) {
    const spy = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        navLinks.forEach((link) => link.classList.toggle('is-active', link.getAttribute('href') === `#${entry.target.id}`));
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    sections.forEach((section) => spy.observe(section));
  }

  /* ---------- Reveal on scroll ---------- */
  const revealEls = [...document.querySelectorAll('[data-reveal]')];
  if (reduceMotion || !('IntersectionObserver' in window)) {
    revealEls.forEach((el) => el.classList.add('is-visible'));
  } else {
    // Stagger siblings that share a parent (cards in a grid, etc.)
    revealEls.forEach((el) => {
      const siblings = [...el.parentElement.children].filter((child) => child.hasAttribute('data-reveal'));
      const index = siblings.indexOf(el);
      if (index > 0) el.style.setProperty('--reveal-delay', `${Math.min(index, 5) * 80}ms`);
    });
    const revealer = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach((el) => revealer.observe(el));
  }

  // Pause SVG (SMIL) animations for people who prefer reduced motion
  if (reduceMotion) document.querySelectorAll('svg').forEach((svg) => svg.pauseAnimations?.());

  /* ---------- FAQ accordion with smooth height animation ---------- */
  document.querySelectorAll('.faq-item').forEach((item) => {
    const summary = item.querySelector('summary');
    const body = item.querySelector('.faq-body');
    let animation = null;

    summary.addEventListener('click', (event) => {
      if (reduceMotion || !body.animate) return; // let <details> toggle natively
      event.preventDefault();

      if (item.classList.contains('is-closing')) { // clicked again while closing → reopen
        animation?.cancel();
        item.classList.remove('is-closing');
        return;
      }
      animation?.cancel();

      const timing = { duration: 320, easing: 'cubic-bezier(.2,.7,.2,1)' };
      if (item.open) {
        item.classList.add('is-closing');
        animation = body.animate({ height: [`${body.offsetHeight}px`, '0px'], opacity: [1, 0] }, timing);
        animation.onfinish = () => { item.open = false; item.classList.remove('is-closing'); animation = null; };
      } else {
        item.open = true;
        animation = body.animate({ height: ['0px', `${body.offsetHeight}px`], opacity: [0, 1] }, timing);
        animation.onfinish = () => { animation = null; };
      }
    });
  });

  /* ---------- Application form ---------- */
  const form = document.getElementById('application-form');
  const packageSelect = form?.querySelector('select[name="package"]');

  // "Choose Standard" etc. pre-select the package in the form
  document.querySelectorAll('[data-package]').forEach((link) => {
    link.addEventListener('click', () => { if (packageSelect) packageSelect.value = link.dataset.package; });
  });

  if (form) {
    const status = form.querySelector('.form-status');
    const showStatus = (message, state = 'success') => {
      status.textContent = message;
      status.dataset.state = state;
      status.hidden = false;
    };

    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      if (!form.checkValidity()) {
        form.classList.add('was-validated');
        form.querySelector(':invalid')?.focus();
        showStatus('Please fill in the required fields marked with *.', 'error');
        return;
      }

      const data = new FormData(form);
      const endpoint = form.dataset.endpoint?.trim();

      // Option A: a form service such as Formspree (set data-endpoint on the form)
      if (endpoint) {
        const button = form.querySelector('button[type="submit"]');
        button.disabled = true;
        try {
          const response = await fetch(endpoint, { method: 'POST', body: data, headers: { Accept: 'application/json' } });
          if (!response.ok) throw new Error(response.statusText);
          form.reset();
          form.classList.remove('was-validated');
          showStatus('Thanks! Your application was sent. Our team will be in touch shortly.');
        } catch {
          showStatus('Something went wrong sending the form. Please email us at hello@dispexpress.com.', 'error');
        } finally {
          button.disabled = false;
        }
        return;
      }

      // Option B (default): open the visitor's email app with everything filled in
      const labels = {
        name: 'Name', company: 'Company', phone: 'Phone', email: 'Email', package: 'Package',
        trucks: 'Trucks', equipment: 'Equipment', location: 'Home base', lanes: 'Preferred lanes', message: 'Message'
      };
      const lines = Object.entries(labels)
        .map(([key, label]) => [label, String(data.get(key) ?? '').trim()])
        .filter(([, value]) => value)
        .map(([label, value]) => `${label}: ${value}`);
      const company = String(data.get('company') ?? '').trim();
      const subject = `Carrier application — ${String(data.get('name')).trim()}${company ? ` (${company})` : ''}`;
      const to = form.dataset.mailto || 'hello@dispexpress.com';

      window.location.href = `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(lines.join('\r\n'))}`;
      showStatus(`Your email app should open with your application ready to send. If it doesn’t, email us at ${to}.`);
    });

    form.addEventListener('input', () => {
      if (form.classList.contains('was-validated') && form.checkValidity()) {
        form.classList.remove('was-validated');
        status.hidden = true;
      }
    });
  }

  /* ---------- Footer year ---------- */
  const year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();
})();
