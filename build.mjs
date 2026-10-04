// Generates the secondary pages. Run: node build.mjs
// Copy comes from the Home draft where it exists; anything in [brackets] is a placeholder to replace with real hotel info.
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';

const SITE = 'https://whalehuahin.com';
const TODAY = '2026-10-04';
// Pages still holding [placeholder] copy: keep them out of the index and the sitemap until real text is in.
const NOINDEX = new Set(['privacy.html', 'terms.html', 'hua-hin/night-markets.html', 'hua-hin/three-easy-days.html']);
// Cloudflare serves these without .html (and folders with a trailing slash); the old .html URLs 307-redirect, so canonical/sitemap use the final form.
const canon = p => '/' + p.replace(/(^|\/)index\.html$/, '$1').replace(/\.html$/, '');
const DEFAULT_OG = 'images/2026/pool-day-hero.webp';
// Search-result copy per page (title incl. brand, ~60 chars; description ~150 chars). Only facts already on the site.
const SEO = {
  'rooms/index.html': ['Rooms & Suites in Hua Hin | Whale Hua Hin Hotel', 'Superior, Premier High Floor, Jacuzzi Deluxe and a Family Jacuzzi 2-Bedroom Suite at Whale Hua Hin, with a rooftop pool and free shuttle to the city center.'],
  'rooms/superior.html': ['Superior Room in Hua Hin | Whale Hua Hin Hotel', 'A comfortable Superior room at Whale Hua Hin, a few steps from the rooftop pool and the free shuttle to the city center.'],
  'rooms/premier-high-floor.html': ['Premier High Floor Room | Whale Hua Hin Hotel', 'Premier High Floor rooms at Whale Hua Hin: more light and open views from a higher floor, with the rooftop pool and free shuttle nearby.'],
  'rooms/jacuzzi-deluxe.html': ['Jacuzzi Deluxe Room in Hua Hin | Whale Hua Hin', 'A spacious Jacuzzi Deluxe room with a private Jacuzzi at Whale Hua Hin, made for slower moments together in Hua Hin.'],
  'rooms/two-bedroom-suite.html': ['Family Jacuzzi 2-Bedroom Suite Hua Hin | Whale', 'A two-bedroom family suite with a Jacuzzi at Whale Hua Hin, made for families and friends travelling together.'],
  'rooms/duplex-suite.html': ['Duplex Suite in Hua Hin | Whale Hua Hin Hotel', 'A two-level Duplex Suite at Whale Hua Hin with floor-to-ceiling windows, a stone staircase, a dining area and a balcony with mountain views.'],
  'experiences/rooftop-pool.html': ['Rooftop Pool & Slide in Hua Hin | Whale Hua Hin', 'Swim, slide and take in the view at the Whale Hua Hin rooftop pool, with a pool slide and a rooftop bar for sunset.'],
  'experiences/rooftop-bar.html': ['Rooftop Bar in Hua Hin | Whale Hua Hin Hotel', 'Sunset drinks and easy bites at the Whale Hua Hin rooftop bar, above the city.'],
  'experiences/well-retreat.html': ['Well Retreat Massage in Hua Hin | Whale Hua Hin', 'Relax with a massage at Well Retreat, the in-hotel spa at Whale Hua Hin, without leaving the hotel.'],
  'experiences/dining.html': ['Breakfast & Dining | Whale Hua Hin Hotel', 'Breakfast favourites and fresh flavours at Whale Hua Hin, with nowhere you need to rush to.'],
  'experiences/play-and-unwind.html': ['Theater Room, Pool Table & Archery | Whale Hua Hin', 'Movie nights in the theater room, a round of pool, archery and a fitness room at Whale Hua Hin.'],
  'hua-hin/index.html': ['Hua Hin Travel Guide | Whale Hua Hin Hotel', 'Beaches, night markets, local food and easy days by the sea: discover Hua Hin from Whale Hua Hin Hotel.'],
  'about.html': ['About Whale Hua Hin | Hotel in Hua Hin', 'Whale Hua Hin is made for unhurried days: spacious rooms, rooftop swims, sunset drinks and thoughtful comforts.'],
  'location.html': ['Location & Directions | Whale Hua Hin Hotel', 'Find Whale Hua Hin at 32/112 Hua Hin 8 Alley, Petchkasem Road: about 5 km from Hua Hin town, with free parking and a free shuttle to the city center.'],
  'offers.html': ['Offers & Direct Booking | Whale Hua Hin Hotel', 'Book Whale Hua Hin direct with the hotel for our best available offers and a stay made a little easier.'],
  'faq.html': ['FAQ & Policies | Whale Hua Hin Hotel', 'Quick answers about the free shuttle, parking, check-in and more before you stay at Whale Hua Hin.'],
  'contact.html': ['Contact Whale Hua Hin Hotel, Hua Hin', 'Call +66 32 522 202, email info@whalehuahin.com or message Whale Hua Hin on Facebook about your stay.'],
};
const CRUMB = { rooms: ['Rooms', '/rooms/'], 'hua-hin': ['Hua Hin Guide', '/hua-hin/'] };
const crumbs = (path, name) => {
  const items = [['Home', '/']];
  const dir = path.split('/')[0];
  if (path.includes('/') && CRUMB[dir] && !path.endsWith('index.html')) items.push(CRUMB[dir]);
  items.push([name, canon(path)]);
  return JSON.stringify({ '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: items.map(([n, u], i) => ({ '@type': 'ListItem', position: i + 1, name: n, item: SITE + u })) });
};
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');

const NAV = (b) => `
<header class="site-header scrolled">
  <a class="brand" href="${b}index.html" aria-label="Whale Hua Hin — home">
    <img class="brand-logo logo-white" src="${b}assets/logo-white.webp" alt="Whale Hua Hin" width="86" height="60"><img class="brand-logo logo-color" src="${b}assets/logo.webp" alt="Whale Hua Hin" width="86" height="60">
  </a>
  <nav class="nav" aria-label="Main">
    <a href="${b}rooms/">Stay</a><a href="${b}index.html#experiences">Experiences</a><a href="${b}hua-hin/">Hua Hin</a><a href="${b}offers.html">Offers</a><a href="${b}about.html">About</a>
  </nav>
  <div class="header-end"><a class="btn btn-aqua btn-sm" href="${b}index.html#book">Book now</a></div>
</header>`;

const FOOT = (b) => `
<footer class="site-footer">
  <img class="foot-logo" src="${b}assets/logo-white.webp" alt="Whale Hua Hin" width="120" height="83" loading="lazy">
  <div class="foot-cols">
    <nav aria-label="Stay"><h3>Stay</h3><a href="${b}rooms/">All Rooms</a><a href="${b}rooms/jacuzzi-deluxe.html">Jacuzzi Deluxe</a><a href="${b}rooms/two-bedroom-suite.html">Two-Bedroom Suite</a><a href="${b}rooms/duplex-suite.html">Duplex Suite</a><a href="${b}index.html#book">Book on Trip.com</a></nav>
    <nav aria-label="Explore"><h3>Explore</h3><a href="${b}index.html#experiences">Experiences</a><a href="${b}hua-hin/">Hua Hin Guide</a><a href="${b}offers.html">Offers</a><a href="${b}experiences/well-retreat.html">Well Retreat</a></nav>
    <nav aria-label="Help"><h3>Help</h3><a href="${b}location.html">Location</a><a href="${b}shuttle.html">Shuttle Times</a><a href="${b}faq.html">FAQ &amp; Policies</a><a href="${b}contact.html">Contact</a></nav>
    <nav aria-label="Connect"><h3>Connect</h3><a href="https://www.facebook.com/whalehuahinhotel" target="_blank" rel="noopener">Facebook</a><a href="#">Instagram</a><a href="#">TikTok</a><a href="#">LINE / WhatsApp</a></nav>
  </div>
  <div class="foot-base">
    <p>Whale Hua Hin · 32/112 Hua Hin 8 Alley, Petchkasem Road, Hua Hin, Prachuap Khiri Khan 77110, Thailand<br>+66 32 522 202 · +66 95 283 4932 · info@whalehuahin.com</p>
    <p class="foot-legal"><a href="${b}privacy.html">Privacy Policy</a> <a href="${b}terms.html">Terms &amp; Conditions</a></p>
    <p class="copy">© ${new Date().getFullYear()} Whale Hua Hin. All rights reserved.</p>
  </div>
</footer>
<div class="sticky-bar"><a href="tel:+6632522202">Call</a><a href="https://line.me/R/ti/p/REPLACE" rel="noopener">LINE</a><a class="btn btn-aqua" href="${b}index.html#book">Book now</a></div>`;

/* Photos live in images/2026/ (processed from "hotel website 2026"). A scene name maps to a photo; unmapped scenes stay as colour placeholders. */
const P = n => `images/2026/${n}.webp`;
const SCENE_IMG = {
  'photo-superior': 'superior-1', 'photo-room-premier': 'premier-tub', 'photo-jacuzzi': 'jacuzzi-tub', 'scene-family': 'suite-living',
  'photo-duplex': 'duplex-living', 'photo-rooftop': 'pool-day-wide', 'photo-rooftop-night': 'pool-sunset', 'scene-spa': 'spa-treatment', 'scene-breakfast': 'breakfast-spread',
  'scene-lifestyle': 'model-window',
};
const HERO_IMG = { 'photo-rooftop': 'pool-day-hero', 'photo-superior': 'superior-2', 'photo-room-premier': 'premier-tub-2' };
const FIT = new Set(['t1']);
const sceneSrc = sc => sc === 't1' ? P('guay-pochana') : sc === 'photo-pooltable' ? 'images/pooltable.jpg' : SCENE_IMG[sc] ? P(SCENE_IMG[sc]) : null;

/* Block renderers */
const B = {
  prose: ({ title, text }) => `<section class="section prose">${title ? `<h2 class="h-section">${title}</h2>` : ''}${[].concat(text).map(t => `<p>${t}</p>`).join('')}</section>`,
  photo: ({ scene, label }) => { const src = sceneSrc(scene); return `<section class="photo-band"><figure class="${src ? 'media' : 'ph ' + scene}" role="img" aria-label="${esc(label)}">${src ? `<img src="${src}" alt="${esc(label)}" loading="lazy">` : `<figcaption class="ph-note">Photo: ${esc(label)}</figcaption>`}</figure></section>`; },
  cards: ({ title, items }) => `<section class="section">${title ? `<h2 class="h-section">${title}</h2>` : ''}<div class="info-cards">${items.map(i => { const src = i.scene && sceneSrc(i.scene); return `<article>${src ? `<figure class="media${FIT.has(i.scene) ? ' fit' : ''}"><img src="${src}" alt="" loading="lazy"></figure>` : i.scene ? `<div class="ph ${i.scene}"></div>` : ''}<h3>${i[0] || i.h}</h3><p>${i[1] || i.p}</p>${i.href ? `<a class="link-arrow" href="${i.href}">${i.cta}</a>` : ''}</article>`; }).join('')}</div></section>`,
  spec: ({ title, rows }) => `<section class="section"><h2 class="h-section">${title}</h2><dl class="spec">${rows.map(r => `<div><dt>${r[0]}</dt><dd>${r[1]}</dd></div>`).join('')}</dl></section>`,
  faq: ({ title, items }) => `<section class="section prose"><h2 class="h-section">${title}</h2>${items.map(i => `<details><summary>${i[0]}</summary><p>${i[1]}</p></details>`).join('')}</section>`,
  gallery: ({ title, imgs }) => `<section class="section">${title ? `<h2 class="h-section">${title}</h2>` : ''}<div class="gallery">${imgs.map(([src, alt]) => `<button type="button" class="g-item" aria-label="Enlarge photo"><img src="${src}" alt="${esc(alt)}" loading="lazy"></button>`).join('')}</div></section>`,
  gmap: () => `<section class="photo-band"><div class="gmap"><iframe title="Whale Hua Hin on Google Maps" src="https://www.google.com/maps/embed?origin=mfe&pb=!1m3!2m1!1s12.6103827,99.9498711!6i17!3m1!1sen!5m1!1sen" loading="lazy" referrerpolicy="no-referrer-when-downgrade" allowfullscreen></iframe></div><p class="map-links"><a class="btn btn-aqua" href="https://www.google.com/maps/dir/?api=1&destination=12.6103827,99.9498711" target="_blank" rel="noopener">Get directions</a><a class="link-arrow" href="https://www.google.com/maps/place/Whale+Hua+Hin+Hotel/@12.6105149,99.9498802,797m/data=!3m1!1e3!4m9!3m8!1s0x30fdabb29c0ca55f:0xc2398f394e7cd6eb!5m2!4m1!1i2!8m2!3d12.6103827!4d99.9498711!16s%2Fg%2F11gghdhwg8" target="_blank" rel="noopener">Open in Google Maps</a></p></section>`,
  figure: ({ src, alt }) => `<section class="photo-band"><img class="map-img" src="${src}" alt="${esc(alt)}" loading="lazy"></section>`,
  cta: ({ text, href, label }) => `<section class="band-cta"><p>${text}</p><a class="btn btn-aqua" href="${href}">${label}</a></section>`,
};
const gal = (names, alt) => names.map(n => [P(n), alt]);

function page(path, { title, eyebrow, h1, lede, desc, blocks }) {
  const b = '../'.repeat(path.split('/').length - 1);
  // A mapped photo in the first block becomes the page's hero image.
  let hero = null;
  if (blocks[0][0] === 'photo') {
    const sc = blocks[0][1].scene;
    const name = HERO_IMG[sc] ? P(HERO_IMG[sc]) : sceneSrc(sc);
    if (name) { hero = { src: name, alt: blocks[0][1].label }; blocks = blocks.slice(1); }
  }
  const [pt, pd] = SEO[path] || [`${title} | Whale Hua Hin`, desc || lede];
  const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(pt)}</title>
<meta name="description" content="${esc(pd)}">
${NOINDEX.has(path) ? '<meta name="robots" content="noindex, follow">' : ''}
<link rel="icon" href="${b}assets/favicon.svg" type="image/svg+xml">
<link rel="icon" href="${b}assets/favicon.png" type="image/png">
<link rel="apple-touch-icon" href="${b}assets/favicon.png">
<link rel="canonical" href="${SITE}${canon(path)}">
<meta property="og:type" content="website">
<meta property="og:site_name" content="Whale Hua Hin">
<meta property="og:title" content="${esc(pt)}">
<meta property="og:description" content="${esc(pd)}">
<meta property="og:url" content="${SITE}${canon(path)}">
<meta property="og:image" content="${SITE}/${hero ? hero.src : DEFAULT_OG}">
<meta name="twitter:card" content="summary_large_image">
<script type="application/ld+json">${crumbs(path, title)}</script>
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400;12..96,600;12..96,800&family=Instrument+Sans:wght@400;500;600&display=swap" rel="stylesheet">
<link rel="stylesheet" href="${b}styles.css">
</head>
<body class="page-inner">${NAV(b)}
<main id="main">
  <section class="page-hero${hero ? ' has-img' : ''}">${hero ? `<img src="${b}${hero.src}" alt="${esc(hero.alt)}" fetchpriority="high">` : ''}<div class="page-hero-in">
    <p class="eyebrow">${eyebrow}</p><h1 class="h-display">${h1}</h1><p class="lede">${lede}</p>
  </div></section>
  ${blocks.map(x => B[x[0]](x[1])).join('\n  ').replace(/src="images\//g, `src="${b}images/`)}
</main>${FOOT(b)}
<script src="${b}lightbox.js"></script>
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
const OLD = d => f => ['images/' + d + '/' + f + '.webp', ''];
const room = (slug, o) => pages[`rooms/${slug}.html`] = {
  title: o.name, eyebrow: o.eyebrow, h1: o.name, lede: o.lede, desc: o.lede,
  blocks: [['photo', { scene: o.scene, label: o.name }], ['prose', { title: o.head, text: o.text }], ['gallery', { title: 'Inside the room', imgs: o.gallery.map(([src]) => [src, o.name]) }], ['spec', { title: 'Room details', rows: roomSpec }], ['prose', { text: 'Rates are shown live in our booking engine, so you always see the current price for your dates.' }]],
};
room('superior', { name: 'Superior', eyebrow: 'Stay', scene: 'photo-superior', gallery: gal(['superior-1', 'superior-2', 'superior-twin', 'superior-desk', 'superior-bed', 'superior-bath'], ''), lede: 'Everything you need for a comfortable Hua Hin stay.', head: 'An easy place to land.', text: ['A comfortable base for a weekend by the sea, with the rooftop pool and shuttle just a few steps away.'] });
room('premier-high-floor', { name: 'Premier High Floor', eyebrow: 'Stay', scene: 'photo-room-premier', gallery: [...gal(['premier-tub', 'premier-tub-2', 'premier-tub-3'], ''), ...['587710646_18341057323227842_6228865959943278826_n', '584367414_18341057305227842_7424491904617671801_n', '582429753_18341057296227842_3183918609453593408_n'].map(OLD('Premier_highfloor'))], lede: 'More light, open views and a little distance from the everyday.', head: 'Higher up, lighter inside.', text: ['Set on a higher floor, with more light and open views to settle into.'] });
room('jacuzzi-deluxe', { name: 'Jacuzzi Deluxe', eyebrow: 'Stay', scene: 'photo-jacuzzi', gallery: gal(['jacuzzi-tub', 'jacuzzi-bed', 'jacuzzi-bed-2', 'jacuzzi-twin', 'jacuzzi-sink', 'jacuzzi-balcony'], ''), lede: 'A little time for two.', head: 'A spacious room with a private Jacuzzi.', text: ['Made for slower moments together: a spacious room with a private Jacuzzi of your own.'] });
room('two-bedroom-suite', { name: 'Family Jacuzzi 2 Bedroom Suite', eyebrow: 'Stay', scene: 'scene-family', gallery: gal(['suite-living', 'suite-bed', 'suite-seaview', 'suite-seaview-2', 'suite-bed-teal'], ''), lede: 'Together, with room to breathe.', head: 'Two bedrooms, one easy stay.', text: ['A two-bedroom suite with a Jacuzzi, made for families and friends travelling together.'] });
room('duplex-suite', { name: 'Duplex Suite', eyebrow: 'Stay', scene: 'photo-duplex', gallery: gal(['duplex-living', 'duplex-dining', 'duplex-stairs', 'duplex-bar', 'duplex-bed', 'duplex-bed-2', 'duplex-bath', 'duplex-tub', 'duplex-balcony'], ''), lede: 'Two levels, floor-to-ceiling windows and room to spread out.', head: 'Two levels of easy living.', text: ['A two-level suite with a stone feature staircase, floor-to-ceiling windows, a dining area and mini bar, a bedroom with a round bathtub, and a balcony with mountain views.'] });
pages['rooms/index.html'] = {
  title: 'Rooms & Suites', eyebrow: 'Stay your way', h1: 'Room to make<br>yourself at home.', lede: 'From easy weekend stays to private Jacuzzi moments and two-bedroom space for everyone.',
  blocks: [['cards', { items: [
    { scene: 'photo-superior', h: 'Superior', p: 'Everything you need for a comfortable Hua Hin stay.', href: 'superior.html', cta: 'View Room' },
    { scene: 'photo-room-premier', h: 'Premier High Floor', p: 'More light, open views and a little distance from the everyday.', href: 'premier-high-floor.html', cta: 'View Room' },
    { scene: 'photo-jacuzzi', h: 'Jacuzzi Deluxe', p: 'A spacious room with a private Jacuzzi made for slower moments together.', href: 'jacuzzi-deluxe.html', cta: 'View Jacuzzi Deluxe' },
    { scene: 'scene-family', h: 'Family Jacuzzi 2 Bedroom Suite', p: 'A two-bedroom suite made for families and friends.', href: 'two-bedroom-suite.html', cta: 'View Two-Bedroom Suite' },
    { scene: 'photo-duplex', h: 'Duplex Suite', p: 'A two-level suite with floor-to-ceiling windows and a stone staircase.', href: 'duplex-suite.html', cta: 'View Duplex Suite' },
  ] }]],
};

/* ---------- Experiences ---------- */
const exp = (slug, o) => pages[`experiences/${slug}.html`] = {
  title: o.name, eyebrow: o.eyebrow, h1: o.h1, lede: o.lede,
  blocks: [['photo', { scene: o.scene, label: o.name }], ['prose', { text: o.text }], ...(o.extra || [])],
};
exp('rooftop-pool', { name: 'Rooftop Pool', eyebrow: 'Above Hua Hin', h1: 'Swim. Slide.<br>Slow down.', scene: 'photo-rooftop', lede: 'Take in the view, cool off in the rooftop pool or add a little fun with a ride down the pool slide.', text: ['Swim, slide and slow down above Hua Hin.'], extra: [['gallery', { title: 'By day', imgs: gal(['pool-day-lounge', 'pool-day-chaise', 'pool-loungers-day', 'pool-turquoise', 'pool-pillow', 'pool-in-water-lounger', 'pool-day-angle', 'pool-reflect', 'lawn-day'], 'Rooftop pool by day') }], ['gallery', { title: 'Sunset & night', imgs: gal(['pool-sunset-guests', 'pool-sunset', 'pool-bluehour', 'pool-flamingo', 'pool-edge-blue', 'pool-night-turquoise', 'lawn-dusk', 'lounge-dusk', 'sky-sunset'], 'Rooftop pool at sunset and night') }], ['spec', { title: 'Good to know', rows: [['Hours', '[pool hours]'], ['Slide', '[slide hours and rules]'], ['Towels', '[towel info]']] }]] });
exp('rooftop-bar', { name: 'Rooftop Bar', eyebrow: 'Sunset, served', h1: 'Sunset looks<br>good from here.', scene: 'photo-rooftop-night', lede: 'Settle in for drinks, easy bites and evenings above the city.', text: ['Open daily · 5 PM–10 PM <em>(confirm hours)</em>'], extra: [['gallery', { title: 'The Flow Bar', imgs: [...gal(['pool-sunset-guests', 'loft-bar', 'loft-bar-2', 'terrace-day', 'lounge-dusk'], 'Rooftop bar'), ...gal(['cocktail-orange', 'cocktail-red', 'cocktail-mojito', 'cocktail-colada', 'cocktail-blue'], 'Cocktail')] }]] });
exp('well-retreat', { name: 'Well Retreat', eyebrow: 'Time for yourself', h1: 'Slow down.<br>You’re here.', scene: 'scene-spa', lede: 'Relax with a thoughtful massage and a quieter moment above Hua Hin.', text: ['Massage and quiet moments without leaving the hotel.'], extra: [['gallery', { title: 'Treatment rooms & lounge', imgs: gal(['spa-treatment-2', 'spa-beds', 'spa-robe', 'spa-terrace', 'spa-lounge', 'spa-corner', 'spa-tea-bed', 'spa-tea-portrait', 'spa-wall-art'], 'Well Retreat') }], ['gallery', { title: 'Foot massage & details', imgs: gal(['spa-chairs', 'spa-chairs-wide', 'spa-chairs-2', 'spa-mirror', 'spa-decor', 'spa-bottles'], 'Well Retreat') }], ['spec', { title: 'Treatments', rows: [['Treatment menu', '[add treatments, durations and prices]'], ['Opening hours', '[hours]']] }], ['prose', { title: 'Book a treatment', text: ['[Booking method — front desk, LINE or phone]'] }]] });
exp('dining', { name: 'Dining', eyebrow: 'Mornings at Whale', h1: 'Start easy.', scene: 'scene-breakfast', lede: 'Breakfast favourites, fresh flavours and nowhere you need to rush to.', text: ['[Breakfast hours, style and menu highlights]'], extra: [['gallery', { title: 'Gallery', imgs: gal(['restaurant-1', 'model-lunch', 'model-pizza', 'restaurant-2', 'pad-thai', 'tea', 'cafe-counter', 'matcha', 'model-cafe'], 'Dining at Whale') }]] });
exp('play-and-unwind', { name: 'Play & Unwind', eyebrow: 'A little more to do', h1: 'Play a little.<br>Stay a little longer.', scene: 'scene-theater', lede: 'Movie nights, a friendly round of pool or something different at the archery range.', text: [''], extra: [['cards', { items: [
  { scene: 'scene-theater', h: 'Theater Room', p: 'Sit back and make it movie night.' },
  { scene: 'photo-pooltable', h: 'Pool Table', p: 'A little friendly competition.' },
  { scene: 'scene-archery', h: 'Archery', p: 'Take aim and try something different.' }] }], ['gallery', { title: 'Fitness & Gym', imgs: gal(['gym-1', 'gym-2'], 'Fitness room') }]] });
pages['experiences/play-and-unwind.html'].blocks.splice(1, 1);

/* ---------- Hua Hin ---------- */
const art = (slug, o) => pages[`hua-hin/${slug}.html`] = { title: o.name, eyebrow: 'Hello, Hua Hin', h1: o.name, lede: o.lede, blocks: [['photo', { scene: o.scene, label: o.name }], ['prose', { text: ['[Write this guide: add real places, tips and distances from the hotel. Mention the free shuttle where it helps.]'] }], ['cta', { text: 'Getting there is easy with the free shuttle.', href: '../shuttle.html', label: 'View shuttle times' }]] };
pages['hua-hin/where-to-eat.html'] = { title: 'Where to Eat in Hua Hin', eyebrow: 'Hello, Hua Hin', h1: 'Where to Eat in Hua Hin', lede: 'Local favourites worth a short trip into town.', blocks: [
  ['prose', { title: 'Guay Pochana', text: ['A Chinese-style eatery on Hua Hin Soi 51, known for its dry rice soup, crispy roast pork and chicken rice. Air-conditioned and easy for a relaxed breakfast or lunch.', 'Recommended by our owner.'] }],
  ['spec', { title: 'Good to know', rows: [['Where', 'Hua Hin Soi 51, Hua Hin'], ['Open', 'Daily 07:00–16:00 · please confirm before you go'], ['Known for', 'Dry rice soup, crispy roast pork, chicken rice'], ['Phone', '<a href="tel:+66938720003">093 872 0003</a>'], ['Online', '<a href="https://www.facebook.com/guaypochana/" target="_blank" rel="noopener">Facebook</a> · <a href="https://www.instagram.com/guaypochana/" target="_blank" rel="noopener">Instagram</a>']] }],
  ['cta', { text: 'See it on the map.', href: 'https://www.google.com/maps/search/?api=1&query=%E0%B8%81%E0%B9%8A%E0%B8%A7%E0%B8%A2%E0%B9%82%E0%B8%A0%E0%B8%8A%E0%B8%99%E0%B8%B2+%E0%B8%AB%E0%B8%B1%E0%B8%A7%E0%B8%AB%E0%B8%B4%E0%B8%99', label: 'Find on Google Maps' }],
] };
art('night-markets', { name: 'Markets After Sunset', scene: 't2', lede: 'Street food, crafts and slow strolls.' });
art('three-easy-days', { name: 'Three Easy Days in Hua Hin', scene: 't3', lede: 'A simple plan for a first visit.' });
pages['hua-hin/index.html'] = { title: 'Hua Hin Guide', eyebrow: 'Step out', h1: 'Hello, Hua Hin.', lede: 'Beaches, markets, local food and easy days by the sea—discover more of Hua Hin from Whale.', blocks: [['cards', { items: [
  { scene: 't1', h: 'Where to Eat in Hua Hin', p: 'Local favourites worth a short trip into town.', href: 'where-to-eat.html', cta: 'Read guide' },
  { scene: 't2', h: 'Markets After Sunset', p: 'Street food, crafts and slow strolls.', href: 'night-markets.html', cta: 'Read guide' },
  { scene: 't3', h: 'Three Easy Days in Hua Hin', p: 'A simple plan for a first visit.', href: 'three-easy-days.html', cta: 'Read guide' }] }]] };

/* ---------- Top-level ---------- */
pages['about.html'] = { title: 'Our Story', eyebrow: 'About Whale', h1: 'A little more room<br>for easy days.', lede: 'Whale Hua Hin is made for days that feel unhurried.', blocks: [['photo', { scene: 'scene-lifestyle', label: 'Guests relaxing at Whale' }], ['prose', { text: ['Spacious rooms, rooftop swims, sunset drinks and thoughtful comforts give you more ways to enjoy your stay—whether you’re here for a weekend or staying a little longer.', '[Add the hotel’s own story: who built it, why the name Whale, what makes it different.]'] }], ['gallery', { title: 'The hotel', imgs: [...gal(['exterior-dusk'], 'Whale Hua Hin at dusk'), ...gal(['ext-pond'], 'Garden pond beneath the lobby roof'), ...gal(['ext-facade'], 'The hotel facade in the evening'), ...gal(['ext-steps'], 'Garden steps'), ...gal(['exterior-day'], 'The hotel from the garden')] }], ['gallery', { title: 'Lobby & details', imgs: [...gal(['lobby-entrance'], 'Lobby entrance'), ...gal(['reception'], 'Reception'), ...gal(['whale-ornament'], 'Whale ornament at reception'), ...gal(['garden'], 'Garden by the cafe'), ...gal(['keycard'], 'Whale key cards')] }]] };
pages['location.html'] = { title: 'Location', eyebrow: 'Find us', h1: 'Easy to reach,<br>easy to leave.', lede: 'Whale Hua Hin, with a free shuttle to the city center.', blocks: [['gmap', {}], ['spec', { title: 'Getting here', rows: [['Address', '32/112 Hua Hin 8 Alley, Petchkasem Road, Hua Hin, Prachuap Khiri Khan 77110, Thailand'], ['From Hua Hin town', 'About 5 km, around 10 minutes by car'], ['From Bangkok', 'About 200 km, around 2 hours 30 minutes by car'], ['Parking', 'Free parking for guests, with EV charging points available']] }], ['figure', { src: 'images/map.jpeg', alt: 'Map of central Hua Hin showing Petchkasem Road, the night market, the train station and the beach' }], ['cta', { text: 'Use the free shuttle to the city center.', href: 'shuttle.html', label: 'View shuttle times' }]] };
pages['offers.html'] = { title: 'Offers', eyebrow: 'Book direct', h1: 'Your easy days<br>start here.', lede: 'Book direct for our best available offers and a stay made a little easier.', blocks: [['cards', { title: 'Direct booking benefits', items: [['Best available direct offer', 'See current offers in our booking engine.'], ['Direct assistance from the hotel', 'Talk to the team that looks after your stay.'], ['Flexible options when available', 'Ask us about changes before you book.']] }], ['prose', { text: ['[List one current promotion here. Confirm terms before using “Best Rate Guarantee” or “Free Cancellation”.]'] }]] };
pages['faq.html'] = { title: 'FAQ & Policies', eyebrow: 'Help', h1: 'Good to know.', lede: 'Quick answers before you arrive.', blocks: [['faq', { title: 'Questions', items: [
  ['Is the shuttle free?', 'Yes. The complimentary shuttle runs between the hotel and the city center (Baan Manthana Hotel). Please reserve your seat in advance. <a href="shuttle.html">See times</a>.'],
  ['What time is check-in and check-out?', 'Check-in is from 2:00 PM and check-out is by 12:00 PM (noon). Late check-out is available until 6:00 PM for a 50% fee.'],
  ['Is breakfast included?', '[Breakfast policy by rate]'],
  ['Can I cancel or change my booking?', '[Cancellation and change policy]'],
  ['Are children welcome?', '[Child policy, extra beds, ages]'],
  ['Do you have parking?', 'Yes. Parking is free for guests, and there are EV charging points available.'],
  ['When is the rooftop pool open?', '[Pool hours and slide rules]']] }]] };
pages['contact.html'] = { title: 'Contact', eyebrow: 'Say hello', h1: 'We’re glad<br>to help.', lede: 'Questions about your stay, the shuttle or a special occasion? Reach the team directly.', blocks: [['spec', { title: 'Reach us', rows: [['Phone', '<a href="tel:+6632522202">+66 32 522 202</a> · <a href="tel:+66952834932">+66 95 283 4932</a>'], ['Email', '<a href="mailto:info@whalehuahin.com">info@whalehuahin.com</a>'], ['Facebook', '<a href="https://www.facebook.com/whalehuahinhotel" target="_blank" rel="noopener">facebook.com/whalehuahinhotel</a>'], ['LINE / WhatsApp', '[LINE ID]'], ['Address', '32/112 Hua Hin 8 Alley, Petchkasem Road, Hua Hin, Prachuap Khiri Khan 77110, Thailand<br><a href="location.html">Map and directions</a>'], ['Front desk', '[Hours]']] }]] };
pages['privacy.html'] = { title: 'Privacy Policy', eyebrow: 'Legal', h1: 'Privacy Policy', lede: 'How Whale Hua Hin handles your personal data.', blocks: [['prose', { text: ['[Insert the hotel’s privacy policy, reviewed for Thailand PDPA. Do not publish without legal review.]'] }]] };
pages['terms.html'] = { title: 'Terms & Conditions', eyebrow: 'Legal', h1: 'Terms &amp; Conditions', lede: 'The terms that apply to bookings and stays.', blocks: [['prose', { text: ['[Insert booking terms, cancellation and payment conditions.]'] }]] };

// Booking CTA on every page except the legal pages
for (const [p, v] of Object.entries(pages)) {
  if (/privacy|terms|contact/.test(p)) { page(p, v); continue; }
  v.blocks = withBook(p, v.blocks); page(p, v);
}
const urls = ['index.html', 'shuttle.html', ...Object.keys(pages)].filter(p => !NOINDEX.has(p)).map(p => `  <url><loc>${SITE}${canon(p)}</loc><lastmod>${TODAY}</lastmod></url>`).join('\n');
writeFileSync('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`);
writeFileSync('robots.txt', 'User-agent: *\nAllow: /\n\nSitemap: https://whalehuahin.com/sitemap.xml\n');
console.log(Object.keys(pages).length, 'pages written');
