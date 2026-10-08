/* Live room data: the hotel edits its rooms in the back office (app.whalehuahin.com > จัดการระบบ > รูปแบบห้องพัก) and this
   script puts them on the Rooms page and on each room page, in the visitor's language. The static HTML stays as the fallback
   (crawlers, slow/failed requests): if the request fails nothing changes. A value left empty in the back office is hidden. */
(() => {
  const API = 'https://app.whalehuahin.com/api/public/room-types';
  const slugHere = location.pathname.split('/').filter(Boolean).pop().replace(/\.html$/i, '');
  // The Rooms page itself (a room page also has .info-cards now: its "Explore other rooms" row)
  const isIndex = slugHere === 'rooms' || slugHere === 'index';
  const UNIT = { en: 'm²', th: 'ตร.ม.', zh: '平方米', ru: 'м²' };
  const AMENITIES_TITLE = { en: 'In-room details', th: 'รายละเอียดในห้อง', zh: '客房设施', ru: 'В номере' };
  const cache = {};
  let applied = null;

  const currentLang = () => {
    let l = 'en';
    try { l = new URLSearchParams(location.search).get('lang') || localStorage.getItem('wh-lang') || 'en'; } catch (e) {}
    return ['en', 'th', 'zh', 'ru'].includes(l) ? l : 'en';
  };
  const slugOfHref = href => (href || '').split('?')[0].split('#')[0].split('/').filter(Boolean).pop().replace(/\.html$/i, '');

  function load(lang) {
    if (!cache[lang]) {
      cache[lang] = fetch(`${API}?lang=${lang}`, { mode: 'cors' })
        .then(r => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
        .then(d => (Array.isArray(d.rooms) ? d.rooms : []))
        .catch(() => { delete cache[lang]; return null; });
    }
    return cache[lang];
  }

  const el = (tag, attrs, children) => {
    const n = document.createElement(tag);
    Object.entries(attrs || {}).forEach(([k, v]) => n.setAttribute(k, v));
    (children || []).forEach(c => n.append(c));
    return n;
  };

  /* ---------- Rooms page: the cards ---------- */
  function applyIndex(rooms) {
    const wrap = document.querySelector('.info-cards');
    if (!wrap || !rooms.length) return;
    const cards = [...wrap.querySelectorAll('article')];
    const bySlug = new Map(cards.map(c => [slugOfHref(c.querySelector('a.link-arrow')?.getAttribute('href')), c]));
    const ordered = [];
    rooms.forEach(room => {
      let card = bySlug.get(room.slug);
      if (!card) { // a room added in the back office: a new card linking to its page
        card = el('article', {}, [
          el('figure', { class: 'media' }, [el('img', { alt: '', loading: 'lazy' })]),
          el('h3'), el('p'), el('a', { class: 'link-arrow' }),
        ]);
      }
      const h3 = card.querySelector('h3'), p = card.querySelector('p'), img = card.querySelector('img'), a = card.querySelector('a.link-arrow');
      if (room.name) h3.textContent = room.name;
      if (room.summary) p.textContent = room.summary;
      if (room.cover && img) img.src = room.cover;
      if (a && !a.getAttribute('href')) { a.href = room.url || '#'; a.textContent = 'View Room'; }
      ordered.push(card);
    });
    // rooms no longer shown in the back office disappear; the order follows the back office
    cards.forEach(c => { if (!ordered.includes(c)) c.remove(); });
    ordered.forEach(c => wrap.append(c));
  }

  /* ---------- A room's own page ---------- */
  function applyRoom(room) {
    const hero = document.querySelector('.page-hero');
    if (hero) {
      const h1 = hero.querySelector('h1'), lede = hero.querySelector('.lede'), img = hero.querySelector('img');
      if (room.name && h1) h1.textContent = room.name;
      if (room.tagline && lede) lede.textContent = room.tagline;
      const first = room.gallery[0] || room.cover;
      if (first && img) img.src = first;
    }
    const prose = document.querySelector('main section.prose');
    if (prose) {
      const h2 = prose.querySelector('h2'), p = prose.querySelector('p');
      if (room.headline && h2) h2.textContent = room.headline;
      if (room.body && p) p.textContent = room.body;
    }
    const gallery = document.querySelector('.gallery');
    if (gallery && room.gallery.length) {
      gallery.replaceChildren(...room.gallery.map(src =>
        el('button', { type: 'button', class: 'g-item', 'aria-label': 'Enlarge photo' }, [el('img', { src, alt: room.name || '', loading: 'lazy' })])));
    }
    const spec = document.querySelector('dl.spec');
    if (spec) {
      const rows = [['Size', room.size ? `${room.size} ${UNIT[currentLang()]}` : ''], ['Bed', room.bed], ['Sleeps', room.sleeps], ['View', room.view]].filter(r => r[1]);
      if (rows.length) {
        spec.replaceChildren(...rows.map(([k, v]) => el('div', {}, [el('dt', {}, [k]), el('dd', {}, [v])])));
        spec.closest('section').hidden = false;
      } else {
        spec.closest('section').hidden = true; // nothing filled in: no empty "[to confirm]" box
      }
    }
  }

  /* In-room details: groups of items; removed again when the room has none. */
  function applyAmenities(room) {
    document.querySelectorAll('section.amenities').forEach(s => s.remove());
    const groups = room.amenities || [];
    if (!groups.length) return;
    const section = el('section', { class: 'section amenities' }, [
      el('h2', { class: 'h-section' }, [AMENITIES_TITLE[currentLang()]]),
      el('div', { class: 'amenity-groups' }, groups.map(g => el('div', { class: 'amenity-group' }, [
        g.title ? el('h3', {}, [g.title]) : '',
        el('ul', {}, g.items.map(i => el('li', {}, [i]))),
      ]))),
    ]);
    const anchor = document.querySelector('dl.spec')?.closest('section') || document.querySelector('.gallery')?.closest('section');
    if (anchor) anchor.after(section);
  }

  async function run() {
    const lang = currentLang();
    if (applied === lang) return;
    const rooms = await load(lang);
    if (!rooms) return; // request failed: keep the static page
    applied = lang;
    if (isIndex) applyIndex(rooms);
    else {
      const room = rooms.find(r => r.slug === slugHere);
      if (room) { applyRoom(room); applyAmenities(room); }
      applyIndex(rooms.filter(r => r.slug !== slugHere)); // the "Explore other rooms" row follows the back office too
    }
  }

  run();
  // The visitor switches language (i18n.js sets <html lang> on every change): load that language's texts too.
  new MutationObserver(() => run()).observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });
})();
