/* Photo viewer for .gallery grids: click (or Enter) to enlarge, ←/→ to browse, Esc to close, swipe on touch. */
(() => {
  const items = [...document.querySelectorAll('.gallery .g-item')];
  if (!items.length) return;

  const lb = document.createElement('div');
  lb.className = 'lb';
  lb.hidden = true;
  lb.setAttribute('role', 'dialog');
  lb.setAttribute('aria-modal', 'true');
  lb.setAttribute('aria-label', 'Photo viewer');
  lb.innerHTML = `
    <button class="lb-close" type="button" aria-label="Close">✕</button>
    <button class="lb-nav lb-prev" type="button" aria-label="Previous photo">‹</button>
    <figure class="lb-stage"><img alt=""><figcaption></figcaption></figure>
    <button class="lb-nav lb-next" type="button" aria-label="Next photo">›</button>`;
  document.body.append(lb);

  const img = lb.querySelector('img');
  const cap = lb.querySelector('figcaption');
  let i = 0, opener = null;

  const src = n => items[n].querySelector('img').currentSrc || items[n].querySelector('img').src;
  function show(n) {
    i = (n + items.length) % items.length;
    const thumb = items[i].querySelector('img');
    img.classList.remove('in');
    img.src = src(i);
    img.alt = thumb.alt;
    cap.textContent = `${i + 1} / ${items.length}${thumb.alt ? ' · ' + thumb.alt : ''}`;
    requestAnimationFrame(() => img.classList.add('in'));
    // warm the neighbours
    [i - 1, i + 1].forEach(k => { const p = new Image(); p.src = src((k + items.length) % items.length); });
  }
  function open(n, from) {
    opener = from;
    lb.hidden = false;
    document.documentElement.classList.add('lb-open');
    show(n);
    lb.querySelector('.lb-close').focus();
  }
  function close() {
    lb.hidden = true;
    document.documentElement.classList.remove('lb-open');
    if (opener) opener.focus();
  }

  items.forEach((b, n) => b.addEventListener('click', () => open(n, b)));
  lb.querySelector('.lb-close').addEventListener('click', close);
  lb.querySelector('.lb-prev').addEventListener('click', () => show(i - 1));
  lb.querySelector('.lb-next').addEventListener('click', () => show(i + 1));
  lb.addEventListener('click', e => { if (e.target === lb || e.target.classList.contains('lb-stage')) close(); });
  addEventListener('keydown', e => {
    if (lb.hidden) return;
    if (e.key === 'Escape') close();
    else if (e.key === 'ArrowRight') show(i + 1);
    else if (e.key === 'ArrowLeft') show(i - 1);
    else if (e.key === 'Tab') { // keep focus inside the viewer
      const f = [...lb.querySelectorAll('button')];
      const first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });
  let x0 = null;
  lb.addEventListener('touchstart', e => { x0 = e.touches[0].clientX; }, { passive: true });
  lb.addEventListener('touchend', e => {
    if (x0 == null) return;
    const dx = e.changedTouches[0].clientX - x0;
    if (Math.abs(dx) > 50) show(i + (dx < 0 ? 1 : -1));
    x0 = null;
  });
})();
