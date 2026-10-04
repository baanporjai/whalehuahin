// Generates the secondary pages. Run: node build.mjs
// Copy comes from the Home draft where it exists; anything in [brackets] is a placeholder to replace with real hotel info.
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';

const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');

const NAV = (b) => `
<header class="site-header scrolled">
  <a class="brand" href="${b}index.html" aria-label="Whale Hua Hin — home">
    <svg viewBox="0 0 48 28" width="34" height="20" aria-hidden="true"><path d="M2 16c6 0 8-8 16-8 7 0 8 6 14 6 4 0 5-4 9-4 2 0 5 1 7 3-2 9-9 14-19 14C13 27 4 24 2 16Z" fill="currentColor"/><circle cx="14" cy="17" r="1.6" fill="#fff"/></svg>
    <span>WHALE <b>HUA HIN</b></span>
  </a>
  <nav class="nav" aria-label="Main">
    <a href="${b}rooms/">Stay</a><a href="${b}index.html#experiences">Experiences</a><a href="${b}hua-hin/">Hua Hin</a><a href="${b}offers.html">Offers</a><a href="${b}about.html">About</a>
  </nav>
  <div class="header-end"><a class="btn btn-aqua btn-sm" href="${b}index.html#book">Book now</a></div>
</header>`;

const FOOT = (b) => `
<footer class="site-footer">
  <div class="foot-cols">
    <nav aria-label="Stay"><h3>Stay</h3><a href="${b}rooms/">All Rooms</a><a href="${b}rooms/jacuzzi-deluxe.html">Jacuzzi Deluxe</a><a href="${b}rooms/two-bedroom-suite.html">Two-Bedroom Suite</a><a href="${b}index.html#book">Cloudbeds Booking</a></nav>
    <nav aria-label="Explore"><h3>Explore</h3><a href="${b}index.html#experiences">Experiences</a><a href="${b}hua-hin/">Hua Hin Guide</a><a href="${b}offers.html">Offers</a><a href="${b}experiences/well-retreat.html">Well Retreat</a></nav>
    <nav aria-label="Help"><h3>Help</h3><a href="${b}location.html">Location</a><a href="${b}shuttle.html">Shuttle Times</a><a href="${b}faq.html">FAQ &amp; Policies</a><a href="${b}contact.html">Contact</a></nav>
    <nav aria-label="Connect"><h3>Connect</h3><a href="#">Facebook</a><a href="#">Instagram</a><a href="#">TikTok</a><a href="#">LINE / WhatsApp</a></nav>
  </div>
  <div class="foot-base">
    <p>Whale Hua Hin · [Hotel address], Hua Hin, Prachuap Khiri Khan, Thailand<br>[Phone] · [Email]</p>
    <p class="foot-legal"><a href="${b}privacy.html">Privacy Policy</a> <a href="${b}terms.html">Terms &amp; Conditions</a></p>
    <p class="copy">© ${new Date().getFullYear()} Whale Hua Hin. All rights reserved.</p>
  </div>
</footer>
<div class="sticky-bar"><a href="tel:+66000000000">Call</a><a href="https://line.me/R/ti/p/REPLACE" rel="noopener">LINE</a><a class="btn btn-aqua" href="${b}index.html#book">Book now</a></div>`;

/* Block renderers */
const B = {
  prose: ({ title, text }) => `<section class="section prose">${title ? `<h2 class="h-section">${title}</h2>` : ''}${[].concat(text).map(t => `<p>${t}</p>`).join('')}</section>`,
  photo: ({ scene, label }) => `<section class="photo-band"><figure class="ph ${scene}" role="img" aria-label="${esc(label)}"><figcaption class="ph-note">Photo: ${esc(label)}</figcaption></figure></section>`,
  cards: ({ title, items }) => `<section class="section">${title ? `<h2 class="h-section">${title}</h2>` : ''}<div class="info-cards">${items.map(i => `<article>${i.scene ? `<div class="ph ${i.scene}"></div>` : ''}<h3>${i[0] || i.h}</h3><p>${i[1] || i.p}</p>${i.href ? `<a class="link-arrow" href="${i.href}">${i.cta}</a>` : ''}</article>`).join('')}</div></section>`,
  spec: ({ title, rows }) => `<section class="section"><h2 class="h-section">${title}</h2><dl class="spec">${rows.map(r => `<div><dt>${r[0]}</dt><dd>${r[1]}</dd></div>`).join('')}</dl></section>`,
  faq: ({ title, items }) => `<section class="section prose"><h2 class="h-section">${title}</h2>${items.map(i => `<details><summary>${i[0]}</summary><p>${i[1]}</p></details>`).join('')}</section>`,
  cta: ({ text, href, label }) => `<section class="band-cta"><p>${text}</p><a class="btn btn-aqua" href="${href}">${label}</a></section>`,
};

function page(path, { title, eyebrow, h1, lede, desc, blocks }) {
  const b = '../'.repeat(path.split('/').length - 1);
  const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)} | Whale Hua Hin</title>
<meta name="description" content="${esc(desc || lede)}">
<link rel="icon" href="${b}assets/favicon.svg" type="image/svg+xml">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400;12..96,600;12..96,800&family=Instrument+Sans:wght@400;500;600&display=swap" rel="stylesheet">
<link rel="stylesheet" href="${b}styles.css">
</head>
<body class="page-inner">${NAV(b)}
<main id="main">
  <section class="page-hero"><div class="page-hero-in">
    <p class="eyebrow">${eyebrow}</p><h1 class="h-display">${h1}</h1><p class="lede">${lede}</p>
  </div></section>
  ${blocks.map(x => B[x[0]](x[1])).join('\n  ')}
</main>${FOOT(b)}
<script src="${b}i18n.js"></script>
</body>
</html>
`;
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, html);
}

const BOOK = ['cta', { text: 'Your easy days start here. Book direct for our best available offers.', href: '#BOOK', label: 'Book your stay' }];
const bk = b => [b[0], { ...b[1], href: b[1].href.replace('#BOOK', '') }];
const withBook = (path, blocks) => [...blocks, ['cta', { text: BOOK[1].text, href: '../'.repeat(path.split('/').length - 1) + 'index.html#book', label: BOOK[1].label }]];

const pages = {};

/* ---------- Rooms ---------- */
const roomSpec = [['Size', '[sqm — to confirm]'], ['Bed', '[bed type — to confirm]'], ['Sleeps', '[guests — to confirm]'], ['View', '[view — to confirm]']];
const room = (slug, o) => pages[`rooms/${slug}.html`] = {
  title: o.name, eyebrow: o.eyebrow, h1: o.name, lede: o.lede, desc: o.lede,
  blocks: [['photo', { scene: o.scene, label: o.name }], ['prose', { title: o.head, text: o.text }], ['spec', { title: 'Room details', rows: roomSpec }], ['prose', { text: 'Rates are shown live in our booking engine, so you always see the current price for your dates.' }]],
};
room('superior', { name: 'Superior', eyebrow: 'Stay', scene: 'scene-superior', lede: 'Everything you need for a comfortable Hua Hin stay.', head: 'An easy place to land.', text: ['A comfortable base for a weekend by the sea, with the rooftop pool and shuttle just a few steps away.'] });
room('premier-high-floor', { name: 'Premier High Floor', eyebrow: 'Stay', scene: 'scene-room', lede: 'More light, open views and a little distance from the everyday.', head: 'Higher up, lighter inside.', text: ['Set on a higher floor, with more light and open views to settle into.'] });
room('jacuzzi-deluxe', { name: 'Jacuzzi Deluxe', eyebrow: 'Stay', scene: 'scene-jacuzzi', lede: 'A little time for two.', head: 'A spacious room with a private Jacuzzi.', text: ['Made for slower moments together: a spacious room with a private Jacuzzi of your own.'] });
room('two-bedroom-suite', { name: 'Family Jacuzzi 2 Bedroom Suite', eyebrow: 'Stay', scene: 'scene-family', lede: 'Together, with room to breathe.', head: 'Two bedrooms, one easy stay.', text: ['A two-bedroom suite with a Jacuzzi, made for families and friends travelling together.'] });
pages['rooms/index.html'] = {
  title: 'Rooms & Suites', eyebrow: 'Stay your way', h1: 'Room to make<br>yourself at home.', lede: 'From easy weekend stays to private Jacuzzi moments and two-bedroom space for everyone.',
  blocks: [['cards', { items: [
    { scene: 'scene-superior', h: 'Superior', p: 'Everything you need for a comfortable Hua Hin stay.', href: 'superior.html', cta: 'View Room' },
    { scene: 'scene-room', h: 'Premier High Floor', p: 'More light, open views and a little distance from the everyday.', href: 'premier-high-floor.html', cta: 'View Room' },
    { scene: 'scene-jacuzzi', h: 'Jacuzzi Deluxe', p: 'A spacious room with a private Jacuzzi made for slower moments together.', href: 'jacuzzi-deluxe.html', cta: 'View Jacuzzi Deluxe' },
    { scene: 'scene-family', h: 'Family Jacuzzi 2 Bedroom Suite', p: 'A two-bedroom suite made for families and friends.', href: 'two-bedroom-suite.html', cta: 'View Two-Bedroom Suite' },
  ] }]],
};

/* ---------- Experiences ---------- */
const exp = (slug, o) => pages[`experiences/${slug}.html`] = {
  title: o.name, eyebrow: o.eyebrow, h1: o.h1, lede: o.lede,
  blocks: [['photo', { scene: o.scene, label: o.name }], ['prose', { text: o.text }], ...(o.extra || [])],
};
exp('rooftop-pool', { name: 'Rooftop Pool', eyebrow: 'Above Hua Hin', h1: 'Swim. Slide.<br>Slow down.', scene: 'scene-pool-wide', lede: 'Take in the view, cool off in the rooftop pool or add a little fun with a ride down the pool slide.', text: ['Swim, slide and slow down above Hua Hin.'], extra: [['spec', { title: 'Good to know', rows: [['Hours', '[pool hours]'], ['Slide', '[slide hours and rules]'], ['Towels', '[towel info]']] }]] });
exp('rooftop-bar', { name: 'Rooftop Bar', eyebrow: 'Sunset, served', h1: 'Sunset looks<br>good from here.', scene: 'scene-sunset', lede: 'Settle in for drinks, easy bites and evenings above the city.', text: ['Open daily · 5 PM–10 PM <em>(confirm hours)</em>'] });
exp('well-retreat', { name: 'Well Retreat', eyebrow: 'Time for yourself', h1: 'Slow down.<br>You’re here.', scene: 'scene-spa', lede: 'Relax with a thoughtful massage and a quieter moment above Hua Hin.', text: ['Massage and quiet moments without leaving the hotel.'], extra: [['spec', { title: 'Treatments', rows: [['Treatment menu', '[add treatments, durations and prices]'], ['Opening hours', '[hours]']] }], ['prose', { title: 'Book a treatment', text: ['[Booking method — front desk, LINE or phone]'] }]] });
pages['experiences/well-retreat.html'].blocks[3][1].title = 'Book a treatment';
exp('dining', { name: 'Dining', eyebrow: 'Mornings at Whale', h1: 'Start easy.', scene: 'scene-breakfast', lede: 'Breakfast favourites, fresh flavours and nowhere you need to rush to.', text: ['[Breakfast hours, style and menu highlights]'] });
exp('play-and-unwind', { name: 'Play & Unwind', eyebrow: 'A little more to do', h1: 'Play a little.<br>Stay a little longer.', scene: 'scene-theater', lede: 'Movie nights, a friendly round of pool or something different at the archery range.', text: [''], extra: [['cards', { items: [
  { scene: 'scene-theater', h: 'Theater Room', p: 'Sit back and make it movie night.' },
  { scene: 'scene-pooltable', h: 'Pool Table', p: 'A little friendly competition.' },
  { scene: 'scene-archery', h: 'Archery', p: 'Take aim and try something different.' }] }]] });
pages['experiences/play-and-unwind.html'].blocks.splice(1, 1);

/* ---------- Hua Hin ---------- */
const art = (slug, o) => pages[`hua-hin/${slug}.html`] = { title: o.name, eyebrow: 'Hello, Hua Hin', h1: o.name, lede: o.lede, blocks: [['photo', { scene: o.scene, label: o.name }], ['prose', { text: ['[Write this guide: add real places, tips and distances from the hotel. Mention the free shuttle where it helps.]'] }], ['cta', { text: 'Getting there is easy with the free shuttle.', href: '../shuttle.html', label: 'View shuttle times' }]] };
art('where-to-eat', { name: 'Where to Eat in Hua Hin', scene: 't1', lede: 'Seafood, noodles and sunset tables.' });
art('night-markets', { name: 'Markets After Sunset', scene: 't2', lede: 'Street food, crafts and slow strolls.' });
art('three-easy-days', { name: 'Three Easy Days in Hua Hin', scene: 't3', lede: 'A simple plan for a first visit.' });
pages['hua-hin/index.html'] = { title: 'Hua Hin Guide', eyebrow: 'Step out', h1: 'Hello, Hua Hin.', lede: 'Beaches, markets, local food and easy days by the sea—discover more of Hua Hin from Whale.', blocks: [['cards', { items: [
  { scene: 't1', h: 'Where to Eat in Hua Hin', p: 'Seafood, noodles and sunset tables.', href: 'where-to-eat.html', cta: 'Read guide' },
  { scene: 't2', h: 'Markets After Sunset', p: 'Street food, crafts and slow strolls.', href: 'night-markets.html', cta: 'Read guide' },
  { scene: 't3', h: 'Three Easy Days in Hua Hin', p: 'A simple plan for a first visit.', href: 'three-easy-days.html', cta: 'Read guide' }] }]] };

/* ---------- Top-level ---------- */
pages['about.html'] = { title: 'Our Story', eyebrow: 'About Whale', h1: 'A little more room<br>for easy days.', lede: 'Whale Hua Hin is made for days that feel unhurried.', blocks: [['photo', { scene: 'scene-lifestyle', label: 'Guests relaxing at Whale' }], ['prose', { text: ['Spacious rooms, rooftop swims, sunset drinks and thoughtful comforts give you more ways to enjoy your stay—whether you’re here for a weekend or staying a little longer.', '[Add the hotel’s own story: who built it, why the name Whale, what makes it different.]'] }]] };
pages['location.html'] = { title: 'Location', eyebrow: 'Find us', h1: 'Easy to reach,<br>easy to leave.', lede: 'Whale Hua Hin, with a free shuttle to the beach and selected stops around town.', blocks: [['photo', { scene: 't3', label: 'Map (embed Google Maps here)' }], ['spec', { title: 'Getting here', rows: [['Address', '[Hotel address]'], ['From Hua Hin town', '[distance / time]'], ['From Bangkok', '[distance / time]'], ['Parking', '[parking info]']] }], ['cta', { text: 'Use the free shuttle to the beach and around town.', href: 'shuttle.html', label: 'View shuttle times' }]] };
pages['offers.html'] = { title: 'Offers', eyebrow: 'Book direct', h1: 'Your easy days<br>start here.', lede: 'Book direct for our best available offers and a stay made a little easier.', blocks: [['cards', { title: 'Direct booking benefits', items: [['Best available direct offer', 'See current offers in our booking engine.'], ['Direct assistance from the hotel', 'Talk to the team that looks after your stay.'], ['Flexible options when available', 'Ask us about changes before you book.']] }], ['prose', { text: ['[List one current promotion here. Confirm terms before using “Best Rate Guarantee” or “Free Cancellation”.]'] }]] };
pages['faq.html'] = { title: 'FAQ & Policies', eyebrow: 'Help', h1: 'Good to know.', lede: 'Quick answers before you arrive.', blocks: [['faq', { title: 'Questions', items: [
  ['Is the shuttle free?', 'Yes, complimentary shuttle service runs between the hotel, the beach and selected stops. Advance reservation may be required. <a href="shuttle.html">See times</a>.'],
  ['What time is check-in and check-out?', '[Check-in / check-out times]'],
  ['Is breakfast included?', '[Breakfast policy by rate]'],
  ['Can I cancel or change my booking?', '[Cancellation and change policy]'],
  ['Are children welcome?', '[Child policy, extra beds, ages]'],
  ['Do you have parking?', '[Parking info]'],
  ['When is the rooftop pool open?', '[Pool hours and slide rules]']] }]] };
pages['contact.html'] = { title: 'Contact', eyebrow: 'Say hello', h1: 'We’re glad<br>to help.', lede: 'Questions about your stay, the shuttle or a special occasion? Reach the team directly.', blocks: [['spec', { title: 'Reach us', rows: [['Phone', '[Phone]'], ['Email', '[Email]'], ['LINE / WhatsApp', '[LINE ID]'], ['Address', '[Hotel address]'], ['Front desk', '[Hours]']] }]] };
pages['privacy.html'] = { title: 'Privacy Policy', eyebrow: 'Legal', h1: 'Privacy Policy', lede: 'How Whale Hua Hin handles your personal data.', blocks: [['prose', { text: ['[Insert the hotel’s privacy policy, reviewed for Thailand PDPA. Do not publish without legal review.]'] }]] };
pages['terms.html'] = { title: 'Terms & Conditions', eyebrow: 'Legal', h1: 'Terms &amp; Conditions', lede: 'The terms that apply to bookings and stays.', blocks: [['prose', { text: ['[Insert booking terms, cancellation and payment conditions.]'] }]] };

// Booking CTA on every page except the legal pages
for (const [p, v] of Object.entries(pages)) {
  if (/privacy|terms|contact/.test(p)) { page(p, v); continue; }
  v.blocks = withBook(p, v.blocks); page(p, v);
}
console.log(Object.keys(pages).length, 'pages written');
