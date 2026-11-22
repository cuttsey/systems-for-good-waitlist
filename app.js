import { mountGrainLight } from './parts/grain-light.js';
const $ = (s) => document.querySelector(s);
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const cfg = window.SFG_CONFIG || {};
const live = !!(cfg.supabaseUrl && cfg.supabaseKey);
const params = new URLSearchParams(location.search);
const source = (params.get('utm_source') || (document.referrer.includes('linkedin') ? 'linkedin' : 'direct')).slice(0, 40);
const campaign = (params.get('utm_campaign') || '').slice(0, 60);

mountGrainLight($('.wl'), { grainOpacity: 0.05, light: false });

async function post(table, row) {
  const r = await fetch(`${cfg.supabaseUrl}/rest/v1/${table}`, {
    method: 'POST',
    headers: { apikey: cfg.supabaseKey, 'Content-Type': 'application/json', Prefer: 'return=minimal' },
    body: JSON.stringify(row),
  });
  if (!r.ok) throw new Error(String(r.status));
}
// one honest visit count per browser session, for the page-to-sign-up rate
if (live && !sessionStorage.getItem('sfg-v')) {
  try { sessionStorage.setItem('sfg-v', '1'); } catch (e) {}
  post('page_views', { source, campaign }).catch(() => {});
}

/* the tape mirrors the problem; it presses in once when typing pauses */
const problem = $('#problem'), emboss = $('#emboss');
let t;
problem.addEventListener('input', () => {
  emboss.textContent = problem.value.trim() || 'The backlog after every sprint';
  if (reduced) return;
  clearTimeout(t);
  t = setTimeout(() => emboss.animate([{ transform: 'translateY(3px)' }, { transform: 'none' }], { duration: 180, easing: 'cubic-bezier(.22,1,.36,1)' }), 400);
});

/* the film plays only on screen */
const film = $('#film');
if (film) {
  film.addEventListener('error', () => film.closest('section')?.classList.add('nofilm'), true);
  new IntersectionObserver(([e]) => { if (reduced) return; e.isIntersecting ? film.play().catch(() => {}) : film.pause(); }, { threshold: 0.4 }).observe(film);
}

/* the form */
const form = $('#wlForm'), email = $('#email'), consent = $('#consent'), btn = $('#joinBtn');
const say = (id, msg) => { $(id).textContent = msg; };
form.addEventListener('submit', async (e) => {
  e.preventDefault();
  say('#emailErr', ''); say('#consentErr', ''); say('#formErr', '');
  email.removeAttribute('aria-invalid');
  const v = email.value.trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) { say('#emailErr', 'Check the email address; it looks incomplete.'); email.setAttribute('aria-invalid', 'true'); email.focus(); return; }
  if (!consent.checked) { say('#consentErr', 'Tick the box so we can email you when it opens.'); consent.focus(); return; }
  if (!live) { say('#formErr', 'Sign-ups open shortly. Try again in a little while.'); return; }
  const row = {
    email: v.toLowerCase(),
    problem: problem.value.trim().slice(0, 80) || null,
    who: form.who.value || 'me',
    pay: form.pay.value || null,
    consent: true,
    source, campaign: campaign || null,
  };
  btn.disabled = true; btn.setAttribute('aria-busy', 'true'); btn.firstChild.textContent = 'Adding you ';
  try {
    await post('waitlist', row);
    form.classList.add('sent'); $('#done').focus();
  } catch (err) {
    if (String(err.message) === '409') { form.classList.add('sent'); $('#done').focus(); return; }
    say('#formErr', "That didn't go through. Your answers are kept here; try again.");
  } finally {
    btn.disabled = false; btn.removeAttribute('aria-busy'); btn.firstChild.textContent = 'Join the waitlist ';
  }
});
