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

/* ── ICS Calendar Generator ── */
function buildICS(name, phone, email, dateStr, timeStr, service, vehicle) {
  function pad(n) { return String(n).padStart(2, '0'); }

  const timeMap = {
    '8:00 AM': 8, '9:00 AM': 9, '10:00 AM': 10, '11:00 AM': 11,
    '12:00 PM': 12, '1:00 PM': 13, '2:00 PM': 14, '3:00 PM': 15,
    '4:00 PM': 16
  };
  const hour = timeMap[timeStr] || 9;

  let dtStart = '', dtEnd = '';
  if (dateStr) {
    const [y, m, d] = dateStr.split('-');
    dtStart = `${y}${m}${d}T${pad(hour)}0000`;
    dtEnd   = `${y}${m}${d}T${pad(hour + 2)}0000`;
  } else {
    const now = new Date();
    const y = now.getFullYear();
    const m2 = pad(now.getMonth() + 1);
    const d2 = pad(now.getDate());
    dtStart = `${y}${m2}${d2}T090000`;
    dtEnd   = `${y}${m2}${d2}T110000`;
  }

  const desc = [
    `Client: ${name}`,
    phone  ? `Phone: ${phone}` : '',
    email  ? `Email: ${email}` : '',
    vehicle ? `Vehicle: ${vehicle}` : '',
    service ? `Service: ${service}` : '',
    'MotorsLuxe Pro — Premium Detailing',
    'Lowcountry\\, SC',
    '(843) 640-7527'
  ].filter(Boolean).join('\\n');

  const ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//MotorsLuxe Pro//Appointment//EN',
    'BEGIN:VEVENT',
    `DTSTART:${dtStart}`,
    `DTEND:${dtEnd}`,
    `SUMMARY:MotorsLuxe Pro — ${name || 'Detail Appointment'}`,
    `DESCRIPTION:${desc}`,
    'LOCATION:Lowcountry\\, SC',
    'ORGANIZER;CN=MotorsLuxe Pro:mailto:motorsluxe@outlook.com',
    email ? `ATTENDEE;CN=${name}:mailto:${email}` : '',
    'STATUS:TENTATIVE',
    'END:VEVENT',
    'END:VCALENDAR'
  ].filter(Boolean).join('\r\n');

  const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
  return URL.createObjectURL(blob);
}

/* Build Outlook Web calendar deep link */
function buildOutlookUrl(name, phone, email, dateStr, timeStr, service, vehicle) {
  const timeMap = {
    '8:00 AM': '08:00', '9:00 AM': '09:00', '10:00 AM': '10:00', '11:00 AM': '11:00',
    '12:00 PM': '12:00', '1:00 PM': '13:00', '2:00 PM': '14:00', '3:00 PM': '15:00',
    '4:00 PM': '16:00'
  };
  const t = timeMap[timeStr] || '09:00';
  const [th, tm] = t.split(':');
  const endH = String(parseInt(th) + 2).padStart(2, '0');

  const body = [
    `Client: ${name}`,
    phone   ? `Phone: ${phone}` : '',
    email   ? `Email: ${email}` : '',
    vehicle ? `Vehicle: ${vehicle}` : '',
    service ? `Service: ${service}` : '',
    '',
    'MotorsLuxe Pro — Premium Detailing',
    'Lowcountry, SC  |  (843) 640-7527'
  ].filter(s => s !== null && s !== undefined).join('%0A');

  const subject = encodeURIComponent(`MotorsLuxe Pro — ${name || 'Detail Appointment'}`);
  const location = encodeURIComponent('Lowcountry, SC');

  if (dateStr) {
    const startdt = encodeURIComponent(`${dateStr}T${t}:00`);
    const enddt   = encodeURIComponent(`${dateStr}T${endH}:${tm}:00`);
    return `https://outlook.office.com/calendar/action/compose?subject=${subject}&startdt=${startdt}&enddt=${enddt}&location=${location}&body=${body}`;
  }
  return `https://outlook.office.com/calendar/action/compose?subject=${subject}&location=${location}&body=${body}`;
}

/* ── Web3Forms Submission ── */
async function submitForm(form) {
  const btn = form.querySelector('[type="submit"]');
  const original = btn.textContent;
  btn.textContent = 'Sending…';
  btn.disabled = true;

  const fd      = new FormData(form);
  const fname   = fd.get('fname') || '';
  const lname   = fd.get('lname') || '';
  const name    = (fname + ' ' + lname).trim();
  const phone   = fd.get('phone') || '';
  const email   = fd.get('email') || '';
  const vehicle = fd.get('vehicle') || '';
  const service = fd.get('service') || '';
  const dateStr = fd.get('preferred_date') || (form.querySelector('[type="date"]') ? form.querySelector('[type="date"]').value : '');
  const timeStr = fd.get('preferred_time') || '9:00 AM';

  try {
    const res = await fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      body: fd
    });
    const data = await res.json();

    if (data.success) {
      const icsUrl     = buildICS(name, phone, email, dateStr, timeStr, service, vehicle);
      const outlookUrl = buildOutlookUrl(name, phone, email, dateStr, timeStr, service, vehicle);
      const dateDisplay = dateStr
        ? new Date(dateStr + 'T12:00:00').toLocaleDateString('en-US', { weekday:'long', month:'long', day:'numeric', year:'numeric' })
        : 'TBD — we will confirm within 24 hours';

      form.innerHTML = `
        <div class="form-success">
          <div class="form-success-icon">✓</div>
          <h3>Request Received!</h3>
          <p>Thank you${name ? ', <strong>' + name + '</strong>' : ''} — your appointment request has been sent to <strong>MotorsLuxe Pro</strong>.</p>
          <p>Requested date: <strong>${dateDisplay}</strong></p>
          <p>We'll confirm within <strong>24 hours</strong>. For immediate help call <a href="tel:+18436407527">(843) 640-7527</a></p>
          <div style="display:flex;flex-wrap:wrap;gap:.75rem;margin-top:1.5rem;">
            ${dateStr ? `<a href="${outlookUrl}" target="_blank" rel="noopener" class="btn-gold" style="display:inline-flex;gap:.5rem;align-items:center;">
              📅 Add to Microsoft Outlook
            </a>` : ''}
            ${dateStr ? `<a href="${icsUrl}" download="motorsluxepro-appointment.ics" class="btn-ghost" style="display:inline-flex;gap:.5rem;align-items:center;">
              📅 Download for Apple Calendar
            </a>` : ''}
          </div>
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

document.querySelectorAll('.mlp-form').forEach(form => {
  form.addEventListener('submit', e => {
    e.preventDefault();
    submitForm(form);
  });
});

/* ── Gallery filter ── */
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
    ? 'rgba(5,5,5,0.99)' : 'rgba(5,5,5,0.97)';
});

/* ── Reveal on scroll (.reveal class) ── */
const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.08 });

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

/* ── Animate cards on older pages (inline style approach) ── */
const cardObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll(
  '.brand-chip, .price-card, .value-item, .perk-item, .job-card'
).forEach(el => {
  if (!el.classList.contains('reveal')) {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = 'opacity .5s ease, transform .5s ease';
    cardObserver.observe(el);
  }
});

/* ── Animated Counters ── */
const counterEls = document.querySelectorAll('[data-count]');
if (counterEls.length) {
  const countObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const target = +el.dataset.count;
      const suffix = el.dataset.suffix || '';
      const steps = 1600 / 16;
      const increment = target / steps;
      let current = 0;
      const tick = () => {
        current = Math.min(current + increment, target);
        el.textContent = Math.floor(current) + suffix;
        if (current < target) requestAnimationFrame(tick);
      };
      tick();
      countObserver.unobserve(el);
    });
  }, { threshold: 0.5 });
  counterEls.forEach(el => countObserver.observe(el));
}
