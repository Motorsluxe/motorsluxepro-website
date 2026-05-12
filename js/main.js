/* MotorsLuxe Pro — Main JS */

/* ── Mobile Nav ── */
const hamburger = document.getElementById('hamburger');
const mobileNav = document.getElementById('mobile-nav');
if (hamburger && mobileNav) {
  hamburger.addEventListener('click', () => mobileNav.classList.toggle('open'));
  document.addEventListener('click', e => {
    if (!hamburger.contains(e.target) && !mobileNav.contains(e.target))
      mobileNav.classList.remove('open');
  });
}

/* ── Before/After Slider ── */
const baWrap   = document.querySelector('.ba-wrap');
const baAfter  = document.querySelector('.ba-after');
const baHandle = document.querySelector('.ba-handle');
const baRange  = document.querySelector('.ba-range');

if (baWrap && baAfter && baHandle && baRange) {
  function setSlider(pct) {
    pct = Math.min(100, Math.max(0, pct));
    baAfter.style.width = pct + '%';
    baHandle.style.left = pct + '%';
    baRange.value = pct;
  }
  baRange.addEventListener('input', () => setSlider(+baRange.value));

  let dragging = false;
  baWrap.addEventListener('mousedown',  () => dragging = true);
  window.addEventListener('mouseup',    () => dragging = false);
  window.addEventListener('mousemove',  e => {
    if (!dragging) return;
    const r = baWrap.getBoundingClientRect();
    setSlider(((e.clientX - r.left) / r.width) * 100);
  });
  baWrap.addEventListener('touchmove', e => {
    const r = baWrap.getBoundingClientRect();
    setSlider(((e.touches[0].clientX - r.left) / r.width) * 100);
  }, { passive: true });

  setSlider(50);
}

/* ── Book Now Tabs ── */
document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    btn.classList.add('active');
    const target = document.getElementById(btn.dataset.tab);
    if (target) target.classList.add('active');
  });
});

/* ── Web3Forms Submission ── */
async function submitForm(form) {
  const btn = form.querySelector('[type="submit"]');
  const original = btn.textContent;
  btn.textContent = 'Sending…';
  btn.disabled = true;

  try {
    const res = await fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      body: new FormData(form)
    });
    const data = await res.json();

    if (data.success) {
      form.innerHTML = `
        <div class="form-success">
          <div class="form-success-icon">✓</div>
          <h3>Request Received!</h3>
          <p>Thank you — we'll contact you within <strong>24 hours</strong> to confirm your appointment.</p>
          <p>For immediate assistance call <a href="tel:+18436407527">(843) 640-7527</a></p>
        </div>`;
    } else {
      throw new Error(data.message || 'Submission failed');
    }
  } catch (err) {
    btn.textContent = original;
    btn.disabled = false;
    const errEl = form.querySelector('.form-error');
    if (errEl) errEl.style.display = 'block';
  }
}

/* Attach handler to every form with class "mlp-form" */
document.querySelectorAll('.mlp-form').forEach(form => {
  form.addEventListener('submit', e => {
    e.preventDefault();
    submitForm(form);
  });
});

/* ── Gallery filter (no-op visual toggle) ── */
document.querySelectorAll('.filter-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
  });
});

/* ── Nav background on scroll ── */
window.addEventListener('scroll', () => {
  const nav = document.querySelector('.nav');
  if (nav) nav.style.background = window.scrollY > 20
    ? 'rgba(8,8,8,0.99)' : 'rgba(8,8,8,0.96)';
});

/* ── Animate on scroll ── */
const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll(
  '.svc-card, .process-step, .review-card, .brand-chip, .price-card, .value-item, .perk-item, .job-card'
).forEach(el => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(20px)';
  el.style.transition = 'opacity .5s ease, transform .5s ease';
  observer.observe(el);
});
