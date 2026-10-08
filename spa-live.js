/* Live spa menu: the hotel edits its treatments in the back office (app.whalehuahin.com > สปา) and this script shows them on the
   Well Retreat page, in the visitor's language: treatment cards with photo and price, the opening hours and how to book. The static
   HTML stays as the fallback: if the request fails nothing changes. */
(() => {
  const API = 'https://app.whalehuahin.com/api/public/spa';
  const HOURS = { en: 'Opening hours', th: 'เวลาทำการ', zh: '营业时间', ru: 'Часы работы' };
  const BOOK = {
    en: 'Book from your room by scanning the QR code in your room, or call the front desk',
    th: 'จองได้จากห้องพักโดยสแกน QR code ในห้อง หรือโทรสอบถามที่แผนกต้อนรับ',
    zh: '请扫描房间内的二维码在客房预约，或致电前台',
    ru: 'Запишитесь из номера, отсканировав QR-код в номере, или позвоните на стойку регистрации',
  };
  const cache = {};
  let applied = null;

  const currentLang = () => {
    let l = 'en';
    try { l = new URLSearchParams(location.search).get('lang') || localStorage.getItem('wh-lang') || 'en'; } catch (e) {}
    return ['en', 'th', 'zh', 'ru'].includes(l) ? l : 'en';
  };

  function load(lang) {
    if (!cache[lang]) {
      cache[lang] = fetch(`${API}?lang=${lang}`, { mode: 'cors' })
        .then(r => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
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
  const baht = n => '฿' + Number(n).toLocaleString('en-US');

  function apply(data, lang) {
    const spec = document.querySelector('main dl.spec');
    const section = spec && spec.closest('section');
    if (section && data.services.length) {
      section.querySelectorAll('.spa-live').forEach(n => n.remove());
      spec.hidden = true;
      const cards = el('div', { class: 'info-cards spa-live' }, data.services.map(s => el('article', {}, [
        s.image ? el('figure', { class: 'media' }, [el('img', { src: s.image, alt: s.name, loading: 'lazy' })]) : '',
        el('h3', {}, [s.name]),
        el('p', {}, [baht(s.price)]),
      ])));
      section.append(cards);
      if (data.hours && data.hours.open) {
        section.append(el('p', { class: 'spa-live', style: 'margin-top:24px' }, [`${HOURS[lang]}: ${data.hours.open}–${data.hours.close}`]));
      }
    }
    // "Book a treatment": how, instead of the placeholder
    const prose = [...document.querySelectorAll('main section.prose')].pop();
    const p = prose && prose.querySelector('p');
    if (p) {
      p.replaceChildren(BOOK[lang]);
      if (data.phone) {
        p.append(': ', el('a', { href: 'tel:' + data.phone.replace(/[^\d+]/g, '') }, [data.phone]));
      }
    }
  }

  async function run() {
    const lang = currentLang();
    if (applied === lang) return;
    const data = await load(lang);
    if (!data || !Array.isArray(data.services)) return;
    applied = lang;
    apply(data, lang);
  }

  run();
  new MutationObserver(() => run()).observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });
})();
