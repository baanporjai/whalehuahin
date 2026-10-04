const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

document.getElementById('reserve-note').textContent = SHUTTLE.note;

const tabs = document.getElementById('tabs');
const panel = document.getElementById('panel');
const now = hotelNowMin();

function show(i) {
  const r = SHUTTLE.routes[i];
  [...tabs.children].forEach((b, j) => { b.setAttribute('aria-selected', j === i); b.tabIndex = j === i ? 0 : -1; });
  const nextT = r.times.find(t => timeMin(t) >= now);
  panel.innerHTML = `<h3>${esc(r.label)}</h3><p class="panel-sub">${esc(r.note)}</p>
    <table><thead><tr><th scope="col">${i ? 'Leaves city center' : 'Leaves hotel'}</th><th scope="col"></th></tr></thead>
    <tbody>${r.times.map(t => `<tr${t === nextT ? ' class="is-next"' : ''}><td>${t}</td><td>${t === nextT ? '<span class="pill">Next</span>' : ''}</td></tr>`).join('')}</tbody></table>`;
}

SHUTTLE.routes.forEach((r, i) => {
  const b = document.createElement('button');
  b.type = 'button'; b.role = 'tab'; b.textContent = r.label;
  b.addEventListener('click', () => show(i));
  b.addEventListener('keydown', e => {
    const n = SHUTTLE.routes.length;
    const d = { ArrowRight: 1, ArrowLeft: -1 }[e.key];
    if (d) { const j = (i + d + n) % n; show(j); tabs.children[j].focus(); }
  });
  tabs.append(b);
});
show(0);
