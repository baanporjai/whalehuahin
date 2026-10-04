/* Whale Hua Hin — Home. Content blocks below mimic CMS data; swap for API/CMS fetch later. */
const TOWN = [
  { title: 'Where to Eat in Hua Hin', blurb: 'Seafood, noodles and sunset tables.', cls: 't1', img: 'images/2026/guay-pochana.webp', href: 'hua-hin/where-to-eat.html' },
  { title: 'Markets After Sunset', blurb: 'Street food, crafts and slow strolls.', cls: 't2', href: 'hua-hin/night-markets.html' },
  { title: 'Three Easy Days in Hua Hin', blurb: 'A simple plan for a first visit.', cls: 't3', href: 'hua-hin/three-easy-days.html' },
];

// Short summaries of recent guest reviews found on Google Maps.
// Keep these attributed and link back to the listing so the source is clear.
const REVIEWS = [
  { quote: 'A wonderful stay with exceptionally spacious rooms and a beautiful terrace. The team was consistently warm, helpful and welcoming, the Wi‑Fi was fast and dependable, and the regular shuttle made it easy to enjoy Hua Hin without any stress.', who: 'Justina R', src: 'Google Maps', date: 'Dec 2025' },
  { quote: 'The staff were lovely from the moment we arrived, with the housekeeping team receiving special praise for their care and kindness. The beds were among the most comfortable, hot water was always available, and the clean rooftop pool was a perfect place to relax.', who: 'E B', src: 'Google Maps', date: 'Jan 2026' },
  { quote: 'After staying here twice on separate trips, this guest highlights the excellent service, spacious and beautiful rooms, wonderfully comfortable beds, free shuttle into the city, and the rooftop pool and bar. A memorable hotel that earns a strong recommendation and a promise to return.', who: 'Laurie', src: 'Google Maps', date: 'Apr 2026' },
];

const REVIEWS_URL = 'https://www.google.com/maps/place/Whale+Hua+Hin+Hotel/@12.6105149,99.9498802,797m/data=!3m1!1e3!4m9!3m8!1s0x30fdabb29c0ca55f:0xc2398f394e7cd6eb!5m2!4m1!1i2!8m2!3d12.6103827!4d99.9498711!16s%2Fg%2F11gghdhwg8';

// Cloudbeds "From" prices: wire these to the Cloudbeds rate feed. Left blank on purpose.
const PRICES = {};

const $ = (s, r = document) => r.querySelector(s);
const el = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; };
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

/* Header: transparent → white on scroll */
const header = $('.site-header');
const onScroll = () => header.classList.toggle('scrolled', scrollY > 40);
addEventListener('scroll', onScroll, { passive: true }); onScroll();

/* Hero slides */
const slides = [...document.querySelectorAll('.hero-slides img')];
if (!matchMedia('(prefers-reduced-motion: reduce)').matches) {
  let i = 0;
  setInterval(() => {
    slides[i].classList.remove('is-active');
    i = (i + 1) % slides.length;
    slides[i].classList.add('is-active');
  }, 6000);
}

/* Booking: dates, mobile sheet */
const form = $('#book');
const iso = d => d.toISOString().slice(0, 10);
const today = new Date(), tomorrow = new Date(Date.now() + 864e5);
const ci = form.elements.checkin, co = form.elements.checkout;
ci.min = iso(today); co.min = iso(tomorrow);
ci.addEventListener('change', () => {
  const next = new Date(new Date(ci.value).getTime() + 864e5);
  co.min = iso(next);
  if (!co.value || co.value <= ci.value) { co.value = iso(next); co.dispatchEvent(new Event('change')); }
});

/* Show dates as DD/MM/YYYY whatever the browser's language is; the native picker and the ISO value underneath are unchanged */
const dmy = v => v ? v.split('-').reverse().join('/') : '';
[ci, co].forEach(input => {
  const wrap = document.createElement('span');
  wrap.className = 'dfield';
  const text = document.createElement('span');
  text.className = 'dfield-text';
  text.setAttribute('aria-hidden', 'true');
  input.before(wrap);
  wrap.append(text, input);
  const sync = () => { text.textContent = dmy(input.value) || 'DD/MM/YYYY'; text.classList.toggle('empty', !input.value); };
  input.addEventListener('change', sync);
  input.addEventListener('input', sync);
  input.addEventListener('click', () => { try { input.showPicker && input.showPicker(); } catch (e) {} });
  sync();
});
const openSheet = () => { form.classList.add('open'); ci.focus(); };
const closeSheet = () => form.classList.remove('open');
$('.booking-open').addEventListener('click', openSheet);
$('.booking-close').addEventListener('click', closeSheet);
/* Submitting the form opens the hotel's own Cloudbeds booking engine with the chosen dates and guests */

document.querySelectorAll('[data-book]').forEach(a => a.addEventListener('click', e => {
  e.preventDefault();
  if (matchMedia('(max-width:720px)').matches) openSheet();
  else { scrollTo({ top: 0, behavior: 'smooth' }); ci.focus({ preventScroll: true }); }
}));
addEventListener('keydown', e => { if (e.key === 'Escape') closeSheet(); });

/* Prices */
document.querySelectorAll('[data-price]').forEach(p => {
  const v = PRICES[p.dataset.price];
  if (v) p.textContent = v; else p.closest('.from').hidden = true;
});

/* Shuttle table + next departure */
const rows = $('#shuttle-rows');
SHUTTLE.routes.forEach(r => {
  rows.append(el('tr', '', `<td><b>${esc(r.label)}</b><span>${esc(r.note)}</span></td><td>${r.times[0]}–${r.times[r.times.length - 1]}</td>`));
});
const nowMin = hotelNowMin();
const upcoming = SHUTTLE.routes[0].times.find(t => timeMin(t) >= nowMin);
$('#shuttle-next').innerHTML = upcoming
  ? `Next from hotel · <b>${upcoming}</b>`
  : `First trip tomorrow · <b>${SHUTTLE.routes[0].times[0]}</b>`;

/* Hello, Hua Hin cards */
const town = $('#town-list');
TOWN.forEach(t => town.append(el('li', 'reveal', `<a href="${esc(t.href)}"><div class="ph ${t.cls}${t.img ? ' fit' : ''}">${t.img ? `<img src="${esc(t.img)}" alt="" loading="lazy">` : ''}</div><h3>${esc(t.title)}</h3><p>${esc(t.blurb)}</p></a>`)));

/* Reviews */
const rv = $('#review-list');
REVIEWS.forEach(r => {
  const draft = false;
  rv.append(el('figure', 'review reveal',
    `<blockquote>“${esc(r.quote)}”</blockquote><figcaption>${esc(r.who)} · ${esc(r.src)} · ${esc(r.date)}</figcaption>`));
});
rv.insertAdjacentHTML('afterend', `<p class="section-foot"><a class="link-arrow" href="${REVIEWS_URL}" target="_blank" rel="noopener">Read more reviews on Google Maps</a></p>`);

/* Reveal on scroll */
document.querySelectorAll('.tiles li, .room, .pair article, .mosaic figure, .shuttle-card, .shuttle-photo').forEach(e => e.classList.add('reveal'));
const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { threshold: .15 });
document.querySelectorAll('.reveal').forEach(e => io.observe(e));

